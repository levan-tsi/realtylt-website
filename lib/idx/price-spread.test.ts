import { describe, expect, it } from "vitest";
import { bandOf, interleaveByBand, pickPriceSpread, PRICE_BANDS } from "./price-spread";

const at = (price: number, id = String(price)) => ({ price, id });
/** A pool shaped like the real inventory: bottom-heavy, with a thin luxury tail. */
const pool = [
  ...Array.from({ length: 40 }, (_, i) => at(200_000 + i, `cheap${i}`)),
  ...Array.from({ length: 40 }, (_, i) => at(700_000 + i, `mid${i}`)),
  ...Array.from({ length: 20 }, (_, i) => at(2_000_000 + i, `high${i}`)),
  ...Array.from({ length: 3 }, (_, i) => at(6_000_000 + i, `lux${i}`)),
  ...Array.from({ length: 2 }, (_, i) => at(12_000_000 + i, `mega${i}`)),
];

describe("bandOf", () => {
  it("puts each price in the band that contains it", () => {
    expect(bandOf(100_000)).toBe(0);
    expect(bandOf(499_999)).toBe(0);
    expect(bandOf(500_000)).toBe(1);
    expect(bandOf(999_999)).toBe(1);
    expect(bandOf(1_000_000)).toBe(2);
    expect(bandOf(5_000_000)).toBe(3);
    expect(bandOf(10_000_000)).toBe(4);
    expect(bandOf(80_000_000)).toBe(4);
  });
  it("bands are contiguous and cover every price", () => {
    for (let i = 1; i < PRICE_BANDS.length; i++) {
      expect(PRICE_BANDS[i].min).toBe(PRICE_BANDS[i - 1].max);
    }
    expect(PRICE_BANDS[0].min).toBe(0);
    expect(PRICE_BANDS.at(-1)!.max).toBe(Infinity);
  });
});

describe("pickPriceSpread — a rail that spans the range", () => {
  it("reaches the expensive bands a fair shuffle would never surface", () => {
    const out = pickPriceSpread(pool, 8);
    expect(out).toHaveLength(8);
    const bands = new Set(out.map((r) => bandOf(r.price)));
    expect(bands.size).toBeGreaterThanOrEqual(4); // genuinely spread, not all starter homes
    expect(out.some((r) => r.price >= 10_000_000)).toBe(true);
    expect(out.some((r) => r.price >= 5_000_000 && r.price < 10_000_000)).toBe(true);
    expect(out.some((r) => r.price < 1_000_000)).toBe(true);
  });

  it("never invents or duplicates a listing", () => {
    const out = pickPriceSpread(pool, 8);
    expect(new Set(out).size).toBe(out.length);
    for (const r of out) expect(pool).toContain(r);
  });

  it("still fills the rail when the luxury bands are EMPTY (thin market)", () => {
    const cheapOnly = pool.filter((r) => r.price < 1_000_000);
    const out = pickPriceSpread(cheapOnly, 8);
    expect(out).toHaveLength(8); // no holes just because nothing costs $10M
  });

  it("returns everything when the pool is smaller than the rail", () => {
    const tiny = [at(300_000), at(9_000_000)];
    expect(pickPriceSpread(tiny, 8)).toHaveLength(2);
  });

  it("keeps the caller's order, so a newest-first pool stays newest-first", () => {
    const out = pickPriceSpread(pool, 8);
    const idx = out.map((r) => pool.indexOf(r));
    expect(idx).toEqual([...idx].sort((a, b) => a - b));
  });

  it("handles empty input and non-positive limits", () => {
    expect(pickPriceSpread([], 8)).toEqual([]);
    expect(pickPriceSpread(pool, 0)).toEqual([]);
  });

  it("gives the leftover slots to the MIDDLE bands, not to the cheapest", () => {
    // Run against the real featured inventory, backfilling cheapest-first put a $29,000 and a
    // $30,000 land parcel on the rail beside a $10M house. The owner asked for "55% between
    // 500k-5m", so the slack belongs to the middle.
    const realistic = [
      ...Array.from({ length: 20 }, (_, i) => at(29_000 + i, `junk${i}`)),
      ...Array.from({ length: 20 }, (_, i) => at(750_000 + i, `mid${i}`)),
      ...Array.from({ length: 20 }, (_, i) => at(2_400_000 + i, `upper${i}`)),
      at(6_800_000, "lux"),
      at(10_000_000, "mega"),
    ];
    const out = pickPriceSpread(realistic, 8);
    const midCount = out.filter((r) => r.price >= 500_000 && r.price < 5_000_000).length;
    expect(midCount).toBeGreaterThanOrEqual(4); // the bulk sits where he asked for it
    expect(out.filter((r) => r.price < 500_000)).toHaveLength(1); // exactly the guaranteed slot
    expect(out.some((r) => r.price >= 10_000_000)).toBe(true);
    expect(out.some((r) => r.price >= 5_000_000 && r.price < 10_000_000)).toBe(true);
  });
});

describe("interleaveByBand — the mixed sort's actual promise", () => {
  it("returns exactly the same listings, only reordered", () => {
    const page = pool.slice(0, 36);
    const out = interleaveByBand(page);
    expect(out).toHaveLength(page.length);
    expect(new Set(out)).toEqual(new Set(page));
  });

  it("opens on range instead of on a run of one band", () => {
    // A page sorted ascending really does start with a long run of starter homes — that is
    // the complaint. Build it from the whole pool so the page HAS other bands to interleave.
    const page = [...pool].sort((a, b) => a.price - b.price);
    expect(new Set(page.slice(0, 4).map((r) => bandOf(r.price))).size).toBe(1); // before: one band
    const out = interleaveByBand(page);
    expect(new Set(out.slice(0, 4).map((r) => bandOf(r.price))).size).toBeGreaterThan(1);
  });

  it("is a no-op on a single-band page rather than dropping rows", () => {
    const page = Array.from({ length: 10 }, (_, i) => at(300_000 + i));
    expect(interleaveByBand(page)).toHaveLength(10);
  });

  it("handles an empty page", () => {
    expect(interleaveByBand([])).toEqual([]);
  });
});
