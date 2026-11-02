import { describe, expect, it } from "vitest";
import { RENOVATIONS_QUIZ } from "./renovations-quiz";
import { RENOVATIONS_POST } from "./renovations-post";
import { RENOVATIONS_FLAGSHIP } from "./renovations-scenes";

/** The renovations quiz is teaching copy: every answer has to be something the post itself says,
 * so a reader who misses a question can find the line again. The same checks as
 * seller-disclosure-quiz.test.ts: the shape, and every number in an explanation appears in the
 * post as a number of its own, and every section an explanation names is a heading of the post. */
describe("renovations quiz", () => {
  it("has exactly ten questions", () => {
    expect(RENOVATIONS_QUIZ).toHaveLength(10);
  });

  it.each(RENOVATIONS_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = RENOVATIONS_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/—/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(RENOVATIONS_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = RENOVATIONS_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*\d|\d/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[$,.]/g, "\\$&")}(?![\\d])`).test(RENOVATIONS_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...RENOVATIONS_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of RENOVATIONS_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });
});

/** The report's re-use guidelines (September 18, 2025) cap ALL excerpts by one publisher at data
 * from five projects; the basement post already quotes one, so this page quotes four. These two
 * checks hold the cap: no other project of the report is named with data, and no percentage
 * appears on the page or in its quiz beyond the ones the four projects (and the post's own
 * break-even and invented example) account for. */
describe("renovations page stays inside the report's excerpt cap", () => {
  const ALLOWED_PERCENTS = new Set(["336.6", "323.4", "203.6", "219.8", "195.2", "200.7", "192.8", "107.2", "103.1", "100", "80"]);
  const QUIZ_TEXT = RENOVATIONS_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
  // Every scene but the quiz (its distractor percentages are checked through the whys only).
  const SCENE_TEXT = JSON.stringify(
    Object.entries(RENOVATIONS_FLAGSHIP.scenes).filter(([key]) => key !== "quiz"),
  );

  it("prints no percentage the four projects do not account for (quiz distractors excepted)", () => {
    const found = [...RENOVATIONS_POST.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => m[1]);
    expect(found.filter((p) => !ALLOWED_PERCENTS.has(p))).toEqual([]);
    const whys = RENOVATIONS_QUIZ.map((i) => i.why).join("\n");
    expect([...whys.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => m[1]).filter((p) => !ALLOWED_PERCENTS.has(p))).toEqual([]);
    expect([...SCENE_TEXT.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => m[1]).filter((p) => !ALLOWED_PERCENTS.has(p))).toEqual([]);
  });

  it("names none of the report's other projects", () => {
    const OTHERS = [/siding replacement/i, /deck addition/i, /backup power/i, /grand entrance/i, /bath remodel/i,
      /hvac conversion/i, /window replacement/i, /basement remodel/i, /roofing replacement/i, /bathroom addition/i,
      /major kitchen remodel/i, /backyard patio/i, /accessory dwelling/i, /primary suite addition/i, /solar power/i];
    for (const re of OTHERS) {
      expect(RENOVATIONS_POST, String(re)).not.toMatch(re);
      expect(QUIZ_TEXT, String(re)).not.toMatch(re);
      expect(SCENE_TEXT, String(re)).not.toMatch(re);
    }
  });
});
