import { describe, expect, it } from "vitest";
import { SELLER_DISCLOSURE_FLAGSHIP } from "@/content/blog/seller-disclosure-scenes";
import { SELLER_DISCLOSURE_POST } from "@/content/blog/seller-posts";
import { flagshipToc, railWords, type FlagshipContent } from "./flagship";
import { parseOutline } from "./markdown";
import { parseHeadings } from "./toc";

/** Since 2026-11-20 the seller disclosure guide is the one flagship on this site: the twenty AI
 * posts, their frozen rails and the scene kinds only they used moved to the AI business's own site. */
const outline = parseOutline(SELLER_DISCLOSURE_POST);

describe("parseOutline", () => {
  it("interleaves scenes and headings in document order", () => {
    const kinds = new Set(outline.map((e) => e.kind));
    expect(kinds).toEqual(new Set(["scene", "heading"]));
    // The timeline is placed straight after the first section heading.
    expect(outline[0]).toMatchObject({ kind: "heading", id: "the-form-is-required-on-most-sales" });
    expect(outline[1]).toEqual({ kind: "scene", key: "form-timeline" });
  });

  it("gives every heading the same id the page renders", () => {
    const fromOutline = outline.filter((e) => e.kind === "heading").map((e) => e.id);
    const fromHeadings = parseHeadings(SELLER_DISCLOSURE_POST)
      .filter((h) => h.level <= 2)
      .map((h) => h.id);
    expect(fromOutline).toEqual(fromHeadings);
  });
});

describe("flagshipToc", () => {
  /** A rail that silently loses a row, or a renamed heading whose short label was not renamed
   * with it (the row then prints the full heading), is per-post, so the guard is a freeze of the
   * rail a reader actually sees. */
  it("derives exactly the rail the seller disclosure guide ships with", () => {
    expect(flagshipToc(outline, SELLER_DISCLOSURE_FLAGSHIP)).toEqual([
      { id: "the-form-is-required-on-most-sales", label: "Required on most sales" },
      { id: "what-the-56-questions-cover", label: "The 56 questions" },
      { id: "answer-from-what-you-actually-know", label: "How to answer" },
      { id: "who-is-exempt", label: "Who is exempt" },
      { id: "selling-as-is-does-not-cover-a-known-hidden-defect", label: "Selling as is" },
      { id: "two-other-disclosures", label: "Two other disclosures" },
      { id: "the-disclosure-plan", label: "The disclosure plan" },
      { id: "who-this-fits", label: "Who this fits" },
      { id: "frequently-asked-questions", label: "Common questions" },
      { id: "scene-quiz", label: "Quiz", scene: true },
      { id: "next-step", label: "Next step" },
      { id: "sources", label: "Sources" },
    ]);
  });

  it("skips scenes that declare no label, because not every scene is a destination", () => {
    const rows = flagshipToc(outline, SELLER_DISCLOSURE_FLAGSHIP);
    for (const key of ["form-timeline", "form-anatomy", "four-answers", "who-files", "lead-paint", "disclosure-plan", "prep-sheet"]) {
      expect(rows.some((r) => r.id === `scene-${key}`)).toBe(false);
    }
  });

  it("falls back to the heading's own text when no short label is given", () => {
    expect(SELLER_DISCLOSURE_FLAGSHIP.headingLabels).not.toHaveProperty("who-is-exempt");
    expect(flagshipToc(outline, SELLER_DISCLOSURE_FLAGSHIP)).toContainEqual({ id: "who-is-exempt", label: "Who is exempt" });
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
  // Round 14, 2026-10-30. The first consumer post built as a flagship, and the first topic whose
  // figures use the round-14 kinds (cells, timeline, flow, tiles, steps).
  ["seller disclosure", SELLER_DISCLOSURE_POST, SELLER_DISCLOSURE_FLAGSHIP],
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
      // The quiz names its dark field "night" (its shape was fixed for two lanes at once);
      // sceneBand reads it as dark, so the rail still flips.
      const bands = scene.kind === "quiz" ? ["night", "light"] : ["dark", "light"];
      expect(bands, `scene ${key}`).toContain(scene.band);
    }
  });

  /** Round 15: a quiz teaches, so every question needs four real choices, one right answer in
   * range, and a line of why. A quiz with a blank why scolds instead of teaching. */
  it("gives every quiz four distinct choices, a right answer and a why line per question", () => {
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (scene.kind !== "quiz") continue;
      expect(scene.questions.length, `scene ${key} questions`).toBeGreaterThanOrEqual(8);
      for (const q of scene.questions) {
        expect(new Set(q.choices).size, `${key}: ${q.q}`).toBe(4);
        expect([0, 1, 2, 3]).toContain(q.answer);
        expect(q.why.trim().length, `${key}: ${q.q} why`).toBeGreaterThan(20);
        expect(`${q.q} ${q.choices.join(" ")} ${q.why}`).not.toMatch(/[–—]/);
      }
      expect(scene.passLine.trim().length).toBeGreaterThan(10);
      expect(scene.failLine.trim().length).toBeGreaterThan(10);
    }
  });

  it("places enough scenes to clear the readiness gate", () => {
    expect(markers.length).toBeGreaterThanOrEqual(5);
  });

  /** The round-14 figure kinds carry their citation as a list rather than one field. A figure
   * with an empty source list passes the compiler and reads as an illustration of nothing. */
  it("gives every round-14 figure a source line and a one-sentence alt", () => {
    const FIGURES = ["cells", "timeline", "flow", "tiles", "steps"];
    for (const [key, scene] of Object.entries(content.scenes)) {
      if (!FIGURES.includes(scene.kind) || !("sources" in scene)) continue;
      expect(scene.sources.length, `scene ${key} sources`).toBeGreaterThan(0);
      for (const s of scene.sources) if (s.href) expect(s.href, `scene ${key}`).toMatch(/^https:\/\//);
      expect(scene.alt.trim().split(/(?<=[a-z0-9)][.!?])\s+(?=[A-Z])/).length, `scene ${key} alt is one sentence`).toBe(1);
      expect(scene.alt, `scene ${key} alt`).not.toMatch(/—/);
    }
  });

  /** A scene REPLACES the prose it stages; it never echoes it.
   *
   * A check on held `statement` scenes (a kind that moved with the AI posts) guarded only their
   * `text` from 2026-08-03. Rounds F, G and H then found TWENTY-THREE echoes it could not see, every one of them in a
   * chart `note`, a grid card `body`, a caption or a footnote — and each round's log recommended
   * building this and moved on, four times. Round H's log put it plainly: "the test to catch
   * them has been recommended four times and never built."
   *
   * So it walks every string in every scene rather than one field of one kind. Identifiers and
   * asset fields are skipped (see SKIP): a `src` or a licence name is not prose about the
   * subject and can legitimately repeat anything.
   *
   * The threshold is EIGHT words, not five. A grid card's label is short and shares
   * the topic's vocabulary by design, so five words produces false positives on exactly the
   * fields this is meant to cover; eight words is a sentence somebody wrote twice. That is the
   * same distinction the sibling-overlap metric had to learn: repeating a SENTENCE is the
   * failure, repeating a NOUN is not.
   *
   * Proved on the real cohort before it was trusted: it found 4 surviving echoes across the
   * twenty posts (chat's funnel footnote, two workflow card bodies, one clone summary claim),
   * all four were genuine, and all four were rewritten rather than excluded. */
  it("never repeats a body sentence anywhere inside a scene payload", () => {
    const SKIP = new Set(["kind", "src", "href", "id", "key", "icon", "slug", "alt",
      "photographer", "licence", "license", "sourceUrl", "ariaLabel", "credit", "sourceHref"]);
    const flat = body.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ");
    const walk = (node: unknown, path: string, out: [string, string][]) => {
      if (typeof node === "string") return void out.push([path, node]);
      if (Array.isArray(node)) return void node.forEach((v, i) => walk(v, `${path}[${i}]`, out));
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          if (SKIP.has(k)) continue;
          walk(v, path ? `${path}.${k}` : k, out);
        }
      }
    };
    for (const [key, scene] of Object.entries(content.scenes)) {
      const strs: [string, string][] = [];
      walk(scene, "", strs);
      const echoes = strs.flatMap(([path, str]) =>
        str
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.split(/\s+/).length >= 8)
          .filter((s) => flat.includes(s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()))
          .map((s) => `${key}.${path}: ${s.slice(0, 80)}`),
      );
      expect(echoes, `scene ${key} repeats a body sentence`).toEqual([]);
    }
  });
});

