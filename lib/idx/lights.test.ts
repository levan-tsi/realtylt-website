import { describe, expect, it } from "vitest";
import { packLights, townName, unpackLights, type LightBox } from "./lights";

const BOX: LightBox = { west: -74.75, south: 40.49, east: -73.51, north: 42.14 };

describe("the hero's packed lights", () => {
  it("round-trips a home to within one grid step (~3m)", () => {
    const rows = [
      { lat: 41.5048, lng: -73.9696, city: "Beacon" },
      { lat: 40.7128, lng: -74.006, city: "New York" },
    ];
    const pts = unpackLights(packLights(rows, BOX));
    expect(pts.x.length).toBe(2);
    rows.forEach((r, i) => {
      const lng = BOX.west + pts.x[i] * (BOX.east - BOX.west);
      const lat = BOX.north - pts.y[i] * (BOX.north - BOX.south);
      expect(Math.abs(lng - r.lng)).toBeLessThan(0.0001);
      expect(Math.abs(lat - r.lat)).toBeLessThan(0.0001);
    });
  });

  it("puts north at the TOP of the picture, the way a map reads", () => {
    const pts = unpackLights(packLights([{ lat: 42.1, lng: -74, city: "A" }, { lat: 40.6, lng: -74, city: "B" }], BOX));
    expect(pts.y[0]).toBeLessThan(pts.y[1]);
  });

  it("names each town once, in the case a person writes it", () => {
    const p = packLights(
      [
        { lat: 41.5, lng: -73.97, city: "BEACON" },
        { lat: 41.51, lng: -73.96, city: "beacon " },
        { lat: 41.7, lng: -73.93, city: "wappingers falls" },
        { lat: 41.2, lng: -73.9, city: "croton-on-hudson" },
      ],
      BOX,
    );
    expect(p.towns).toEqual(["Beacon", "Wappingers Falls", "Croton-On-Hudson"]);
    const pts = unpackLights(p);
    expect([...pts.town]).toEqual([0, 0, 1, 2]);
    expect(townName("  NEW   paltz ")).toBe("New Paltz");
  });

  it("counts an unmeasured home toward its town but does not draw it", () => {
    const p = packLights(
      [
        { lat: 41.5, lng: -73.97, city: "Beacon", geocoded: true },
        { lat: 41.5, lng: -73.97, city: "Beacon", geocoded: false },
        { lat: 41.7, lng: -73.93, city: "Fishkill", geocoded: false },
      ],
      BOX,
    );
    const pts = unpackLights(p);
    expect(pts.x.length).toBe(1);
    expect(p.towns).toEqual(["Beacon", "Fishkill"]);
    expect(p.counts).toEqual([2, 1]);
  });

  it("drops a home outside the served region instead of pinning it to the edge", () => {
    const pts = unpackLights(packLights([{ lat: 43.0, lng: -74, city: "Far" }, { lat: 41, lng: -74, city: "Near" }], BOX));
    expect(pts.x.length).toBe(1);
    expect(pts.towns[pts.town[0]]).toBe("Near");
  });
});
