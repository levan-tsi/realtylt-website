import { describe, expect, it } from "vitest";
import {
  answer,
  buildQualifier,
  INTENT_OPTIONS,
  nextStep,
  prevStep,
  progress,
  QUESTIONS,
  reasonFor,
  stepsFor,
  trail,
} from "./home-intake";
import { INTEREST_REASONS } from "./site";

describe("home intake flow", () => {
  it("opens on the intent question and knows nothing else until it is answered", () => {
    expect(stepsFor({})).toEqual(["intent"]);
    expect(nextStep("intent", {})).toBeNull();
    expect(prevStep("intent", {})).toBeNull();
  });

  it("every branch is exactly three questions, then the details form (the owner's 'not too many')", () => {
    for (const intent of ["buy", "sell", "both"] as const) {
      const steps = stepsFor({ intent });
      expect(steps[0]).toBe("intent");
      expect(steps[steps.length - 1]).toBe("details");
      expect(steps.filter((s) => s !== "intent" && s !== "details")).toHaveLength(intent === "buy" ? 2 : 3);
      expect(progress("details", { intent }).total).toBe(intent === "buy" ? 3 : 4);
    }
  });

  it("asks buyers how soon and whether they are qualified; sellers primary residence, how soon, and the price", () => {
    expect(stepsFor({ intent: "buy" })).toEqual(["intent", "buyTimeline", "preapproval", "details"]);
    expect(stepsFor({ intent: "sell" })).toEqual(["intent", "sellTimeline", "primaryResidence", "askingPrice", "details"]);
    expect(stepsFor({ intent: "both" })).toEqual(["intent", "sellTimeline", "askingPrice", "preapproval", "details"]);
  });

  it("walks forward and back along the chosen branch", () => {
    const a = { intent: "sell" as const };
    expect(nextStep("intent", a)).toBe("sellTimeline");
    expect(nextStep("sellTimeline", a)).toBe("primaryResidence");
    expect(nextStep("askingPrice", a)).toBe("details");
    expect(nextStep("details", a)).toBeNull();
    expect(prevStep("details", a)).toBe("askingPrice");
    expect(prevStep("sellTimeline", a)).toBe("intent");
  });

  it("progress reads as a fraction that only reaches 1 on the details form", () => {
    const a = { intent: "buy" as const };
    expect(progress("intent", a)).toMatchObject({ index: 0, total: 3 });
    expect(progress("buyTimeline", a).fraction).toBeCloseTo(0.5);
    expect(progress("preapproval", a).fraction).toBeCloseTo(0.75);
    expect(progress("details", a).fraction).toBe(1);
    // Before the intent is known there is one question of an unknown total: still under 1.
    expect(progress("intent", {}).fraction).toBeLessThan(1);
  });

  it("changing the intent clears the branch answers; changing a branch answer keeps the rest", () => {
    let a = answer({}, "intent", "sell");
    a = answer(a, "sellTimeline", "1 to 3 months");
    a = answer(a, "askingPrice", "Under $500k");
    expect(answer(a, "sellTimeline", "As soon as possible")).toEqual({
      intent: "sell",
      sellTimeline: "As soon as possible",
      askingPrice: "Under $500k",
    });
    expect(answer(a, "intent", "buy")).toEqual({ intent: "buy" });
  });

  it("the trail prints answered steps in branch order with human labels", () => {
    const a = { intent: "sell" as const, askingPrice: "Over $2M", sellTimeline: "3 to 6 months" };
    expect(trail(a)).toEqual([
      { step: "intent", label: "Looking to", value: "Selling" },
      { step: "sellTimeline", label: "Timeline", value: "3 to 6 months" },
      { step: "askingPrice", label: "Hoping for", value: "Over $2M" },
    ]);
    expect(trail({})).toEqual([]);
  });

  it("the qualifier is flat strings the CRM already labels, stamped with where it came from", () => {
    const q = buildQualifier({ intent: "both", sellTimeline: "1 to 3 months", askingPrice: "$1M to $2M", preapproval: "Not yet" });
    expect(q).toEqual({
      intake: "home",
      intent: "Both",
      preapproval: "Not yet",
      sellTimeline: "1 to 3 months",
      askingPrice: "$1M to $2M",
    });
    for (const v of Object.values(q)) expect(typeof v).toBe("string");
  });

  it("files the lead under the same three interest reasons the wizard uses", () => {
    expect(reasonFor("buy")).toBe(INTEREST_REASONS[0]);
    expect(reasonFor("sell")).toBe(INTEREST_REASONS[1]);
    expect(reasonFor("both")).toBe(INTEREST_REASONS[2]);
  });

  it("every intent tile has a real destination for the no-JavaScript case", () => {
    for (const o of INTENT_OPTIONS) expect(o.href).toMatch(/^\/(buying|selling)$/);
  });

  it("house rules on the copy: no em dashes, options short enough for one line at 320", () => {
    const all = [...Object.values(QUESTIONS).flatMap((q) => [q.question, q.label, ...q.options])];
    for (const s of all) {
      expect(s).not.toMatch(/[—–]/);
    }
    for (const q of Object.values(QUESTIONS)) for (const o of q.options) expect(o.length).toBeLessThanOrEqual(24);
  });
});
