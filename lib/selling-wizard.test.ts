import { describe, expect, it } from "vitest";
import { FIRST_STEP, nextStep, summarizeAnswers, type WizardAnswers } from "./selling-wizard";

/** Walk the machine from a set of fixed answers, returning the ordered step ids reached
 * (plus a terminal marker). Simulates a user always able to answer each step. */
function walk(answers: WizardAnswers): string[] {
  const seen: string[] = [FIRST_STEP];
  let current = FIRST_STEP;
  for (let i = 0; i < 20; i++) {
    const res = nextStep(current, answers);
    if (res.type === "done") return [...seen, "DONE"];
    if (res.type === "navigate") return [...seen, `NAV:${res.target}`];
    seen.push(res.step);
    current = res.step;
  }
  throw new Error("wizard did not terminate");
}

describe("selling-wizard flow", () => {
  it("BUYING + wants consult: intent → buyTimeline → mortgage → consult → scheduleConsult → confirm → done", () => {
    expect(walk({ intent: "Buying", consult: "Yes" })).toEqual([
      "intent",
      "buyTimeline",
      "mortgage",
      "consult",
      "scheduleConsult",
      "confirm",
      "DONE",
    ]);
  });

  it("BUYING + declines consult: consult → confirm (no scheduleConsult)", () => {
    expect(walk({ intent: "Buying", consult: "No" })).toEqual([
      "intent",
      "buyTimeline",
      "mortgage",
      "consult",
      "confirm",
      "DONE",
    ]);
  });

  it("SELLING → schedule consultation: intent → sellTimeline → consultOrValue → scheduleConsult → confirm", () => {
    expect(walk({ intent: "Selling", consultOrValue: "Schedule Consultation" })).toEqual([
      "intent",
      "sellTimeline",
      "consultOrValue",
      "scheduleConsult",
      "confirm",
      "DONE",
    ]);
  });

  it("SELLING → my home value: navigates to /home-value (never reaches confirm)", () => {
    expect(walk({ intent: "Selling", consultOrValue: "My Home Value" })).toEqual([
      "intent",
      "sellTimeline",
      "consultOrValue",
      "NAV:home-value",
    ]);
  });

  it("BOTH: buyer questions then seller branch → intent → buyTimeline → mortgage → sellTimeline → consultOrValue", () => {
    expect(walk({ intent: "Both", consultOrValue: "Schedule Consultation" })).toEqual([
      "intent",
      "buyTimeline",
      "mortgage",
      "sellTimeline",
      "consultOrValue",
      "scheduleConsult",
      "confirm",
      "DONE",
    ]);
  });

  it("summarizeAnswers produces a readable, pipe-joined line for the CRM", () => {
    const s = summarizeAnswers({
      intent: "Both",
      buyTimeline: "1-3 months",
      mortgage: "Using Cash",
      sellTimeline: "3-6 months",
      consultOrValue: "Schedule Consultation",
      callTimes: "weekday evenings",
    });
    expect(s).toContain("Looking to: Both");
    expect(s).toContain("Pre-approved: Using Cash");
    expect(s).toContain("Best times to call: weekday evenings");
    expect(s).not.toContain("undefined");
  });
});
