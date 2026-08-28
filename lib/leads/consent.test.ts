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
  consentAnswered,
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
    "%s renders the consent box",
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

  /** THE QUESTION IS UNSKIPPABLE, AND LEAVING IT UNANSWERED MUST BE LOUD.
   *
   * Three decisions in a week (2026-08-22 two options; 08-23 one mandatory box; 08-28 "do as
   * its proper to do" = two options again, neither pre-selected, both submit). The reasoning
   * lives in components/leads/ConsentCheckbox.tsx and lib/leads/consent.ts and is not re-run here.
   *
   * WHAT THESE GUARD IS THE BUG HE ACTUALLY HIT. The first mandatory version used the browser's
   * native `required`, and on the footer form that produced no message, no scroll and no posted
   * lead: "when I filled it up nothing happened." Reproduced on production. So the rule is now
   * inverted from what you would expect — the input must NOT carry `required`, because the FORM
   * owns the check and renders a visible error. Putting `required` back would silently restore
   * the exact failure he reported.
   *
   * Comments are stripped before matching: the doc comment above the component explains the
   * history, and a naive substring match reads the explanation as the violation. */
  const consentSrc = () =>
    read("components/leads/ConsentCheckbox.tsx")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

  it("is two radios, a yes and a no, neither pre-selected", () => {
    const src = consentSrc();
    expect((src.match(/type="checkbox"/g) ?? []).length).toBe(0);
    expect((src.match(/type="radio"/g) ?? []).length).toBe(2);
    expect((src.match(/name="consentToContact"/g) ?? []).length).toBe(2);
    expect(src).toContain('value="true"');
    expect(src).toContain('value="false"');
    expect(src).not.toMatch(/\bdefaultChecked\b/);
    expect(src).not.toMatch(/\bchecked[=\s]/);
    // The decline option is the thing that makes the yes worth anything; both labels come
    // from the one wording file.
    expect(src).toContain("CONSENT_DECLINE_LABEL");
    expect(src).toContain("CONSENT_LABEL");
  });

  it("either answer is an answer; absence is not", () => {
    expect(consentAnswered("true")).toBe(true);
    expect(consentAnswered("false")).toBe(true);
    expect(consentAnswered(undefined)).toBe(false);
    expect(consentAnswered("")).toBe(false);
    expect(consentAnswered("on")).toBe(false);
    expect(consentAnswered(null)).toBe(false);
  });

  it("does NOT use the native required attribute, because that failure was silent", () => {
    expect(
      consentSrc(),
      "native `required` gave no message, no scroll and no lead on the footer form; the form must own this check",
    ).not.toMatch(/\brequired\b/);
  });

  it("the form refuses to submit without it, and says so where a person will see it", () => {
    const form = read("components/leads/LeadForm.tsx");
    expect(form).toContain("!consentAnswered(data.consentToContact)");
    // The refusal has to reach the same visible error channel every other failure uses.
    expect(form).toMatch(/setStatus\("error"\)/);
    expect(form).toMatch(/setError\(CONSENT_UNANSWERED_ERROR\)/);
    // ...and put the visitor next to the control that stopped them.
    expect(form).toContain("[data-consent-input]");
    expect(form).toMatch(/scrollIntoView/);
  });

  it("the box carries a hook the form can find it by", () => {
    expect(consentSrc()).toContain("data-consent-input");
  });

  it("an unticked box is still stored as an explicit refusal, not as an absence", () => {
    const c = lead({ phone: "917-555-0142" }).consent;
    expect(c).toBeDefined();
    expect(c?.granted).toBe(false);
    expect(c?.text).toBe(CONSENT_TEXT);
  });
});
