import { describe, expect, it } from "vitest";
import { POSTS } from "./posts";

/**
 * Round 66 (the owner's standing rule since round 63, and his 2026-10-04 "the titles"). A post's
 * `title` is its H1, its index and related-post card, its share card, its JSON-LD headline and its
 * label on /sitemap and llms.txt, all read from this one field, so the case is checked here once.
 *
 * Sentence case: a capital where a sentence starts, on the pronoun I, and on the names and
 * acronyms listed below; everything else lowercase, after a colon too. The <title> tag
 * (`seoTitle`) is not a heading and keeps its own case (round 63, app/sentence-case.test.ts).
 * A new name goes on the list on purpose, when a title needs it.
 */
const PHRASES = ["Hudson Valley", "New York"];
const WORDS = new Set(["I", "NY", "March", "July", "October", "AI", "CRM", "ROI", "BRRRR", "FSBO", "FHA", "VA"]);

/** The words in `title` that break sentence case; empty when it is in sentence case. */
function offenders(title: string): string[] {
  let text = title;
  // A listed phrase stands in as one neutral word, so "Hudson Valley's" never reads as two names.
  for (const p of PHRASES) text = text.split(p).join("§");
  const tokens = text.split(/\s+/).filter(Boolean);
  const bad: string[] = [];
  tokens.forEach((token, i) => {
    const prev = tokens[i - 1];
    const sentenceStart = i === 0 || (/[.?!]["')\]]*$/.test(prev) && !/^vs\.$/i.test(prev));
    const core = token.replace(/^["'([]+/, "").replace(/["')\],:;.?!]+$/, "").replace(/'s$/, "");
    if (!core || !/^[A-Za-z]/.test(core)) return; // a number, a price, a listed phrase
    core.split("-").forEach((part, j) => {
      if (!part) return;
      const capital = /^[A-Z]/.test(part);
      if (j === 0 && sentenceStart && !capital) bad.push(`${part} (starts a sentence)`);
      else if (capital && !WORDS.has(part) && !(j === 0 && sentenceStart)) bad.push(part);
    });
  });
  return bad;
}

describe("blog post titles are in sentence case", () => {
  it("finds the posts at all (the check must not silently match nothing)", () => {
    expect(POSTS.length).toBeGreaterThanOrEqual(57);
  });

  it("writes every post title in sentence case, names and acronyms kept", () => {
    const wrong = Object.fromEntries(
      POSTS.map((p) => [p.slug, offenders(p.title)] as const).filter(([, words]) => words.length > 0),
    );
    expect(wrong).toEqual({});
  });

  it("fails a Title Case title, and passes the shapes the titles really take", () => {
    expect(offenders("9 High-ROI Home Improvements You Can Tackle for Under $1,000")).toEqual([
      "High", "Home", "Improvements", "You", "Can", "Tackle", "Under",
    ]);
    expect(offenders("Packing 101: Pro Tips")).toEqual(["Pro", "Tips"]);
    expect(offenders("the answer was wrong.")).toEqual(["the (starts a sentence)"]);
    // Two sentences, a quoted question, an abbreviation, a possessive name, a time.
    expect(offenders('"How much house can I afford?" A simple guide to calculating your real budget')).toEqual([]);
    expect(offenders("Short-term vs. long-term rentals in the Hudson Valley: what's more profitable?")).toEqual([]);
    expect(offenders("How to make a winning offer in the NY Hudson Valley's competitive market")).toEqual([]);
    expect(offenders("Your website answered that buyer at 11:40pm. Did you?")).toEqual([]);
  });
});
