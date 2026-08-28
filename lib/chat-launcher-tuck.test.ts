import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE CHAT LAUNCHER MUST BE VISIBLE ON LOAD ON THE AI PAGE, AND STAY TUCKED ON LISTING PAGES.
 *
 * The owner's own test on realtylt.com/ai (2026-08-28): "the chat launcher is invisible until you
 * scroll". public/rlt-chat.js tucks the phone launcher while scrollY < 60% of the viewport so it
 * never lands on a form field or a CTA in a listing page's first screen. On /ai the hero fills
 * that first screen and the chat is the product being sold, so the tuck hid the product.
 *
 * The fix is decided by the page (detectPersona reads the pathname) and NOT by a new key on the
 * deliberately short RLT_CHAT_CONFIG override list, which must stay endpoint-only. This test holds
 * the two halves together the way lib/chat-csp.test.ts holds the widget and the CSP together:
 * the file is a byte copy on the AI page's repo, so a regression here is a regression there.
 */
const ROOT = path.resolve(__dirname, "..");
const js = fs.readFileSync(path.join(ROOT, "public", "rlt-chat.js"), "utf8");

/** The persona detector, lifted out of the IIFE and run against a fake `location`. */
function personaFor(pathname: string, hostname = "realtylt.com"): string {
  const m = js.match(/function detectPersona\(\) \{[\s\S]*?\r?\n {2}\}\r?\n/);
  if (!m) throw new Error("rlt-chat.js: detectPersona() not found");
  const fn = new Function("location", `${m[0]}; return detectPersona();`);
  return fn({ pathname, hostname }) as string;
}

describe("the chat launcher's first-screen tuck", () => {
  it("still tucks (class + scroll/resize listeners) — the listing-page behaviour is intact", () => {
    expect(js).toContain("bubble.classList.add('rlt-bubble--tucked')");
    expect(js).toContain("window.addEventListener('scroll', syncBubble");
    expect(js).toContain("window.addEventListener('resize', syncBubble");
    expect(js).toMatch(/const TUCK_UNTIL = \(\) => Math\.round\(window\.innerHeight \* 0\.6\)/);
  });

  it("skips the tuck on the AI page, decided by detectPersona() and nothing configurable", () => {
    const block = js.match(
      /if \(detectPersona\(\) !== 'aipage'\) \{\s*bubble\.classList\.add\('rlt-bubble--tucked'\);[\s\S]*?syncBubble\(\);\s*\}/,
    );
    expect(block, "the tuck must be inside `if (detectPersona() !== 'aipage')`").not.toBeNull();
    // The override list stays endpoint-only: no TUCK / persona key was added to it.
    const overrides = js.match(/\[('[A-Z_]+'(?:, )?)+\]\.forEach\(function\(key\)/);
    expect(overrides?.[0]).toBe(
      "['WEBHOOK_URL', 'SESSION_URL', 'POLL_URL', 'VOICE_TOKEN_URL', 'VOICE_TURN_URL'].forEach(function(key)",
    );
  });

  it("detectPersona() says aipage for /ai and /ai/*, and realestate everywhere else", () => {
    expect(personaFor("/ai")).toBe("aipage");
    expect(personaFor("/ai/")).toBe("aipage");
    expect(personaFor("/ai/services")).toBe("aipage");
    expect(personaFor("/", "realtylt-ai-page.vercel.app")).toBe("aipage");
    expect(personaFor("/")).toBe("realestate");
    expect(personaFor("/listing/KEY1")).toBe("realestate");
    expect(personaFor("/air-conditioning")).toBe("realestate");
    expect(personaFor("/selling")).toBe("realestate");
  });
});
