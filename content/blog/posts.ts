/** Blog content collection — seeded with the 10 live post titles (docs/reference/page-inventory.json).
 * BODIES ARE PLACEHOLDERS: owner supplies final articles from Drive (CHECKPOINT.md).
 * Adding a post = add an entry here; pages generate automatically. */

import type { FlagshipContent } from "@/lib/blog/flagship";
import type { ArticleFilm } from "@/lib/blog/types";
import {
  AI_CHAT_ASSISTANT_POST,
  AI_VOICE_AGENTS_POST,
  DATABASE_REACTIVATION_POST,
  LEAD_QUALIFICATION_POST,
  WORKFLOW_AUTOMATION_POST,
} from "./ai-posts";
import { AI_CHAT_FLAGSHIP, FILM } from "./ai-chat-scenes";
import { AI_VOICE_FLAGSHIP, VOICE_FILM } from "./voice-agent-scenes";
import { REACTIVATION_FILM, REACTIVATION_FLAGSHIP } from "./reactivation-scenes";
import { QUALIFY_FILM, QUALIFY_FLAGSHIP } from "./qualify-scenes";
import { WORKFLOW_FLAGSHIP } from "./workflow-scenes";

/** "October 24, 2025" — the T12:00:00Z noon guard keeps the date stable in every timezone. */
export const fmtDate = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

export interface BlogPost {
  slug: string;
  title: string;
  date: string; // ISO
  /** ISO date of the last substantive revision, when there has been one. Drives JSON-LD
   * dateModified and the visible "Updated" line. Omit on a post that has never been revised:
   * an invented modified date is a freshness fiction, not a freshness signal. */
  updated?: string;
  excerpt: string;
  cover: string;
  /** Meta description override. The excerpt is VISIBLE copy (index card, article hero) and
   * is allowed to run long; this is what search engines get. Mirrors the DB path's
   * `seo_description`. Omit and the excerpt is used. */
  seoDescription?: string;
  /** Paragraphs. Placeholder until owner's Drive copy lands. */
  body: string[];
  /** Full article in the markdown subset lib/blog/markdown.tsx renders (headings, lists,
   * quotes, links). When present it REPLACES `body` — a real article needs structure, and
   * a flat paragraph array cannot carry an H2. Set `body: []` alongside it. */
  markdown?: string;
  /** A film that belongs to this post. Its presence is what emits VideoObject. */
  film?: ArticleFilm;
  /** Scene payloads, for a markdown body that places [[scene:...]] markers. */
  flagship?: FlagshipContent;
  placeholder: boolean;
}

const PLACEHOLDER_BODY = (topic: string): string[] => [
  `[Placeholder draft. The owner's final article replaces this text.]`,
  `This post will cover ${topic} for Hudson Valley homeowners and buyers, written from local experience across Dutchess, Westchester, Putnam, Rockland, Ulster and Orange counties.`,
  `In the meantime, if this topic is on your mind, call us at (917) 905-7923 or send a message from any page, and we're happy to talk it through, seven days a week.`,
];

/* NOTE ON ORDER: this array is authored NEWEST-FIRST, and lib/blog's merge relies on the
   sort being stable so an empty blog_posts table reproduces exactly this ordering. A new
   post therefore goes at the TOP, not the bottom. */
