import { describe, expect, it } from "vitest";
import { WALKTHROUGH_QUIZ } from "./walkthrough-quiz";
import { FINAL_WALK_THROUGH_POST } from "./real-estate-posts";

/** The walk-through quiz is teaching copy: every answer is something the post says. The same
 * checks as the seller quiz, plus the second reader's two corrections held by test: no quiz
 * question asks for a typical duration (none could be sourced), and no answer promises an outcome. */
describe("final walk-through quiz", () => {
  it("has exactly ten questions", () => {
    expect(WALKTHROUGH_QUIZ).toHaveLength(10);
  });

  it.each(WALKTHROUGH_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = WALKTHROUGH_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/—/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(WALKTHROUGH_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = WALKTHROUGH_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,]*/g) ?? [])
        .map((n) => n.replace(/,$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[$,]/g, "\\$&")}(?![\\d])`).test(FINAL_WALK_THROUGH_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...FINAL_WALK_THROUGH_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of WALKTHROUGH_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1].replace(/\.$/, ""));
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("asks for no typical duration and promises no outcome", () => {
    const all = WALKTHROUGH_QUIZ.flatMap((i) => [i.q, ...i.choices]).join("\n");
    expect(all).not.toMatch(/\b(minutes?|half an hour|an hour)\b/i);
    expect(all).not.toMatch(/\b(most|usually|always) (problems|are settled|is settled)\b/i);
  });

  it("keeps no typical duration in the post either (the second reader's note 4)", () => {
    expect(FINAL_WALK_THROUGH_POST).not.toMatch(/30 minutes|half an hour for a small condo|an hour or more for a house/i);
  });
});
