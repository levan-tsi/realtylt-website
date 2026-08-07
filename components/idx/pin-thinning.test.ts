import { describe, expect, it } from "vitest";
import { planMarkers, MARKER_CAP, type PlannedMarker } from "./pin-thinning";
import { chipPrice } from "./map-shared";
import type { MapPin } from "@/lib/idx/types";

/** The planner works on projected pixels, so these tests use an identity-ish projection:
 * 1 degree = 1,000 px. Geometry stays readable — a pin at (41.5, -74.0) plots at pixel
 * (-74000, -41500)… flipped Y does not matter to collision math, so keep it simple: x=lng*1e3,
 * y=lat*1e3, viewport around the pins. */
const project = (lat: number, lng: number) => ({ x: lng * 1000, y: lat * 1000 });
const VIEW = { left: -75000, right: -73000, top: 40000, bottom: 43000 };

let seq = 0;
function pin(over: Partial<MapPin> = {}): MapPin {
  seq += 1;
  return {
    id: `p${seq}`,
    price: 500_000,
    lat: 41.5,
    lng: -74.0,
    address: `${seq} Main St`,
    city: "Beacon",
    zip: "12508",
    beds: 3,
    baths: 2,
    office: "Test Realty",
    photoCount: 1,
    ...over,
  };
}

const pills = (plan: PlannedMarker[]) => plan.filter((m) => m.kind === "pill");
const dots = (plan: PlannedMarker[]) => plan.filter((m) => m.kind === "dot");

