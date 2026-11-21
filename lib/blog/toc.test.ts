import { describe, expect, it } from "vitest";
import { extractFaqs, extractToc, parseHeadings, readingTime, slugify, stripInline } from "./toc";
import { SELLER_DISCLOSURE_POST } from "@/content/blog/seller-posts";
import { FIRST_TIME_BUYER_CHECKLIST_POST } from "@/content/blog/real-estate-posts";

describe("slugify / stripInline", () => {
  it("lowercases, drops punctuation, hyphenates whitespace", () => {
    expect(slugify("The number everyone quotes, and what it really means")).toBe(
      "the-number-everyone-quotes-and-what-it-really-means",
    );
  });

  it("strips inline markdown before slugging", () => {
    expect(slugify("What **automation** actually is")).toBe("what-automation-actually-is");
    expect(stripInline("A [link](/x) and `code` and *em*")).toBe("A link and code and em");
  });

  it("never returns an empty slug", () => {
    expect(slugify("!!!")).toBe("section");
    expect(slugify("")).toBe("section");
  });
});

describe("parseHeadings", () => {
  it("captures level and order and de-duplicates ids", () => {
    const md = ["# One", "text", "## Two", "## Two", "### Deep"].join("\n");
    const h = parseHeadings(md);
    expect(h.map((x) => [x.level, x.id])).toEqual([
      [1, "one"],
      [2, "two"],
      [2, "two-2"],
      [3, "deep"],
    ]);
  });

  it("ignores non-heading '#' lines (no space after hashes)", () => {
    expect(parseHeadings("#nope\n\nbody")).toHaveLength(0);
  });
});

describe("extractToc", () => {
  it("maps h1/h2 to depth 2, h3 to depth 3, and drops h4+", () => {
    const md = ["# A", "## B", "### C", "#### D"].join("\n");
    expect(extractToc(md)).toEqual([
      { id: "a", text: "A", depth: 2 },
      { id: "b", text: "B", depth: 2 },
      { id: "c", text: "C", depth: 3 },
    ]);
  });

  it("finds the sections and questions in each real article", () => {
    // The two long staying guides (since 2026-11-20 the AI posts this used to count live on their
    // own site). Assert the SECTION count directly rather than a loose floor, so a heading going
    // missing fails this test.
    expect(extractToc(SELLER_DISCLOSURE_POST).filter((t) => t.depth <= 2)).toHaveLength(11);
    expect(extractToc(SELLER_DISCLOSURE_POST).filter((t) => t.depth === 3)).toHaveLength(10);
    expect(extractToc(SELLER_DISCLOSURE_POST)).toHaveLength(21);
    expect(extractToc(FIRST_TIME_BUYER_CHECKLIST_POST).filter((t) => t.depth <= 2)).toHaveLength(14);
    expect(extractToc(FIRST_TIME_BUYER_CHECKLIST_POST).filter((t) => t.depth === 3)).toHaveLength(11);
    expect(extractToc(FIRST_TIME_BUYER_CHECKLIST_POST)).toHaveLength(25);
    // ids are unique and non-empty
    for (const post of [SELLER_DISCLOSURE_POST, FIRST_TIME_BUYER_CHECKLIST_POST]) {
      const ids = extractToc(post).map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every(Boolean)).toBe(true);
    }
  });
});

describe("readingTime", () => {
  it("is a floor of one minute and scales with length", () => {
    expect(readingTime("one two three")).toBe(1);
    expect(readingTime(SELLER_DISCLOSURE_POST)).toBeGreaterThanOrEqual(3);
  });
});

describe("extractFaqs", () => {
  it("never fabricates: a post with no FAQ section still yields []", () => {
    // A FIXTURE, not a real post. This used to point at the workflow article, which was the one
    // long body on the site with no Q&A section in it. That article became a flagship and grew
    // one, and a negative control that depends on a piece of content never gaining a feature is
    // a control that expires. Question-shaped headings are included deliberately: the section
    // heading is what turns FAQ extraction on, and this proves it.
    const noFaqSection = [
      "# A post with questions in it but no question section",
      "",
      "## What it actually looks like",
      "",
      "Some body copy that is long enough to be a real answer if anything were pairing it.",
      "",
      "### Is this a question?",
      "",
      "It is shaped like one, and it is not inside a section that says so.",
    ].join("\n");
    expect(extractFaqs(noFaqSection)).toEqual([]);
  });

  it("pairs a real post's questions with their answers (drives FAQPage JSON-LD)", () => {
    // The seller disclosure guide's questions, in order. Assert the real questions, so a rewrite
    // that quietly drops one fails here. (Until 2026-11-20 this held the AI chat post's thirteen;
    // that post moved to its own site.)
    const faqs = extractFaqs(SELLER_DISCLOSURE_POST);
    expect(faqs.map((f) => f.q)).toEqual([
      "Is the property condition disclosure statement required in New York?",
      "Which version of the form should a seller use?",
      "Do I have to disclose a death in a house in New York?",
      "Do condo and co-op sellers have to fill out the PCDS?",
      "Is New York a buyer beware state?",
    ]);
    expect(faqs.every((f) => f.a.length > 40)).toBe(true);
  });

  it("parses ### questions inside a Frequently-asked section", () => {
    const md = [
      "## Intro",
      "words",
      "## Frequently asked questions",
      "### Does it cost extra?",
      "No. It is included.",
      "### Can I cancel?",
      "Yes, any time.",
      "## After",
      "### Not a question",
      "this is outside the faq section",
    ].join("\n");
    expect(extractFaqs(md)).toEqual([
      { q: "Does it cost extra?", a: "No. It is included." },
      { q: "Can I cancel?", a: "Yes, any time." },
    ]);
  });
});
