import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Round 69, the laptop's first screen on a short window. The hero's column is 864 px tall from 1280 wide, so on
 * the commonest laptop windows (1440 x 789, 1536 x 730, 1366 x 657, 1280 x 800) it ran past the fold and the credit
 * corner (MlGround CLEAR_STYLE, which erases the page's own words at the window's bottom-left on purpose) ate the
 * small lights line, and at 1366 x 657 the search box's first words and both boxed links
 * (docs/parity/DESIGN-ROUND69.md §1b.1, measured with scripts/_scratch-r69/hero-fit.mjs). The fix lives in three
 * height queries in app/globals.css; from 864 px tall none applies, so the approved layout is exactly as it was.
 * Checked on the source, because a rule that drifts does not fail anything else.
 */
const ROOT = path.resolve(import.meta.dirname, "../..");
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8").replace(/\r\n/g, "\n");
const page = fs.readFileSync(path.join(ROOT, "app/page.tsx"), "utf8");

/** The body of the first `@media <query> {` block, braces balanced. */
function block(query: string): string {
  const at = css.indexOf(`@media ${query} {`);
  expect(at, `no "@media ${query}" block in app/globals.css`).toBeGreaterThan(-1);
  let depth = 0;
  for (let i = css.indexOf("{", at); i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}" && --depth === 0) return css.slice(at, i + 1);
  }
  throw new Error("unbalanced");
}

describe("the laptop's first screen on a short window", () => {
  it("scales the top padding, the gaps and the headline under 864 px tall, laptops only", () => {
    const b = block("(min-width: 1024px) and (max-height: 863px)");
    expect(b).toMatch(/\.rlt-hero-pad \{\s*padding-top: 136px;/);
    // The headline keeps its width-based size and is capped by the window's height: 100 px at 862, 92.8 at 800.
    expect(b).toContain("font-size: min(clamp(3.5rem, 2.3rem + 5vw, 6.25rem), 11.6svh);");
    expect(b).toMatch(/\.rlt-hero-pad \[data-quiet="lead"\],\s*\.rlt-hero-pad \.search-instrument,\s*\.rlt-hero-pad \[data-hero-claim\] \{\s*margin-top: 24px;/);
    expect(b).toMatch(/\.rlt-hero-pad \.search-instrument \+ p \{\s*margin-top: 16px;/);
  });

  it("lets the small lights line step aside under 760 px and the count take its short form under 700", () => {
    expect(block("(min-width: 1024px) and (max-height: 759px)")).toMatch(/\.rlt-hero-pad \[data-hero-claim\] \{\s*display: none;/);
    const b = block("(min-width: 1024px) and (max-height: 699px)");
    expect(b).toContain("11svh");
    expect(b).toMatch(/\.rlt-hero-pad \.t-lead > \.max-lg\\:hidden \{\s*display: none;/);
    expect(b).toMatch(/\.rlt-hero-pad \.t-lead > \.lg\\:hidden \{\s*display: inline;/);
  });

  it("comes before the no-script padding, which must win where the no-script header is a row taller", () => {
    expect(css.indexOf("@media (min-width: 1024px) and (max-height: 863px) {")).toBeLessThan(css.indexOf("@media (scripting: none) and (max-width: 1279px) {"));
  });

  it("marks the small lights line the rules step aside, and only that line", () => {
    expect(page.match(/data-hero-claim/g)).toHaveLength(1);
    expect(page).toMatch(/<p data-quiet data-hero-claim className=\{`mt-10 hidden w-fit max-w-\[26rem\]/);
  });
});