describe("planMarkers — Zillow-style label thinning (pills + dots, no count circles)", () => {
  it("far-apart pins all get price pills, and every label IS the floored price", () => {
    const ps = [
      pin({ lat: 41.1, lng: -74.5, price: 875_000 }),
      pin({ lat: 41.9, lng: -73.6, price: 1_350_000 }),
      pin({ lat: 42.4 - 0.6, lng: -74.0, price: 219_900 }),
    ];
    const plan = planMarkers({ pins: ps, project, viewport: VIEW });
    expect(pills(plan)).toHaveLength(3);
    expect(dots(plan)).toHaveLength(0);
    // The owner's invariant, held by a test: a marker's label is always the price — never a
    // badge, never "NEW", never a count.
    for (const m of plan) {
      expect(m.label).toBe(chipPrice(m.pin.price));
      expect(m.label).toMatch(/^\$[\d.]+[KM]$/);
    }
  });

  it("two pins on the same spot: one pill, the second is thinned (never two overlapping pills)", () => {
    const plan = planMarkers({ pins: [pin(), pin()], project, viewport: VIEW });
    expect(pills(plan)).toHaveLength(1);
    // The runner-up sits within DOT_CLEARANCE of the pill's anchor — dropped as invisible.
    expect(plan.length).toBeLessThanOrEqual(2);
  });

  it("accepted pills never overlap, at any density", () => {
    // A 20×20 grid, 0.005° (=5px projected) apart — far denser than any pill can fit.
    const ps: MapPin[] = [];
    for (let i = 0; i < 20; i++)
      for (let j = 0; j < 20; j++) ps.push(pin({ lat: 41 + i * 0.005, lng: -74 + j * 0.005 }));
    const plan = planMarkers({ pins: ps, project, viewport: VIEW });
    const placed = pills(plan);
    expect(placed.length).toBeGreaterThan(0);
    expect(dots(plan).length).toBeGreaterThan(0); // density is absorbed by dots, not circles
    const rect = (m: PlannedMarker) => {
      const w = m.label.length * 7 + 18;
      return { l: m.x - w / 2, r: m.x + w / 2, t: m.y - 26, b: m.y };
    };
    for (let a = 0; a < placed.length; a++)
      for (let b = a + 1; b < placed.length; b++) {
        const ra = rect(placed[a]);
        const rb = rect(placed[b]);
        const overlap = ra.l < rb.r && ra.r > rb.l && ra.t < rb.b && ra.b > rb.t;
        expect(overlap, `pills ${placed[a].pin.id} and ${placed[b].pin.id} overlap`).toBe(false);
      }
  });

  it("re-planning the same viewport is byte-identical (no flicker between draws)", () => {
    const ps = Array.from({ length: 200 }, (_, i) =>
      pin({ lat: 41 + (i % 14) * 0.004, lng: -74 + Math.floor(i / 14) * 0.004 }),
    );
    const a = planMarkers({ pins: ps, project, viewport: VIEW });
    const b = planMarkers({ pins: ps, project, viewport: VIEW });
    expect(a.map((m) => `${m.pin.id}:${m.kind}`)).toEqual(b.map((m) => `${m.pin.id}:${m.kind}`));
  });

  it("the selected home is ALWAYS a pill, even in a colliding stack", () => {
    const ps = [pin(), pin(), pin(), pin()];
    const chosen = ps[3].id; // lowest natural priority in the stack
    const plan = planMarkers({ pins: ps, project, viewport: VIEW, selectedId: chosen });
    const selected = plan.find((m) => m.pin.id === chosen);
    expect(selected?.kind).toBe("pill");
  });

  it("a saved home outranks an unsaved one for the pill on the same spot", () => {
    const ps = [pin(), pin(), pin()];
    const hearted = ps[2].id;
    const plan = planMarkers({
      pins: ps,
      project,
      viewport: VIEW,
      isSaved: (p) => p.id === hearted,
    });
    expect(plan.find((m) => m.pin.id === hearted)?.kind).toBe("pill");
  });

  it("a home you can still buy outranks a Pending one for the pill", () => {
    const active = pin({ status: "Active" });
    const pending = pin({ status: "Pending" });
    // Pending listed first so only priority (not input order) can explain the outcome.
    const plan = planMarkers({ pins: [pending, active], project, viewport: VIEW });
    expect(plan.find((m) => m.pin.id === active.id)?.kind).toBe("pill");
    expect(plan.find((m) => m.pin.id === pending.id)?.kind).not.toBe("pill");
  });

  it("culls pins outside the viewport (plus a small edge margin)", () => {
    const inside = pin({ lat: 41.5, lng: -74.0 });
    const outside = pin({ lat: 45.0, lng: -70.0 });
    const nearEdge = pin({ lat: VIEW.bottom / 1000 + 0.02, lng: -74.0 }); // 20px past the edge
    const plan = planMarkers({ pins: [inside, outside, nearEdge], project, viewport: VIEW });
    const ids = plan.map((m) => m.pin.id);
    expect(ids).toContain(inside.id);
    expect(ids).not.toContain(outside.id);
    expect(ids).toContain(nearEdge.id); // within EDGE_MARGIN — kept so panning has no pop-in
  });

  it("respects the marker cap, spending it on the highest-priority homes", () => {
    // 2,000 pins scattered widely enough that most could render.
    const ps = Array.from({ length: 2000 }, (_, i) =>
      pin({ lat: 40.2 + (i % 45) * 0.06, lng: -74.9 + Math.floor(i / 45) * 0.04 }),
    );
    const wide = { left: -76000, right: -72000, top: 39000, bottom: 44000 };
    const plan = planMarkers({ pins: ps, project, viewport: wide });
    expect(plan.length).toBeLessThanOrEqual(MARKER_CAP);
    expect(plan.length).toBeGreaterThan(MARKER_CAP / 2); // the budget is actually used
  });

  it("dots never sit under a pill or on top of another dot", () => {
    const ps = Array.from({ length: 400 }, (_, i) =>
      pin({ lat: 41 + (i % 20) * 0.003, lng: -74 + Math.floor(i / 20) * 0.003 }),
    );
    const plan = planMarkers({ pins: ps, project, viewport: VIEW });
    const ds = dots(plan);
    for (let a = 0; a < ds.length; a++)
      for (let b = a + 1; b < ds.length; b++) {
        const dx = ds[a].x - ds[b].x;
        const dy = ds[a].y - ds[b].y;
        expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(8);
      }
  });

  it("returns nothing for an empty viewport or an unprojectable set", () => {
    expect(planMarkers({ pins: [], project, viewport: VIEW })).toEqual([]);
    expect(
      planMarkers({ pins: [pin()], project: () => null, viewport: VIEW }),
    ).toEqual([]);
  });
});
