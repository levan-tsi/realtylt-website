import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE LISTING SHEETS MUST REFUSE AN UNTICKED CONSENT BOX, LOUDLY.
 *
 * THE BUG. Both listing sheets read `consentToContact` out of the FormData and handed it straight
 * to postLead(). No check. An unticked box therefore posted a real lead to the live CRM and showed
 * "Tour requested." — the visitor is told they will be called, having explicitly not agreed to be.
 * It is the same silent refusal the owner reported on the footer form ("when I filled it up
 * nothing happened"), still live on the listing page, which is the flagship conversion path.
 *
 * WHAT PROVES THE FIX, AND WHERE. scripts/verify-lead-modal.mjs drives all three lead modals in a
 * real browser at 1440, 390 and 320: submits unticked and asserts ZERO posts plus a visible
 * role=alert, then ticks and asserts exactly one. That is the proof, because only a browser can
 * show that a refusal is visible and that nothing left the page. 111/111 at the time of writing.
 *
 * THESE TESTS GUARD WHAT THAT RUN CANNOT: the shape of the code, so the check cannot be quietly
 * removed, reordered behind the POST, or re-implemented per sheet until the two drift. Every
 * failure they catch looks like a tidy-up.
 */

const read = (f: string) => fs.readFileSync(path.join(process.cwd(), f), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const src = strip(read("components/leads/ListingLeadCTAs.tsx"));

/** The body of one modal's `onSubmit`, from its declaration to the closing brace of the function
 * that follows it — enough to see the ORDER of the consent check against the POST. */
function submitBody(afterMarker: string): string {
  const start = src.indexOf(afterMarker);
  expect(start, `${afterMarker} not found`).toBeGreaterThan(-1);
  const at = src.indexOf("async function onSubmit", start);
  expect(at, `no onSubmit under ${afterMarker}`).toBeGreaterThan(-1);
  return src.slice(at, src.indexOf("\n  }", at));
}

describe("the listing tour and offer sheets enforce consent before they post", () => {
  for (const [name, marker] of [
    ["tour", "function TourModal("],
    ["offer", "function OfferModal("],
  ] as const) {
    const body = submitBody(marker);

    it(`${name}: checks consent BEFORE any lead is posted`, () => {
      const guard = body.indexOf("consent.refused(");
      const post = body.indexOf("postLead(");
      expect(guard, "the consent guard is gone").toBeGreaterThan(-1);
      expect(post).toBeGreaterThan(-1);
      expect(guard, "the guard must run before the POST, not after it").toBeLessThan(post);
    });

    /** `submitted.current = true` latches the form against double-submits and is only cleared on a
     * failed POST. Latching it on a refusal would leave a visitor who ticks the box unable to
     * submit at all — a worse bug than the one being fixed. */
    it(`${name}: returns before the double-submit latch is set`, () => {
      expect(body.indexOf("consent.refused(")).toBeLessThan(body.indexOf("submitted.current = true"));
    });

    it(`${name}: returns rather than falling through`, () => {
      expect(body).toMatch(/if \(consent\.refused\([^)]*\)\) return;/);
    });
  }
});

describe("the refusal is the same refusal the rest of the site gives", () => {
  /** One hook, two callers. Two copies of this check is how the tour sheet and the offer sheet
   * end up disagreeing about what consent means. */
  it("both sheets share one guard rather than each growing their own", () => {
    expect(src).toContain("function useConsentGuard()");
    expect(src.match(/useConsentGuard\(\)/g)?.length, "expected the hook plus two callers").toBe(3);
  });

  /** The wording is LeadForm's wording. A visitor who meets this on a listing page and again in
   * the footer must not be told two different things about the same box. */
  it("uses the wording the footer and /connect forms already use", () => {
    const shared = "CONSENT_UNANSWERED_ERROR";
    expect(src, "listing sheets drifted from LeadForm's wording").toContain(shared);
    expect(strip(read("components/leads/LeadForm.tsx"))).toContain(shared);
    expect(strip(read("components/plan/PlanQuiz.tsx"))).toContain(shared);
  });

  it("marks the box invalid on both sheets, not just one", () => {
    expect(src.match(/<ConsentCheckbox invalid=\{consent\.invalid\}/g)?.length).toBe(2);
  });

  /** role="alert" is an assertive live region, and tabIndex={-1} is what lets focus land on it —
   * announcing is not the same as being somewhere. Both are required for the refusal to reach a
   * screen-reader visitor the way it reaches a sighted one. */
  it("shows the reason in a focusable role=alert", () => {
    expect(src).toMatch(/role="alert"/);
    expect(src).toMatch(/tabIndex=\{-1\}/);
    expect(src).toContain("alertRef.current?.focus()");
  });

  it("scrolls the box the visitor missed back into view", () => {
    expect(src).toContain("[data-consent-input]");
    expect(src).toContain("scrollIntoView");
  });
});

describe("the consent input keeps NO native required attribute", () => {
  /** The owner's decision, twice, and the actual bug he reported: the native attribute produced no
   * message, no scroll and no posted lead. The check lives in JavaScript precisely so the failure
   * is visible. If `required` ever comes back, the silent version comes back with it. */
  it("is not reintroduced on the shared checkbox", () => {
    const box = strip(read("components/leads/ConsentCheckbox.tsx"));
    expect(box).not.toMatch(/\brequired\b/);
  });

  it("is not reintroduced on either listing sheet", () => {
    expect(src).not.toMatch(/name="consentToContact"[^>]*required/);
  });
});
