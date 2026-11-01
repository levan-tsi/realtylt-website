import { describe, expect, it } from "vitest";
import { TIMELINE_QUIZ } from "./timeline-quiz";
import { SELLING_TIMELINE_POST } from "./seller-posts";

/** The selling timeline quiz is teaching copy: every answer has to be something the post itself
 * says, so a reader who misses a question can find the line again. The same checks as
 * seller-disclosure-quiz.test.ts: the shape, every number in an explanation appears in the post as
 * a number of its own, and every section an explanation names is a heading of the post. */
describe("selling timeline quiz", () => {
  it("has exactly ten questions", () => {
    expect(TIMELINE_QUIZ).toHaveLength(10);
  });

  it.each(TIMELINE_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = TIMELINE_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/—/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(TIMELINE_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = TIMELINE_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*\d|\d/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[$,.]/g, "\\$&")}(?![\\d])`).test(SELLING_TIMELINE_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...SELLING_TIMELINE_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of TIMELINE_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });
});