/** Round 16 (the owner, 2026-10-31): a flagship's floating list "is full on the whole screen"
 * and "shows things twice". It had 32 rows: every H2 plus every labelled scene, several labelled
 * with their own section's words. flagshipToc now gives one entry per section. */
describe("flagshipToc: one entry per section, no row twice", () => {
  const key = (label: string) => [...railWords(label)].sort().join(" ");

  it("strips articles, punctuation and figure numbering, and keeps every other word", () => {
    expect(railWords("Figure 3: The three questions!")).toEqual(["three", "questions"]);
    expect(railWords("What a booking is")).toEqual(["what", "booking", "is"]);
    expect(railWords("Not to automate")).toEqual(["not", "to", "automate"]);
  });

  it("drops a scene that repeats a heading anywhere, or its own section's words, and keeps the rest", () => {
    const content = {
      scenes: {
        same: { kind: "tiles", band: "light", label: "How it runs" },
        inside: { kind: "tiles", band: "light", label: "Not to automate" },
        own: { kind: "tiles", band: "light", label: "The booking" },
        tool: { kind: "steps", band: "light", label: "Your numbers" },
      },
      headingLabels: { b: "What not to automate" },
    } as unknown as FlagshipContent;
    const rows = flagshipToc(
      [
        { kind: "heading", id: "a", level: 2, text: "How it runs" },
        { kind: "scene", key: "same" },
        { kind: "heading", id: "b", level: 2, text: "What should not be automated" },
        { kind: "scene", key: "inside" },
        { kind: "heading", id: "c", level: 2, text: "What it does" },
        { kind: "scene", key: "own" },
        { kind: "scene", key: "tool" },
        { kind: "heading", id: "d", level: 2, text: "What a booking is" },
        { kind: "heading", id: "e", level: 2, text: "How it runs" },
      ],
      content,
    );
    expect(rows.map((r) => r.label)).toEqual(["How it runs", "What not to automate", "What it does", "The booking", "Your numbers", "What a booking is"]);
  });

  it.each(TOPICS)("never repeats a row's words on the %s rail", (_name, body, content) => {
    const keys = flagshipToc(parseOutline(body), content).map((r) => key(r.label));
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });
});
