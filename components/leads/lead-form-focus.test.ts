import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** SUBMITTING A FORM MUST NOT THROW A KEYBOARD VISITOR BACK TO THE TOP OF THE PAGE.
 *
 * The submit button is `disabled` while the request is in flight. A disabled element loses
 * focus, and focus falls to <body>; when the button comes back, focus does not. So whatever
 * replaces or follows the button has to claim focus deliberately.
 *
 * The success path has done this since round 22 (`successRef`, `tabIndex={-1}`). The ERROR
 * path had the identical hole and nobody had driven it. Measured in round 29 on /who-we-are
 * with a real Tab to the button and a real Enter, against a 500: focus ended on <body> and the
 * next Tab landed on the phone number in the HEADER. After the fix, focus is the alert and the
 * next Tab is the submit button, so retrying is one key away. Verified the same on /connect and
 * /top-areas.
 *
 * `role="alert"` announcing the message is NOT a substitute: announcing tells you what happened,
 * focus tells you where you are. This is a source guard in the house idiom (see
 * components/a11y-modals.test.ts) because the behaviour lives in an effect; the browser proof
 * is the drive recorded in docs/parity/PAGES-ROUND29.md.
 */

const SRC = fs.readFileSync(
  path.join(path.resolve(__dirname, "../.."), "components/leads/LeadForm.tsx"),
  "utf8",
);
// Comments explain the rule; they must not be able to satisfy it.
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("LeadForm — the outcome takes focus", () => {
  it("moves focus on success AND on error", () => {
    expect(CODE).toMatch(/status === "success"\)\s*successRef\.current\?\.focus\(\)/);
    expect(
      CODE,
      "an error leaves the visitor wherever the disabled button dropped them (<body>) unless " +
        "something claims focus. Focus the alert.",
    ).toMatch(/status === "error"\)\s*errorRef\.current\?\.focus\(\)/);
  });

  it("gives the alert a focus target and keeps its announcement", () => {
    const alert = CODE.match(/<p[^>]*role="alert"[\s\S]{0,320}?\/p>/);
    expect(alert, 'the error message must stay a role="alert" live region').toBeTruthy();
    expect(alert![0], "an element only takes programmatic focus with tabIndex={-1}").toContain("tabIndex={-1}");
    expect(alert![0], "errorRef is what the effect focuses").toContain("ref={errorRef}");
    // Focusing an element paints the UA's default outline on a message the visitor did not
    // navigate to. The success panel already suppresses it the same way.
    expect(alert![0]).toContain("outline-none");
  });

  it("still disables the button only while the request is in flight", () => {
    // If this ever becomes an unconditional disable, the focus dance above is the least of it.
    expect(CODE).toContain('disabled={status === "submitting"}');
  });
});
