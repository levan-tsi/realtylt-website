import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Round 69: the home intake's first three answers ("Buying", "Selling", "Both") are anchors, so with scripting off
 * they are the three most useful links on the page; with it on, a click is the answer. They carried
 * `aria-pressed` from the server on, and no link may carry it (axe `aria-allowed-attr`, critical, x3 at every width;
 * the one Lighthouse accessibility failure, docs/parity/DESIGN-ROUND69.md §1b.2). Now the button role and the
 * pressed state arrive with hydration (the round 68 pattern of the photo grid, components/listing/nojs.test.ts), and
 * Space answers as Enter does, as it would on a button. Checked on the source.
 */
const ROOT = path.resolve(import.meta.dirname, "../..");
const src = fs.readFileSync(path.join(ROOT, "components/home/HomeIntake.tsx"), "utf8").replace(/\r\n/g, "\n");
const anchor = src.slice(src.indexOf("<a\n", src.indexOf("INTENT_OPTIONS.map")), src.indexOf("</a>", src.indexOf("INTENT_OPTIONS.map")));

describe("the intake's first answers", () => {
  it("knows when it has hydrated", () => {
    expect(src).toMatch(/const \[hydrated, setHydrated\] = useState\(false\);/);
    expect(src).toMatch(/useEffect\(\(\) => setHydrated\(true\), \[\]\);/);
  });

  it("stays a plain link until then: no role, no pressed state", () => {
    expect(anchor).toContain("href={o.href}");
    expect(anchor).toContain('role={hydrated ? "button" : undefined}');
    expect(anchor).toContain("aria-pressed={hydrated ? selected : undefined}");
    expect(anchor).not.toMatch(/aria-pressed=\{selected\}/);
  });

  it("answers on Space as a button does, once it is one", () => {
    expect(anchor).toMatch(/onKeyDown=\{\(e\) => \{\s*if \(!hydrated \|\| e\.key !== " "\) return;\s*e\.preventDefault\(\);\s*choose\("intent", o\.value\);/);
  });
});
