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
    /* NO BOX, deliberately (round 36). This sat in a bordered, tinted rounded-xl on every form,
       and every one of those forms is itself a bordered panel — a box inside a box, the one
       place on the page with a third surface treatment neither the fields nor the panel use.
       The permission is a quiet ROW now: checkbox and sentence, flush with the form's content
       edge, position and tone doing the work the border pretended to. The owner's 2026-08-20
       "smaller box" call and this round's box-in-box finding have the same answer: no box.
       The whole row stays the label, so the tap target is the full row height (well over the
       24px floor), and py keeps a finger from clipping the field above. */
    <label className="flex cursor-pointer items-start gap-2.5 py-1">
      <input
        type="checkbox"
        name="consentToContact"
        value="true"
        // A 16px box is under the 24px tap-target floor on its own, so the whole row is the
        // label and the row height carries the target.
        className="mt-px h-4 w-4 shrink-0 accent-porchlight-deep"
      />
      <span className="min-w-0">
        {/* `text-sm` on the sentence being agreed to (the owner's "smaller text" call, round
            34) — consent has to stay clear and conspicuous, so it holds a step above the
            disclosure explaining it. The disclosure moved 11px -> text-xs in round 36: eleven
            pixels on the legal disclosure a visitor is agreeing to was a measured finding, not
            a judgement call. 12px is the scale's caption step; smaller-than-body is right for
            small print, smaller-than-the-scale is not. */}
        <span className={`block text-sm font-medium leading-[1.45] ${dark ? "text-paper" : "text-ink"}`}>
          {CONSENT_LABEL}
        </span>
        <span className={`mt-1 block text-xs ${dark ? "text-paper/60" : "text-stone"}`}>
          {CONSENT_DISCLOSURE}
        </span>
      </span>
    </label>
  );
}
