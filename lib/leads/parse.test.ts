import { describe, expect, it } from "vitest";
import { parseLead } from "@/lib/leads";

const src = "/selling";

describe("parseLead — split name + qualifier (wizard) shape", () => {
  it("composes name from firstName/lastName when `name` is absent", () => {
    const res = parseLead({ firstName: "Ada", lastName: "Lovelace", email: "a@b.com" }, src);
    expect(res.kind).toBe("lead");
    if (res.kind === "lead") expect(res.lead.name).toBe("Ada Lovelace");
  });

  it("still requires a name when both whole and split names are empty", () => {
    const res = parseLead({ firstName: "  ", email: "a@b.com" }, src);
    expect(res).toEqual({ kind: "invalid", error: "Name is required." });
  });

  it("attaches qualifier answers AND folds them into the message", () => {
    const res = parseLead(
      {
        name: "Test Lead",
        email: "t@realtylt.com",
        qualifier: { intent: "Selling", sellTimeline: "1-3 months", choice: "My Home Value" },
      },
      src,
    );
    expect(res.kind).toBe("lead");
    if (res.kind !== "lead") return;
    expect(res.lead.qualifier).toEqual({
      intent: "Selling",
      sellTimeline: "1-3 months",
      choice: "My Home Value",
    });
    expect(res.lead.message).toContain("[Qualifier]");
    expect(res.lead.message).toContain("intent: Selling");
    expect(res.lead.message).toContain("choice: My Home Value");
  });

  it("preserves an existing message and appends the qualifier below it", () => {
    const res = parseLead(
      { name: "T", email: "t@b.com", message: "Call me", qualifier: { intent: "Buying" } },
      src,
    );
    if (res.kind !== "lead") throw new Error("expected lead");
    expect(res.lead.message.startsWith("Call me")).toBe(true);
    expect(res.lead.message).toContain("[Qualifier] intent: Buying");
  });

  it("drops non-string / oversized / empty qualifier values defensively", () => {
    const res = parseLead(
      {
        name: "T",
        email: "t@b.com",
        qualifier: { intent: "Both", bad: { nested: 1 }, huge: "x".repeat(500), blank: "  " },
      },
      src,
    );
    if (res.kind !== "lead") throw new Error("expected lead");
    expect(res.lead.qualifier?.intent).toBe("Both");
    expect(res.lead.qualifier?.bad).toBeUndefined();
    expect(res.lead.qualifier?.blank).toBeUndefined();
    expect(res.lead.qualifier?.huge?.length).toBe(200);
  });

  it("leaves qualifier undefined when no wizard answers are present", () => {
    const res = parseLead({ name: "T", email: "t@b.com" }, src);
    if (res.kind !== "lead") throw new Error("expected lead");
    expect(res.lead.qualifier).toBeUndefined();
    expect(res.lead.message).toBe("");
  });
});
