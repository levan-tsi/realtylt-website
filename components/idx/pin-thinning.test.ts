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
    // The FACE box (round 24b: 6px horizontal padding, 18px tall) — the same estimate the
    // planner collides on. The transparent hit shells may kiss; the visible ink must not.
    const rect = (m: PlannedMarker) => {
      const w = m.label.length * 7 + 12;
      return { l: m.x - w / 2, r: m.x + w / 2, t: m.y - 18, b: m.y };
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

  it("a home beside a pill keeps its dot — only a home BEHIND the painted face is dropped", () => {
    // The defect this pins: the dot test used to run against the pill's COLLISION rect, which
    // carries a 3px separation margin on every side, so a home whose anchor merely grazed a
    // neighbouring label's breathing room vanished from the map. Measured on the real map at
    // street zoom over Poughkeepsie: 15 homes in view, 9 drawn, and all 6 missing were OUTSIDE
    // the pill's painted face. A margin keeps two labels apart; it says nothing about what a
    // visitor can see.
    //
    // Geometry: the anchor pill is at (x=0, y=0) in projected space. Its face for "$500K"
    // (5 glyphs) is 5*7+12 = 47 wide, so x -23.5..23.5.
    //
    // VERTICALLY the face is NOT flush to the anchor. The chip button carries 4px of
    // transparent padding whose bottom edge sits on the anchor, and that padding doubles as the
    // teardrop tail — so the ink runs y -21..-4. MEASURED on the rendered map, 50 of 50 chips:
    // face top -21.00, face bottom -4.00, height 17.00, with no spread at all. The first
    // version of this test used -18..0 and therefore placed `justAbove` at y -19.5, which is
    // INSIDE the real face: it asserted that a home genuinely buried under the label should
    // still be drawn. The band that discriminates is measured, not assumed.
    //
    // The three homes below sit OUTSIDE the painted face but INSIDE the old collision rect's
    // 3px margin (plus that rule's own 2px slop), so the old rule drops each of them and the
    // new one keeps the two that are visible. An earlier draft placed them where both rules
    // agree and passed against the defect it was written for.
    const anchor = pin({ lat: 0, lng: 0, price: 500_000 });
    const behind = pin({ lat: -0.009, lng: 0.004, price: 500_000 }); // (4, -9): inside the face
    const justBelow = pin({ lat: 0.002, lng: 0.004, price: 500_000 }); // (4, 2): 2px under the ink
    const justAbove = pin({ lat: -0.022, lng: 0.004, price: 500_000 }); // (4, -22): 1px above the ink
    // These two pin the face's REGISTRATION, and nothing else in the file does. Each is on the
    // opposite side of the 4px the face is offset by, so a box modelled -18..0 gets both wrong:
    const underInk = pin({ lat: -0.0195, lng: -0.014, price: 500_000 }); // (-14, -19.5): real ink covers it
    const inTailGap = pin({ lat: -0.002, lng: 0.02, price: 500_000 }); // (20, -2): below the ink, beside the tail
    const view = { left: -200, right: 200, top: -200, bottom: 200 };
    const plan = planMarkers({
      pins: [anchor, behind, justBelow, justAbove, underInk, inTailGap],
      project,
      viewport: view,
      selectedId: anchor.id, // the anchor takes the pill deterministically
    });
    const kind = (p: MapPin) => plan.find((m) => m.pin.id === p.id)?.kind ?? "dropped";
    expect(kind(anchor)).toBe("pill");
    // Genuinely hidden behind the painted face — dropping it is right, it could not be seen.
    expect(kind(behind)).toBe("dropped");
    // Half of each of these dots is on screen, beside a label that is merely keeping its
    // distance. The map must not delete a home to protect a margin.
    expect(kind(justBelow)).toBe("dot");
    expect(kind(justAbove)).toBe("dot");
    // Registration: the ink sits 4px higher than a naive "flush to the anchor" box would put it.
    expect(kind(underInk)).toBe("dropped");
    expect(kind(inTailGap)).toBe("dot");
  });

  it("a dot buried by a pill accepted LATER is dropped, not counted as drawn", () => {
    // Priority order accepts pills all the way down the candidate list, but a dot is only ever
    // tested against the pills placed BEFORE it — and both engines paint every dot UNDER every
    // pill. So a pill taken later buries a dot the planner already approved, and that dot went
    // on counting itself in "N of M homes shown". Measured on the live map at mid zoom: 21 such
    // dots across three markets, up to 96% of the mark covered by ink.
    //
    // Geometry (x = lng*1000, y = lat*1000; a face is 47 wide and spans y-21..y-4):
    //   A (0,0)      selected -> tier 0 -> always a pill. Face x -23.5..23.5, y -21..-4.
    //   B (30,0)     saved -> tier 1. Its pill rect overlaps A's, so it falls back to a DOT.
    //                Not under A's face (x 30 is outside A's 23.5), so the loop approves it.
    //   C (53.2,12)  tier 2, processed AFTER B. Its collision rect starts at x 26.7, clearing
    //                A's 26.5 by a whisker, so C is accepted as a pill — and C's face spans
    //                x 29.7..76.7, y -9..8, which swallows B at (30,0).
    const a = pin({ lat: 0, lng: 0, price: 500_000 });
    const b = pin({ lat: 0, lng: 0.03, price: 500_000, saved: true });
    const c = pin({ lat: 0.012, lng: 0.0532, price: 500_000 });
    const plan = planMarkers({
      pins: [a, b, c],
      project,
      viewport: { left: -200, right: 200, top: -200, bottom: 200 },
      selectedId: a.id,
    });
    const kind = (p: MapPin) => plan.find((m) => m.pin.id === p.id)?.kind ?? "dropped";
    expect(kind(a)).toBe("pill");
    expect(kind(c)).toBe("pill");
    // Under the single-pass rule this was a "dot" — a mark the visitor could not see, inflating
    // the count line. It is behind painted ink, so it is dropped like any other hidden home.
    expect(kind(b)).toBe("dropped");
  });

  it("returns nothing for an empty viewport or an unprojectable set", () => {
    expect(planMarkers({ pins: [], project, viewport: VIEW })).toEqual([]);
    expect(
      planMarkers({ pins: [pin()], project: () => null, viewport: VIEW }),
    ).toEqual([]);
  });
});
