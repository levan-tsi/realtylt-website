import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE /connect POPUP FORM (round 38, the owner's ask).
 *
 * The browser proof is scripts/_scratch-r38-connect-modal.mjs, which drives the real thing at
 * 1440, 390 and 320: opens it, submits WITHOUT ticking consent and asserts no lead is posted,
 * ticks it and asserts exactly one is, then checks Escape, focus restoration, the Tab trap and
 * backdrop dismissal. 42/42 at the time of writing.
 *
 * These tests guard the two things that browser run cannot: that the modal keeps REUSING the
 * shared pieces instead of quietly growing its own. Both failures they catch look like tidy-ups.
 */

const read = (f: string) => fs.readFileSync(path.join(process.cwd(), f), "utf8");
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("the /connect modal reuses the site's one lead form", () => {
  const src = strip(read("components/leads/ConnectFormModal.tsx"));

  it("renders the shared LeadForm rather than its own fields", () => {
    expect(src).toContain("<LeadForm");
    expect(src).toMatch(/import \{ LeadForm \} from "\.\/LeadForm"/);
  });

  /** THE POINT OF THE WHOLE DESIGN. The consent contract was decided by the owner twice and
   * re-implementing it here is how the two copies drift apart. If this file ever grows its own
   * consent markup or its own POST to /api/lead, that has happened. */
  it("does not re-implement the consent box or the lead POST", () => {
    expect(src, "grew its own consent markup").not.toContain("ConsentCheckbox");
    expect(src, "grew its own consent field name").not.toContain("consentToContact");
    expect(src, "grew its own lead POST").not.toContain("/api/lead");
  });

  it("uses the shared modal shell rather than a second one", () => {
    expect(src).toContain("<LeadSheet");
    expect(src, "grew its own portal").not.toContain("createPortal");
    expect(src, "grew its own dialog role").not.toContain('role="dialog"');
  });

  /** LeadForm's own note gives the rule: a redirect is wrong for a form someone opened mid-page.
   * `redirectOnSuccess` defaults to false, so the guard is that nobody turns it on here. */
  it("does not redirect on success, so the visitor keeps their place", () => {
    expect(src).not.toContain("redirectOnSuccess");
  });

  /** The footer form is on /connect too and its button says "Send Us A Message". Two controls
   * with one accessible name is a page where a screen reader's button list says the same thing
   * twice about different things. */
  it("does not reuse the footer form's button label", () => {
    expect(src.toLowerCase()).not.toContain("send us a message");
  });
});

describe("the /connect modal is wired into the page where the copy invites it", () => {
  const page = strip(read("app/connect/page.tsx"));

  it("is mounted on /connect", () => {
    expect(page).toContain("<ConnectFormModal />");
  });

  /** The button exists BECAUSE of this sentence. If the sentence goes, the button has lost the
   * thing that explains it, and someone should notice rather than leave an unexplained control
   * in a sticky rail. */
  it("still sits under the line that offers the alternative", () => {
    expect(page).toMatch(/Would rather not pick a slot\?/);
    const idx = page.indexOf("Would rather not pick a slot?");
    const btn = page.indexOf("<ConnectFormModal />");
    expect(idx).toBeGreaterThan(-1);
    expect(btn).toBeGreaterThan(idx);
  });

  /** The owner asked for the popup as an ADDITION. The call/text line and the booking embed
   * both stay. */
  it("keeps the booking embed and the call/text line", () => {
    expect(page).toContain("BOOKING_EMBED_URL");
    expect(page).toMatch(/Call or text and we/);
  });
});

describe("the extracted modal shell kept the behaviour it was extracted with", () => {
  const sheet = read("components/leads/LeadSheet.tsx");

  it("still portals to document.body", () => {
    expect(sheet).toContain("createPortal");
    expect(sheet).toContain("document.body");
  });

  /** Nothing in the real world appears from nothing. The panel enters from scale(0.98), not
   * scale(0), and the backdrop fades separately — both are classes in globals.css, so the guard
   * is that the shell keeps asking for them. */
  it("enters on the site's own pop-in and fade-in, not a bare appearance", () => {
    expect(sheet).toContain("rlt-pop-in");
    expect(sheet).toContain("rlt-fade-in");
  });

  it("closes on a backdrop mousedown only when the backdrop itself was hit", () => {
    expect(sheet).toMatch(/e\.target === e\.currentTarget/);
  });

  /** A modal is anchored to the viewport, not to a trigger, so it is centred rather than
   * origin-aware — and below sm it lands where a thumb is. */
  it("is centred on desktop and a bottom sheet on a phone", () => {
    expect(sheet).toContain("items-end");
    expect(sheet).toContain("sm:items-center");
  });
});
