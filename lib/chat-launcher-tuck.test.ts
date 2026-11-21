import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE CHAT LAUNCHER STAYS TUCKED ON A PAGE'S FIRST SCREEN, AND THE WIDGET RUNS ONE ASSISTANT.
 *
 * public/rlt-chat.js tucks the phone launcher while scrollY < 60% of the viewport so it never
 * lands on a form field or a CTA in a listing page's first screen. Until 2026-11-20 the tuck was
 * skipped on /ai, where the chat was the product, and a second persona ('aipage') opened there.
 * The AI business moved to its own site that day and every /ai address here is a permanent
 * redirect, so the widget tucks everywhere and tells the CRM one context on every turn.
 *
 * The deliberately short RLT_CHAT_CONFIG override list stays endpoint-only: a page may point the
 * widget at another server, never choose its persona or its behaviour.
 */
const ROOT = path.resolve(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "public", "rlt-chat.js"), "utf8");

describe("the chat launcher's first-screen tuck", () => {
  it("still tucks (class + scroll/resize listeners) — the listing-page behaviour is intact", () => {
    expect(js).toContain("bubble.classList.add('rlt-bubble--tucked')");
    expect(js).toContain("window.addEventListener('scroll', syncBubble");
    expect(js).toContain("window.addEventListener('resize', syncBubble");
    expect(js).toMatch(/const TUCK_UNTIL = \(\) => Math\.round\(window\.innerHeight \* 0\.6\)/);
  });

  it("a tucked launcher is hidden outright: out of the tab order and the hit test (round 65)", () => {
    const rule = js.match(/\.rlt-bubble--tucked \{([^}]*)\}/);
    expect(rule, "the tucked rule").not.toBeNull();
    expect(rule![1]).toMatch(/opacity: 0;/);
    expect(rule![1]).toMatch(/visibility: hidden;/);
    expect(rule![1]).toMatch(/pointer-events: none;/);
    // The fade out still plays: visibility flips only after it.
    expect(js).toMatch(/\.rlt-bubble--tucked \{ transition: [^}]*visibility 0s linear 0\.25s; \}/);
  });

  it("tucks on every page (no page-based exception) and keeps the override list endpoint-only", () => {
    // The tuck is unconditional: the line that adds the class sits at the IIFE's own indent, not
    // inside an if. (The file is CRLF, hence \r?.)
    expect(js).toMatch(/\r?\n {2}bubble\.classList\.add\('rlt-bubble--tucked'\);\r?\n/);
    const overrides = js.match(/\[('[A-Z_]+'(?:, )?)+\]\.forEach\(function\(key\)/);
    expect(overrides?.[0]).toBe(
      "['WEBHOOK_URL', 'SESSION_URL', 'POLL_URL', 'VOICE_TOKEN_URL', 'VOICE_TURN_URL'].forEach(function(key)",
    );
  });
});

describe("one assistant (since 2026-11-20)", () => {
  it("sends the real-estate context on every text and voice turn", () => {
    expect(js).toContain("const PERSONA = 'realestate';");
    // Code only: a value ends at a comma or a brace on its own line (a comment that says
    // "context:" does not).
    const contexts = (js.match(/context: [^,}\r\n]+(?=[,}])/g) ?? []).map((c) => c.trim());
    // The text turn, the voice turn and the voice token mint.
    expect(contexts).toHaveLength(3);
    for (const c of contexts) expect(c).toBe("context: PERSONA");
  });

  it("carries no AI persona, greeting, chips or placeholder", () => {
    expect(js).not.toMatch(/AI_GREETING|AI_CHIPS|AI_PLACEHOLDER|detectPersona|currentPersona/);
    expect(js).not.toMatch(/return 'aipage'|=== 'aipage'/);
  });
});
