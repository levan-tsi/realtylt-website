/** THE HOME-PAGE INTAKE — the pure flow behind components/home/HomeIntake.tsx.
 *
 * The owner, 2026-08-28: the home page carried the same "tell us about your home" form twice
 * (the value section, then the footer). Replace the first with the thing the /plan and wizard
 * pop-ups do, but ON the page: "starting to ask one question, are you looking to buy or sell or
 * both, and whichever they choose then it asks a few more questions ... some very important
 * questions but not too many, and then the last page would be the fill-out form".
 *
 * Every branch is three questions, then the details. The questions are the ones he named:
 * buyers, how soon and are you qualified; sellers, is it your primary residence, how soon, and
 * what are you hoping to get. "Both" takes the seller's two that drive the plan (timing, price)
 * plus the buyer's readiness (pre-approval), because the sale is what sets the calendar.
 *
 * No React in here so the branching is unit-testable; the component renders STEPS and calls
 * stepsFor() to know where it is. The answers travel to the CRM as the same `qualifier` the
 * wizard and /plan already send, so the contact's "What they told us" card reads them.
 */
import { INTEREST_REASONS } from "@/lib/site";

export type Intent = "buy" | "sell" | "both";

export type IntakeStepId =
  | "intent"
  | "buyTimeline"
  | "preapproval"
  | "sellTimeline"
  | "primaryResidence"
  | "askingPrice"
  | "details";

export interface IntakeAnswers {
  intent?: Intent;
  buyTimeline?: string;
  preapproval?: string;
  sellTimeline?: string;
  primaryResidence?: string;
  askingPrice?: string;
}

/** A question step: what the panel asks, the options it offers, and the short label the trail
 * on the left prints beside the answer. */
export interface IntakeQuestion {
  id: Exclude<IntakeStepId, "intent" | "details">;
  /** The answer key this step writes. */
  key: keyof IntakeAnswers;
  question: string;
  options: readonly string[];
  /** Trail label, e.g. "Timeline". */
  label: string;
}

/** The first question. Each option carries a real destination so that with JavaScript off the
 * three tiles are still three useful links instead of three dead buttons. */
export const INTENT_OPTIONS: readonly { value: Intent; label: string; href: string }[] = [
  { value: "buy", label: "Buying", href: "/buying" },
  { value: "sell", label: "Selling", href: "/selling" },
  { value: "both", label: "Both", href: "/selling" },
];

export const INTENT_QUESTION = "Are you looking to buy, sell, or both?";

export const QUESTIONS: Record<IntakeQuestion["id"], IntakeQuestion> = {
  buyTimeline: {
    id: "buyTimeline",
    key: "buyTimeline",
    question: "How soon are you looking to buy?",
    options: ["Within 3 months", "3 to 6 months", "6 to 12 months", "Just looking for now"],
    label: "Timeline",
  },
  preapproval: {
    id: "preapproval",
    key: "preapproval",
    question: "Are you pre-approved for a mortgage?",
    options: ["Yes, pre-approved", "Not yet", "Paying cash"],
    label: "Financing",
  },
  sellTimeline: {
    id: "sellTimeline",
    key: "sellTimeline",
    question: "How soon do you want to sell?",
    options: ["As soon as possible", "1 to 3 months", "3 to 6 months", "Later, just planning"],
    label: "Timeline",
  },
  primaryResidence: {
    id: "primaryResidence",
    key: "primaryResidence",
    question: "Is this your primary residence?",
    options: ["Yes, I live there", "No, it's an investment", "No, a second home"],
    label: "The home",
  },
  askingPrice: {
    id: "askingPrice",
    key: "askingPrice",
    question: "What are you hoping to get for it?",
    options: ["Under $500k", "$500k to $750k", "$750k to $1M", "$1M to $2M", "Over $2M", "Not sure yet"],
    label: "Hoping for",
  },
};

/** The question steps after the first one, per intent, each ending on the details form. */
const PATHS: Record<Intent, readonly IntakeStepId[]> = {
  buy: ["buyTimeline", "preapproval", "details"],
  sell: ["sellTimeline", "primaryResidence", "askingPrice", "details"],
  both: ["sellTimeline", "askingPrice", "preapproval", "details"],
};

/** The whole sequence for the answers so far: always starts on intent; the rest is unknown
 * until the intent is chosen. */
export function stepsFor(answers: IntakeAnswers): readonly IntakeStepId[] {
  return answers.intent ? ["intent", ...PATHS[answers.intent]] : ["intent"];
}

/** Where a step sits in its sequence. `total` counts only questions, so the details form
 * reads as "last step" rather than "question 4 of 4". */
export function progress(step: IntakeStepId, answers: IntakeAnswers): { index: number; total: number; fraction: number } {
  const steps = stepsFor(answers);
  const questions = steps.filter((s) => s !== "details");
  const index = steps.indexOf(step);
  // Before the intent is chosen the total is unknown, and "1 of 1" would draw the rule half
  // full on the first question; a short first mark says "this has begun" and nothing more.
  const fraction = step === "details" ? 1 : !answers.intent ? 0.16 : (index + 1) / (questions.length + 1);
  return { index, total: questions.length, fraction };
}

export function nextStep(step: IntakeStepId, answers: IntakeAnswers): IntakeStepId | null {
  const steps = stepsFor(answers);
  const i = steps.indexOf(step);
  return i >= 0 && i < steps.length - 1 ? steps[i + 1] : null;
}

export function prevStep(step: IntakeStepId, answers: IntakeAnswers): IntakeStepId | null {
  const steps = stepsFor(answers);
  const i = steps.indexOf(step);
  return i > 0 ? steps[i - 1] : null;
}

/** Changing the intent invalidates every branch answer; changing a branch answer keeps the rest
 * (the visitor is editing one line of the trail, not starting over). */
export function answer(answers: IntakeAnswers, key: keyof IntakeAnswers, value: string): IntakeAnswers {
  if (key === "intent") return { intent: value as Intent };
  return { ...answers, [key]: value };
}

export function intentLabel(intent: Intent): string {
  return INTENT_OPTIONS.find((o) => o.value === intent)!.label;
}

/** The trail the left column prints: one line per answered step, in step order. */
export function trail(answers: IntakeAnswers): { step: IntakeStepId; label: string; value: string }[] {
  const out: { step: IntakeStepId; label: string; value: string }[] = [];
  if (!answers.intent) return out;
  out.push({ step: "intent", label: "Looking to", value: intentLabel(answers.intent) });
  for (const step of PATHS[answers.intent]) {
    if (step === "details") continue;
    const q = QUESTIONS[step as IntakeQuestion["id"]];
    const v = answers[q.key];
    if (v) out.push({ step, label: q.label, value: v });
  }
  return out;
}

/** The interest reason the lead files under — the same three the wizard maps to. */
export function reasonFor(intent: Intent): (typeof INTEREST_REASONS)[number] {
  return intent === "buy" ? INTEREST_REASONS[0] : intent === "sell" ? INTEREST_REASONS[1] : INTEREST_REASONS[2];
}

/** The flat string record the lead carries. Keys match what the wizard and /plan already send
 * where the question is the same (intent, buyTimeline, sellTimeline, preapproval) so the CRM's
 * "What they told us" card labels them the same way. `intake: home` says where it came from. */
export function buildQualifier(answers: IntakeAnswers): Record<string, string> {
  const q: Record<string, string> = { intake: "home" };
  if (answers.intent) q.intent = intentLabel(answers.intent);
  for (const step of Object.values(QUESTIONS)) {
    const v = answers[step.key];
    if (v) q[step.key] = v;
  }
  return q;
}
