import { describe, expect, it } from "vitest";
import { WORKFLOW_QUIZ } from "./workflow-quiz";
import { WORKFLOW_AUTOMATION_POST } from "./ai-posts";

/** The workflow quiz is teaching copy: every answer has to be something the post itself says, so
 * a reader who misses a question can find the line again. The same checks as the seller quiz:
 * the shape, and the fact rules a test can hold (every number in a `why` is in the post, every
 * `why` names a real heading). */
describe("workflow automation quiz", () => {
  it("has exactly ten questions", () => {
    expect(WORKFLOW_QUIZ).toHaveLength(10);
  });

  it.each(WORKFLOW_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = WORKFLOW_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/—/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(WORKFLOW_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = WORKFLOW_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,]*/g) ?? [])
        .map((n) => n.replace(/,$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[$,]/g, "\\$&")}(?![\\d])`).test(WORKFLOW_AUTOMATION_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...WORKFLOW_AUTOMATION_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of WORKFLOW_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("keeps the second reader's two corrections in the quiz itself", () => {
    // Question 2: elapsed time before resumption, never "time lost".
    expect(WORKFLOW_QUIZ[1].choices[WORKFLOW_QUIZ[1].answer]).toMatch(/passed before interrupted work was resumed/);
    // Question 4: a customer-facing job has a risk floor of 3.
    expect(WORKFLOW_QUIZ[3].choices[WORKFLOW_QUIZ[3].answer]).toBe("3");
  });
});
