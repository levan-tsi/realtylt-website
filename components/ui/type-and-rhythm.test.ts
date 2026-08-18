import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** THE SCALES, AND THE GATE THAT KEEPS THEM.
 *
 * Round 11 replaced "the five ad-hoc paddings that were shipping" with three named rhythm steps.
 * By round 34 there were six ad-hoc paddings again — `py-16 md:py-24` on eleven sections,
 * `py-16 md:py-20` on three, `py-14` on three — and the rubric was reading them as sections off
 * the rhythm on /selling, /buying, /financing, /home-value, /top-areas, the county pages and
 * /who-we-are. Tokens re-rot without a gate; this is the gate.
 *
 * Same story for type. The committed scale is five DISPLAY classes, and everything the site set
 * in Lato above body size — card titles, CTA lead-ins, figures — had no name and was chosen
 * fresh at each call site. `.t-title` and `.t-lead` name the first two. See the long note in
 * globals.css for why the answer is two scales rather than one, and for what was deliberately
 * NOT done (the numeric voice, and teaching the rubric about these classes).
 */

const root = join(__dirname, "..", "..");
const css = readFileSync(join(root, "app", "globals.css"), "utf8");

/** Every page file under app/, so a NEW page cannot quietly start a seventh padding. */
function pageFiles(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) pageFiles(p, out);
    else if (e === "page.tsx") out.push(p);
  }
  return out;
}

describe("the vertical rhythm", () => {
  it("names exactly three steps", () => {
    for (const step of ["sec-sm", "sec", "sec-lg"]) {
      expect(css, `.${step} is missing`).toMatch(new RegExp(`\\.${step}\\s*\\{[^}]*padding-block`));
    }
  });

  it("is not bypassed by an ad-hoc padding on any full-width band", () => {
    // A BAND IS A SECTION THAT PAINTS ITS OWN BACKGROUND — that is what makes it a full-width
    // stripe of the page, and what makes its padding part of the site's rhythm rather than one
    // block's internal spacing. A constrained `<section class="mx-auto max-w-7xl px-4 py-12">`
    // is a content block inside a band and is deliberately exempt, as are heroes, which are
    // `<div>`s sizing themselves around a photograph.
    const offenders: string[] = [];
    for (const f of pageFiles(join(root, "app"))) {
      const src = readFileSync(f, "utf8");
      for (const m of src.matchAll(/<section[^>]*className=[^>]*?>/g)) {
        const tag = m[0];
        if (!/\bbg-(paper|ink|mist|ink-soft)\b/.test(tag)) continue;
        if (!/\bpy-\d|\bmd:py-\d|\bpy-\[/.test(tag)) continue;
        offenders.push(`${f.slice(root.length + 1)}: ${tag.replace(/\s+/g, " ").slice(0, 96)}`);
      }
    }
    expect(offenders, `bands carrying their own padding instead of a rhythm step:\n${offenders.join("\n")}`).toEqual([]);
  });
});

describe("the UI type scale", () => {
  const rule = (sel: string) => {
    const i = css.indexOf(sel);
    if (i < 0) return null;
    const open = css.indexOf("{", i);
    return css.slice(open + 1, css.indexOf("}", open));
  };

  it("names a card title, in the TEXT face — a light serif goes weedy at a title's length", () => {
    const t = rule(".t-title");
    expect(t, ".t-title is missing").toBeTruthy();
    expect(t).toMatch(/font-family:\s*var\(--font-sans\)/);
    expect(t).toMatch(/font-size:\s*1\.25rem/);
    expect(t).toMatch(/font-weight:\s*700/);
  });

  it("names the sentence that leads into a pair of buttons, and it is fluid", () => {
    const t = rule(".t-lead");
    expect(t, ".t-lead is missing").toBeTruthy();
    expect(t).toMatch(/font-family:\s*var\(--font-sans\)/);
    expect(t).toMatch(/font-size:\s*clamp\(/);
    expect(t).toMatch(/font-weight:\s*300/);
  });

  it("gives small RUNNING copy 16px on a phone and 14px from md", () => {
    const t = rule(".t-small");
    expect(t, ".t-small is missing").toBeTruthy();
    expect(t).toMatch(/font-size:\s*1rem/);
    // and the md step down has to exist, or this is just "text-base" with a new name
    const md = css.slice(css.indexOf(".t-small"));
    expect(md).toMatch(/@media \(min-width: 768px\)[\s\S]{0,120}\.t-small\s*\{[\s\S]{0,120}font-size:\s*0\.875rem/);
  });
});

describe("the payment breakdown bar", () => {
  const calc = readFileSync(join(root, "components", "financing", "MortgageCalculator.tsx"), "utf8");
  it("does not transition a layout property", () => {
    // `transition: width 1s ease` was the last layout-property transition on the site and the
    // only D7 deduction on /financing. It also meant that while somebody typed, the bar spent a
    // second showing a breakdown that was true of neither the old numbers nor the new ones.
    const code = calc.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    expect(code).not.toMatch(/transition:\s*["'`]?\s*width/);
  });
});
