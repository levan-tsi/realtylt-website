import { describe, expect, it } from "vitest";
import { AREA_FLIGHT } from "../night/shots";
import { focusOf } from "./cameras";
import { TERRITORY_LABELS } from "./labels";
import { TOWN_LABELS, townsOf } from "./towns";

/** Round 57.3 (brief item 9): two or three names inside each area's chapter shot. */
describe("the places named inside a county", () => {
  it("names two or three places for every area of Where we work", () => {
    for (const shot of AREA_FLIGHT) {
      const n = townsOf(focusOf(shot)).length;
      expect(n, shot).toBeGreaterThanOrEqual(2);
      expect(n, shot).toBeLessThanOrEqual(3);
    }
  });

  it("puts each place near its own area (within 45 km of the area's name)", () => {
    const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
      Math.hypot((a.lat - b.lat) * 111.1, (a.lng - b.lng) * 111.1 * Math.cos((a.lat * Math.PI) / 180));
    for (const t of TOWN_LABELS) {
      const area = TERRITORY_LABELS.find((l) => l.id === t.area);
      expect(area, t.area).toBeDefined();
      expect(km(t, area!), t.text).toBeLessThan(45);
    }
  });

  it("gives every place a distinct id", () => {
    expect(new Set(TOWN_LABELS.map((t) => t.id)).size).toBe(TOWN_LABELS.length);
  });

  it("names nothing away from an area's shot", () => {
    expect(townsOf(null)).toEqual([]);
    expect(townsOf(focusOf("hero"))).toEqual([]);
  });
});
