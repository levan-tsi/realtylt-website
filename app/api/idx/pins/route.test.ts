import { describe, expect, it } from "vitest";
import { PIN_CAP } from "@/lib/idx";
import { GET } from "./route";

/** A box that contains the planet — the stand-in for "everything", now that the route
 * requires a viewport. */
const WORLD = "north=90&south=-90&east=180&west=-180";
const pins = (qs: string) => GET(new Request(`http://localhost/api/idx/pins?${qs}`)).then((r) => r.json());

describe("GET /api/idx/pins — a viewport is required", () => {
  it("400s without a bbox instead of paging the whole filtered set", async () => {
    const res = await GET(new Request("http://localhost/api/idx/pins"));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/viewport/i);
  });

  it("400s on a partial or degenerate bbox — a garbled box is not an invitation to scan everything", async () => {
    for (const qs of [
      "north=41", // three sides missing
      "north=40&south=41&east=-73&west=-74", // north below south
      "north=41&south=40&east=-74&west=-73", // east west of west
      "north=x&south=40&east=-73&west=-74", // NaN
    ]) {
      const res = await GET(new Request(`http://localhost/api/idx/pins?${qs}`));
      expect(res.status, qs).toBe(400);
    }
  });
});

describe("GET /api/idx/pins — inside a viewport", () => {
  it("returns the located matches as slim pins, capped, with the true in-bounds total", async () => {
    const world = await pins(WORLD);
    expect(world.total).toBeGreaterThan(12); // the fixture set is far bigger than a grid page
    expect(world.pins.length).toBe(Math.min(world.total, PIN_CAP));
    const pin = world.pins[0];
    expect(Object.keys(pin).sort()).toEqual(
      ["address", "baths", "beds", "city", "id", "lat", "lng", "office", "photoCount", "price", "zip"],
    );
    expect(pin.lat).not.toBe(0); // Null Island rows never ship
    // Coordinates ship rounded to 4 decimals (~11 m — zip-centroid pins are approximate
    // anyway) so the payload doesn't carry float noise.
    for (const p of world.pins) {
      expect(p.lat).toBe(Math.round(p.lat * 1e4) / 1e4);
      expect(p.lng).toBe(Math.round(p.lng * 1e4) / 1e4);
    }
  });

  it("honors the same filter params as /api/idx/search", async () => {
    const all = await pins(WORLD);
    const filtered = await pins(`${WORLD}&county=dutchess&priceMin=1`);
    expect(filtered.total).toBeGreaterThan(0);
    expect(filtered.total).toBeLessThan(all.total);
  });

  it("is CDN-cacheable (map traffic never re-hits the data layer per user)", async () => {
    const res = await GET(new Request(`http://localhost/api/idx/pins?${WORLD}`));
    expect(res.headers.get("cache-control")).toContain("s-maxage");
  });

  it("clips to the box — an empty ocean box returns nothing (fast + empty)", async () => {
    const json = await pins("north=1&south=0&east=1&west=0");
    expect(json.pins).toEqual([]);
    expect(json.total).toBe(0);
  });

  it("clips to the box — a NY box excludes far-away rows but keeps NY ones", async () => {
    const all = await pins(WORLD);
    const ny = await pins("north=42.2&south=40.4&east=-73.3&west=-74.9");
    expect(ny.total).toBeGreaterThan(0);
    expect(ny.total).toBeLessThanOrEqual(all.total);
    for (const p of ny.pins) {
      expect(p.lat).toBeGreaterThanOrEqual(40.4);
      expect(p.lat).toBeLessThanOrEqual(42.2);
      expect(p.lng).toBeGreaterThanOrEqual(-74.9);
      expect(p.lng).toBeLessThanOrEqual(-73.3);
    }
  });
});
