import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE LEGAL MARKS IN THE FOOTER, PINNED.
 *
 * Two marks ship on every page and both carry usage rules that are easy to break by accident
 * while doing something else.
 *
 * 1. EQUAL HOUSING OPPORTUNITY — HUD's fair-housing advertising guidance: where other
 *    logotypes appear in the advertisement, the Equal Housing mark should be "at least equal
 *    in size to the largest of the other logotypes". Round 11 wrote that rule into
 *    docs/parity/DESIGN-ROUND11.md and then shipped the mark at 32px, which made it the
 *    SMALLEST logotype on every page — the header wordmark measured 43.0px between 640 and
 *    1279px wide. Round 29 measured it (8 pages x 6 widths, 48/48 too small) and raised the
 *    mark to 44px. The rot mode this guards is not somebody deleting the mark: it is somebody
 *    growing the header logo, or shrinking the footer mark, months from now with no idea a
 *    ratio was load-bearing. So the test does the arithmetic from the SAME numbers the
 *    components render from.
 *
 * 2. THE REALTOR® MARK — NAR's form-of-use rule: all capitals with the ® adjacent, and the
 *    contextual-use rule requires a membership reference in the same phrase. "Member of the
 *    National Association of REALTORS®" satisfies both. It is also a MEMBERSHIP CLAIM: only
 *    NAR members may display the marks at all, so if that membership ever lapses this line
 *    comes off the site. Recorded here because a comment in a component is where nobody looks.
 */

const ROOT = path.resolve(__dirname, "../..");
const footer = fs.readFileSync(path.join(ROOT, "components/site/Footer.tsx"), "utf8");
const header = fs.readFileSync(path.join(ROOT, "components/site/Header.tsx"), "utf8");
const mark = fs.readFileSync(path.join(ROOT, "components/site/EqualHousingMark.tsx"), "utf8");

/** Tailwind height/width utilities used on these two logos, in px. */
const REM = 16;
function widthPx(token: string): number | null {
  const arbitrary = token.match(/^w-\[(\d+(?:\.\d+)?)px\]$/);
  if (arbitrary) return Number(arbitrary[1]);
  const scale = token.match(/^w-(\d+(?:\.\d+)?)$/);
  return scale ? (Number(scale[1]) / 4) * REM : null;
}
function heightPx(token: string): number | null {
  const arbitrary = token.match(/^h-\[(\d+(?:\.\d+)?)px\]$/);
  if (arbitrary) return Number(arbitrary[1]);
  const scale = token.match(/^h-(\d+(?:\.\d+)?)$/);
  return scale ? (Number(scale[1]) / 4) * REM : null;
}

/** Every rendered height of an <Image src="/logo-realtylt.png"> in one file. The logo is
 * always sized by WIDTH with h-auto, so the rendered height is width x (height/width) of the
 * source file that the same JSX declares. */
function logoHeights(src: string): number[] {
  const out: number[] = [];
  for (const block of src.split("<Image")) {
    if (!block.includes("/logo-realtylt.png")) continue;
    const w = Number(block.match(/width=\{(\d+)\}/)?.[1]);
    const h = Number(block.match(/height=\{(\d+)\}/)?.[1]);
    const cls = block.match(/className="([^"]+)"/)?.[1] ?? "";
    if (!w || !h) continue;
    for (const token of cls.split(/\s+/)) {
      // drop any responsive prefix — every breakpoint is a width the visitor can be at
      const bare = token.replace(/^[a-z0-9]+:/, "");
      const px = widthPx(bare);
      if (px !== null) out.push((px * h) / w);
    }
  }
  return out;
}

describe("footer legal marks", () => {
  it("draws the Equal Housing mark at least as tall as the largest other logotype", () => {
    const ehoClass = footer.match(/<EqualHousingMark className="([^"]+)"/)?.[1];
    expect(ehoClass, "the Equal Housing mark must be in the footer").toBeTruthy();

    const ehoHeights = ehoClass!
      .split(/\s+/)
      .map((t) => heightPx(t.replace(/^[a-z0-9]+:/, "")))
      .filter((n): n is number => n !== null);
    expect(ehoHeights.length, `no height utility on <EqualHousingMark className="${ehoClass}">`).toBe(1);

    const others = [...logoHeights(header), ...logoHeights(footer)];
    expect(others.length, "expected to find the RealtyLT wordmark in the header and the footer").toBeGreaterThan(2);

    const tallestOther = Math.max(...others);
    expect(
      ehoHeights[0],
      `HUD fair-housing advertising guidance: where other logotypes appear, the Equal Housing ` +
        `mark is at least equal in size to the largest of them. The mark renders at ` +
        `${ehoHeights[0]}px; the tallest RealtyLT wordmark renders at ${tallestOther.toFixed(1)}px ` +
        `(heights found: ${others.map((n) => n.toFixed(1)).join(", ")}). Raise the mark, or ` +
        `shrink the wordmark — do not just delete this test.`,
    ).toBeGreaterThanOrEqual(tallestOther);
  });

  it("keeps the mark's aspect ratio, so a height utility is enough to size it", () => {
    // The arithmetic above assumes w-auto: if the SVG ever gets a fixed width the height test
    // stops describing what a visitor sees.
    expect(footer).toMatch(/<EqualHousingMark className="[^"]*\bw-auto\b/);
    expect(mark).toContain('viewBox="0 0 282 244"');
  });

  it("writes REALTOR® in the preferred form, beside a membership reference", () => {
    // NAR form of use: all capitals, ® adjacent. NAR contextual use: a membership reference
    // in the same phrase — here, the association's own name.
    expect(footer).toContain("National Association of REALTORS&reg;");
    // Never the lowercase or title-case forms, which NAR's form-of-use rule prohibits outside
    // domain names and email addresses.
    const visible = footer.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(visible).not.toMatch(/\bRealtors?\b/);
    expect(visible).not.toMatch(/\brealtors?\b/);
  });

  it("keeps the Equal Housing statement beside the mark", () => {
    // HUD accepts the logotype, the statement or the slogan. We ship the logo AND the words,
    // which is the combination HUD itself publishes; the words are also what a screen reader
    // gets, since the SVG is aria-hidden.
    expect(footer).toContain("Equal Housing Opportunity.");
    expect(mark).toContain("aria-hidden");
  });
});
