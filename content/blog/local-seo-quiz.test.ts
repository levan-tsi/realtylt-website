import { describe, expect, it } from "vitest";
import { LOCAL_SEO_QUIZ } from "./local-seo-quiz";
import { LOCAL_SEO_POST } from "./ai-posts";

/** The local SEO quiz is teaching copy: every answer is something the post says. The reviews
 * quiz's checks (round 28), plus the rule this post exists to teach: no right answer says a
 * position can be bought. */
describe("Google Maps quiz", () => {
  it("has exactly ten questions", () => {
    expect(LOCAL_SEO_QUIZ).toHaveLength(10);
  });

  it.each(LOCAL_SEO_QUIZ.map((item, i) => [i + 1, item] as const))(
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
    const all = LOCAL_SEO_QUIZ.flatMap((i) => [i.q, i.why, ...i.choices]).join("\n");
    expect(all).not.toMatch(/[–—]/);
  });

  it("does not put the right answer in the same slot every time", () => {
    expect(new Set(LOCAL_SEO_QUIZ.map((i) => i.answer)).size).toBeGreaterThanOrEqual(3);
  });

  it("takes every number in an explanation from the post", () => {
    const missing = LOCAL_SEO_QUIZ.flatMap((item) =>
      (item.why.match(/\d[\d,.]*/g) ?? [])
        .map((n) => n.replace(/[,.]$/, ""))
        .filter((n) => !new RegExp(`(?<![\\d])${n.replace(/[.$,]/g, "\\$&")}(?![\\d])`).test(LOCAL_SEO_POST))
        .map((n) => `${n} in: ${item.why}`),
    );
    expect(missing).toEqual([]);
  });

  it("names a section heading the post actually has in every explanation", () => {
    const headings = new Set([...LOCAL_SEO_POST.matchAll(/^#{2,3} (.+)$/gm)].map((m) => m[1].trim()));
    for (const item of LOCAL_SEO_QUIZ) {
      const named = [...item.why.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      expect(named.length, item.why).toBeGreaterThan(0);
      for (const h of named) expect(headings, `"${h}" is not a heading of the post`).toContain(h);
    }
  });

  it("never teaches that a position can be bought", () => {
    const right = LOCAL_SEO_QUIZ.map((i) => i.choices[i.answer]).join("\n");
    expect(right).not.toMatch(/guarantee|buy a|pay for a (better|higher)/i);
    expect(LOCAL_SEO_POST).toMatch(/no way to request or pay for a better local ranking/i);
  });
});
