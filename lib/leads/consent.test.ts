import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseLead } from "./index";
import {
  buildConsent,
  CONSENT_DECLINE_LABEL,
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
  /** The wording was deliberately softened in v2 (the owner: "if we don't need to mention AI
   * calls let's not"). These guard the two clauses that CANNOT go, so a future softening pass
   * cannot quietly turn the box into consent to nothing. */
  it("discloses that the calls and texts may be automated and recorded", () => {
    const d = CONSENT_DISCLOSURE.toLowerCase();
    expect(d).toContain("automated");
    // covers "artificial or prerecorded voice" in a person's vocabulary
    expect(d).toMatch(/recorded/);
  });

  it("says agreeing is never required to get the service", () => {
    expect(CONSENT_DISCLOSURE.toLowerCase()).toMatch(/never required|not required|not a condition/);
  });

  it("tells them how to stop the messages", () => {
    expect(CONSENT_DISCLOSURE.toLowerCase()).toContain("stop");
  });

  /** Kept short on purpose. If this ever fails upward, someone is re-inflating the fine print. */
  it("stays short enough that a person will actually read it", () => {
    expect(CONSENT_DISCLOSURE.split(/\s+/).length).toBeLessThanOrEqual(32);
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
    "%s renders the consent choice",
    (file) => {
      expect(read(file)).toContain("<ConsentChoice");
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

  /** THE ASK IS UNSKIPPABLE, AND DECLINING IS FREE. Those two have to hold together.
   *
   * The owner asked (2026-08-22) for a required box because the form was submitting with the
   * question untouched. A required box would be a forced yes, and a forced yes is not prior
   * express written consent — it is a stored string that proves nothing while authorising real
   * automated calls. So the question became a two-option choice that must be answered, where
   * BOTH answers submit.
   *
   * The dangerous regression is not someone deleting `required`. It is someone deleting the
   * DECLINE option and leaving a single required radio, which reads like a tidy-up and is a
   * forced yes. That is what the count below exists to catch.
   *
   * Comments are stripped before matching: the doc comment above the component explains why a
   * required box would be wrong, and a naive substring match reads that explanation as the
   * violation. This test learned that the hard way once already. */
  const consentSrc = () =>
    read("components/leads/ConsentChoice.tsx")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  it("never pre-selects an answer", () => {
    const src = consentSrc();
    expect(src).not.toMatch(/\bdefaultChecked\b/);
    expect(src).not.toMatch(/\bchecked[=\s]/);
  });

  it("offers exactly two answers, so declining is a real option and not an omission", () => {
    const src = consentSrc();
    const yes = (src.match(/value="true"/g) ?? []).length;
    const no = (src.match(/value="false"/g) ?? []).length;
    expect(yes, "the agree option").toBe(1);
    expect(no, "the decline option — without it, a required group is a forced yes").toBe(1);
    expect((src.match(/name="consentToContact"/g) ?? []).length).toBe(2);
  });

  it("requires an answer, so the question cannot be scrolled past", () => {
    const src = consentSrc();
    // Both members of a radio group carry `required`; the browser then demands one of them.
    expect((src.match(/\brequired\b/g) ?? []).length).toBe(2);
  });

  it("declining is stored as an explicit refusal, not as an absence", () => {
    const c = lead({ phone: "917-555-0142", consentToContact: "false" }).consent;
    expect(c).toBeDefined();
    expect(c?.granted).toBe(false);
    expect(c?.text).toBe(CONSENT_TEXT);
  });

  /** The decline label has to read as a genuine, unpunished choice. If it ever becomes a
   * discouraging sentence, the yes beside it stops being freely given. */
  it("the decline option is plain and carries no penalty language", () => {
    expect(CONSENT_DECLINE_LABEL.length).toBeLessThanOrEqual(60);
    expect(CONSENT_DECLINE_LABEL.toLowerCase()).not.toMatch(/unable|cannot help|won't be able|slower|delay/);
    expect(CONSENT_DECLINE_LABEL).not.toMatch(/[—–]/);
  });
});
