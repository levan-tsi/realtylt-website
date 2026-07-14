/** Service content collection — the indexable, per-service SEO/GEO surface.
 *
 * WHY THIS EXISTS: realtylt.com/ai is a Three.js journey. Its service panels open on a
 * hash (`/ai#voice`), and a hash fragment canonicalises to `/ai` — so the journey ranks
 * for nothing per service. These files are the real HTML at real paths that Google
 * indexes and that an AI assistant can quote.
 *
 * SOURCE OF TRUTH: every `eyebrow` / `title` / `lede` / `specs` / `why` / `keywords`
 * below is seeded verbatim from the `COPY` object in realtylt-ai-page/web/src/main.js,
 * so the 3D panel and the page cannot drift apart. `aiKey` is that COPY key — it is
 * also the hash that opens the panel (`/ai#<aiKey>`).
 *
 * Shape mirrors content/blog/posts.ts: a typed TS array, no MDX, no CMS.
 */

/** The built-in-HTML figure that carries a section's picture-to-text balance.
 * These are DIAGRAMS, not stock photos — a stock photo of a headset would say nothing
 * about what an AI voice agent does. Each service picks the shape that fits its work. */
export type Figure =
  /** A conversation. For anything whose product IS a dialogue. */
  | {
      kind: "transcript";
      caption: string;
      turns: { who: "visitor" | "ai"; text: string }[];
      footnote: string;
    }
  /** A sequence with elapsed time. For anything whose product is SPEED. */
  | {
      kind: "timeline";
      caption: string;
      events: { at: string; label: string; note: string }[];
      footnote: string;
    }
  /** Thin input becomes rich output. For anything whose product is DATA. */
  | {
      kind: "records";
      caption: string;
      headers: { before: string; after: string };
      rows: { before: string; after: string[]; tag: string }[];
      footnote: string;
    }
  /** Tools wired together. For anything whose product is a CHAIN of steps. */
  | {
      kind: "flow";
      caption: string;
      trigger: string;
      nodes: { label: string; note: string }[];
      footnote: string;
    };

export interface FaqItem {
  /** Phrased the way a person actually types it into an assistant. */
  q: string;
  /** Answers the question in the first sentence. Quotable on its own. */
  a: string;
}

export interface ServiceVideo {
  /** Absolute or site-relative MP4/stream URL (the file itself). */
  contentUrl: string;
  /** Player page, when there is one (YouTube/HeyGen share link). */
  embedUrl?: string;
  name: string;
  description: string;
  /** Site-relative poster image. */
  thumbnailUrl: string;
  /** ISO date the video was published. */
  uploadDate: string;
  /** ISO 8601 duration, e.g. "PT1M42S". */
  duration: string;
}

/** flagship = the three pilots, built to full depth.
 *  core     = on the /ai hub.
 *  more     = staged behind "+ more" on the hub. */
export type ServiceTier = "flagship" | "core" | "more";

export interface Service {
  /** URL: /services/<slug> */
  slug: string;
  /** COPY key in the /ai journey. Deep link: /ai#<aiKey> */
  aiKey: string;
  /** Short label for nav, cards, breadcrumbs. */
  name: string;
  tier: ServiceTier;

  /** COPY.sys — kicker above the H1. */
  eyebrow: string;
  /** COPY.h — the H1. */
  title: string;
  /** COPY.p — the lede. */
  lede: string;
  /** COPY.specs — the stack chips. */
  specs: string[];
  /** COPY.why — the stakes. Rendered as the outcome band. */
  why: string;
  /** COPY.kw — the real target keywords. Drives the meta description review, not stuffing. */
  keywords: string[];

  seo: { title: string; description: string };

  /** Only when the number is one we already state and can stand behind. */
  stat?: { value: string; label: string };

  figure: Figure;

  /** "What it is" — plain-language prose. Two or three paragraphs. */
  whatItIs: string[];
  howItWorks: { title: string; body: string }[];
  useCases: { title: string; body: string }[];
  faqs: FaqItem[];

  /** HeyGen / Higgsfield walkthrough. Absent until one is recorded; the VideoObject
   * JSON-LD and the video section both activate the moment this is filled in. */
  video?: ServiceVideo;

  /** Blog slugs to surface at the foot of the page. */
  relatedPosts?: string[];
}
