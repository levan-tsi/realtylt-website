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
 * TWO TIERS, DELIBERATELY. Filling in a form asking us about a house is itself a request to be
 * contacted about that house. Agreeing to automated calls and marketing texts is a different
 * thing, so it is a separate, optional, never-pre-ticked box. The form must submit perfectly
 * well without it — PEWC requires that agreeing is not a condition, and a checkbox you cannot
 * decline is not consent.
 */

/** Bump when the wording changes. Stored on every lead so a record can be read back years
 * later against the exact text that was on screen. */
export const CONSENT_VERSION = "2026-08-03.v1";

/** The clickable line. Plain, active, and it says who is calling. */
export const CONSENT_LABEL = "Yes, RealtyLT can call or text me at this number.";

/** The disclosure PEWC requires, in the words a person reads. */
export const CONSENT_DISCLOSURE =
  "This includes automated dialing and prerecorded or artificial voice messages about my request and about homes. Agreeing is not a condition of buying or selling a home. Message and data rates may apply, message frequency varies, and you can reply STOP at any time to stop the messages.";

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
