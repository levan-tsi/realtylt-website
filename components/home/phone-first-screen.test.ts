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
  it("shows the two boxed links once per layout: under the search on a laptop, below the first screen on a phone", () => {
    expect(page.match(/<HeroLinks \/>/g)).toHaveLength(2);
    expect(page).toMatch(/className="rise rise-4 mt-5 flex flex-wrap gap-x-3 gap-y-3 max-lg:hidden">\s*<HeroLinks \/>/);
    expect(page).toMatch(/className="pointer-events-auto relative z-10 flex flex-wrap gap-x-3 gap-y-3 px-4 pb-6 lg:hidden">\s*<HeroLinks \/>/);
  });

  it("keeps the count short on a phone and the laptop's sentence whole", () => {
    expect(page.match(/<span className="max-lg:hidden">, from Poughkeepsie to the five boroughs<\/span>/g)).toHaveLength(2);
    expect(page).toContain("t-lead rise rise-2 max-w-[30rem] text-ink-soft max-lg:text-[17px]");
  });

  it("ends the phone's first screen 56 px up and leaves the laptop's padding as it was", () => {
    expect(page).toContain("flex-col justify-between px-4 pb-14 pt-32 lg:justify-end lg:px-8 lg:pb-24 lg:pt-40");
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

  it("shades a phone's words with a short feather", () => {
    expect(ground).toContain("const PHONE_SCRIM_FEATHER = 56;");
    expect(ground).toContain("const feather = wide ? SCRIM_FEATHER : PHONE_SCRIM_FEATHER;");
  });
});
