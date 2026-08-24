import { CONSENT_DISCLOSURE, CONSENT_LABEL } from "@/lib/leads/consent";

/**
 * Permission to call or text, on any form that takes a phone number.
 *
 * ONE TICKABLE BOX, AND IT IS REQUIRED. The owner's call, 2026-08-23, made twice: first "it has to
 * be a must box", then again after seeing the two-option version — "no send me email instead has to
 * be removed, only yes text and call me option check box which is must".
 *
 * I argued the other side and lost on the merits of whose business it is. The argument, kept here
 * so nobody has to reconstruct it: prior express written consent is only valid if agreeing is not a
 * condition of getting the thing (47 CFR 64.1200(f)(9)), so a box you cannot decline weakens the
 * evidentiary value of every record it produces, against a New York exposure that runs to $20,000
 * per call (lib/leads/consent.ts has the citations). He has heard that and decided. It is his
 * business and his risk, and the decision is recorded rather than re-litigated.
 *
 * WHAT IS NOT NEGOTIABLE, AND IS THE ACTUAL BUG HE REPORTED: refusing to submit must never be
 * silent. The previous version used the browser's native `required`, and on the footer form that
 * produced no message, no scroll and no posted lead — "when I filled it up nothing happened",
 * exactly as he described. So there is no `required` attribute here. The form validates this in
 * JavaScript and shows a real error in the place it already shows errors, which is the only way a
 * person finds out what is wrong.
 */
export function ConsentCheckbox({ dark = false, invalid = false }: { dark?: boolean; invalid?: boolean }) {
  return (
    <label
      className={`-mx-3 flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-150 ${
        invalid ? (dark ? "bg-rose-400/10" : "bg-rose-50") : ""
      }`}
    >
      <input
        type="checkbox"
        name="consentToContact"
        value="true"
        // No `required`: see the note above. The form owns this check so the failure is visible.
        aria-invalid={invalid || undefined}
        aria-describedby="consent-disclosure"
        data-consent-input
        className={`mt-px h-4 w-4 shrink-0 accent-porchlight-deep ${
          invalid ? "outline outline-2 outline-offset-2 outline-rose-500" : ""
        }`}
      />
      <span className="min-w-0">
        <span className={`block text-sm font-medium leading-[1.45] ${dark ? "text-paper" : "text-ink"}`}>
          {CONSENT_LABEL}
        </span>
        <span id="consent-disclosure" className={`mt-1 block text-xs ${dark ? "text-paper/60" : "text-stone"}`}>
          {CONSENT_DISCLOSURE}
        </span>
      </span>
    </label>
  );
}
