import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** NO PAGE MAY APPEND THE BRAND THE ROOT TEMPLATE ALREADY APPENDS.
 *
 * app/layout.tsx sets `title.template: "%s | RealtyLT"`, which Next applies to every route
 * EXCEPT the segment that defines it — so app/page.tsx names the brand itself and every other
 * page must not. /thank-you did, and shipped to production as "Thanks | RealtyLT | RealtyLT".
 * The GA page_view carried the doubled string too, so it was being recorded that way as well.
 *
 * One route's mistake is a typo; a rule nothing measures is the next round's typo.
 */
const APP = path.resolve(__dirname);

function pageFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return pageFiles(full);
    return e.name === "page.tsx" ? [full] : [];
  });
}

/** `title: "..."` at the top level of an exported metadata object. Nested `title:` keys inside
 *  openGraph, or inside the page's own content arrays, are not route titles and are skipped. */
function routeTitle(src: string): string | null {
  const meta = src.match(/export const metadata[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!meta) return null;
  const title = meta[1].match(/^\s{2}title:\s*"([^"]*)"/m);
  return title ? title[1] : null;
}

describe("route titles and the root template", () => {
  it("finds page files to check at all (the scan must not silently match nothing)", () => {
    expect(pageFiles(APP).length).toBeGreaterThan(10);
  });

  it("never lets a child route append the brand twice", () => {
    const root = path.join(APP, "page.tsx");
    const offenders = pageFiles(APP)
      .filter((f) => f !== root)
      .map((f) => [path.relative(APP, f), routeTitle(fs.readFileSync(f, "utf8"))] as const)
      .filter(([, t]) => t !== null && /\|\s*RealtyLT\s*$/.test(t));

    expect(offenders).toEqual([]);
  });
});
