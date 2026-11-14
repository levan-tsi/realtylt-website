import { describe, expect, it } from "vitest";
import { REACTIVATION_QUIZ } from "./reactivation-quiz";
import { DATABASE_REACTIVATION_POST } from "./ai-posts";

/** The reactivation quiz is teaching copy: every answer is something the post says. The reviews
 * quiz's checks (round 28), plus the rule this post exists to teach: no right answer says a
 * list may be contacted on a hunch. */
describe("Database reactivation quiz", () => {
  it("has exactly ten questions", () => {
    expect(REACTIVATION_QUIZ).toHaveLength(10);
  });

  it.each(REACTIVATION_QUIZ.map((item, i) => [i + 1, item] as const))(
    "question %i has four distinct choices and an answer in range",
    (_n, item) => {
      expect(item.choices).toHaveLength(4);
      expect(new Set(item.choices.map((c) => c.trim().toLowerCase())).size).toBe(4);
      expect([0, 1, 2, 3]).toContain(item.answer);
      expect(item.q.trim().length).toBeGreaterThan(0);
      expect(item.why.trim().length).toBeGreaterThan(0);
    },
  );

  it("carries no em or en dash anywhere", () => {
    const all = REACTIVATION_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/[–—]/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(REACTIVATION_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = REACTIVATION_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[.$,]/g, "\\$&")}(?![\\d])`).test(DATABASE_REACTIVATION_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...DATABASE_REACTIVATION_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of REACTIVATION_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("never teaches that a list may be contacted on a hunch", () => {
    const right = REACTIVATION_QUIZ.map((i) => i.choices[i.answer]).join(" ");
    expect(right).not.toMatch(/on your list|whole list|everyone at night/i);
    expect(DATABASE_REACTIVATION_POST).toMatch(/prior express written consent/i);
  });
});
