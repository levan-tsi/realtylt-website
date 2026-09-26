import {
  CONSENT_DISCLOSURE,
  CONSENT_LABEL,
} from "@/lib/leads/consent";

/**
 * Permission to call or text, on any form that takes a phone number.
 *
 * ONE TICKABLE BOX, AND IT IS REQUIRED. The owner has now decided this three times (2026-08-23,
 * reaffirmed 2026-09-17: "I told u to delete why did u add it back remove that" about the decline
 * option a round had restored). The counter-argument - prior express written consent is weaker
 * when agreeing is a condition of the service, 47 CFR 64.1200(f)(9) - lives in
 * lib/leads/consent.ts with the citations and is not re-run here. His business, his risk,
 * recorded rather than re-litigated.
 *
 * WHAT IS NOT NEGOTIABLE: refusing to submit is never silent. No native `required` (on the
 * footer form it once produced no message, no scroll and no lead - "when I filled it up nothing
 * happened"). The form owns the check via consentAnswered() and shows a real error where it
 * shows every other error, and scrolls this box into view.
 */
export function ConsentCheckbox({ dark = false, invalid = false }: { dark?: boolean; invalid?: boolean }) {
  return (
    <label
      className={`-mx-3 flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-150 ${
        invalid ? (dark ? "bg-rose-400/10" : "bg-rose-50 night:bg-rose-400/10") : ""
      }`}
    >
      <input
        type="checkbox"
        name="consentToContact"
        value="true"
        aria-invalid={invalid || undefined}
        aria-describedby="consent-disclosure"
        data-consent-input
        className={`mt-px h-4 w-4 shrink-0 accent-porchlight-deep ${
          invalid ? "outline outline-2 outline-offset-2 outline-rose-500" : ""
        }`}
      />
      <span className="min-w-0">
        <span className={`t-small block font-medium ${dark ? "text-paper" : "text-ink"}`}>
          {CONSENT_LABEL}
        </span>
        <span id="consent-disclosure" className={`t-fine mt-1 block ${dark ? "text-paper/60" : "text-stone"}`}>
          {CONSENT_DISCLOSURE}
        </span>
      </span>
    </label>
  );
}
