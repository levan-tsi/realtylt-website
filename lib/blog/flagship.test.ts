import { describe, expect, it } from "vitest";
import { AI_CHAT_FLAGSHIP } from "@/content/blog/ai-chat-scenes";
import { AI_VOICE_FLAGSHIP } from "@/content/blog/voice-agent-scenes";
import { AI_CHAT_ASSISTANT_POST, AI_VOICE_AGENTS_POST } from "@/content/blog/ai-posts";
import { flagshipToc, type FlagshipContent } from "./flagship";
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

/** These are the checks EVERY topic has to pass. They are about the wiring, not about any one
 * post: every marker resolves, every payload is used, and no short label points at a heading
 * that no longer exists.
 *
 * TABLE-DRIVEN ON PURPOSE. The handoff told the next agent to copy this block per topic, and
 * copying a guard nineteen times is how a guard rots: one copy gets a weaker assertion and
 * nobody notices. Adding a topic is a row here, so a new topic is covered by construction
 * rather than by whoever wrote it remembering to duplicate the file. */
const TOPICS: [string, string, FlagshipContent][] = [
  ["ai chat assistant", AI_CHAT_ASSISTANT_POST, AI_CHAT_FLAGSHIP],
  ["ai voice agents", AI_VOICE_AGENTS_POST, AI_VOICE_FLAGSHIP],
];

describe.each(TOPICS)("the topic content contract: %s", (_name, body, content) => {
  const topicOutline = parseOutline(body);
  const markers = topicOutline.filter((e) => e.kind === "scene").map((e) => e.key);

  it("has a payload for every [[scene:key]] the body places", () => {
    expect(markers.filter((k) => !content.scenes[k])).toEqual([]);
  });

  it("has no payload the body never places", () => {
    expect(Object.keys(content.scenes).filter((k) => !markers.includes(k))).toEqual([]);
  });

  it("has no short label pointing at a heading that is not in the body", () => {
    const ids = new Set(parseHeadings(body).map((h) => h.id));
    expect(Object.keys(content.headingLabels ?? {}).filter((id) => !ids.has(id))).toEqual([]);
  });

  it("gives every scene a band, so the floating rail can always flip its contrast", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      expect(["dark", "light"], `scene ${key}`).toContain(scene.band);
    }
  });

  it("places enough scenes to clear the readiness gate", () => {
    expect(markers.length).toBeGreaterThanOrEqual(5);
  });

  /** The honesty invariants. TypeScript forces the FIELDS to exist; these force them to say
   * something. A cited chart whose source is a blank string, or whose caveat is empty, passes
   * the compiler and fails the reader. */
  it("gives every cited data graphic a live source and a real caveat", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (scene.kind !== "statbars") continue;
      expect(scene.sourceHref, `scene ${key}`).toMatch(/^https:\/\//);
      expect(scene.note.trim().length, `scene ${key} caveat`).toBeGreaterThan(20);
      expect(scene.bars.length, `scene ${key} bars`).toBeGreaterThan(1);
    }
  });

  it("makes every staged conversation admit that it is staged", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (scene.kind !== "conversation") continue;
      expect(scene.note.trim().length, `scene ${key} note`).toBeGreaterThan(10);
      expect(scene.turns.length, `scene ${key} turns`).toBeGreaterThan(1);
    }
  });

  /** A film scene with no film renders nothing, which is a silent hole in the page rather
   * than an error. Catch it here instead of in a screenshot. */
  it("only places a film scene when the topic actually has a film", () => {
    const placesFilm = Object.values(content.scenes).some((s) => s.kind === "film");
    if (placesFilm) expect(content.film).toBeDefined();
  });
});
