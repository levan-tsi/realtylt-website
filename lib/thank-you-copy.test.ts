import { describe, expect, it } from "vitest";
import {
  followUpCopy,
  HERO_NOTE_TODAY,
  HERO_NOTE_WHEN_LIVE,
  NEXT_STEPS_TODAY,
  NEXT_STEPS_WHEN_LIVE,
  type ConsentCopySet,
  type NextStep,
} from "@/lib/thank-you-copy";

/** THE THANK-YOU PAGE MUST NOT PROMISE WHAT THE CRM DOES NOT DO.
 *
 * The assistant's confirmation call and the automatic thank-you email are the owner's plan,
 * not the system's behaviour: no active workflow places a call or sends an email on a website
 * lead (checked 2026-08-22). Round 10 already had to weaken a shipped claim nothing delivered.
 * So the page renders from lib/thank-you-copy.ts, both copy sets exist on either side of ONE
 * constant, and this file holds each set to the rules that make it honest:
 *
 *  - the TODAY set may not mention the assistant or an email that "is on its way";
 *  - the DECLINED branch may never promise a call or a text, under EITHER set — the visitor
 *    ticked "No thanks. Email me instead.", and the consent record exists precisely so that
 *    call never happens;
 *  - the UNKNOWN branch (JS off, direct visit, server render) may not lean on the consent
 *    answer it does not have.
 *
 * Both sets are tested UNCONDITIONALLY, so flipping the constant stays a one-line change that
 * cannot flip the page into copy nobody vetted.
 */

const setStrings = (note: ConsentCopySet, steps: NextStep[]): string[] => [
  ...Object.values(note),
  ...steps.flatMap((s) => [s.when, s.title, ...(typeof s.body === "string" ? [s.body] : Object.values(s.body))]),
];

const branch = (note: ConsentCopySet, steps: NextStep[], key: keyof ConsentCopySet): string[] => [
  note[key],
  ...steps.flatMap((s) => (typeof s.body === "string" ? [] : [s.body[key]])),
];

const TODAY = { note: HERO_NOTE_TODAY, steps: NEXT_STEPS_TODAY };
const LIVE = { note: HERO_NOTE_WHEN_LIVE, steps: NEXT_STEPS_WHEN_LIVE };

/** "instead of calling" / "not to call" / "will not call" restate the visitor's OWN choice,
 * which is the honest use of the word. Strip those exact phrases, and any "call"/"text" that
 * remains is a promise. (The declined branch MAY print our phone number: that is an inbound
 * invitation for the day they change their mind, and the live workflow's email does the
 * same.) */
const withoutNegations = (s: string) => s.replace(/instead of calling|not to call|will not call/gi, "");

describe("the thank-you page's promises", () => {
  it("hands the page exactly the set the boolean names, so the flip is one line in page.tsx", () => {
    expect(followUpCopy(false)).toEqual({ heroNote: HERO_NOTE_TODAY, nextSteps: NEXT_STEPS_TODAY });
    expect(followUpCopy(true)).toEqual({
      heroNote: HERO_NOTE_WHEN_LIVE,
      nextSteps: NEXT_STEPS_WHEN_LIVE,
    });
  });

  it("TODAY promises no assistant call and no email, because neither exists", () => {
    for (const s of setStrings(TODAY.note, TODAY.steps)) {
      expect(s).not.toMatch(/assistant/i);
      expect(s).not.toMatch(/on its way|thank-you note|we (have )?sent/i);
    }
  });

  it("never tells a visitor who declined calls that we will call or text, in either set", () => {
    for (const { note, steps } of [TODAY, LIVE]) {
      for (const s of branch(note, steps, "declined")) {
        expect(withoutNegations(s)).not.toMatch(/\bcall|\btext/i);
      }
    }
  });

  it("does not lean on a consent answer it does not have in the unknown branch", () => {
    // "the way you asked" is allowed: it names no particular answer. "You said", or promising
    // a call or a text, claims one.
    for (const { note, steps } of [TODAY, LIVE]) {
      for (const s of branch(note, steps, "unknown")) {
        expect(s).not.toMatch(/\bcall|\btext|you said/i);
      }
    }
  });

  it("does tell a visitor who AGREED how we will reach them (the branch has to earn its keep)", () => {
    expect(branch(TODAY.note, TODAY.steps, "agreed").join(" ")).toMatch(/call or text/i);
    expect(branch(LIVE.note, LIVE.steps, "agreed").join(" ")).toMatch(/\bcall/i);
  });

  it("keeps the visitor-copy rules: no em or en dashes, no exclamation marks", () => {
    for (const { note, steps } of [TODAY, LIVE]) {
      for (const s of setStrings(note, steps)) {
        expect(s).not.toMatch(/[–—!]/);
      }
    }
  });
});
