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
    expect(extractToc(AI_CHAT_ASSISTANT_POST)).toHaveLength(6);
    expect(extractToc(WORKFLOW_AUTOMATION_POST)).toHaveLength(6);
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
  it("returns [] for the real posts (no FAQ section — never fabricated)", () => {
    expect(extractFaqs(AI_CHAT_ASSISTANT_POST)).toEqual([]);
    expect(extractFaqs(WORKFLOW_AUTOMATION_POST)).toEqual([]);
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
