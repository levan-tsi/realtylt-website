import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE SHARE CARD MUST EXIST, BE THE SIZE THE TAGS CLAIM, AND BE THE CURRENT DESIGN.
 *
 * 2026-08-28: the owner shared realtylt.com by iMessage and the preview was the card drawn for
 * the pre-round-11 design (an "RT" monogram, Fraunces, "Six counties · One river"); nothing
 * held the card to the site. Every og:image reference now points at og-realtylt.png, which
 * scripts/make-og.mjs renders from the site's own logo, faces and hero photograph. This test
 * holds the references to the file, the file to its declared 1200x630, and the generator to
 * the site's faces rather than a font the site does not use.
 */
const ROOT = path.resolve(__dirname, "..");
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

function pngSize(file: string): { w: number; h: number } {
  const b = fs.readFileSync(path.join(ROOT, file));
  expect(b.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

describe("the share card", () => {
  const refs = [
    "app/layout.tsx",
    "app/services/page.tsx",
    "app/services/[slug]/page.tsx",
    "components/listing/ListingDetail.tsx",
    "lib/blog/structured-data.ts",
  ];

  it.each(refs)("%s references og-realtylt.png and nothing references the retired name", (file) => {
    const src = read(file);
    expect(src).toContain("/og-realtylt.png");
    expect(src).not.toMatch(/["`']\/og\.png/);
  });

  it("the file exists at the declared 1200x630", () => {
    expect(pngSize("public/og-realtylt.png")).toEqual({ w: 1200, h: 630 });
    // The legacy URL keeps serving the same card for anything that cached the old address.
    expect(pngSize("public/og.png")).toEqual({ w: 1200, h: 630 });
    expect(fs.readFileSync(path.join(ROOT, "public/og.png")).equals(fs.readFileSync(path.join(ROOT, "public/og-realtylt.png")))).toBe(true);
  });

  it("the generator draws the site's own faces and logo, not the retired design", () => {
    // Comments stripped: the generator's own header records what it replaced by name.
    const gen = read("scripts/make-og.mjs").replace(/^\s*\/\/.*$/gm, "");
    expect(gen).toContain("Newsreader");
    expect(gen).toContain("Lato");
    expect(gen).toContain("logo-realtylt.png");
    expect(gen).not.toMatch(/Fraunces|Nunito|Spline/);
    expect(gen).not.toContain("One river");
    // Both outputs, so the legacy URL cannot drift from the new one.
    expect(gen).toContain('"public/og-realtylt.png"');
    expect(gen).toContain('"public/og.png"');
  });

  it("the layout declares the size the file actually is", () => {
    const layout = read("app/layout.tsx");
    expect(layout).toMatch(/url: "\/og-realtylt\.png", width: 1200, height: 630/);
  });
});
