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
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
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
        className="mt-0.5 h-4 w-4 shrink-0 accent-porchlight-deep"
      />
      <span className="min-w-0">
        {/* `.t-small`, not `text-sm`: this is a sentence somebody has to READ and agree to, and
            it is the one piece of copy on the site whose comprehension is legally load-bearing.
            14px on a phone is the wrong place to be small — the same stylesheet already floors
            form controls at 16px there for exactly this reason. From `md` it returns to 14px.
            The DISCLOSURE below stays 12px: three lines of small print is a real convention, and
            the sentence that needs reading is this one. */}
        <span className={`t-small block font-medium ${dark ? "text-paper" : "text-ink"}`}>
          {CONSENT_LABEL}
        </span>
        <span className={`mt-1 block text-xs leading-[1.6] ${dark ? "text-paper/60" : "text-stone"}`}>
          {CONSENT_DISCLOSURE}
        </span>
      </span>
    </label>
  );
}
