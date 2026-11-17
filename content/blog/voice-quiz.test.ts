import { describe, expect, it } from "vitest";
import { VOICE_QUIZ } from "./voice-quiz";
import { AI_VOICE_AGENTS_POST } from "./ai-posts";

/** The voice quiz is teaching copy: every answer is something the post says. The same checks as
 * the seller quiz, plus the second reader's corrections held by test. */
describe("AI voice agent quiz", () => {
  it("has exactly ten questions", () => {
    expect(VOICE_QUIZ).toHaveLength(10);
  });

  it.each(VOICE_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = VOICE_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/—/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(VOICE_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = VOICE_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,]*/g) ?? [])
        .map((n) => n.replace(/,$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[$,]/g, "\\$&")}(?![\\d])`).test(AI_VOICE_AGENTS_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...AI_VOICE_AGENTS_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of VOICE_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("teaches no unconditional recording permission and no 'form is permission' shortcut", () => {
    const right = VOICE_QUIZ.map((i) => i.choices[i.answer]).join("\n");
    expect(right).not.toMatch(/you may record your own calls without asking/i);
    expect(right).not.toMatch(/a form is permission/i);
    expect(right).not.toMatch(/no name, no useful number and no record/i);
  });

  it("keeps the post free of the vendor name and the unconditional New York sentence", () => {
    expect(AI_VOICE_AGENTS_POST).not.toMatch(/\bVapi\b/);
    expect(AI_VOICE_AGENTS_POST).not.toMatch(/so in New York you may record your own calls without asking the other side/);
  });
});
