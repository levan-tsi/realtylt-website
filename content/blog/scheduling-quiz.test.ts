import { describe, expect, it } from "vitest";
import { SCHEDULING_QUIZ } from "./scheduling-quiz";
import { AI_SCHEDULING_POST } from "./ai-posts";

/** The reviews quiz is teaching copy: every answer is something the post says. The voice quiz's
 * checks (round 24), plus the rule this post exists to teach: only a reply confirms. */
describe("AI scheduling quiz", () => {
  it("has exactly ten questions", () => {
    expect(SCHEDULING_QUIZ).toHaveLength(10);
  });

  it.each(SCHEDULING_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = SCHEDULING_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/[–—]/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(SCHEDULING_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = SCHEDULING_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[.$,]/g, "\\$&")}(?![\\d])`).test(AI_SCHEDULING_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...AI_SCHEDULING_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of SCHEDULING_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("never teaches that silence or a delivered message confirms", () => {
    const right = SCHEDULING_QUIZ.map((i) => i.choices[i.answer]).join(" | ");
    expect(right).not.toMatch(/no objection|person is coming|person accepted/i);
    expect(AI_SCHEDULING_POST).toMatch(/Only a reply from that person moves it/);
  });
});
