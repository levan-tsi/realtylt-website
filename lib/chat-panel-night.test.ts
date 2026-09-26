import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE CHAT PANEL IS NIGHT (round 60, the owner: "do all the other pages as well so they are not
 * white. We're making it dark"). The launcher already wore the logo's navy; the panel it opens was
 * still the white one. It now takes the site's night tokens, written out in the script's CONFIG
 * because the file is a static script outside the stylesheet. These hold the colours to the floors
 * and keep a white ground from coming back into any panel rule. */
const js = fs.readFileSync(path.resolve(__dirname, "..", "public", "rlt-chat.js"), "utf8");

const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const config = (key: string) => {
  const v = js.match(new RegExp(`\\b${key}: '(#[0-9a-f]{6})'`, "i"))?.[1];
  if (!v) throw new Error(`no CONFIG.${key}`);
  return v;
};
/** One rule's body, to its closing brace. */
const rule = (selector: string) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return js.match(new RegExp(`\\n\\s*${esc} \\{[^}]*?(?:\\$\\{[^}]*\\}[^}]*?)*\\}`))?.[0] ?? "";
};

describe("the chat panel at night", () => {
  const PANEL = config("PANEL");
  const RAISE = config("RAISE");
  const MOON = config("MOON");
  const HAZE = config("HAZE");
  const EDGE = config("EDGE");
  const ACTION = config("ACTION");
  const INK = config("ACTION_INK");

  it("sits on a near-black ground", () => {
    expect(lum(PANEL)).toBeLessThan(0.01);
    expect(rule(".rlt-panel")).toContain("background: ${CONFIG.PANEL};");
    expect(rule(".rlt-header")).toContain("background: ${CONFIG.PANEL};");
    expect(rule(".rlt-input-wrap")).toContain("background: ${CONFIG.PANEL};");
  });

  it("keeps every text colour over 4.5:1 on the grounds it sits on", () => {
    expect(ratio(MOON, PANEL)).toBeGreaterThan(15);
    expect(ratio(MOON, RAISE)).toBeGreaterThan(14);
    expect(ratio(HAZE, PANEL)).toBeGreaterThan(4.5);
    expect(ratio(ACTION, PANEL)).toBeGreaterThan(4.5);
  });

  it("puts the one action (Send) in the porchlight with a dark glyph over 4.5:1", () => {
    expect(ACTION.toLowerCase()).toBe("#28a8e0");
    expect(ratio(INK, ACTION)).toBeGreaterThan(4.5);
    expect(ratio(INK, config("ACTION_HOVER"))).toBeGreaterThan(4.5);
    expect(rule(".rlt-send")).toContain("background: ${CONFIG.ACTION};");
  });

  it("draws control edges at 3:1 or better", () => {
    expect(ratio(EDGE, PANEL)).toBeGreaterThan(3);
  });

  it("tells ours from the visitor's without a new hue", () => {
    expect(rule(".rlt-msg-user")).toContain("background: ${CONFIG.RAISE};");
    expect(rule(".rlt-msg-bot")).toContain("background: transparent;");
  });

  it("sets the composer at 16px at every width (the iOS zoom floor)", () => {
    expect(rule(".rlt-input")).toContain("font-size: 16px;");
  });

  it("gives the close control a 24px-plus target and a visible focus ring", () => {
    expect(rule(".rlt-header-btn")).toMatch(/min-height: 44px;[\s\S]*min-width: 44px;/);
    expect(js).toMatch(/\.rlt-header-btn:focus-visible \{ outline: 2px solid \$\{CONFIG\.MOON\}/);
  });

  it("brings no white ground back into the panel", () => {
    const styles = js.slice(js.indexOf(".rlt-panel {"), js.indexOf("document.head.appendChild(style)"));
    expect(styles).not.toMatch(/background: (#fff\b|#ffffff|white|#f[0-9a-f]{5})/i);
  });
});
