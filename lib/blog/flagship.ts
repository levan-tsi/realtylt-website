/** THE FLAGSHIP TEMPLATE.
 *
 * One great post is not a template. Cloning the AI chat assistant piece to the other service
 * topics used to mean copying nine bespoke components and editing the strings inside them,
 * which is exactly how a template rots: nineteen near-identical files that drift apart.
 *
 * So the SHAPE lives here and the WORDS live in one file per topic. A scene is a typed payload
 * with a `kind`; the registry maps the kind to a primitive that takes it as props and imports
 * nothing. Adding a topic is a content file plus `[[scene:key]]` markers in its markdown, and
 * touches no component at all.
 *
 * 2026-11-20: the AI posts moved to the AI business's own site and took the kinds only
 * they used (grid, summary, statement, film, statbars, diagram, conversation, plate, calculator,
 * bars and the bespoke-component hatch). What stays is exactly what the seller disclosure guide
 * places: offer, cells, timeline, flow, tiles, steps and quiz.
 */

import type { OutlineEntry } from "./markdown";

/** Common to every scene. */
interface SceneBase {
  /** Dark or light field. The floating rail reads it to flip its own contrast as it passes
   * over the band, and a topic controls its own light/dark rhythm by setting it. */
  band: "dark" | "light";
  /** The rail label. A scene with no label is not a navigation destination — a pull quote is
   * not somewhere you jump back to. Presence here IS the decision, rather than a second
   * curated list that has to agree with this one. */
  label?: string;
}

/** ── The figure kinds added in round 14 (2026-10-30), for the data points a post's review chain
 * hands over: a form drawn as its questions, a dated change, a
 * question flow, a card of facts and a numbered path.
 *
 * These kinds keep every word in HTML, where it wraps and stays at reading size, and draw only
 * the marks.
 *
 * Every one of them carries `alt` (one plain sentence, the figure's accessible name) and
 * `sources` (the source line as the post's data points give it). A figure without a source is
 * an illustration, and the two must never be confused. */
export interface SceneSource {
  text: string;
  href?: string;
}

interface FigureBase {
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  /** What the figure does NOT say, when there is something it could be stretched to say. */
  note?: string;
}

/** One bar on a 0 to max track. `hollow` draws an outline instead of a fill: an upper bound
 * ("under 20 percent") or an expectation, never a measured share. */
export interface BarRow {
  label: string;
  value: number;
  display: string;
  lit?: boolean;
  hollow?: boolean;
  /** A short qualifier under the label, such as the date the count is as of. */
  tag?: string;
}

/** One group of a form drawn as cells, numbered `from` to `to`. */
export interface CellGroup {
  label: string;
  range: string;
  from: number;
  to: number;
}

/** Cells picked out of the form: `fill` lights them, `ring` outlines them. `numbered` prints
 * the question number inside each picked cell, which is only done for numbers the post states. */
export interface CellMark {
  cells: number[];
  label: string;
  tone: "fill" | "ring";
  numbered?: boolean;
}

export interface TimelineEvent {
  /** ISO date, for true-date spacing only; never printed. */
  date: string;
  display: string;
  title: string;
  detail?: string;
  /** Not law, or not yet: drawn hollow. */
  pending?: boolean;
}

export interface FlowGate {
  ask: string;
  /** The answer that continues down the path, and the one that leaves it. */
  pass: string;
  exit: string;
  outcome: string;
  detail?: string;
}

export interface Tile {
  figure?: string;
  title: string;
  body?: string;
}

export interface PathStep {
  title: string;
  body?: string;
  /** Things tied to this step, such as a document and its question number. */
  chips?: { label: string; value: string }[];
  /** A line the post marks as an invented example, printed with that label. */
  example?: string;
  /** A miniature of a numbered form with these cells lit. */
  mini?: { total: number; breaks: number[]; lit: number[] };
}

export type Scene =
  /** One ask, in the middle, earned by the section above it. `reassure` is required and says
   * what will NOT happen — see primitives/Offer.tsx for why that is structural. */
  | (SceneBase & {
      kind: "offer";
      band: "light";
      eyebrow: string;
      text: string;
      reassure: string;
      action: { label: string; href: string };
      ariaLabel: string;
    })
  /** A numbered form drawn as one cell per question, grouped, with some cells picked out, and
   * an optional strip of bars under it for how the count changed. */
  | (SceneBase &
      FigureBase & {
        kind: "cells";
        groups: CellGroup[];
        marks: CellMark[];
        strip?: BarRow[];
      })
  /** Dated events on a vertical axis spaced by the real calendar. */
  | (SceneBase & FigureBase & { kind: "timeline"; events: TimelineEvent[] })
  /** Questions in order, each with the answer that leaves the path and where it goes. */
  | (SceneBase &
      FigureBase & {
        kind: "flow";
        gates: FlowGate[];
        end: { title: string; detail?: string };
        /** One name for every exit, when they all land in the same place ("Not building"). */
        tray?: string;
        /** A run of the flow the post marks as an invented example. */
        example?: string;
      })
  /** A card of facts. `specimen` draws one line of a form with its answer boxes above them. */
  | (SceneBase &
      FigureBase & {
        kind: "tiles";
        columns: 2 | 3;
        tiles: Tile[];
        specimen?: { line: string; options: string[]; ticked: number; tag: string };
      })
  /** A numbered path of steps, with an optional row of facts above it and a closing line. */
  | (SceneBase &
      FigureBase & {
        kind: "steps";
        facts?: Tile[];
        steps: PathStep[];
        close?: string;
      })
  /** A short quiz on what the post taught, one question at a time, with the result at the end.
   * The band is "night" or "light" rather than SceneBase's pair because the seller lane's data
   * file was written to this exact shape; `sceneBand` reads "night" as a dark field. The label
   * is optional like every scene's. See components/blog/scenes/primitives/Quiz.tsx. */
  | (Omit<SceneBase, "band"> & {
      kind: "quiz";
      band: "night" | "light";
      ariaLabel: string;
      eyebrow: string;
      title: string;
      questions: QuizQuestion[];
      passLine: string;
      failLine: string;
    });

