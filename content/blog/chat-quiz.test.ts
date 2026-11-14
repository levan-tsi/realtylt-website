import { describe, expect, it } from "vitest";
import { CHAT_QUIZ } from "./chat-quiz";
import { AI_CHAT_ASSISTANT_POST } from "./ai-posts";

/** The chat quiz is teaching copy: every answer is something the post says. The reviews quiz's
 * checks (round 28), plus the rule this post exists to teach: the right answer never guesses. */
describe("AI chat assistant quiz", () => {
  it("has exactly ten questions", () => {
    expect(CHAT_QUIZ).toHaveLength(10);
  });

  it.each(CHAT_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = CHAT_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/[–—]/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(CHAT_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = CHAT_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[.$,]/g, "\\$&")}(?![\\d])`).test(AI_CHAT_ASSISTANT_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...AI_CHAT_ASSISTANT_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of CHAT_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("never teaches guessing: the right answer to the unknown question offers a person", () => {
    const unknown = CHAT_QUIZ.find((i) => /cannot know/.test(i.q));
    expect(unknown).toBeDefined();
    expect(unknown!.choices[unknown!.answer]).toMatch(/offer a person/i);
    expect(AI_CHAT_ASSISTANT_POST).toMatch(/says it does not know and offers a person instead/);
  });
});
