import { describe, expect, it } from "vitest";
import { getServices } from "./index";
import { serviceHeadings } from "./headings";

describe("serviceHeadings (search rules pass, round 30)", () => {
  it("every service has a noun phrase that reads in a sentence", () => {
    for (const s of getServices()) {
      expect(s.noun.trim().length, s.slug).toBeGreaterThan(3);
      expect(s.noun, s.slug).not.toMatch(/\s{2,}|[.?!]$/);
    }
  });

  it("every heading of every service is a question, 70 characters or fewer, naming the service", () => {
    for (const s of getServices()) {
      for (const [key, hd] of Object.entries(serviceHeadings(s))) {
        expect(hd.text, `${s.slug} ${key}`).toMatch(/\?$/);
        expect(hd.text.length, `${s.slug} ${key}: ${hd.text}`).toBeLessThanOrEqual(70);
        expect(hd.text[0], `${s.slug} ${key}`).toMatch(/[A-Z]/);
      }
      expect(serviceHeadings(s).howItWorks.text, s.slug).toContain(s.noun);
    }
  });

  it("the lead, strong and tail parts join to the text", () => {
    const hd = serviceHeadings({ noun: "an AI receptionist" });
    expect(hd.howItWorks.text).toBe("How does an AI receptionist work, step by step?");
    expect(hd.faq.text).toBe("What questions do owners ask about an AI receptionist?");
  });
});
