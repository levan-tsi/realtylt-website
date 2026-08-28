/** CONSENT TO CALL OR TEXT.
 *
 * The CRM has a live dialer and live Twilio SMS pointed at exactly these leads, and until now
 * this site collected phone numbers with no consent language anywhere on it.
 *
 * WHAT THE LAW ACTUALLY ASKS FOR, checked 2026-08-03 rather than recalled:
 *
 * - The FCC's "one-to-one consent" rule is NOT in force. The Eleventh Circuit vacated it in
 *   *Insurance Marketing Coalition v. FCC* (Jan 2025) and the FCC then deleted the vacated
 *   language, so the governing federal standard is the pre-2023 **prior express written
 *   consent** (PEWC), 47 CFR 64.1200(f)(9). Do not build to the vacated rule.
 *
 * - PEWC is a written agreement, signed (a ticked box plus submit is a valid E-SIGN
 *   signature), that (a) clearly authorises the seller to deliver telemarketing calls or texts
 *   using an automatic telephone dialing system or an artificial/prerecorded voice, (b) states
 *   the person is NOT required to agree as a condition of buying anything, and (c) identifies
 *   the number the authorisation covers.
 *
 * - New York is the sharper edge. GBL §399-z(5)(a) makes it unlawful to knowingly make an
 *   *unsolicited* telemarketing sales call to anyone in an area under a declared state of
 *   emergency, and New York has run rolling states of emergency for years — which is why NYSAR
 *   keeps telling its members cold calling is still prohibited. Penalties run to $20,000 per
 *   call, each call a separate violation. Consent is precisely what makes a call solicited.
 *
 * THE BOX IS MANDATORY, BY THE OWNER'S DECISION (2026-08-22, restated 2026-08-23). This section
 * used to say the opposite, and the change is recorded rather than quietly rewritten.
 *
 * What it said before: agreeing must not be a condition, so the box is optional and the form
 * submits without it. That is what point (b) above asks for, and it is why the earlier design
 * offered a decline option.
 *
 * What he decided, after being shown that argument twice: "no send me email instead has to be
 * removed, only yes text and call me option check box which is must." His stated reason is the
 * one this file was built to serve — the CRM's dialer and AI caller are pointed at these numbers
 * and a lead without permission is a lead he cannot work.
 *
 * SO READ THE RECORDS ACCORDINGLY. Every `granted: true` stored from this date carries the fact
 * that ticking was required to submit, which is exactly the circumstance (b) warns about. The
 * disclosure below still says "never required" because removing that sentence would fail the
 * PEWC wording test outright; that tension is real and it is his to carry, not something a later
 * round should "fix" by re-opening the decision. If the exposure ever matters, the fix is to
 * restore an equal, unpunished decline option, not to reword the disclosure.
 */

/** Bump when the wording changes. Stored on every lead so a record can be read back years
 * later against the exact text that was on screen. */
export const CONSENT_VERSION = "2026-08-28.v3";

/** The clickable line. Plain, warm, and about THEIR request rather than our marketing. */
export const CONSENT_LABEL = "Yes, you can call or text me about my request.";

/**
 * The fine print. Deliberately short, and the owner asked for it to be as unintimidating as it
 * can be without failing the requirement (2026-08-03): "if we don't need to mention AI calls
 * let's not". Cut from 60 words to 28. What went, and what could not:
 *
 * GONE, because nothing requires it: "message frequency varies", the second mention of homes,
 * and the words "dialing", "prerecorded" and "artificial voice", which are the regulation's
 * vocabulary and not a person's.
 *
 * STAYING, and this is the load-bearing part: some reference to **automated and recorded**
 * calls. PEWC is only valid consent for calls placed with an autodialer or an artificial or
 * prerecorded voice IF the agreement discloses that, and the CRM places exactly those calls.
 * Removing it would not make the consent gentler, it would make it consent to nothing, which is
 * worse than having no box at all. "Automated and recorded" says the same thing in words a
 * person actually uses.
 *
 * STAYING: "never required", because PEWC is invalid if agreeing is a condition of the service.
 * STAYING: "STOP", which is a carrier requirement for SMS, not a legal nicety.
 */