/** One quiz question: four choices, the index of the right one, and one line of teaching shown
 * whichever choice the reader taps. */
export interface QuizQuestion {
  q: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
}

/** The cold open's own variables. The flagship hero is one held moment, and the moment is
 * the only part that changes between topics (the seller disclosure guide: 56 questions). */
export interface FlagshipHero {
  /** The numerals. */
  moment: string;
  /** The unit beside them, in the accent. */
  suffix: string;
  /** Atmosphere behind the type. Masked away from the words, never sat behind them. */
  photo: string;
}

export interface FlagshipContent {
  /** Scene key (the `[[scene:key]]` marker) to its payload. */
  scenes: Record<string, Scene>;
  /** The cold open. Omit and the hero falls back to ColdOpen's defaults. */
  hero?: FlagshipHero;
  /** Short rail labels for PROSE headings, keyed by the heading's own anchor id. Optional:
   * order and ids are derived from the document, so a stale key here degrades to the full
   * heading text rather than to a dead row. scripts/_scratch-toc.mjs fails on a key that
   * matches no heading, so it cannot rot quietly either. */
  headingLabels?: Record<string, string>;
}

export interface FlagshipTocRow {
  id: string;
  label: string;
  scene?: boolean;
}

/** Articles carry nothing in a rail label, so "The roadmap" and "Roadmap" are one destination.
 * Every other word counts: "What a booking is" and "The booking" are different rows. */
const RAIL_STOPWORDS = new Set(["a", "an", "the"]);

/** A label's words for comparing rail rows: lowercase, figure numbering ("Figure 3", "Fig. 2")
 * and punctuation stripped, articles dropped. */
export function railWords(label: string): string[] {
  return label
    .toLowerCase()
    .replace(/\bfig(?:ure)?\.?\s*\d+[a-z]?\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !RAIL_STOPWORDS.has(w));
}

/** The rail, derived from the document's own outline.
 *
 * Every top-level heading becomes a row; a scene becomes one only if it declares a label, and
 * then only if it is its own destination. Round 16 (the owner, 2026-10-31: the list "is full on
 * the whole screen" and "shows things twice"): the AI audit post had 20 headings and 22 scenes,
 * 11 of them labelled, four with their own section's words, and the rail ran to 32 rows. So:
 *   - a scene row never appears when a heading row carries the same words (lowercase, punctuation
 *     and figure numbering stripped, articles dropped), anywhere on the page;
 *   - nor when every word of its label is already in the label of the section it sits in, so
 *     "Not to automate" under "What not to automate" goes; "The booking" under "What it does"
 *     stays, because the section heading does not say it;
 *   - no two rows carry the same words.
 * Which scenes are destinations at all stays the post's call: a scene with no label gets no row.
 * Measured on 2026-10-31, twelve of the twenty-one flagship posts carried at least one repeated
 * row, so this is a template fix, not one post's.
 * Nothing here is typed by hand, so a renamed heading or a re-ordered scene cannot leave a
 * row pointing at an element that is not on the page. */
export function flagshipToc(outline: OutlineEntry[], content?: FlagshipContent): FlagshipTocRow[] {
  const labelOf = (entry: { id: string; text: string }) => content?.headingLabels?.[entry.id] ?? entry.text;
  const keyOf = (words: string[]) => [...words].sort().join(" ");
  const headingKeys = new Set(
    outline.flatMap((entry) => (entry.kind === "heading" && entry.level <= 2 ? [keyOf(railWords(labelOf(entry)))] : [])),
  );
  const rows: FlagshipTocRow[] = [];
  const seen = new Set<string>();
  let section = new Set<string>();
  for (const entry of outline) {
    if (entry.kind === "scene") {
      const scene = content?.scenes[entry.key];
      if (!scene?.label) continue;
      const words = railWords(scene.label);
      const key = keyOf(words);
      if (headingKeys.has(key) || seen.has(key)) continue;
      if (words.length && words.every((w) => section.has(w))) continue;
      seen.add(key);
      rows.push({ id: `scene-${entry.key}`, label: scene.label, scene: true });
    } else if (entry.level <= 2) {
      const label = labelOf(entry);
      const words = railWords(label);
      section = new Set(words);
      const key = keyOf(words);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({ id: entry.id, label });
    }
  }
  return rows;
}
