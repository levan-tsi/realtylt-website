import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseLead } from "./index";
import {
  buildConsent,
  CONSENT_DISCLOSURE,
  CONSENT_LABEL,
  CONSENT_TEXT,
  CONSENT_VERSION,
} from "./consent";

const base = { name: "Ada Lovelace", email: "ada@example.com" };
const lead = (body: Record<string, unknown>, ip = "203.0.113.7") => {
  const parsed = parseLead({ ...base, ...body }, "/listing/123", ip);
  if (parsed.kind !== "lead") throw new Error(`expected a lead, got ${parsed.kind}`);
  return parsed.lead;
};

describe("consent — what actually gets stored", () => {
  it("records the agreement, not just a flag", () => {
    const c = lead({ phone: "917-555-0142", consentToContact: "true" }).consent;
    expect(c?.granted).toBe(true);
    // The four things a boolean cannot tell you a year later.
    expect(c?.text).toBe(CONSENT_TEXT);
    expect(c?.version).toBe(CONSENT_VERSION);
    expect(c?.source).toBe("/listing/123");
    expect(c?.ip).toBe("203.0.113.7");
    expect(c?.phone).toBe("917-555-0142");
    expect(Date.parse(c!.at)).not.toBeNaN();
  });

  /** An absent consent field and a declined one mean opposite things to whoever is about to
   * press dial, and only one of them is safe. */
  it("still records the refusal when the box is left unticked", () => {
    const c = lead({ phone: "917-555-0142" }).consent;
    expect(c).toBeDefined();
    expect(c?.granted).toBe(false);
    expect(c?.text).toBe(CONSENT_TEXT);
  });

  it("does not invent a consent record when there is no number to call", () => {
    expect(lead({}).consent).toBeUndefined();
  });

  /** The client may say yes or no. It may not say WHEN, from WHERE, or as WHOM — a record the
   * submitter can write is not evidence. */
  it("ignores client-supplied proof fields", () => {
    const c = lead({
      phone: "917-555-0142",
      consentToContact: "true",
      consent: { at: "1999-01-01T00:00:00.000Z", ip: "1.1.1.1", text: "I agree to anything" },
    }).consent;
    expect(c?.ip).toBe("203.0.113.7");
    expect(c?.text).toBe(CONSENT_TEXT);
    expect(new Date(c!.at).getUTCFullYear()).toBeGreaterThan(2020);
  });

  it.each([
    ["true", true],
    ["on", true],
    [true, true],
    ["false", false],
    ["", false],
    [undefined, false],
    ["yes", false],
    [1, false],
  ])("reads %p as granted=%p", (input, expected) => {
    expect(buildConsent({ granted: input, phone: "1", source: "/", ip: "x" }).granted).toBe(expected);
  });
});

describe("consent — the wording carries what the law requires", () => {
  /** Prior express written consent (47 CFR 64.1200(f)(9)) is only valid if it discloses the
   * automated dialing AND that agreeing is not a condition of buying anything. If someone
   * softens the copy later, these fail before it reaches a visitor. */
  it("discloses automated dialing and prerecorded messages", () => {
    expect(CONSENT_DISCLOSURE.toLowerCase()).toContain("automated dialing");
    expect(CONSENT_DISCLOSURE.toLowerCase()).toContain("prerecorded");
  });

  it("says agreeing is not a condition of buying or selling", () => {
    expect(CONSENT_DISCLOSURE.toLowerCase()).toContain("not a condition");
  });

  it("tells them how to stop the messages", () => {
    expect(CONSENT_DISCLOSURE.toLowerCase()).toContain("stop");
  });

  it("names who is being authorised", () => {
    expect(CONSENT_LABEL).toContain("RealtyLT");
  });

  /** House rule: no em dashes in anything a visitor reads. */
  it("has no em dashes", () => {
    expect(CONSENT_TEXT).not.toMatch(/[—–]/);
  });
});

describe("consent — every form that takes a phone number actually asks", () => {
  const ROOT = path.resolve(__dirname, "../..");
  const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

  /** The checkbox rendering is only half of it. Both listing sheets build their POST body from
   * explicitly named fields, so the field was silently dropped on the way to the server: the
   * box ticked, the lead sent, and no consent recorded anywhere. Caught once; guarded now. */
  it.each(["components/leads/LeadForm.tsx", "components/leads/ListingLeadCTAs.tsx"])(
    "%s renders the checkbox",
    (file) => {
      expect(read(file)).toContain("<ConsentCheckbox");
    },
  );

  it("ListingLeadCTAs forwards the field on every lead it posts", () => {
    const src = read("components/leads/ListingLeadCTAs.tsx");
    const posts = (src.match(/phone: data\.phone,/g) ?? []).length;
    const forwards = (src.match(/consentToContact: data\.consentToContact,/g) ?? []).length;
    expect(posts).toBeGreaterThan(0);
    expect(forwards).toBe(posts);
  });

  /** LeadForm spreads the whole FormData, so it needs no per-field wiring — but if that ever
   * becomes a hand-written body, this notices. */
  it("LeadForm posts the whole form rather than a hand-picked list of fields", () => {
    expect(read("components/leads/LeadForm.tsx")).toMatch(/\.\.\.data,/);
  });

  /** Never pre-ticked: consent that is the default is not consent, and PEWC needs agreeing to
   * be genuinely optional. */
  it("the box is never checked by default and never required", () => {
    // Read only what ships: the doc comment above the component explains WHY it must not be
    // required, and a naive substring match reads that sentence as the violation.
    const src = read("components/leads/ConsentCheckbox.tsx").replace(/\/\*[\s\S]*?\*\//g, "");
    expect(src).not.toMatch(/\bdefaultChecked\b/);
    expect(src).not.toMatch(/\bchecked[=\s]/);
    expect(src).not.toMatch(/\brequired\b/);
  });
});
