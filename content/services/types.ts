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

  /** Only when the number is one we already state and can stand behind.
   *
   * `source` was added 2026-08-25 (Round B) after `review-automation` carried "73% of customers
   * read reviews before they book" for the life of the page with nothing under it. Making the
   * field EXIST is what turns "where did this come from" from a question nobody asks into a
   * blank in the object. It is optional rather than required because two of the numbers on this
   * surface are our own product facts and have no external document to point at; a number that
   * comes from outside this business has no excuse. */
  stat?: { value: string; label: string; source?: { text: string; href: string } };

  figure: Figure;

  /** "What it is" — plain-language prose. Two or three paragraphs. */
  whatItIs: string[];
  howItWorks: { title: string; body: string }[];
  useCases: { title: string; body: string }[];

  /** "What it does not do." REQUIRED, and required is the whole point.
   *
   * The flagship blog standard makes a limits section mandatory for every post, because a
   * business owner's fourth question is "what will it not do, where does this break"
   * (docs/blog-flagship/STANDARD.md §1). The commercial surface, which is the one that ranks
   * and the one an AI answer lifts from, had no such structure, and five of twenty pages
   * carried no limiting language anywhere at all. The voice page proved the value by doing it
   * inside prose and is the most convincing page in the set as a result. It was just not a
   * field, so nineteen pages did not have to meet it. Now they do.
   *
   * Three to five short entries, each a sentence a person would say out loud. Every one has to
   * be grounded in a claim this page already makes or in a plain product truth: a limits list
   * is not a licence to assert a NEW fact about the product from the negative side. If a
   * limit cannot be stated without inventing something, write fewer of them. */
  limits: string[];

  faqs: FaqItem[];

  /** HeyGen / Higgsfield walkthrough. Absent until one is recorded; the VideoObject
   * JSON-LD and the video section both activate the moment this is filled in. */
  video?: ServiceVideo;

  /** Blog slugs to surface at the foot of the page. */
  relatedPosts?: string[];
}
