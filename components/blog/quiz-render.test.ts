import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Quiz } from "./scenes/primitives/Quiz";
import { AUDIT_FLAGSHIP } from "@/content/blog/audit-scenes";

/** WITH JAVASCRIPT OFF the server markup is all a reader gets, so it must be the whole quiz:
 * every question, every choice, and every answer with its why inside a <details>. The live,
 * one-at-a-time run only replaces it after mount. This renders exactly what the server sends. */
const scene = AUDIT_FLAGSHIP.scenes.quiz;
if (scene?.kind !== "quiz") throw new Error("the AI post must place a quiz scene");

const html = renderToStaticMarkup(createElement(Quiz, scene));
const text = html.replace(/<[^>]+>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");

describe("the quiz without JavaScript", () => {
  it("renders the list version, not the live run", () => {
    expect(html).toContain("data-quiz-list");
    expect(html).not.toContain("data-quiz-live");
    expect(html).not.toContain("data-quiz-result");
  });

  it("prints every question and every choice", () => {
    for (const q of scene.questions) {
      expect(text).toContain(q.q);
      for (const c of q.choices) expect(text).toContain(c);
    }
  });

  it("folds each answer and its why inside a <details>", () => {
    const details = html.match(/<details[\s\S]*?<\/details>/g) ?? [];
    expect(details.length).toBe(scene.questions.length);
    scene.questions.forEach((q, i) => {
      const inside = details[i].replace(/<[^>]+>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ");
      expect(inside).toContain(q.choices[q.answer]);
      expect(inside).toContain(q.why);
    });
  });

  it("names the section for a screen reader and gives the summary a 44px target", () => {
    expect(html).toContain(`aria-label="${scene.ariaLabel}"`);
    expect(html).toMatch(/<summary[^>]*min-h-11/);
  });
});
