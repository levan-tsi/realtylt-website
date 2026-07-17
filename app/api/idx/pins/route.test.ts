import { describe, expect, it } from "vitest";
import { PIN_CAP } from "@/lib/idx";
import { GET } from "./route";

describe("GET /api/idx/pins — full-result map pins", () => {
  it("returns EVERY match (not one grid page) as slim pins", async () => {
    const res = await GET(new Request("http://localhost/api/idx/pins"));
    const json = await res.json();
    expect(json.total).toBeGreaterThan(12); // fixture set is far bigger than a grid page
    // Unpaged — every LOCATED match ships; the few rows without coordinates (no zip
    // centroid in the real snapshot) are dropped rather than plotted on Null Island.
    expect(json.pins.length).toBeGreaterThan(json.total - 10);
    expect(json.pins.length).toBeLessThanOrEqual(json.total);
    const pin = json.pins[0];
    expect(Object.keys(pin).sort()).toEqual(
      ["address", "baths", "beds", "city", "id", "lat", "lng", "office", "price", "zip"],
    );
    expect(pin.lat).not.toBe(0); // Null Island rows never ship
    // Coordinates ship rounded to 4 decimals (~11 m — zip-centroid pins are approximate
    // anyway) so the full-set payload doesn't carry float noise.
    for (const p of json.pins) {
      expect(p.lat).toBe(Math.round(p.lat * 1e4) / 1e4);
      expect(p.lng).toBe(Math.round(p.lng * 1e4) / 1e4);
    }
  });

  it("honors the same filter params as /api/idx/search", async () => {
    const all = await (await GET(new Request("http://localhost/api/idx/pins"))).json();
    const res = await GET(new Request("http://localhost/api/idx/pins?county=dutchess&priceMin=1"));
    const json = await res.json();
    expect(json.total).toBeGreaterThan(0);
    expect(json.total).toBeLessThan(all.total);
  });

  it("is CDN-cacheable (map traffic never re-hits the data layer per user)", async () => {
    const res = await GET(new Request("http://localhost/api/idx/pins"));
    expect(res.headers.get("cache-control")).toContain("s-maxage");
  });
});

describe("GET /api/idx/pins — viewport bbox", () => {
  it("a whole-planet box reports every located row as total but caps the pins shipped", async () => {
    const all = await (await GET(new Request("http://localhost/api/idx/pins"))).json();
    const world = await (
      await GET(new Request("http://localhost/api/idx/pins?north=90&south=-90&east=180&west=-180"))
    ).json();
    expect(world.total).toBe(all.pins.length); // in-bounds count = every located row (uncapped)
    expect(world.pins.length).toBe(Math.min(all.pins.length, PIN_CAP)); // payload is capped
  });

  it("clips to the box — an empty ocean box returns nothing (fast + empty)", async () => {
    const res = await GET(new Request("http://localhost/api/idx/pins?north=1&south=0&east=1&west=0"));
    const json = await res.json();
    expect(json.pins).toEqual([]);
    expect(json.total).toBe(0);
  });

  it("clips to the box — a NY box excludes far-away rows but keeps NY ones", async () => {
    const all = await (await GET(new Request("http://localhost/api/idx/pins"))).json();
    const ny = await (
      await GET(new Request("http://localhost/api/idx/pins?north=42.2&south=40.4&east=-73.3&west=-74.9"))
    ).json();
    expect(ny.total).toBeGreaterThan(0);
    expect(ny.total).toBeLessThanOrEqual(all.pins.length);
    for (const p of ny.pins) {
      expect(p.lat).toBeGreaterThanOrEqual(40.4);
      expect(p.lat).toBeLessThanOrEqual(42.2);
      expect(p.lng).toBeGreaterThanOrEqual(-74.9);
      expect(p.lng).toBeLessThanOrEqual(-73.3);
    }
  });

  it("ignores a partial/garbled bbox (falls back to the unbounded set)", async () => {
    const all = await (await GET(new Request("http://localhost/api/idx/pins"))).json();
    const partial = await (
      await GET(new Request("http://localhost/api/idx/pins?north=41")) // missing s/e/w → invalid
    ).json();
    expect(partial.total).toBe(all.total);
    expect(partial.pins.length).toBe(all.pins.length);
  });
});
