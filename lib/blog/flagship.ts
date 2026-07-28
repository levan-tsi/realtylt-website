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
 * `kind: "component"` is the honest escape hatch. It names a bespoke component for the scenes
 * that genuinely are one-off (the calculator's model is per-topic and cannot be data), and it
 * lets the remaining scenes migrate to primitives one at a time instead of in one risky sweep.
 */

import type { OutlineEntry } from "./markdown";
import type { ArticleFilm } from "./types";

/** Re-exported so a scene primitive has ONE import for everything it is handed. */
export type { ArticleFilm } from "./types";

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

export interface GridItem {
  /** The claim, in the article's own words. */
  lead: string;
  body: string;
}

/** Bespoke components that are not (yet) primitives. Adding a key here is a deliberate
 * admission that a scene is one-off. */
export type ComponentId =
  | "cold-open-calculator"
  | "response-curve"
  | "response-gap"
  | "teardown"
  | "system-diagram";

/** A caption that needs one link in the middle of it. A list of parts rather than markup:
 * typed, tiny to render, and it keeps a parser out of the content layer. */
export type RichText = (string | { href: string; label: string })[];

export interface SceneAction {
  label: string;
  href: string;
  variant: "light" | "outline-light";
}

export type Scene =
  /** n items, each a lead and a body, on a 2 or 3 column grid under an eyebrow and a heading.
   * Two columns get the larger type and more air; three get the compact treatment, because a
   * checklist you scan and a spec you study are not the same object. */
  | (SceneBase & {
      kind: "grid";
      eyebrow: string;
      heading: string;
      columns: 2 | 3;
      /** The porchlight signal-glow. Dark bands only; on a light field it is invisible. */
      glow?: boolean;
      items: GridItem[];
    })
  /** The skimmable answer, on the reading measure rather than full-bleed: a summary belongs to
   * the article. Hairlines and one accent tick per line, no card and no icon, which is what
   * keeps it from reading as a templated "key takeaways" box. */
  | (SceneBase & { kind: "summary"; eyebrow: string; claims: string[]; ariaLabel: string })
  /** One line held on a field, with nothing competing with it. `tone` picks a whole preset
   * rather than exposing six knobs: "quote" is the quote card (a rule, a blockquote, the
   * tighter measure) and "close" is the ending (actions under it, the wider measure). */
  | (SceneBase & {
      kind: "statement";
      /** river reads as its own chapter next to the near-black scenes either side of it. */
      field: "ink" | "river";
      tone: "quote" | "close";
      text: string;
      glow?: boolean;
      actions?: SceneAction[];
      footnote?: string;
      ariaLabel?: string;
    })
  /** The film. `preload="none"` with a poster means zero bytes load for a reader who scrolls
   * past, and autoplay is deliberately absent, which is the honest reading of reduced motion. */
  | (SceneBase & {
      kind: "film";
      eyebrow: string;
      heading: string;
      caption: RichText;
      ariaLabel: string;
    })
  | (SceneBase & { kind: "component"; id: ComponentId });

export interface FlagshipContent {
  /** Scene key (the `[[scene:key]]` marker) to its payload. */
  scenes: Record<string, Scene>;
  /** Short rail labels for PROSE headings, keyed by the heading's own anchor id. Optional:
   * order and ids are derived from the document, so a stale key here degrades to the full
   * heading text rather than to a dead row. scripts/_scratch-toc.mjs fails on a key that
   * matches no heading, so it cannot rot quietly either. */
  headingLabels?: Record<string, string>;
  /** The film, when the topic has one. The same object is set as the article's `film`, so the
   * scene and the VideoObject can never disagree. */
  film?: ArticleFilm;
}

export interface FlagshipTocRow {
  id: string;
  label: string;
  scene?: boolean;
}

/** The rail, derived from the document's own outline.
 *
 * Every top-level heading becomes a row; a scene becomes one only if it declares a label.
 * Nothing here is typed by hand, so a renamed heading or a re-ordered scene cannot leave a
 * row pointing at an element that is not on the page. */
export function flagshipToc(outline: OutlineEntry[], content?: FlagshipContent): FlagshipTocRow[] {
  const rows: FlagshipTocRow[] = [];
  for (const entry of outline) {
    if (entry.kind === "scene") {
      const scene = content?.scenes[entry.key];
      if (scene?.label) rows.push({ id: `scene-${entry.key}`, label: scene.label, scene: true });
    } else if (entry.level <= 2) {
      rows.push({ id: entry.id, label: content?.headingLabels?.[entry.id] ?? entry.text });
    }
  }
  return rows;
}
