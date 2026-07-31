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

/** One bar of a cited data graphic. `display` is the label as written (60x, 37%), kept
 * separate from `value` so the geometry and the typography cannot disagree. */
export interface StatBar {
  label: string;
  value: number;
  display: string;
}

/** One hop of a system diagram: what it is, and what it actually connects to. The second
 * half is the part a conversation view can never show. */
export interface DiagramStep {
  label: string;
  connects: string;
  at?: string;
}

/** One turn of a staged conversation. `who` is the side, not a name: a topic supplies the
 * side LABELS once rather than repeating them on every turn. */
export interface ConversationTurn {
  who: "them" | "us";
  at: string;
  text: string;
}

/** One thing the system did while the conversation was happening. */
export interface ConversationEvent {
  at: string;
  label: string;
  detail: string;
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
  /** A cited data graphic: n bars, a source, and the caveat that keeps it honest.
   *
   * Drawn as real inline SVG rather than CSS bars because a chart is the asset another site
   * embeds and credits, so it has to survive being lifted out of the page. The numbers are
   * also in the DOM as text, so nothing is locked inside a picture. */
  | (SceneBase & {
      kind: "statbars";
      eyebrow: string;
      /** The chart's own title. Rendered as the scene heading AND as the SVG <title>. */
      caption: string;
      bars: StatBar[];
      /** The axis maximum. Omit and the chart scales to its own largest bar, which is right
       * for RATIOS (60x against 1x) where the biggest value is the point being made. Set it
       * to 100 for SHARES of a whole: scaling four percentages to the largest of them draws
       * a 37% bar at full width, and a full-width bar reads as everything. */
      max?: number;
      /** Which bar carries the accent. Index into `bars`; omit for the first. */
      lit?: number;
      sourceText: string;
      sourceHref: string;
      /** What the data does NOT say. A chart without this is an advert. */
      note: string;
      /** Read out in the SVG description after the bars, for a screen reader. */
      basis: string;
    })
  /** n labelled nodes on a spine, each with what it connects to. Wide by nature: the SVG
   * keeps a min width and its own container scrolls, so the page never scrolls sideways. */
  | (SceneBase & {
      kind: "diagram";
      eyebrow: string;
      heading: string;
      lede: string;
      steps: DiagramStep[];
      /** Prefix for the SVG's single-child <title>. React does not reconcile several text
       * children inside <title>, and the two-child version re-rendered the whole page tree. */
      altPrefix: string;
    })
  /** A staged exchange beside the machinery that fired during it. Both tracks at once IS the
   * argument, which is why this is one scene and not two. */
  | (SceneBase & {
      kind: "conversation";
      /** How the exchange is DRAWN. "bubbles" is a typed conversation; "transcript" is a
       * spoken one. Getting this wrong makes a phone call look like a chat window, which is
       * the wrong thing to tell a reader about the channel. Defaults to bubbles. */
      layout?: "bubbles" | "transcript";
      eyebrow: string;
      heading: string;
      /** The line that says this is an illustration, not a real client's transcript. */
      note: string;
      /** Column headings, and the per-turn side labels. A topic owns its own nouns. */
      themLabel: string;
      usLabel: string;
      turnsHeading: string;
      eventsHeading: string;
      turns: ConversationTurn[];
      events: ConversationEvent[];
    })
  /** One photograph, full bleed, with a caption that does real work. Pure atmosphere would
   * not earn a band; the caption is what makes this a scene rather than decoration. */
  | (SceneBase & {
      kind: "plate";
      src: string;
      /** Real alt text. This image is content, so it is not aria-hidden. */
      alt: string;
      caption: string;
      /** Licence line. The site keeps its ledger in public/images/ATTRIBUTIONS.md and the
       * credit belongs next to the picture as well as in the file. */
      credit: string;
      ariaLabel: string;
    })
  | (SceneBase & { kind: "component"; id: ComponentId });

/** The cold open's own variables. The flagship hero is one held moment, and the moment is
 * the only part that changes between topics: a clock at 11:40pm for the chat piece, a phone
 * ringing at 9:42pm for this one. `signature` picks which single animated element the scene
 * gets, because two would already be one too many. */
export interface FlagshipHero {
  /** The numerals. */
  moment: string;
  /** The unit beside them, in the accent. */
  suffix: string;
  /** Atmosphere behind the type. Masked away from the words, never sat behind them. */
  photo: string;
  signature: "porchlight" | "ring";
}

export interface FlagshipContent {
  /** Scene key (the `[[scene:key]]` marker) to its payload. */
  scenes: Record<string, Scene>;
  /** The cold open. Omit and the hero falls back to the chat piece's original moment, so an
   * existing topic keeps rendering exactly as it did. */
  hero?: FlagshipHero;
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