export const POSTS: BlogPost[] = [
  /* ── The AI exemplars. Real articles, full markdown bodies, not stubs. They are the long
     form behind /services/ai-voice-agents, /services/ai-chat-assistant and
     /services/workflow-automation, and those pages link back to them. The first two are
     flagships: full-bleed scenes, cited data graphics and their own cold opens. */
  {
    slug: "ai-lead-qualification-real-estate-scoring",
    title: "All Three Leads Look the Same. Two Are Worth Your Morning.",
    date: "2026-07-31",
    /** NO `updated` YET, DELIBERATELY, and this is the one readiness check the post does not
     * pass on day one. `updated` means the date of the last substantive revision, and a post
     * written, built and shipped inside a single day has not had one. Inventing a later date to
     * turn the check green would be exactly the freshness fiction the field comment above warns
     * about, on a page whose own argument is that the inputs have to be honest.
     *
     * Set this to the real date the first time the article is genuinely revised, which for the
     * other three flagships happened within a week of shipping. */
    excerpt:
      "Your CRM sorts leads by when they arrived, which is the one thing about a lead that predicts nothing. Here is what an AI qualification system reads instead, what a ready lead actually sounds like, and the fair housing line that separates ranking your own time from rationing access.",
    seoDescription:
      "What AI lead qualification reads instead of your contact form, the three signals that predict who transacts, and the fair housing rules that govern scoring and routing.",
    cover: "/images/counties/westchester.jpg",
    body: [],
    placeholder: false,
    markdown: LEAD_QUALIFICATION_POST,
    film: QUALIFY_FILM,
    flagship: QUALIFY_FLAGSHIP,
  },
  {
    slug: "database-reactivation-old-real-estate-leads",
    title: "They Said Not Right Now. That Was Three Years Ago.",
    /** Researched and drafted 07-30, finished and shipped 07-31. Both dates are real: this
     * session began on the 30th and the piece was rewritten and verified on the 31st. */
    date: "2026-07-30",
    updated: "2026-07-31",
    excerpt:
      "Your CRM is full of people who told you not right now, and nobody has asked them since. Here is what an AI reactivation campaign actually does with that list, the consent rules with dates in them that nobody selling you one mentions, and what it costs when it goes wrong.",
    seoDescription:
      "What AI database reactivation does with your old real estate leads, the federal consent and do-not-call rules with dates in them, and what getting it wrong costs.",
    cover: "/images/hero/valley-aerial.jpg",
    body: [],
    placeholder: false,
    markdown: DATABASE_REACTIVATION_POST,
    film: REACTIVATION_FILM,
    flagship: REACTIVATION_FLAGSHIP,
  },
  {
    slug: "ai-voice-agent-missed-calls-real-estate",
    title: "Nobody Leaves a Voicemail Anymore. They Call the Next Agent.",
    date: "2026-07-30",
    /** A real revision, not a freshness fiction: the all-party-consent paragraph asserted a
     * count of states that had not been checked against the statutes, and now says only what
     * was verified plus advice to check the caller's own state. Shipped 2026-07-31. */
    updated: "2026-07-31",
    excerpt:
      "A missed call leaves no name, no message and no record that anybody wanted you. Here is what an AI voice agent actually does when the phone rings at 9:42 on a Sunday, the one thing that decides whether it works, and the disclosure rules nobody selling one mentions.",
    seoDescription:
      "What an AI voice agent does when a buyer calls at 9:42 on a Sunday, why latency decides whether it works, and the AI disclosure and call recording rules that apply.",
    cover: "/images/hero/millerton-night.jpg",
    body: [],
    placeholder: false,
    markdown: AI_VOICE_AGENTS_POST,
    film: VOICE_FILM,
    flagship: AI_VOICE_FLAGSHIP,
  },
  {
    slug: "workflow-automation-real-estate-business",
    title: "The Busywork Tax: What Workflow Automation Actually Removes",
    date: "2026-07-13",
    /** A REAL revision, not a freshness fiction. Shipped 07-13 as a plain 1,200-word article; on
     * 08-01 it was rebuilt onto the flagship path with a cited field study, an original data
     * graphic, the rebuilt chain as a diagram, its own film, and two sections it never had (what
     * it costs, and what it does not do). Roughly half the sentences on the page are new. */
    updated: "2026-08-01",
    excerpt:
      "The manual step takes ninety seconds. Getting back to what you were doing takes twenty five minutes. Here is what workflow automation actually removes from a real estate business, how to find your own version of it in an hour, and the failure mode nobody warns you about.",
    seoDescription:
      "What workflow automation removes from a real estate business, how to find your own list in an hour, and the quiet failure the platforms document but nobody mentions.",
    // Was /images/team-bg.jpg, which does not exist and never has: the raw asset 404s and the
    // optimizer therefore 400s, so this post's card on /blog and its own hero were both broken.
    // Accounting Finance (CC0, already in public/images/ATTRIBUTIONS.md) is the paperwork this
    // post is about. lib/blog/index.test.ts now fails on a cover that is not on disk.
    cover: "/images/lifestyle/financing.jpg",
    body: [],
    placeholder: false,
    markdown: WORKFLOW_AUTOMATION_POST,
    flagship: WORKFLOW_FLAGSHIP,
  },
  {
    slug: "ai-chat-assistant-real-estate-website",
    title: "Your Website Answered That Buyer at 11:40pm. Did You?",
    date: "2026-07-12",
    updated: "2026-07-27",
    excerpt:
      "Most home searching happens at night, on a phone, and most real estate websites answer the next morning. Here is what an AI chat assistant actually does in that gap, and what it cannot do.",
    seoDescription:
      "Most home searching happens at night, on a phone, and most real estate sites answer the next morning. What an AI chat assistant does in that gap, and what it cannot do.",
    cover: "/images/lifestyle/buying.jpg",
    body: [],
    placeholder: false,
    markdown: AI_CHAT_ASSISTANT_POST,
    film: FILM,
    flagship: AI_CHAT_FLAGSHIP,
  },

  {
    slug: "top-5-renovations-increase-home-value-ny",
    title: "The Top 5 Renovations That Actually Increase Your Homes Value in New York",
    date: "2025-10-24",
    excerpt:
      "You watch the home improvement shows, you see the stunning transformations, but which projects actually pay you back at the closing table in New York?",
    cover: "/images/listings/house-16.jpg",
    body: PLACEHOLDER_BODY("the five renovations with the best resale return in New York, and the popular ones that don't pay back"),
    placeholder: true,
  },
  {
    slug: "first-time-home-buyer-ny-10-step-checklist",
    title: "First-Time Home Buyer in NY? Here's Your 10-Step Checklist from Start to Finish",
    date: "2025-10-24",
    excerpt:
      "From the first budget conversation to getting the keys, the ten steps every first-time New York buyer walks through, in order, with no jargon.",
    cover: "/images/listings/house-03.jpg",
    body: PLACEHOLDER_BODY("a step-by-step checklist for first-time buyers in New York, from pre-approval to closing day"),
    placeholder: true,
  },
  {
    slug: "moving-to-hudson-valley-rental-vs-buying",
    title: "Moving to the Hudson Valley: Rental vs. Buying – What Makes the Most Sense?",
    date: "2025-09-13",
    excerpt:
      "Rents keep climbing, but so do rates. Here's an honest framework for deciding whether your first Hudson Valley address should be rented or owned.",
    cover: "/images/listings/house-12.jpg",
    body: PLACEHOLDER_BODY("the rent-versus-buy math for the Hudson Valley market, including the break-even timeline"),
    placeholder: true,
  },
  {
    slug: "relocating-to-hudson-valley-newcomers-guide",
    title: "Relocating to the Hudson Valley: What Newcomers Need to Know About Small-Town Charm Meets Big-City Access",
    date: "2025-09-13",
    excerpt:
      "Metro-North lines, school districts, winters, and the difference between river towns: the honest orientation we give every family relocating from the city.",
    cover: "/images/counties/dutchess.jpg",
    body: PLACEHOLDER_BODY("what newcomers should know before relocating to the Hudson Valley: commutes, towns, and trade-offs"),
    placeholder: true,
  },
  {
    slug: "how-to-hire-best-local-movers-7-questions",
    title: "How to Hire the Best Local Movers: 7 Questions You Must Ask Before Signing",
    date: "2025-09-13",
    excerpt:
      "Not all moving companies are equal, and the cheap quote is rarely the cheap move. Seven questions that separate the pros from the problems.",
    cover: "/images/listings/house-09.jpg",
    body: PLACEHOLDER_BODY("the seven questions that protect you when hiring a local moving company"),
    placeholder: true,
  },
  {
    slug: "packing-101-pro-tips-organized-move",
    title: "Packing 101: Pro Tips and Hacks for a Faster, More Organized Move",
    date: "2025-09-12",
    excerpt:
      "Label systems, box strategy, and the one room you should pack last. Practical packing habits that make unpacking almost pleasant.",
    cover: "/images/listings/house-15.jpg",
    body: PLACEHOLDER_BODY("packing strategies that save time and prevent broken-box regrets on moving day"),
    placeholder: true,
  },
  {
    slug: "ultimate-moving-checklist-8-week-guide",
    title: "The Ultimate Moving Checklist: Your 8-Week Guide to a Stress-Free Move",
    date: "2025-09-12",
    excerpt:
      "Eight weeks out to moving day, week by week: utilities, schools, address changes, and everything people remember too late.",
    cover: "/images/listings/house-18.jpg",
    body: PLACEHOLDER_BODY("an eight-week countdown checklist that keeps a move on schedule"),
    placeholder: true,
  },
  {
    slug: "lower-energy-bills-9-efficiency-tips-ny",
    title: "Lower Your Energy Bills: 9 Efficiency Tips for New York Homeowners",
    date: "2025-09-12",
    excerpt:
      "Hudson Valley winters are no joke. Nine upgrades, from free habits to smart investments, that cut heating and cooling costs in New York homes.",
    cover: "/images/listings/house-07.jpg",
    body: PLACEHOLDER_BODY("nine energy-efficiency moves for New York homeowners, ranked by cost and payback"),
    placeholder: true,
  },
  {
    slug: "new-homeowners-toolkit-9-essentials",
    title: "The Ultimate New Homeowner's Toolkit: 9 Essentials Every Owner Needs",
    date: "2025-09-12",
    excerpt:
      "The nine tools that handle ninety percent of first-year homeowner jobs, and none of them are a table saw.",
    cover: "/images/listings/house-14.jpg",
    body: PLACEHOLDER_BODY("the starter toolkit every new homeowner should own before the first squeaky hinge"),
    placeholder: true,
  },
  {
    slug: "finishing-your-basement-cost-and-value",
    title: "Thinking of Finishing Your Basement? What to Know About Cost and Value",
    date: "2025-09-12",
    excerpt:
      "Costs per square foot, permits, moisture first, and what a finished basement really adds at resale in the Hudson Valley.",
    cover: "/images/listings/house-17.jpg",
    body: PLACEHOLDER_BODY("what finishing a basement costs in our market and how much value it actually returns"),
    placeholder: true,
  },

];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
