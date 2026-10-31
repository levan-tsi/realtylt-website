import { describe, expect, it } from "vitest";
import { SELLER_DISCLOSURE_QUIZ } from "./seller-disclosure-quiz";
import { SELLER_DISCLOSURE_POST } from "./seller-posts";

/** The seller quiz is teaching copy: every answer has to be something the post itself says, so a
 * reader who misses a question can find the line again. These checks hold the shape (ten
 * questions, four distinct choices, a valid answer) and the one fact rule a test can hold: every
 * number in an explanation appears in the post as a number of its own. */
describe("seller disclosure quiz", () => {
  it("has exactly ten questions", () => {
    expect(SELLER_DISCLOSURE_QUIZ).toHaveLength(10);
  });

  it.each(SELLER_DISCLOSURE_QUIZ.map((item, i) => [i + 1, item] as const))(
    "question %i has four distinct choices and an answer in range",
    (_n, item) => {
      expect(item.choices).toHaveLength(4);
      expect(new Set(item.choices.map((c) => c.trim().toLowerCase())).size).toBe(4);
      expect([0, 1, 2, 3]).toContain(item.answer);
      expect(item.q.trim().length).toBeGreaterThan(0);
      expect(item.why.trim().length).toBeGreaterThan(0);
    },
  );

  it("carries no em dash anywhere", () => {
    const all = SELLER_DISCLOSURE_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/—/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(SELLER_DISCLOSURE_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = SELLER_DISCLOSURE_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,]*/g) ?? [])
        .map((n) => n.replace(/,$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[$,]/g, "\\$&")}(?![\\d])`).test(SELLER_DISCLOSURE_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set(
      [...SELLER_DISCLOSURE_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()),
    );
    for (const item of SELLER_DISCLOSURE_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });
});
