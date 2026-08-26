import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * "CLEAR ALL FILTERS" HAS TO CLEAR ALL THE FILTERS.
 *
 * The empty state ("No homes match those filters.") offers exactly one way out, and for the
 * MORE panel's fields it was a dead click: `CLEARED_FILTERS` listed the bar's filters plus the
 * panel's four numeric ranges, and nothing else. A search narrowed by home type, heating fuel,
 * parking, keywords, a feature toggle, or either end of Days on market hit zero results, showed
 * the button, and the click left the URL, the filters and the zero count exactly as they were.
 * Measured on the dev server before the fix, three separate URLs reproduced it:
 *   /search?quick=new&listedMinDays=90            → 0 results, click → still 0, URL unchanged
 *   /search?keywords=zzqqxxnothing                → 0 results, click → still 0, URL unchanged
 *   /search?homeType=condo&heating=solar&…        → 0 results, click → still 0, URL unchanged
 * The panel's own "Reset advanced" cleared every one of them, so the two buttons disagreed
 * about what counts as a filter, and the one a stuck visitor is shown was the wrong one.
 *
 * The type annotation on CLEARED_FILTERS is the real guard (a missing key fails `tsc`). This is
 * the readable one: it names the defect, and it fails with the field's own name rather than a
 * structural type error, so the next person adding a panel field learns why in one line.
 *
 * A source scan rather than a render — the same reason search-instrument.test.ts is one: the
 * drift happens when someone adds a field to the panel and forgets this object, and the source
 * is where that is visible.
 */

const ROOT = path.resolve(__dirname, "../..");
const SRC = fs.readFileSync(path.join(ROOT, "components/search/SearchClient.tsx"), "utf8");

/** The string members of a `const X = [...] as const` declaration. */
function stringArrayConst(name: string): string[] {
  const m = SRC.match(new RegExp(`const ${name} = \\[([^\\]]*)\\]`));
  if (!m) throw new Error(`${name} not found in SearchClient.tsx`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** CLEARED_FILTERS as { field: literal } — the object literal, not its type annotation. */
function clearedFilters(): Record<string, string> {
  const start = SRC.indexOf("const CLEARED_FILTERS");
  if (start < 0) throw new Error("CLEARED_FILTERS not found in SearchClient.tsx");
  const open = SRC.indexOf("= {", start);
  const end = SRC.indexOf("\n};", open);
  const body = SRC.slice(open + 3, end);
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/(\w+):\s*("[^"]*"|true|false)/g)) out[m[1]] = m[2];
  return out;
}

const MORE_KEYS = stringArrayConst("MORE_KEYS");
const MORE_FLAGS = stringArrayConst("MORE_FLAGS");
const CLEARED = clearedFilters();

describe("the empty state's Clear All Filters", () => {
  it("reads the two panel field lists it has to cover", () => {
    expect(MORE_KEYS).toContain("listedMinDays");
    expect(MORE_KEYS).toContain("listedDays");
    expect(MORE_KEYS.length).toBeGreaterThanOrEqual(15);
    expect(MORE_FLAGS.length).toBeGreaterThanOrEqual(12);
  });

  it("clears every MORE-panel value field, so no panel filter survives the click", () => {
    for (const key of MORE_KEYS) {
      expect(CLEARED[key], `CLEARED_FILTERS never clears \`${key}\` — the empty state's button is a dead click for it`).toBe('""');
    }
  });

  it("clears every MORE-panel toggle, including the photo checkbox", () => {
    for (const key of [...MORE_FLAGS, "withPhotos"]) {
      expect(CLEARED[key], `CLEARED_FILTERS never clears \`${key}\` — the empty state's button is a dead click for it`).toBe("false");
    }
  });

  it("still clears the filter bar's own fields", () => {
    for (const key of ["q", "city", "county", "priceMin", "priceMax", "bedsMin", "bathsMin", "sqftMin", "propertyType"]) {
      expect(CLEARED[key], `CLEARED_FILTERS stopped clearing \`${key}\``).toBe('""');
    }
  });

  it("clears at least everything the panel's own Reset advanced clears", () => {
    // Two buttons, two lists; they disagreed once and the stuck visitor got the shorter one.
    const start = SRC.indexOf("const clearMore =");
    const body = SRC.slice(SRC.indexOf("apply({", start), SRC.indexOf("});", start));
    const resetKeys = [...body.matchAll(/(\w+):\s*(?:""|false)/g)].map((m) => m[1]);
    expect(resetKeys.length).toBeGreaterThan(20);
    for (const key of resetKeys) {
      expect(Object.keys(CLEARED), `Reset advanced clears \`${key}\` but Clear All Filters does not`).toContain(key);
    }
  });
});
