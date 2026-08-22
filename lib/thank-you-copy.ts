import { SITE } from "@/lib/site";

/** EVERYTHING /thank-you IS ALLOWED TO PROMISE, IN ONE PLACE.
 *
 * Two complete copy sets: the page that is true TODAY (a person follows up, nothing is
 * automated) and the page for the day the CRM's outbound follow-up actually runs. Which one
 * renders is decided by ONE boolean in app/thank-you/page.tsx (OUTBOUND_FOLLOW_UP_LIVE — the
 * flip conditions are commented there, and docs/LEAD-FOLLOW-UP.md points at it); this module
 * only holds the words, and lib/thank-you-copy.test.ts holds BOTH sets to the honesty rules
 * so the flip can never surface copy nobody vetted.
 */

/** One sentence in three truths. LeadForm redirects here with `?c=1` (they ticked "Yes, you
 * can call or text me about my request.") or `?c=0` ("No thanks. Email me instead."), and the
 * page must not tell a person who declined calls that their phone is about to ring — the
 * consent record exists precisely so that call never happens. `unknown` is what renders with
 * JavaScript off, on a direct visit, and on the server: only claims true on every branch. */
export type ConsentCopySet = {
  agreed: string;
  declined: string;
  unknown: string;
};

/** One row of the "what happens next" ledger. `when` is the row's left column — the ledger is
 * ordered by time because "when do I hear back" is the question a person who just handed over
 * their phone number actually has. A `body` that depends on the consent answer is a
 * ConsentCopySet; a string is the same for everyone. */
export type NextStep = {
  when: string;
  title: string;
  body: string | ConsentCopySet;
};

/* ── The page that is TRUE TODAY: a person follows up, nothing is automated. ─────────────── */

export const HERO_NOTE_TODAY: ConsentCopySet = {
  agreed: "You said a call or text is okay, so that is how we will reach you.",
  declined: "You asked us to email instead of calling, and that is exactly what we will do.",
  unknown: "Someone on our team will be in touch soon.",
};

export const NEXT_STEPS_TODAY: NextStep[] = [
  {
    when: "Already done",
    title: "Your request is saved",
    body: "Everything you typed is in front of our team now. Nothing to resend, nothing to repeat.",
  },
  {
    when: "Usually within the hour",
    title: "A person reads it",
    body: {
      agreed: `Not an autoresponder. Someone on our team reads what you sent, seven days a week, then reaches you by call or text from ${SITE.phone}, the way you said was okay.`,
      declined:
        "Not an autoresponder. Someone on our team reads what you sent, seven days a week, and the reply lands in your inbox, as you asked.",
      unknown:
        "Not an autoresponder. Someone on our team reads what you sent, seven days a week, and gets back to you the way you asked.",
    },
  },
  {
    when: "When we talk",
    title: "You get specifics",
    body: "Recent sales, what is asking nearby, and what those numbers mean for your address and your timing.",
  },
  {
    when: "Always",
    title: "You set the pace",
    body: "No obligation. If the timing is wrong for you, we will say so plainly.",
  },
];

/* ── The page for the day the follow-up EXISTS. The sending side is drafted and inactive
   (n8n `rzI7WIQhRKfrhJxH`, "[DRAFT] Website Lead Follow-up"): consented leads get a short
   verification call and a "we will call you" email; declined leads get an email-only note.
   This copy speaks in that same voice — the call confirms a time and works around them; the
   declined branch says plainly that we will not call, and leaves the number for the day they
   change their mind. Re-read these claims on flip day against what the workflow actually
   does. ──────────────────────────────────────────────────────────────────────────────────── */

export const HERO_NOTE_WHEN_LIVE: ConsentCopySet = {
  agreed:
    "A thank-you note is on its way to your inbox, and a short call is coming to confirm a day that works for you.",
  declined:
    "A thank-you note is on its way to your inbox, and everything stays in email, as you asked.",
  unknown: "A thank-you note is on its way to your inbox, and someone on our team will be in touch soon.",
};

export const NEXT_STEPS_WHEN_LIVE: NextStep[] = [
  {
    when: "Already done",
    title: "Your request is saved",
    body: "Everything you typed is in front of our team now. Nothing to resend, nothing to repeat.",
  },
  {
    when: "Within a few minutes",
    title: "A thank-you note reaches your inbox",
    body: "It repeats what you asked for, so you have a copy and a reply address that goes to a person.",
  },
  {
    when: "Usually within the hour",
    title: "We set a day that works",
    body: {
      agreed: `Our assistant calls from ${SITE.phone} to confirm your request and find a day that works around your schedule. Levan takes it from there.`,
      declined: `We will not call, because you asked us not to. The day for your appointment gets worked out over email, and if you change your mind, ${SITE.phone} reaches us any day.`,
      unknown: "We confirm your request and find a day that works around your schedule. Levan takes it from there.",
    },
  },
  {
    when: "Always",
    title: "You set the pace",
    body: "No obligation. If the timing is wrong for you, we will say so plainly.",
  },
];

/** The one place the page asks for its words. The caller owns the boolean (see
 * app/thank-you/page.tsx); this function only guarantees the two sets can never mix. */
export function followUpCopy(outboundFollowUpLive: boolean): {
  heroNote: ConsentCopySet;
  nextSteps: NextStep[];
} {
  return outboundFollowUpLive
    ? { heroNote: HERO_NOTE_WHEN_LIVE, nextSteps: NEXT_STEPS_WHEN_LIVE }
    : { heroNote: HERO_NOTE_TODAY, nextSteps: NEXT_STEPS_TODAY };
}
