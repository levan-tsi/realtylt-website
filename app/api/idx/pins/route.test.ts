import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/idx/pins — full-result map pins", () => {
  it("returns EVERY match (not one grid page) as slim pins", async () => {
    const res = await GET(new Request("http://localhost/api/idx/pins"));
    const json = await res.json();
    expect(json.total).toBeGreaterThan(12); // fixture set is far bigger than a grid page
    expect(json.pins.length).toBe(json.total); // unpaged
    const pin = json.pins[0];
    expect(Object.keys(pin).sort()).toEqual(
      ["address", "baths", "beds", "city", "id", "lat", "lng", "office", "price", "zip"],
    );
    expect(pin.lat).not.toBe(0); // Null Island rows never ship
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
