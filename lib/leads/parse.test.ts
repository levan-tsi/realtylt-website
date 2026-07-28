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
  // Listing alerts: a visitor without an account keeps their saved searches in localStorage,
  // so these travel with the lead or the CRM never learns what to watch.
  it("carries saved searches through and summarizes them into the message", () => {
    const res = parseLead(
      {
        name: "Ada",
        email: "ada@b.com",
        savedSearches: [
          { label: "Beacon 3bd", query: "county=dutchess&bedsMin=3", criteria: { county: "dutchess", bedsMin: 3 } },
        ],
      },
      src,
    );
    if (res.kind !== "lead") throw new Error("expected lead");
    expect(res.lead.savedSearches).toHaveLength(1);
    expect(res.lead.savedSearches?.[0].criteria).toEqual({ county: "dutchess", bedsMin: 3 });
    expect(res.lead.message).toContain("[Listing alerts requested]");
    expect(res.lead.message).toContain("Beacon 3bd (/search?county=dutchess&bedsMin=3)");
  });

  it("keeps a typed message above the alert summary", () => {
    const res = parseLead(
      {
        name: "Ada",
        email: "ada@b.com",
        message: "Only south of Poughkeepsie please",
        savedSearches: [{ label: "S", query: "county=dutchess", criteria: {} }],
      },
      src,
    );
    if (res.kind !== "lead") throw new Error("expected lead");
    expect(res.lead.message.startsWith("Only south of Poughkeepsie please")).toBe(true);
    expect(res.lead.message).toContain("[Listing alerts requested]");
  });

  it("bounds the saved-search payload defensively", () => {
    const res = parseLead(
      {
        name: "T",
        email: "t@b.com",
        savedSearches: [
          ...Array.from({ length: 30 }, (_, i) => ({ label: `S${i}`, query: "county=ulster", criteria: {} })),
        ],
      },
      src,
    );
    if (res.kind !== "lead") throw new Error("expected lead");
    expect(res.lead.savedSearches).toHaveLength(20);
  });

  it("strips non-scalar and oversized criteria values", () => {
    const res = parseLead(
      {
        name: "T",
        email: "t@b.com",
        savedSearches: [
          {
            label: "x".repeat(300),
            query: "county=ulster",
            criteria: { county: "ulster", nested: { a: 1 }, arr: [1, 2], huge: "y".repeat(400), on: true },
          },
        ],
      },
      src,
    );
    if (res.kind !== "lead") throw new Error("expected lead");
    const s0 = res.lead.savedSearches![0];
    expect(s0.label.length).toBe(120);
    expect(s0.criteria.county).toBe("ulster");
    expect(s0.criteria.on).toBe(true);
    expect(s0.criteria.nested).toBeUndefined();
    expect(s0.criteria.arr).toBeUndefined();
    expect(String(s0.criteria.huge).length).toBe(120);
  });

  it("leaves savedSearches undefined when none are sent, and ignores junk shapes", () => {
    for (const body of [
      { name: "T", email: "t@b.com" },
      { name: "T", email: "t@b.com", savedSearches: "nope" },
      { name: "T", email: "t@b.com", savedSearches: [] },
      { name: "T", email: "t@b.com", savedSearches: [null, 7, { label: "", query: "" }] },
    ]) {
      const res = parseLead(body, src);
      if (res.kind !== "lead") throw new Error("expected lead");
      expect(res.lead.savedSearches).toBeUndefined();
      expect(res.lead.message).toBe("");
    }
  });
});
