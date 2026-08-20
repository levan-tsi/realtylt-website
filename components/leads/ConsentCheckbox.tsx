import { CONSENT_DISCLOSURE, CONSENT_LABEL } from "@/lib/leads/consent";

/**
 * Permission to call or text, on any form that takes a phone number.
 *
 * UNCHECKED, ALWAYS, and the form submits perfectly well without it. That is not politeness:
 * prior express written consent is only valid if agreeing is not a condition of getting the
 * thing, so a box that is pre-ticked or required is not consent at all. See
 * lib/leads/consent.ts for the rest of what the law asks for and why.
 *
 * The wording lives in that module rather than here, because the exact sentence a person read
 * is what gets stored on the lead. Two copies of it would eventually be two different
 * sentences, and then the stored record would no longer be evidence of anything.
 */
export function ConsentCheckbox({ dark = false }: { dark?: boolean }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${
        dark
          ? "border-paper/20 bg-white/[0.04] hover:border-paper/35"
          : "border-line bg-mist/60 hover:border-line-strong"
      }`}
    >
      <input
        type="checkbox"
        name="consentToContact"
        value="true"
        // A 16px box is under the 24px tap-target floor on its own, so the whole row is the
        // label and the padding carries the target.
        className="mt-px h-4 w-4 shrink-0 accent-porchlight-deep"
      />
      <span className="min-w-0">
        {/* SIZED DOWN ON THE OWNER'S CALL (2026-08-20): "make it smaller box and optimize wherever
            we have that checkbox, smaller text, people don't need huge box and text". Measured at
            390 it was 308x162 — a permission slip taking more room than the fields it sits under.
            It previously used `.t-small`, which steps UP to 16px on a phone. That class is for
            running copy a reader has to get through, and the 16px phone floor it honours is the
            iOS one for form CONTROLS, which zoom on focus below it — a <span> does not, so the
            floor never applied to this text. `text-sm` is the site's own step and holds at 14px.
            Deliberately NOT taken down to the 11px small-print tier: consent has to be clear and
            conspicuous to be worth anything, so the sentence being agreed to stays a step above
            the disclosure explaining it. */}
        <span className={`block text-sm font-medium leading-[1.45] ${dark ? "text-paper" : "text-ink"}`}>
          {CONSENT_LABEL}
        </span>
        <span className={`mt-1 block text-[11px] leading-[1.5] ${dark ? "text-paper/60" : "text-stone"}`}>
          {CONSENT_DISCLOSURE}
        </span>
      </span>
    </label>
  );
}
