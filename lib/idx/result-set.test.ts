import { describe, expect, it } from "vitest";
import { neighbours, parseResultSet, type ResultSet } from "./result-set";

const item = (n: number) => ({ id: `KEY${n}`, path: `/homes-for-sale/NY/beacon/12508/${n}-main/bid-38-KEY${n}`, address: `${n} Main St` });
const set = (n: number, over: Partial<ResultSet> = {}): ResultSet => ({
  items: Array.from({ length: n }, (_, i) => item(i + 1)),
  page: 1,
  totalPages: 3,
  searchHref: "/search?county=orange",
  ...over,
});

describe("neighbours — what 'next listing' is allowed to mean", () => {
  it("finds the position and both sides in the middle of a set", () => {
    const n = neighbours(set(5), "KEY3");
    expect(n).toMatchObject({ index: 2, count: 5 });
    expect(n?.prev?.id).toBe("KEY2");
    expect(n?.next?.id).toBe("KEY3".replace("3", "4"));
  });

  it("stops hard at both ends — a set is ONE page, so there is nothing beyond it", () => {
    expect(neighbours(set(5), "KEY1")?.prev).toBeNull();
    expect(neighbours(set(5), "KEY1")?.next?.id).toBe("KEY2");
    expect(neighbours(set(5), "KEY5")?.next).toBeNull();
    expect(neighbours(set(5), "KEY5")?.prev?.id).toBe("KEY4");
  });

  it("a single-result set offers no arrows at all", () => {
    const n = neighbours(set(1), "KEY1");
    expect(n).toMatchObject({ index: 0, count: 1, prev: null, next: null });
  });

  it("RETURNS NULL for a listing that is not in the set — the cold-visitor case", () => {
    // A visitor arriving from Google must never see arrows that lead somewhere arbitrary.
    expect(neighbours(set(5), "KEY999")).toBeNull();
    expect(neighbours(null, "KEY1")).toBeNull();
  });

  it("carries the page context through so the pager can say why it stops", () => {
    expect(neighbours(set(5, { page: 2, totalPages: 7 }), "KEY5")).toMatchObject({ page: 2, totalPages: 7 });
  });
});

describe("parseResultSet — storage is untrusted input", () => {
  it("round-trips a set it wrote", () => {
    const s = set(3);
    expect(parseResultSet(JSON.stringify(s))).toEqual(s);
  });

  it("returns null for nothing, junk, or the wrong shape", () => {
    expect(parseResultSet(null)).toBeNull();
    expect(parseResultSet("")).toBeNull();
    expect(parseResultSet("not json")).toBeNull();
    expect(parseResultSet('"a string"')).toBeNull();
    expect(parseResultSet("{}")).toBeNull();
    expect(parseResultSet('{"items":[]}')).toBeNull();
    expect(parseResultSet('{"items":"nope"}')).toBeNull();
  });

  it("drops items whose fields are the wrong type instead of trusting the blob", () => {
    const raw = JSON.stringify({ items: [item(1), { id: 5, path: "/x", address: "y" }, { id: "KEY2" }], page: 1, totalPages: 1, searchHref: "/search" });
    expect(parseResultSet(raw)?.items.map((i) => i.id)).toEqual(["KEY1"]);
  });

  it("REFUSES OFF-SITE PATHS — `path` becomes an href, so it must stay site-relative", () => {
    const off = JSON.stringify({
      items: [
        { id: "A", path: "https://evil.example/x", address: "a" },
        { id: "B", path: "//evil.example/x", address: "b" }, // protocol-relative: startsWith("/") is not enough
        { id: "C", path: "javascript:alert(1)", address: "c" },
        item(9),
      ],
      page: 1,
      totalPages: 1,
      searchHref: "/search",
    });
    expect(parseResultSet(off)?.items.map((i) => i.id)).toEqual(["KEY9"]);
  });

  it("falls back to /search when the stored searchHref is missing or off-site", () => {
    const mk = (href: unknown) => JSON.stringify({ items: [item(1)], page: 1, totalPages: 1, searchHref: href });
    expect(parseResultSet(mk("https://evil.example"))?.searchHref).toBe("/search");
    expect(parseResultSet(mk("//evil.example"))?.searchHref).toBe("/search");
    expect(parseResultSet(mk(undefined))?.searchHref).toBe("/search");
    expect(parseResultSet(mk("/search?county=ulster"))?.searchHref).toBe("/search?county=ulster");
  });
});
