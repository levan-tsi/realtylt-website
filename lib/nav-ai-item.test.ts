import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FOOTER_NAV, NAV } from "./site";

/** THE AI ITEM IN THE HEADER NAV (owner-directed, 2026-08-28: "add AI before connect on top
 * menu bar and give it purple outline or our logo R blue so people notice").
 *
 * Three things have to stay true together: it sits IMMEDIATELY before Connect; it is marked
 * external, because /ai is served by a rewrite to the AI page's own deployment and a <Link>
 * prefetch there 404s (the footer learned this first); and the header draws it as a plain
 * anchor outlined in the logo-R blue, not the purple the palette rule bans as a primary.
 */
const ROOT = path.resolve(__dirname, "..");
const header = fs.readFileSync(path.join(ROOT, "components", "site", "Header.tsx"), "utf8");

describe("the AI nav item", () => {
  const labels = NAV.map((i) => i.label);

  it("sits immediately before Connect in the primary nav", () => {
    const ai = labels.indexOf("AI");
    const connect = labels.indexOf("Connect");
    expect(ai).toBeGreaterThan(-1);
    expect(connect).toBe(ai + 1);
    expect(connect).toBe(labels.length - 1);
  });

  it("points at /ai, external (rewrite, not an RSC route) and accented", () => {
    const item = NAV.find((i) => i.label === "AI")!;
    expect(item.href).toBe("/ai");
    expect("external" in item && item.external).toBe(true);
    expect("accent" in item && item.accent).toBe(true);
    // The footer already links /ai the same way; the two must agree on the destination.
    expect(FOOTER_NAV.find((i) => i.href === "/ai")).toBeDefined();
  });

  it("the header draws an accented item as a plain <a>, outlined in the R-blue, desktop and drawer", () => {
    // Two render sites (desktop row, mobile drawer), each a plain anchor carrying the outline.
    const anchors = header.match(/<a\s+href=\{item\.href\}\s+className=\{`[^`]*border-porchlight[^`]*`\}/g) ?? [];
    expect(anchors.length, "desktop + drawer").toBe(2);
    for (const a of anchors) {
      expect(a).toContain("text-porchlight-deep"); // 5.0:1 on paper; the pure R-blue fails AA at 13px
      expect(a).toContain("hover:bg-porchlight");
      expect(a).not.toMatch(/purple|violet|#8b5cf6/i);
    }
    // Both are gated on the accent flag, not on a label string that could drift.
    expect((header.match(/"accent" in item && item\.accent/g) ?? []).length).toBe(2);
  });
});
