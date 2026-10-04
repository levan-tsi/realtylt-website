import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** The photo viewer's top bar at phone widths (round 66, builder 3).
 *
 * Measured on the running build (scripts/_scratch-r66/final/gallery-bar.mjs): at 390 the three tabs,
 * the counter and the close did not fit the row, so "Street View", "Map View" and "2 / 11" each
 * folded onto two lines and the 44px close was squeezed to 41x44 (31x44 at 320). Source-level so a
 * class edit is caught on every `npm test`; the probe is the rendered check. */
const src = fs.readFileSync(path.join(process.cwd(), "components/idx/ListingGallery.tsx"), "utf8");

describe("the photo viewer's bar never folds a label or squeezes the close", () => {
  it("keeps every tab label on one line", () => {
    const tab = src.match(/const tabBtn[\s\S]*?className=\{`([^`$]*)/)?.[1] ?? "";
    expect(tab).toMatch(/\bwhitespace-nowrap\b/);
    expect(tab).toMatch(/\bshrink-0\b/);
  });

  it("lets the tab row scroll below 390 rather than fold", () => {
    const list = src.match(/role="tablist"[^>]*className="([^"]*)"/)?.[1] ?? "";
    expect(list).toMatch(/\bmin-w-0\b/);
    expect(list).toMatch(/max-\[389px\]:overflow-x-auto/);
  });

  it("keeps the counter on one line and the close cluster at its size", () => {
    expect(src).toContain('<span aria-hidden className="whitespace-nowrap font-mono text-sm tabular-nums text-paper/80">');
    expect(src).toContain('<div className="flex shrink-0 items-center gap-3">');
  });
});
