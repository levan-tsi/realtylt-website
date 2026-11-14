import { describe, expect, it } from "vitest";
import { BOOKING_QUIZ } from "./booking-quiz";
import { AI_APPOINTMENT_BOOKING_POST } from "./ai-posts";

/** The booking quiz is teaching copy: every answer is something the post says. The reviews quiz's
 * checks (round 28), plus the rule this post is built on: the study figures are quoted as they
 * stand, and the carry-over answer is the direction, never the percentages. */
describe("AI appointment booking quiz", () => {
  it("has exactly ten questions", () => {
    expect(BOOKING_QUIZ).toHaveLength(10);
  });

  it.each(BOOKING_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = BOOKING_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/[–—]/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(BOOKING_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = BOOKING_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[.$,]/g, "\\$&")}(?![\\d])`).test(AI_APPOINTMENT_BOOKING_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...AI_APPOINTMENT_BOOKING_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of BOOKING_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("keeps the carry-over answer as the direction, not the percentages", () => {
    const q = BOOKING_QUIZ.find((i) => /carries over/.test(i.q));
    expect(q).toBeDefined();
    expect(q!.choices[q!.answer]).toMatch(/direction/i);
    expect(AI_APPOINTMENT_BOOKING_POST).toMatch(/not a benchmark for anything you do/);
  });
});
