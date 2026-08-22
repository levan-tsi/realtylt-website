import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE PAGE THE OWNER SENT BACK.
 *
 * His words: "it should say thank you". The shipped headline was "The lights are on" — a page
 * named thank-you that never said it. That is a defect a rubric cannot see and a reader sees
 * instantly, so the literal requirement is pinned here: the H1 of /thank-you says thank you.
 *
 * The other two guards protect the mechanics the rebuild depends on:
 *
 *  - the page stays a SERVER component (no "use client"), so it renders in full with
 *    JavaScript off — dev always streams, so only a source guard and the production no-JS
 *    probes can hold this line;
 *  - nothing on this route touches `useSearchParams`. It suspends, which puts a Suspense
 *    boundary over the route, and Next then streams the page into `<div hidden id="S:0">`
 *    revealed by an inline `$RC(...)` call that never runs without JavaScript — the bug that
 *    blanked /search for no-JS visitors. `?from=` and `?c=` are both read from
 *    `window.location.search` in client islands instead.
 */
const HERE = path.resolve(__dirname);
const page = fs.readFileSync(path.join(HERE, "page.tsx"), "utf8");
const consentCopy = fs.readFileSync(
  path.join(HERE, "..", "..", "components", "thank-you", "ConsentCopy.tsx"),
  "utf8",
);

/** Comments explaining WHY useSearchParams is banned must be allowed to name it — the ban is
 * on code. (This test's own first run failed on the page's comment, not on an import.) */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

describe("/thank-you", () => {
  it("says thank you in the headline, in those words", () => {
    const h1 = page.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? "";
    const text = h1.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    expect(text.toLowerCase()).toContain("thank you");
  });

  it("stays a server component so the page works with JavaScript off", () => {
    expect(page).not.toContain('"use client"');
    // The islands it mounts are the client side, and only they may be.
    expect(consentCopy.startsWith('"use client"')).toBe(true);
  });

  it("never reads useSearchParams on this route (it suspends the route into a JS-only stream)", () => {
    expect(stripComments(page)).not.toContain("useSearchParams");
    expect(stripComments(consentCopy)).not.toContain("useSearchParams");
    expect(consentCopy).toContain("window.location.search");
  });

  it("renders the consent-aware sentences from the one vetted copy module", () => {
    expect(page).toContain("<ConsentCopy");
    expect(page).toMatch(/from "@\/lib\/thank-you-copy"/);
  });

  it("keeps the follow-up switch here, as one boolean literal (the contract in docs/LEAD-FOLLOW-UP.md)", () => {
    // The orchestrator's doc names this file as the single place the follow-up copy switches
    // on. One boolean, commented, feeding the copy selector: not an env var, not a flag system.
    expect(stripComments(page)).toMatch(/^const OUTBOUND_FOLLOW_UP_LIVE = (true|false);$/m);
    expect(stripComments(page)).toContain("followUpCopy(OUTBOUND_FOLLOW_UP_LIVE)");
  });
});
