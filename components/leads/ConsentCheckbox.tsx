import { useId } from "react";
import {
  CONSENT_DECLINE_LABEL,
  CONSENT_DISCLOSURE,
  CONSENT_LABEL,
  CONSENT_QUESTION,
} from "@/lib/leads/consent";

/**
 * Permission to call or text, on any form that takes a phone number.
 *
 * TWO ANSWERS, NEITHER PRE-SELECTED, AND THE FORM WILL NOT GO UNTIL ONE IS CHOSEN. The file keeps
 * its name because every form imports it and the tests hold it by that name; what it renders is a
 * radio group, not a checkbox, since 2026-08-28.
 *
 * The record of how it got here, because it has been changed three times and each change was
 * argued: 2026-08-22 the owner reported the form submitting with the box untouched and asked for
 * a "must box"; the session shipped this two-option control instead (a required box is not
 * consent: prior express written consent is only valid if agreeing is not a condition of the
 * service, 47 CFR 64.1200(f)(9), lib/leads/consent.ts has the citations and the New York
 * exposure). 2026-08-23 he removed the decline option ("only yes text and call me option check
 * box which is must"). 2026-08-28, shown the tension again in the round-49 report, he delegated:
 * "i did not get it do as its proper to do". This is the proper shape.
 *
 * WHAT DID NOT CHANGE, AND IS THE BUG HE ORIGINALLY HIT: refusing to submit is never silent. There
 * is no native `required` here (on the footer form it produced no message, no scroll and no lead:
 * "when I filled it up nothing happened"). The form owns the check and shows a real error in the
 * place it shows every other error, and scrolls this control into view.
 *
 * NEITHER OPTION IS VISUALLY LOUDER. A pre-selected yes is invalid consent outright, and a yes
 * styled as the obvious choice is the same nudge in a nicer coat. Identical rows; the only
 * asymmetry is that the yes carries the disclosure, because the disclosure describes what a yes
 * means. The wording lives in lib/leads/consent.ts, because the exact sentence a person read is
 * what gets stored on the lead and two copies would eventually be two sentences.
 */
export function ConsentCheckbox({ dark = false, invalid = false }: { dark?: boolean; invalid?: boolean }) {
  // Two forms share a page on /listing (tour + offer) and on /connect (page + modal), so the
  // question's id cannot be a constant or the second group would label itself with the first.
  const qid = useId();
  // `-mx-3` against `px-3`: the padding makes the whole row a comfortable hit area and gives the
  // selected tint something to fill, but padding alone would indent the radio 12px from the edge
  // every field above it lines up on. The negative margin pulls the row back out.
  const row = "-mx-3 flex cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-150";
  const tone = dark
    ? "hover:bg-paper/10 has-[:checked]:bg-paper/10"
    : "hover:bg-mist has-[:checked]:bg-mist";
  const radio = `mt-px h-4 w-4 shrink-0 accent-porchlight-deep ${
    invalid ? "outline outline-2 outline-offset-2 outline-rose-500" : ""
  }`;

  return (
    /* A radio GROUP: the two radios are one question, and a screen reader should hear the question
       before either answer. role="group" + aria-labelledby rather than <fieldset>/<legend>, because
       a fieldset paints its background from the legend's midline down, so the invalid tint cut
       through the question instead of wrapping it. The tint sits on the group, since the group is
       what was left unanswered. */
    <div
      role="group"
      aria-labelledby={qid}
      aria-invalid={invalid || undefined}
      aria-describedby="consent-disclosure"
      className={`-mx-3 min-w-0 rounded-xl px-3 pb-1 pt-2.5 transition-colors duration-150 ${
        invalid ? (dark ? "bg-rose-400/10" : "bg-rose-50") : ""
      }`}
    >
      <p id={qid} className={`t-small pb-1.5 font-medium ${dark ? "text-paper" : "text-ink"}`}>
        {CONSENT_QUESTION}
      </p>

      <label className={`${row} ${tone}`}>
        <input
          type="radio"
          name="consentToContact"
          value="true"
          data-consent-input
          className={radio}
        />
        <span className="min-w-0">
          <span className={`t-small block ${dark ? "text-paper" : "text-ink"}`}>{CONSENT_LABEL}</span>
          <span id="consent-disclosure" className={`t-fine mt-1 block ${dark ? "text-paper/60" : "text-stone"}`}>
            {CONSENT_DISCLOSURE}
          </span>
        </span>
      </label>

      <label className={`${row} ${tone}`}>
        <input type="radio" name="consentToContact" value="false" className={radio} />
        <span className={`t-small min-w-0 ${dark ? "text-paper" : "text-ink"}`}>{CONSENT_DECLINE_LABEL}</span>
      </label>
    </div>
  );
}
