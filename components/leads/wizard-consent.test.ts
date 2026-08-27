import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/** THE WIZARD'S FOLLOW-UP POST MUST CARRY THE CONSENT ANSWER.
 *
 * THE BUG, seen live on production 2026-08-27. The qualifying wizard fires a second
 * /api/lead POST with the visitor's answers, and that body carried no `consentToContact`.
 * Server-side, buildConsent coerces an absent value to granted:false, and the consent-aware
 * thank-you email branches on exactly that flag. A /selling visitor who TICKED the box got
 * the "You asked us not to call, so everything stays in email" note — the declined branch,
 * sent to a consented lead — because the qualifier POST happened to be the one that reached
 * n8n. The CRM's consent record on that lead row was wrong for the same reason.
 *
 * The wizard already holds the answer (`prefill.consented` travels to /thank-you as `?c=`),
 * so the fix is to put the same answer in the body. This guards the shape: the follow-up
 * body must derive `consentToContact` from `prefill.consented`, and the field must not be
 * quietly dropped in a refactor — every failure this catches would look like a tidy-up.
 */

const src = fs.readFileSync(
  path.join(process.cwd(), "components/leads/QualifyingWizard.tsx"),
  "utf8",
);

describe("the qualifying wizard's follow-up POST carries consent", () => {
  it("builds consentToContact from prefill.consented in the submit body", () => {
    const i = src.indexOf("const body = {");
    expect(i, "submitQualifier body literal not found").toBeGreaterThan(-1);
    const body = src.slice(i, src.indexOf("};", i));
    expect(body).toContain("consentToContact");
    expect(body).toContain("prefill.consented");
  });
});
