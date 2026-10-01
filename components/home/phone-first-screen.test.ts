import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Round 62, the phone's first screen (the owner on his phone: "it lost all the effect ... map is not
 * really shown", and a "dark cloud" bottom left). The first screen on a phone is the headline at the
 * top, the lit city in the open middle and a two-line count with the search at the foot; the two
 * boxed links wait just below it. The credit corner on a phone is the (i)'s own 48 x 44, and no hole
 * is cut in the words or the shades round it. Every rule here is scoped under the lg breakpoint, so
 * the laptop's approved layout does not move. Checked on the source, because a class that drifts
 * back does not fail anything else.
 */
const ROOT = path.resolve(import.meta.dirname, "../..");
const page = fs.readFileSync(path.join(ROOT, "app/page.tsx"), "utf8");
const ground = fs.readFileSync(path.join(ROOT, "components/home/ml/MlGround.tsx"), "utf8");

describe("the phone's first screen", () => {
  it("keeps the two boxed links right under the search on a phone too (the owner: below the fold they were not seen)", () => {
    expect(page.match(/<HeroLinks \/>/g)).toHaveLength(1);
    expect(page).toMatch(/className="rise rise-4 mt-5 flex flex-wrap gap-x-3 gap-y-3 max-lg:mt-3">\s*<HeroLinks \/>/);
  });

  it("keeps the two links on one row under 375 px with the nav's short label (round 65, 320 x 568)", () => {
    expect(page).toContain('{ href: "/home-value", label: "What is my home worth?", short: "Home value" }');
    expect(page).toContain('<span className="max-[374px]:hidden">{c.label}</span>');
    expect(page).toContain('<span className="min-[375px]:hidden">{c.short}</span>');
  });

  it("keeps the count short on a phone and the laptop's sentence whole", () => {
    // Whole runs per layout: a span boundary inside "boroughs." moved the laptop's period by a pixel.
    expect(page.match(/<span className="max-lg:hidden">right now, from Poughkeepsie to the five boroughs\.<\/span>/g)).toHaveLength(2);
    expect(page.match(/<span className="lg:hidden">right now\.<\/span>/g)).toHaveLength(2);
    expect(page).toContain("t-lead phone-halo rise rise-2 max-w-[30rem] text-ink-soft max-lg:text-[17px] max-lg:[text-wrap:pretty]");
  });

  it("ends the phone's first screen 44 px up and leaves the laptop's padding as it was", () => {
    expect(page).toContain("flex-col justify-between px-4 pb-11 pt-32 lg:justify-end lg:px-8 lg:pb-24 lg:pt-40");
  });
});

describe("the credit corner on a phone", () => {
  it("is the (i)'s own size, the laptop's unchanged", () => {
    expect(ground).toContain("const CREDIT_CORNER = { w: 180, h: 54 };");
    expect(ground).toContain("const PHONE_CREDIT_CORNER = { w: 48, h: 44 };");
    expect(ground).not.toMatch(/CREDIT_CORNER\.[wh]/);
  });

  it("cuts no hole in the words, the shades or the veil on a phone, and the foot shade is gone", () => {
    expect(ground.match(/\$\{NO_HOLE_ON_PHONE\}/g)).toHaveLength(3);
    expect(ground).not.toContain("FOOT_SHADE");
    expect(ground).not.toContain("footShade");
  });

  // Round 63 (the owner: "make them see-through so the map is fully visible ... even on the top").
  it("puts no shade behind a phone's words, not even the top one; the words carry the map's label shadow", () => {
    expect(ground).toContain('const blocks = (wide ? [...document.querySelectorAll<HTMLElement>("[data-quiet]")] : [])');
    expect(ground).toContain('className="absolute inset-x-0 top-0 h-[230px] max-lg:hidden"');
    expect(ground).not.toContain("PHONE_SCRIM");
    const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
    expect(css.replace(/\s+/g, " ")).toContain(".phone-halo, [data-shot] [data-quiet] { text-shadow: 0 0 1px rgba(0, 0, 0, 1), 0 0 3px rgba(0, 0, 0, 0.95), 0 0 12px rgba(0, 0, 0, 0.8); }");
    for (const cls of ["t-eyebrow phone-halo", "t-display phone-halo", "search-instrument phone-glass"]) expect(page).toContain(cls);
  });
});

describe("where we work on a phone", () => {
  const css = fs.readFileSync(path.join(ROOT, "app/globals.css"), "utf8");
  const chapter = fs.readFileSync(path.join(ROOT, "components/home/ml/MlAreaChapter.tsx"), "utf8");

  it("pins the stage only on a phone with JavaScript, and shows the chips only there", () => {
    const at = css.indexOf("@media (max-width: 1023.98px) and (scripting: enabled)");
    expect(at).toBeGreaterThan(0);
    const block = css.slice(at, css.indexOf("\n}\n", at));
    expect(block).toMatch(/\.rlt-areas-stage \{[^}]*position: sticky;[^}]*height: 100svh;/);
    expect(block).toMatch(/\.rlt-area-chips \{\s*display: block;/);
    expect(css).toMatch(/\.rlt-area-chips \{\s*display: none;\s*\}/);
    expect(page).toContain('data-pin="phone"');
    expect(page).toContain("data-pin-stage");
  });

  it("makes a chip scroll to its area (the scroll is the flight), and the county's page one link away", () => {
    expect(chapter).toContain("onClick={() => goTo(row.shot)}");
    expect(chapter).toContain("aria-pressed={on}");
    expect(chapter).toMatch(/href=\{active\.href\}[\s\S]{0,700}See homes/);
  });
});
