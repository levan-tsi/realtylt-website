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

/** The inner list: everything after the list opens, where each answer has its own <details>. */
const inner = html.slice(html.indexOf("data-quiz-list"));

describe("the quiz without JavaScript", () => {
  it("renders the list version, not the live run", () => {
    expect(html).toContain("data-quiz-list");
    expect(html).not.toContain("data-quiz-live");
    expect(html).not.toContain("data-quiz-result");
  });

  it("is closed: one outer <details> named Take the quiz holds the whole list", () => {
    expect(html).toMatch(/<details[^>]*data-quiz-invite[^>]*>\s*<summary[^>]*>Take the quiz<\/summary>/);
    expect(html).not.toMatch(/<details[^>]*\sopen/);
    expect(html.match(/Take the quiz/g)?.length).toBe(1);
    // the list sits inside the outer details: it opens after the summary and the last </details> closes the outer one
    expect(html.indexOf("data-quiz-list")).toBeGreaterThan(html.indexOf("</summary>"));
    expect(html.lastIndexOf("</details>")).toBeGreaterThan(html.lastIndexOf("</ol>"));
    expect(html.match(/<details/g)?.length).toBe(scene.questions.length + 1);
    expect(html.match(/<\/details>/g)?.length).toBe(scene.questions.length + 1);
  });

  it("says what the quiz is before it opens, and the button exists only with a script", () => {
    expect(text).toContain("questions on what this page taught. It takes about two minutes.");
    expect(html).not.toContain("data-quiz-start");
    expect(html).not.toContain("<button");
    expect(html).toMatch(/<summary[^>]*min-h-12/);
  });

  it("prints every question and every choice", () => {
    for (const q of scene.questions) {
      expect(text).toContain(q.q);
      for (const c of q.choices) expect(text).toContain(c);
    }
  });

  it("folds each answer and its why inside its own <details>, inside the outer one", () => {
    const details = inner.match(/<details[\s\S]*?<\/details>/g) ?? [];
    expect(details.length).toBe(scene.questions.length);
    scene.questions.forEach((q, i) => {
      const inside = details[i].replace(/<[^>]+>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, " ");
      expect(inside).toContain(q.choices[q.answer]);
      expect(inside).toContain(q.why);
    });
  });

  it("names the section for a screen reader and gives every summary a 44px target", () => {
    expect(html).toContain(`aria-label="${scene.ariaLabel}"`);
    expect(inner).toMatch(/<summary[^>]*min-h-11/);
    expect((inner.match(/<summary[^>]*min-h-11/g) ?? []).length).toBe(scene.questions.length);
  });
});
