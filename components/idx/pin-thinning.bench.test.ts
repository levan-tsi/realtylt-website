import { describe, expect, it } from "vitest";
import { planMarkers } from "./pin-thinning";
import type { MapPin } from "@/lib/idx/types";

/** Not a correctness test — the number behind MARKER_CAP's comment. draw() runs planMarkers on
 * every map idle and every card hover, so the planner's own cost must stay far under a frame.
 * Kept as a test (not a scratch script) so a future change that makes it quadratic fails loud. */
describe("planMarkers cost at the fetch cap", () => {
  it("plans 3,000 pins in well under a frame", () => {
    const pins: MapPin[] = [];
    for (let i = 0; i < 3000; i++)
      pins.push({
        id: `p${i}`,
        price: 100_000 + ((i * 997) % 2_000_000),
        lat: 40.9 + ((i * 7919) % 1000) / 800,
        lng: -74.7 + ((i * 104729) % 1200) / 1000,
        address: `${i} Main St`,
        city: "X",
        zip: "10000",
        beds: 3,
        baths: 2,
        office: "O",
        photoCount: 1,
      });
    const project = (lat: number, lng: number) => ({ x: (lng + 74.7) * 600, y: (41.9 - lat) * 600 });
    const viewport = { left: 0, top: 0, right: 720, bottom: 760 };
    for (let i = 0; i < 3; i++) planMarkers({ pins, project, viewport }); // warm
    const t0 = performance.now();
    const runs = 20;
    for (let i = 0; i < runs; i++) planMarkers({ pins, project, viewport, selectedId: "p42" });
    const perDraw = (performance.now() - t0) / runs;
    // Measured 2026-08-06 on the dev box: 3.93ms/draw solo, ~11ms under the full parallel
    // suite's CPU contention. The bound guards against an accidental O(n²) (which would be
    // hundreds of ms at n=3,000), not against scheduler noise — so it is deliberately loose.
    expect(perDraw).toBeLessThan(50);
  });
});
