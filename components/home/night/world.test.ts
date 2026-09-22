import { describe, expect, it } from "vitest";
import { SERVED_REGION } from "@/components/idx/county-bounds";
import { boxUVToLngLat, EXAGGERATION, heightToWorld, KM_PER_DEG_LAT, lngLatToWorld, ORIGIN, over, worldToLngLat } from "./world";

/** Great-circle distance, km (the truth the flat world approximates). */
function haversineKm(lng1: number, lat1: number, lng2: number, lat2: number): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.sqrt(a));
}

describe("night world projection", () => {
  it("puts the served region's middle at the origin, north toward -z, east toward +x", () => {
    const [x, y, z] = lngLatToWorld(ORIGIN.lng, ORIGIN.lat);
    expect([x, y, z].map((v) => Math.abs(v) < 1e-9)).toEqual([true, true, true]);
    const [, , zNorth] = lngLatToWorld(ORIGIN.lng, ORIGIN.lat + 0.1);
    const [xEast] = lngLatToWorld(ORIGIN.lng + 0.1, ORIGIN.lat);
    expect(zNorth).toBeLessThan(0);
    expect(xEast).toBeGreaterThan(0);
  });

  it("round-trips longitude and latitude", () => {
    for (const [lng, lat] of [
      [-73.93, 41.7], // Poughkeepsie
      [-74.01, 40.7], // the Battery
      [-74.75, 42.14], // the region's north-west corner
      [-73.51, 40.49],
    ]) {
      const [x, , z] = lngLatToWorld(lng, lat);
      const [lng2, lat2] = worldToLngLat(x, z);
      expect(lng2).toBeCloseTo(lng, 10);
      expect(lat2).toBeCloseTo(lat, 10);
    }
  });

  it("keeps the true aspect: a kilometre east is a kilometre north (cos latitude on x)", () => {
    // 20 km east and 20 km north of the origin, measured on the sphere.
    const east = lngLatToWorld(ORIGIN.lng + 20 / (111.32 * Math.cos((ORIGIN.lat * Math.PI) / 180)), ORIGIN.lat);
    const north = lngLatToWorld(ORIGIN.lng, ORIGIN.lat + 20 / KM_PER_DEG_LAT);
    expect(Math.hypot(east[0], east[2]) / Math.hypot(north[0], north[2])).toBeCloseTo(1, 3);
    // World distances match the sphere to under 1.5% across the whole region (the cos is exact
    // at the middle latitude only).
    const pairs: [number, number, number, number][] = [
      [-74.01, 40.7, -73.93, 41.7], // Battery to Poughkeepsie
      [-74.75, 41.3, -73.51, 41.3], // across the region
      [-74.2, 40.58, -74.0, 42.1], // Staten Island to Kingston
    ];
    for (const [a, b, c, d] of pairs) {
      const [x1, , z1] = lngLatToWorld(a, b);
      const [x2, , z2] = lngLatToWorld(c, d);
      const truth = haversineKm(a, b, c, d);
      expect(Math.abs(Math.hypot(x2 - x1, z2 - z1) - truth) / truth).toBeLessThan(0.015);
    }
  });

  it("lifts heights by the exaggeration, in kilometres", () => {
    expect(heightToWorld(1000)).toBeCloseTo(EXAGGERATION, 10);
    expect(lngLatToWorld(-74, 41, 400)[1]).toBeCloseTo(0.4 * EXAGGERATION, 10);
    expect(over(-74, 41, 7)[1]).toBe(7);
  });

  it("reads a packed light's fractions the way lib/idx/lights.ts writes them (v = 0 is north)", () => {
    expect(boxUVToLngLat(0, 0, SERVED_REGION)).toEqual([SERVED_REGION.west, SERVED_REGION.north]);
    expect(boxUVToLngLat(1, 1, SERVED_REGION)).toEqual([SERVED_REGION.east, SERVED_REGION.south]);
  });
});