export const CONSENT_DISCLOSURE =
  "Includes automated and recorded calls and texts. Optional, and never required to buy or sell a home. Reply STOP any time. Message and data rates may apply.";

/**
 * THE OTHER ANSWER, restored 2026-08-28. Round 49 flagged the tension recorded above (a box that
 * must be ticked, under a disclosure that says "never required") and the owner answered: "i did
 * not get it do as its proper to do." He delegated the legal shape, so the control is the one the
 * 2026-08-22 session shipped once and the 08-23 decision removed: two radios, NEITHER
 * pre-selected, BOTH submit, and the form will not go until one is chosen. Every lead still
 * arrives with an explicit answer, which was the thing he actually needed (the dialer and the AI
 * caller know where they stand), and a yes is a yes that was not a condition of anything, which
 * is what makes it consent. Declining is a real, equal, unpunished choice or the yes beside it is
 * worth nothing. It is honest about what still happens: they asked us something, so we answer by
 * email. Version bumped so records can be told apart from the required-box era.
 */
export const CONSENT_DECLINE_LABEL = "No thanks. Email me instead.";

/** The question the two answers belong to. A screen reader hears it before either answer. */
export const CONSENT_QUESTION = "Can we call or text you about this?";

/** The two answers the control can send, and nothing else. A form must refuse to submit until
 * the visitor has chosen one; absence is neither a yes nor a no, it is an unanswered question.
 * Shared by every form so the predicate cannot drift between the footer, the listing sheets and
 * /plan. */
export function consentAnswered(value: unknown): value is "true" | "false" {
  return value === "true" || value === "false";
}

/** The refusal copy, one sentence, shared for the same reason. */
export const CONSENT_UNANSWERED_ERROR =
  "Please pick one of the two options above so we know how to reach you.";

/** What gets stored: the whole agreement as one string, because the label alone is not the
 * agreement and the disclosure alone is not the ask. */
export const CONSENT_TEXT = `${CONSENT_LABEL} ${CONSENT_DISCLOSURE}`;

/** The seller being authorised. PEWC requires the agreement identify them. */
export const CONSENT_SELLER = "RealtyLT (Levan Tsiklauri, United Real Estate)";

/**
 * The proof, not the flag. A bare `consent: true` proves nothing a year later: it cannot show
 * what the person was asked, when, on what page, or which number they authorised. Every field
 * below except `granted` is stamped SERVER-SIDE and is never read from the client, because a
 * record the submitter can write is not evidence.
 */
export interface ContactConsent {
  /** True only if the box was ticked. Never inferred and never defaulted to true. */
  granted: boolean;
  /** The exact agreement text on screen at the moment it was ticked. */
  text: string;
  /** Which wording that was. */
  version: string;
  /** Who was authorised. */
  seller: string;
  /** When, ISO, server clock. */
  at: string;
  /** The page they were on. */
  source: string;
  /** Their IP at submission. */
  ip: string;
  /** The number the authorisation covers. Kept on the record itself so the consent stays
   * readable even if the contact's phone is later edited in the CRM. */
  phone: string;
}

/** Build the stored record. Called server-side only: `granted` is the single thing the client
 * gets a say in, and even that is coerced to a real boolean rather than trusted. */
export function buildConsent(input: {
  granted: unknown;
  phone: string;
  source: string;
  ip: string;
  at?: string;
}): ContactConsent {
  return {
    granted: input.granted === true || input.granted === "true" || input.granted === "on",
    text: CONSENT_TEXT,
    version: CONSENT_VERSION,
    seller: CONSENT_SELLER,
    at: input.at ?? new Date().toISOString(),
    source: input.source,
    ip: input.ip,
    phone: input.phone,
  };
}
