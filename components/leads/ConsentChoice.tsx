import { CONSENT_DECLINE_LABEL, CONSENT_DISCLOSURE, CONSENT_LABEL } from "@/lib/leads/consent";

/**
 * Permission to call or text, on any form that takes a phone number.
 *
 * THE OWNER'S 2026-08-22 REPORT: "it will let you fill the form without checking the box of the
 * calls and text and it has to be a must box." He is right about the problem and the literal fix
 * would have hurt him. A checkbox nobody has to touch is a checkbox most people scroll past, so
 * most leads arrived with no permission to call attached — and his AI assistant is supposed to
 * ring them.
 *
 * BUT A REQUIRED BOX IS NOT CONSENT. Prior express written consent is only valid if agreeing is
 * not a condition of getting the thing (47 CFR 64.1200(f)(9); see lib/leads/consent.ts for the
 * citations and the New York exposure, which runs to $20,000 per call). Forcing the tick would
 * have converted every record from evidence into decoration, and the calls it authorised would
 * have been unconsented calls carrying a stored string that says otherwise. Worse than no box.
 *
 * SO THE ANSWER IS NOT "OPTIONAL" AND NOT "REQUIRED" — IT IS **UNSKIPPABLE**. Two options,
 * neither pre-selected, both submit the form, and the form will not submit until one is chosen.
 * Every lead now arrives carrying an explicit yes or an explicit no. Agreeing is still not a
 * condition of anything, so a yes is still valid consent — and a no is worth having too: it is
 * the difference between a number nobody may ring and a number nobody has asked yet.
 *
 * The wording lives in lib/leads/consent.ts rather than here, because the exact sentence a
 * person read is what gets stored on the lead. Two copies would eventually be two sentences.
 */
export function ConsentChoice({ dark = false }: { dark?: boolean }) {
  // Both inputs carry `required`, which in a radio GROUP means "one of us must be chosen" — so
  // this works with JavaScript disabled, on the browser's own validation, like every other
  // required field on these forms.
  // `-mx-3` against the `px-3`: the padding is what makes the whole row a comfortable hit area
  // and gives the hover/selected tint something to fill, but padding alone would indent the
  // radio 12px from the left edge every field above it lines up on. The negative margin pulls
  // the row back out so the control aligns with the form and the tint still runs full width.
  const base =
    "flex cursor-pointer items-start gap-2.5 rounded-xl -mx-3 px-3 py-2.5 transition-colors duration-150";
  const tone = dark
    ? "hover:bg-paper/10 has-[:checked]:bg-paper/10 has-[:focus-visible]:bg-paper/10"
    : "hover:bg-mist has-[:checked]:bg-mist has-[:focus-visible]:bg-mist";

  return (
    /* A fieldset, because these two radios are one question and a screen reader should hear the
       question before either answer. The legend is the question; the options are the answers. */
    <fieldset className="min-w-0">
      <legend className={`mb-1.5 text-sm font-medium ${dark ? "text-paper" : "text-ink"}`}>
        Can we call or text you about this?
      </legend>

      {/* NEITHER IS PRE-SELECTED AND NEITHER IS VISUALLY LOUDER. A pre-ticked yes is invalid
          consent outright, and a yes styled as the obvious choice is the same nudge wearing a
          nicer coat. They get identical treatment; the only asymmetry is that the yes carries
          the disclosure, because the disclosure describes what saying yes means. */}
      <div className="space-y-0.5">
        <label className={`${base} ${tone}`}>
          <input
            type="radio"
            name="consentToContact"
            value="true"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-porchlight-deep"
          />
          <span className="min-w-0">
            <span className={`block text-sm leading-[1.45] ${dark ? "text-paper" : "text-ink"}`}>
              {CONSENT_LABEL}
            </span>
            <span className={`mt-1 block text-xs ${dark ? "text-paper/60" : "text-stone"}`}>
              {CONSENT_DISCLOSURE}
            </span>
          </span>
        </label>

        <label className={`${base} ${tone}`}>
          <input
            type="radio"
            name="consentToContact"
            value="false"
            required
            className="mt-0.5 h-4 w-4 shrink-0 accent-porchlight-deep"
          />
          <span className={`min-w-0 text-sm leading-[1.45] ${dark ? "text-paper" : "text-ink"}`}>
            {CONSENT_DECLINE_LABEL}
          </span>
        </label>
      </div>
    </fieldset>
  );
}
