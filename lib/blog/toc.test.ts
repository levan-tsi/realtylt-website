import { describe, expect, it } from "vitest";
import { extractFaqs, extractToc, parseHeadings, readingTime, slugify, stripInline } from "./toc";
import { AI_CHAT_ASSISTANT_POST, WORKFLOW_AUTOMATION_POST } from "@/content/blog/ai-posts";

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

  it("finds the six sections in each real article", () => {
    // The AI post was raised to the flagship standard on 2026-08-02 and gained four sections
    // (what makes an answer true, the fine print, what it costs, how to test one) and four more
    // questions: 10 top-level sections + 7 questions. Assert the SECTION count directly rather
    // than relaxing the number, so a heading going missing still fails this test.
    expect(extractToc(AI_CHAT_ASSISTANT_POST).filter((t) => t.depth <= 2)).toHaveLength(10);
    expect(extractToc(AI_CHAT_ASSISTANT_POST).filter((t) => t.depth === 3)).toHaveLength(7);
    expect(extractToc(AI_CHAT_ASSISTANT_POST)).toHaveLength(17);
    // The workflow post was rebuilt as a flagship on 2026-08-01 and gained a "Common questions"
    // section: 9 top-level sections plus 6 questions. On 2026-08-25 it gained a tenth, "The
    // first month, and the two things to do in it", when the standard ratcheted to 19 sections
    // and the honest way to close that was to write one. Same shape of assertion as above, so a
    // heading going missing still fails rather than being absorbed by a looser number.
    expect(extractToc(WORKFLOW_AUTOMATION_POST).filter((t) => t.depth <= 2)).toHaveLength(10);
    expect(extractToc(WORKFLOW_AUTOMATION_POST).filter((t) => t.depth === 3)).toHaveLength(6);
    expect(extractToc(WORKFLOW_AUTOMATION_POST)).toHaveLength(16);
    // ids are unique and non-empty
    for (const post of [AI_CHAT_ASSISTANT_POST, WORKFLOW_AUTOMATION_POST]) {
      const ids = extractToc(post).map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.every(Boolean)).toBe(true);
    }
  });
});

describe("readingTime", () => {
  it("is a floor of one minute and scales with length", () => {
    expect(readingTime("one two three")).toBe(1);
    expect(readingTime(AI_CHAT_ASSISTANT_POST)).toBeGreaterThanOrEqual(3);
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

  it("pairs the AI post's real questions with their answers (drives FAQPage JSON-LD)", () => {
    // Reshaped again on 2026-08-02. The first three entries were all OBJECTIONS, which is what
    // we are defensive about rather than what anybody types into a search box, and the
    // definitional question ("what IS this, in plain terms") was missing entirely even though it
    // is the entry an AI answer lifts. It now leads. Assert the real questions, so a rewrite
    // that quietly drops the definitional one fails here.
    const faqs = extractFaqs(AI_CHAT_ASSISTANT_POST);
    expect(faqs.map((f) => f.q)).toEqual([
      "What is an AI chat assistant for a real estate website, in plain terms?",
      "How is it different from the chatbot I already have?",
      "Will it annoy my visitors?",
      "My leads want a human, not a bot",
      "Does it work on the MLS, or only on what my website already says?",
      "Do I have to tell people it is an AI?",
      "What happens when it gets something wrong?",
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
