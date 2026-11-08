import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { LOOK_SWITCH_SCRIPT } from "./look-switch";

/**
 * Round 69: the preview's look switch and the one taste pair it draws (docs/parity/DESIGN-ROUND69.md §4). The pair is
 * the two labels that carry no fact: "Start here" over the intake's heading and "Reach out" over the footer's address
 * (DESIGN-ROUND68 §1 move 2 on the home page). The branch's default drops them (the recommendation); `?r69=labels-on`
 * on the home page draws them as live has them. Removed with its CSS when he has picked.
 */
const ROOT = path.resolve(import.meta.dirname, "../..");
const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8").replace(/\r\n/g, "\n");
const page = fs.readFileSync(path.join(ROOT, "app/page.tsx"), "utf8");
const footer = fs.readFileSync(path.join(ROOT, "components/site/Footer.tsx"), "utf8");

function run(search: string): string | null {
  const attrs: Record<string, string> = {};
  const fakeDocument = { documentElement: { setAttribute: (k: string, v: string) => (attrs[k] = v) } };
  new Function("location", "document", LOOK_SWITCH_SCRIPT)({ search }, fakeDocument);
  return attrs["data-r69"] ?? null;
}

describe("the preview's look switch", () => {
  it("sets data-r69 from ?r69= and from nothing else", () => {
    expect(run("?r69=labels-on")).toBe("labels-on");
    expect(run("")).toBeNull();
    expect(run("?r69=%3Cimg%20src%3Dx%3E")).toBeNull();
    expect(run("?r69=" + "a".repeat(41))).toBeNull();
  });

  it("runs on the home page", () => {
    expect(page).toContain('import { LOOK_SWITCH_SCRIPT } from "@/components/home/look-switch";');
    expect(page).toContain("<script dangerouslySetInnerHTML={{ __html: LOOK_SWITCH_SCRIPT }} />");
  });

  it("drops the two fact-less labels by default and draws them under labels-on", () => {
    expect(footer).toContain('<p data-r69-label className="t-eyebrow mt-9 text-ink">Reach out</p>');
    expect(css).toMatch(/p\.t-eyebrow:has\(\+ h2 #value-heading\),\s*footer \[data-r69-label\] \{\s*display: none;/);
    expect(css).toMatch(/footer \[data-r69-label\] \+ address \{\s*margin-top: 2\.25rem;/);
    expect(css).toMatch(/:root\[data-r69~="labels-on"\] p\.t-eyebrow:has\(\+ h2 #value-heading\),\s*:root\[data-r69~="labels-on"\] footer \[data-r69-label\] \{\s*display: block;/);
    expect(css).toMatch(/:root\[data-r69~="labels-on"\] footer \[data-r69-label\] \+ address \{\s*margin-top: 1rem;/);
  });

  it("sits outside every @layer, so the address's margin beats its own mt-4 utility", () => {
    // Measured on the first build: inside `@layer components` the rule matched and the margin stayed 16 px.
    const at = css.indexOf("footer [data-r69-label] + address {");
    for (const m of css.matchAll(/@layer [a-z]+ \{/g)) {
      let depth = 0, end = -1;
      for (let i = m.index! + m[0].length - 1; i < css.length; i++) {
        if (css[i] === "{") depth++;
        else if (css[i] === "}" && --depth === 0) { end = i; break; }
      }
      expect(at > m.index! && at < end, `the label rules sit inside "${m[0]}"`).toBe(false);
    }
  });
});
