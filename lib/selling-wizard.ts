/** Qualifying-wizard flow — the pure state machine behind the post-submit popup on /selling.
 *
 * Mirrors the live realtylt.com (Brivity) qualifying popup, but as a small, testable reducer
 * with no React or DOM inside it. The <QualifyingWizard> component renders these steps and
 * drives navigation with nextStep(); the branching lives here so it can be unit-tested.
 *
 * Flow (from the live DOM):
 *   intent → Buying:  buyTimeline → mortgage → consult → (Yes) scheduleConsult → confirm
 *                                                          (No)  confirm
 *            Selling: sellTimeline → consultOrValue → (Schedule) scheduleConsult → confirm
 *                                                     (Home value) navigate to /home-value
 *            Both:    buyTimeline → mortgage → sellTimeline → consultOrValue → …
 */

export type WizardStepId =
  | "intent"
  | "buyTimeline"
  | "mortgage"
  | "consult"
  | "sellTimeline"
  | "consultOrValue"
  | "scheduleConsult"
  | "confirm";

export type Intent = "Buying" | "Selling" | "Both";

export interface WizardAnswers {
  intent?: Intent;
  buyTimeline?: string;
  mortgage?: string;
  consult?: "Yes" | "No";
  sellTimeline?: string;
  consultOrValue?: "Schedule Consultation" | "My Home Value";
  callTimes?: string;
}

export type WizardNext =
  | { type: "step"; step: WizardStepId }
  | { type: "done" }
  | { type: "navigate"; target: "home-value" };

const step = (s: WizardStepId): WizardNext => ({ type: "step", step: s });

/** The first step every run opens on. */
export const FIRST_STEP: WizardStepId = "intent";

/** Compute the next screen from the current step + answers so far. Pure. */
export function nextStep(current: WizardStepId, answers: WizardAnswers): WizardNext {
  switch (current) {
    case "intent":
      // Selling-only sellers skip the buyer questions entirely.
      return answers.intent === "Selling" ? step("sellTimeline") : step("buyTimeline");
    case "buyTimeline":
      return step("mortgage");
    case "mortgage":
      // "Both" continues into the seller branch; a pure buyer offers the consult.
      return answers.intent === "Both" ? step("sellTimeline") : step("consult");
    case "consult":
      return answers.consult === "Yes" ? step("scheduleConsult") : step("confirm");
    case "sellTimeline":
      return step("consultOrValue");
    case "consultOrValue":
      return answers.consultOrValue === "My Home Value"
        ? { type: "navigate", target: "home-value" }
        : step("scheduleConsult");
    case "scheduleConsult":
      return step("confirm");
    case "confirm":
      return { type: "done" };
  }
}

/** Which answer key a step writes (used to record and to clear on Back). */
export const STEP_ANSWER_KEY: Partial<Record<WizardStepId, keyof WizardAnswers>> = {
  intent: "intent",
  buyTimeline: "buyTimeline",
  mortgage: "mortgage",
  consult: "consult",
  sellTimeline: "sellTimeline",
  consultOrValue: "consultOrValue",
  scheduleConsult: "callTimes",
};

/** A readable one-line summary of the answers, appended to the lead's message so a human
 * reading the CRM record sees exactly what the visitor told the wizard. */
export function summarizeAnswers(a: WizardAnswers): string {
  const parts: string[] = [];
  if (a.intent) parts.push(`Looking to: ${a.intent}`);
  if (a.buyTimeline) parts.push(`Buy timeline: ${a.buyTimeline}`);
  if (a.mortgage) parts.push(`Pre-approved: ${a.mortgage}`);
  if (a.sellTimeline) parts.push(`Sell timeline: ${a.sellTimeline}`);
  if (a.consult) parts.push(`Wants consult: ${a.consult}`);
  if (a.consultOrValue) parts.push(`Chose: ${a.consultOrValue}`);
  if (a.callTimes) parts.push(`Best times to call: ${a.callTimes}`);
  return parts.join(" | ");
}
