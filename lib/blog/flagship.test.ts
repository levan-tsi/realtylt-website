import { describe, expect, it } from "vitest";
import { AI_CHAT_FLAGSHIP } from "@/content/blog/ai-chat-scenes";
import { AI_CHAT_ASSISTANT_POST } from "@/content/blog/ai-posts";
import { flagshipToc } from "./flagship";
import { parseOutline } from "./markdown";
import { parseHeadings } from "./toc";

const outline = parseOutline(AI_CHAT_ASSISTANT_POST);

describe("parseOutline", () => {
  it("interleaves scenes and headings in document order", () => {
    const kinds = new Set(outline.map((e) => e.kind));
    expect(kinds).toEqual(new Set(["scene", "heading"]));
    // The reel is placed before the first prose heading in the body.
    const firstScene = outline.findIndex((e) => e.kind === "scene");
    const firstHeading = outline.findIndex((e) => e.kind === "heading");
    expect(firstScene).toBeLessThan(firstHeading);
  });

  it("gives every heading the same id the page renders", () => {
    const fromOutline = outline.filter((e) => e.kind === "heading").map((e) => e.id);
    const fromHeadings = parseHeadings(AI_CHAT_ASSISTANT_POST)
      .filter((h) => h.level <= 2)
      .map((h) => h.id);
    expect(fromOutline).toEqual(fromHeadings);
  });
});

describe("flagshipToc", () => {
  /** The rail this reproduces was hand-curated until the template landed. Freezing the exact
   * list here is what proves deriving it changed nothing, and it stays as the guard: a scene
   * that loses its label, or a heading that is renamed, shows up here rather than as a rail
   * row that jumps nowhere. */
  it("derives exactly the rail the flagship shipped with", () => {
    expect(flagshipToc(outline, AI_CHAT_FLAGSHIP)).toEqual([
      { id: "scene-reel", label: "Watch it", scene: true },
      { id: "the-number-everyone-quotes-and-what-it-really-means", label: "The number" },
      { id: "scene-response-gap", label: "The gap", scene: true },
      { id: "scene-leads-calculator", label: "Your numbers", scene: true },
      { id: "what-an-ai-chat-assistant-actually-does", label: "What it does" },
      { id: "scene-four-moves", label: "Four moves", scene: true },
      { id: "what-it-does-not-do-and-should-not-pretend-to", label: "What it will not do" },
      { id: "scene-teardown", label: "The teardown", scene: true },
      { id: "common-questions-answered-honestly", label: "Common questions" },
      { id: "where-it-goes-wrong", label: "Where it goes wrong" },
      { id: "scene-system-diagram", label: "What it connects to", scene: true },
      { id: "what-to-do-about-it", label: "What to do" },
    ]);
  });

  it("skips scenes that declare no label, because not every scene is a destination", () => {
    const rows = flagshipToc(outline, AI_CHAT_FLAGSHIP);
    for (const key of ["pull-quote", "funnel", "in-short", "response-curve", "failure-modes"]) {
      expect(rows.some((r) => r.id === `scene-${key}`)).toBe(false);
    }
  });

  it("falls back to the heading's own text when no short label is given", () => {
    expect(AI_CHAT_FLAGSHIP.headingLabels).not.toHaveProperty("where-it-goes-wrong");
    expect(flagshipToc(outline, AI_CHAT_FLAGSHIP)).toContainEqual({
      id: "where-it-goes-wrong",
      label: "Where it goes wrong",
    });
  });

  it("emits nothing but headings when a post has no scene content", () => {
    const rows = flagshipToc(outline, undefined);
    expect(rows.every((r) => !r.scene)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
  });
});

/** These are the checks a NEW topic has to pass. They are about the wiring, not about this
 * post: every marker resolves, every payload is used, and no short label points at a heading
 * that no longer exists. */
describe("the topic content contract", () => {
  const markers = outline.filter((e) => e.kind === "scene").map((e) => e.key);

  it("has a payload for every [[scene:key]] the body places", () => {
    const missing = markers.filter((k) => !AI_CHAT_FLAGSHIP.scenes[k]);
    expect(missing).toEqual([]);
  });

  it("has no payload the body never places", () => {
    const orphans = Object.keys(AI_CHAT_FLAGSHIP.scenes).filter((k) => !markers.includes(k));
    expect(orphans).toEqual([]);
  });

  it("has no short label pointing at a heading that is not in the body", () => {
    const ids = new Set(parseHeadings(AI_CHAT_ASSISTANT_POST).map((h) => h.id));
    const stale = Object.keys(AI_CHAT_FLAGSHIP.headingLabels ?? {}).filter((id) => !ids.has(id));
    expect(stale).toEqual([]);
  });

  it("gives every scene a band, so the floating rail can always flip its contrast", () => {
    for (const [key, scene] of Object.entries(AI_CHAT_FLAGSHIP.scenes)) {
      expect(["dark", "light"], `scene ${key}`).toContain(scene.band);
    }
  });
});
