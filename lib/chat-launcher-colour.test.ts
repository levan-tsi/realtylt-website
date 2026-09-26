import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE CHAT LAUNCHER WEARS THE LOGO'S NAVY (owner's order 2026-09-25): "our chat icon has like light
 * color blue, can we make it a dark color blue that our logo has, the second one". The logo's two
 * blues are the bright R (#28a8e0) and the navy (#0f2e53); the launcher takes the navy, its white
 * glyph must stay readable on it at rest and on hover, and on the black site a hairline draws the
 * disc's edge. */
const js = fs.readFileSync(path.resolve(__dirname, "..", "public", "rlt-chat.js"), "utf8");

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
/** The launcher's own rule, to its closing brace (the template's `${…}` carry braces of their own). */
const bubbleRule = () => js.match(/\.rlt-bubble \{[\s\S]*?\n\s*\}/)?.[0] ?? "";
const config = (key: string) => js.match(new RegExp(`${key}: '(#[0-9a-f]{6})'`, "i"))?.[1];

describe("the chat launcher's colour", () => {
  const rest = config("LAUNCHER_COLOR");
  const hover = config("LAUNCHER_HOVER");

  it("is the logo's navy at rest", () => {
    expect(rest).toBe("#0f2e53");
  });

  it("paints the bubble from the launcher colours, not the panel's brand blue", () => {
    const bubble = bubbleRule();
    expect(bubble).toContain("background: ${CONFIG.LAUNCHER_COLOR};");
    expect(bubble).toContain("color: #fff;");
    expect(js).toMatch(/\.rlt-bubble:hover \{ background: \$\{CONFIG\.LAUNCHER_HOVER\};/);
  });

  it("keeps the white glyph well over 3:1 on the disc, at rest and on hover", () => {
    expect(ratio("#ffffff", rest!)).toBeGreaterThan(12);
    expect(ratio("#ffffff", hover!)).toBeGreaterThan(9);
  });

  it("makes the hover a visible step lighter than rest", () => {
    expect(lum(hover!)).toBeGreaterThan(lum(rest!) * 1.3);
  });

  it("draws the disc's edge with a hairline on the black ground", () => {
    const bubble = bubbleRule();
    expect(bubble).toMatch(/box-shadow: 0 0 0 1px rgba\(255,255,255,0\.22\)/);
  });
});
