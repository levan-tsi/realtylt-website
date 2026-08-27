/** Blog content collection — seeded with the 10 live post titles (docs/reference/page-inventory.json).
 * BODIES ARE PLACEHOLDERS: owner supplies final articles from Drive (CHECKPOINT.md).
 * Adding a post = add an entry here; pages generate automatically. */

import type { FlagshipContent } from "@/lib/blog/flagship";
import type { ArticleFilm } from "@/lib/blog/types";
import type { Cluster } from "@/lib/blog/related";
import {
  AI_AGENT_WORKFORCE_POST,
  AI_APPOINTMENT_BOOKING_POST,
  AI_AUDIT_POST,
  CUSTOM_AUTOMATION_POST,
  AI_CLONE_POST,
  AI_SCHEDULING_POST,
  INVOICING_POST,
  AI_CHAT_ASSISTANT_POST,
  AI_VOICE_AGENTS_POST,
  CRM_SYNC_POST,
  DATABASE_REACTIVATION_POST,
  DATA_ENRICHMENT_POST,
  DOCUMENT_PROCESSING_POST,
  GEO_LANDING_PAGES_POST,
  LEAD_QUALIFICATION_POST,
  LOCAL_SEO_POST,
  MARKETING_AUTOMATION_POST,
  REVIEW_AUTOMATION_POST,
  SINGULARITY_POST,
  SKIP_TRACING_POST,
  WORKFLOW_AUTOMATION_POST,
} from "./ai-posts";
import { AUDIT_FLAGSHIP } from "./audit-scenes";
import { CUSTOM_FLAGSHIP } from "./custom-scenes";
import { CLONE_FLAGSHIP } from "./clone-scenes";
import { SCHEDULING_FLAGSHIP } from "./scheduling-scenes";
import { INVOICING_FLAGSHIP } from "./invoicing-scenes";
import { DATA_ENRICHMENT_FLAGSHIP } from "./enrichment-scenes";
import { DOCUMENT_PROCESSING_FLAGSHIP } from "./document-scenes";
import { MARKETING_AUTOMATION_FLAGSHIP } from "./marketing-automation-scenes";
import { SKIP_TRACING_FLAGSHIP } from "./skip-tracing-scenes";
import { AGENT_WORKFORCE_FLAGSHIP } from "./agent-workforce-scenes";
import { CRM_SYNC_FLAGSHIP } from "./crm-sync-scenes";
import { REVIEW_FLAGSHIP } from "./review-scenes";
import { BOOKING_FLAGSHIP } from "./booking-scenes";
import { LOCAL_SEO_FLAGSHIP } from "./local-seo-scenes";
import { GEO_PAGES_FLAGSHIP } from "./geo-pages-scenes";
import { AI_CHAT_FLAGSHIP, FILM } from "./ai-chat-scenes";
import { AI_VOICE_FLAGSHIP, VOICE_FILM } from "./voice-agent-scenes";
import { REACTIVATION_FILM, REACTIVATION_FLAGSHIP } from "./reactivation-scenes";
import { QUALIFY_FILM, QUALIFY_FLAGSHIP } from "./qualify-scenes";
import { WORKFLOW_FILM, WORKFLOW_FLAGSHIP } from "./workflow-scenes";
import { SINGULARITY_FLAGSHIP } from "./singularity-scenes";

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
  /** Which group of articles this one belongs with, for the "Keep reading" block at the foot
   * of the page. See lib/blog/related.ts for why one word per post beats deriving the block
   * from the posts' own links. */
  cluster?: Cluster;
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
  {
    slug: "the-singularity-self-improving-ai-system",
    cluster: "building",
    title: "The Answer Was Wrong in March. It Was Still Wrong in October.",
    date: "2026-08-27",
    /** NO `updated`, for the same reason every post shipped inside a single day carries none: a post written and shipped
     * inside one day has not been revised, and score-flagship's D5 wants dateModified later
     * than datePublished. Set it when the article takes its first real revision, never to
     * satisfy a gate. With the absent film (C3), this slug ships at 17/19 and both reds are
     * true statements about the page.
     *
     * ROUND 44 rewrote most of this post's argument on the day it was published, which is a
     * revision by any honest reading. It still gets no `updated`, because a date equal to the
     * published date is not a freshness signal, it is a gate being fed. The next revision on a
     * later day sets it. Excerpt and seoDescription DID change, because both described the
     * product the post no longer sells. */
    excerpt:
      "Nobody was careless. A common question got a slightly wrong answer in March and went on getting it until October, because reading a year of conversations is not a job anybody in a brokerage has. What a self improving system actually is, why a model that reviews its own work scores lower rather than higher, and what has to be standing outside one before it can be trusted to change real software.",
    seoDescription:
      "What a self improving AI system does: one shared memory, what it learns kept in files rather than a model, and code that ships only past tests and a person.",
    cover: "/images/editorial/ships-barograph.jpg",
    body: [],
    placeholder: false,
    markdown: SINGULARITY_POST,
    flagship: SINGULARITY_FLAGSHIP,
  },
  {
    slug: "custom-automation-real-estate-bespoke-build",
    cluster: "building",
    title: "It Ran Every Morning for Two Years. Then a Field Came Back With a New Word in It.",
    date: "2026-08-26",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47, on the field's own terms rather than the gate's. Published
     * 2026-08-26 and revised on 2026-08-27, when the relevance pass changed visitor copy in this
     * article; the change list is in docs/parity/ROUND45-RELEVANCE-PASS.md and, for the dek,
     * ROUND46. That is the first real revision this post has taken, which is exactly the
     * condition this field documents. D5 turning green is a consequence, not the reason: the
     * posts that were read that day and left unchanged still carry no `updated`. C3 stays red,
     * this topic has no film, so the slug ships at 18/19. */
    excerpt:
      "Nobody broke a promise. A new value arrived in a field, which was always allowed, and a chain that had run five hundred mornings quietly took the wrong branch for nine days. When a bespoke build is genuinely the right answer, what three named vendors actually promise you in writing, and the cost that begins on the day it works.",
    seoDescription:
      "When a custom automation is the right answer, what Google, Microsoft and Meta promise about changing their interfaces, and what a bespoke build costs after it works.",
    cover: "/images/editorial/jacquard-cards.jpg",
    body: [],
    placeholder: false,
    markdown: CUSTOM_AUTOMATION_POST,
    flagship: CUSTOM_FLAGSHIP,
  },
  {
    slug: "ai-audit-small-business-what-not-to-automate",
    cluster: "building",
    title: "You Had Eleven Ideas. The Hour Crossed Four of Them Off.",
    date: "2026-08-26",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-26, revised 2026-08-27 when the relevance
     * pass cut a clause from the Vrije Universiteit paragraph; see
     * docs/parity/ROUND45-RELEVANCE-PASS.md. First real revision, which is the condition this
     * field documents. C3 stays red, no film, so the slug ships at 18/19. */
    excerpt:
      "Anybody can write the list of things they would automate. The part worth paying for is knowing which ones to remove and being able to say why. The three questions that do the cutting, what a survey of 850,000 firms found about how far behind you really are, and why the most quoted project failure figure in the industry cannot be used.",
    seoDescription:
      "What an AI audit actually produces, the three questions that decide what not to automate, and why the industry's most quoted project failure rate cannot be used.",
    cover: "/images/editorial/switch-box.jpg",
    body: [],
    placeholder: false,
    markdown: AI_AUDIT_POST,
    flagship: AUDIT_FLAGSHIP,
  },
  {
    slug: "ai-clone-real-estate-agent-video-avatar",
    cluster: "visibility",
    title: "Fourteen Videos Went Out in Your Face. You Have Watched None of Them.",
    date: "2026-08-26",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-26, revised 2026-08-27 when the relevance
     * pass corrected the 16 CFR part 461 effective date and trimmed the section 50-f paragraph;
     * see docs/parity/ROUND45-RELEVANCE-PASS.md. First real revision. C3 stays red, no film, so
     * the slug ships at 18/19. */
    excerpt:
      "Fourteen statements were published in your name to fourteen people who now believe you said them. Whose face and voice a business may reproduce, why New York's oldest privacy statute makes the wrong version a misdemeanour, what happened when 315 people tried to tell synthetic faces from real ones, and the cost of a digital twin that nobody quotes.",
    seoDescription:
      "Whose likeness a real estate business may reproduce, what New York Civil Rights Law 50 and 50-f require, and what happened when 315 people tried to spot synthetic faces.",
    cover: "/images/editorial/victrola.jpg",
    body: [],
    placeholder: false,
    markdown: AI_CLONE_POST,
    flagship: CLONE_FLAGSHIP,
  },
  {
    slug: "invoicing-and-payments-real-estate-brokerage",
    cluster: "back-office",
    title: "The Referral Closed in July. Nobody Here Raised an Invoice.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 when the relevance
     * pass fixed which denominator the IC3 average loss hangs on; see
     * docs/parity/ROUND45-RELEVANCE-PASS.md. First real revision. C3 stays red, no film, so the
     * slug ships at 18/19. */
    excerpt:
      "There was no invoice sitting unpaid in anybody's system, because there was no invoice. What actually behaves like a receivable in a brokerage and what does not, the federal statute that decides who you may pay and be paid by, why the money that arrived on Monday is not yours until Thursday, and the one control that stops a diverted payment.",
    seoDescription:
      "What behaves like a receivable in a brokerage, what RESPA says about referral fees, and why money that arrived on Monday may not be yours until Thursday.",
    cover: "/images/editorial/register-keys.jpg",
    body: [],
    placeholder: false,
    markdown: INVOICING_POST,
    flagship: INVOICING_FLAGSHIP,
  },
  {
    slug: "ai-scheduling-real-estate-showing-confirmations",
    cluster: "appointments",
    title: "You Said It Was Confirmed. One of the Three People Had Not Replied.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 when the relevance
     * pass pointed the fine-tuning caveat at the right Microsoft Graph page and rewrote the
     * seo.description ending; see docs/parity/ROUND45-RELEVANCE-PASS.md and ROUND46. First real
     * revision. C3 stays red, no film, so the slug ships at 18/19. */
    excerpt:
      "The appointment was booked. It was booked by one of the three people whose agreement it needed, and that one was you. What a scheduling system can actually do when the calendars it needs belong to other people, why the standards already have a word for an appointment nobody has agreed to, and why moving the time throws every yes away.",
    seoDescription:
      "What a scheduling system can do when the calendars it needs belong to other people, and why moving an appointment resets every confirmation you had.",
    cover: "/images/editorial/clock-not-in-use.jpg",
    body: [],
    placeholder: false,
    markdown: AI_SCHEDULING_POST,
    flagship: SCHEDULING_FLAGSHIP,
  },
  {
    slug: "data-enrichment-real-estate-stale-contact-records",
    cluster: "records",
    title: "The Empty Fields Got Filled. So Did the Ones That Were Already Right.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 twice: round 46
     * reshaped the SHIELD refusal and the decay-rate FAQ, and round 47 put the decay-rate floor
     * back to twenty. See docs/parity/ROUND46-RELEVANCE-PASS.md and ROUND47. First real
     * revision. C3 stays red, no film, so the slug ships at 18/19. */
    excerpt:
      "Most of the blanks came back full, which is what you paid for. In one record the number a client gave you herself had been replaced, and nothing in the row said what was there before, where the new one came from, or when either was true. What an appended field actually asserts, why no honest decay rate exists, and the two columns that make all of it manageable.",
    seoDescription:
      "What real estate data enrichment actually appends, what the FTC found when it ordered nine data brokers to explain themselves, and why no honest data decay rate exists.",
    cover: "/images/editorial/ghost-signs-layered.jpg",
    body: [],
    placeholder: false,
    markdown: DATA_ENRICHMENT_POST,
    flagship: DATA_ENRICHMENT_FLAGSHIP,
  },
  {
    slug: "document-processing-real-estate-contract-deadlines",
    cluster: "back-office",
    title: "It Read the Date Correctly. The Date Was Not the Deadline.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 when the relevance
     * pass removed a duplicated sentence and quoted Regulation Z's State law governs commentary;
     * see docs/parity/ROUND46-RELEVANCE-PASS.md. First real revision. C3 stays red, no film, so
     * the slug ships at 18/19. */
    excerpt:
      "The rider arrived as a photograph taken over a kitchen table, with two handwritten changes and a date among them. Everything was read correctly and the answer was still wrong, because what a deadline counts from is not printed on the page. What was actually measured on real scanned forms, what a person scores on the same task, and the phrase one regulation defines twice.",
    seoDescription:
      "What AI document processing does with real estate contracts, what research measured on noisy scanned forms, and why a correct date can still be the wrong deadline.",
    cover: "/images/editorial/signature-ink.jpg",
    body: [],
    placeholder: false,
    markdown: DOCUMENT_PROCESSING_POST,
    flagship: DOCUMENT_PROCESSING_FLAGSHIP,
  },
  {
    slug: "marketing-automation-real-estate-email-deliverability",
    cluster: "records",
    title: "You Sent It to Fourteen Hundred People. Five Pressed One Button.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 twice: round 46 fixed
     * three misquotes and closed the cold open's loop, and round 47 moved the Yahoo gloss onto
     * that page's own word. See docs/parity/ROUND46-RELEVANCE-PASS.md and ROUND47. First real
     * revision. C3 stays red, no film, so the slug ships at 18/19. */
    excerpt:
      "The market note went out to fourteen hundred people and nobody complained. Five of them pressed the other button, and the next month's note reached fewer people for reasons nothing in your software will ever show you. What marketing automation actually decides on your behalf, the ceiling Google and Yahoo both publish, and why you cannot work out your own.",
    seoDescription:
      "What real estate marketing automation actually decides for you, what CAN-SPAM does and does not require, and the spam rate ceiling Google and Yahoo both publish.",
    cover: "/images/editorial/notice-board.jpg",
    body: [],
    placeholder: false,
    markdown: MARKETING_AUTOMATION_POST,
    flagship: MARKETING_AUTOMATION_FLAGSHIP,
  },
  {
    slug: "skip-tracing-real-estate-legal-owner-phone-numbers",
    cluster: "records",
    title: "You Have Her Number. She Never Gave It to You.",
    date: "2026-08-25",
    /** NO `updated`. Round 46 read this post in full and changed nothing in it, and round 47 left
     * it alone as well, so there has been no revision to date. Same reason as elsewhere: a post written and shipped
     * inside one day has not been revised, and score-flagship's D5 wants dateModified later
     * than datePublished. Set it when the article takes its first real revision, never to
     * satisfy a gate. With the absent film (C3), this slug ships at 17/19 and both reds are
     * true statements about the page. */
    excerpt:
      "She picked up, she was polite, and she asked the one question nobody in this trade can answer: where did you get this number? Two federal statutes ask it too, and they ask it of you rather than of the tool. What skip tracing actually is, what the law permits, and the four questions to put to a provider in writing.",
    seoDescription:
      "What skip tracing does in real estate, what the Driver's Privacy Protection Act and the Fair Credit Reporting Act actually say about it, and what to ask a provider.",
    cover: "/images/editorial/mailboxes-receding.jpg",
    body: [],
    placeholder: false,
    markdown: SKIP_TRACING_POST,
    flagship: SKIP_TRACING_FLAGSHIP,
  },
  {
    slug: "ai-agent-workforce-real-estate-assistants",
    cluster: "building",
    title: "Four Assistants Ran Overnight. Nobody Read What They Did.",
    date: "2026-08-25",
    /** NO `updated`. Rounds 46 and 47 both changed the scene file's provenance docstring for this
     * topic, which is a comment rather than copy, and left the article itself untouched. Same
     * reason as elsewhere: a post written and shipped
     * inside one day has not been revised, and score-flagship's D5 wants dateModified later
     * than datePublished. Set it when the article takes its first real revision, never to
     * satisfy a gate. With the absent film (C3), this slug ships at 17/19 and both reds are
     * true statements about the page. */
    excerpt:
      "Nine good mornings, and on the tenth an assistant confirmed a showing you had already moved. What an AI agent workforce actually is, why an assistant that is right most of the time is a different product from one that is right every time, where multi-agent systems really fail, and who is accountable when one of them is wrong.",
    seoDescription:
      "What an AI agent workforce does, why being right every time matters more than a single success rate, where multi-agent systems fail, and what supervising them costs.",
    cover: "/images/hero/hero-cand-bear-mountain.jpg",
    body: [],
    placeholder: false,
    markdown: AI_AGENT_WORKFORCE_POST,
    flagship: AGENT_WORKFORCE_FLAGSHIP,
  },
  {
    slug: "crm-sync-real-estate-duplicate-contact-records",
    cluster: "records",
    title: "She Is In Your CRM Twice. Only One of Them Knows She Sold.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 48. Published 2026-08-25, revised 2026-08-27: the sync-path
     * diagram heading still read "one record that is true", the unqualified claim round 47
     * removed twice from /services/crm-sync. It now reads as the diagram's own lede does, that
     * both systems agree on the record. See docs/parity/ROUND48-RELEVANCE-PASS.md. First real
     * revision. C3 stays red, no film, so the slug ships at 18/19. */
    excerpt:
      "Two contact records, one woman, and an automated email asking whether she is still thinking of selling three days before her closing. What a two-way CRM sync actually decides on your behalf, why the published model for matching records has three answers rather than two, and the one field in your setup that every duplicate you have ever had came from.",
    seoDescription:
      "What two-way CRM sync actually does about duplicate contacts, why record matching has three outcomes rather than two, and the four ways a sync quietly damages a record.",
    cover: "/images/listings/house-11.jpg",
    body: [],
    placeholder: false,
    markdown: CRM_SYNC_POST,
    flagship: CRM_SYNC_FLAGSHIP,
  },
  {
    slug: "geo-landing-pages-real-estate-doorway-pages",
    cluster: "visibility",
    title: "Nine Town Pages. The Only Thing That Changed Was the Town.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 when the relevance
     * pass restored the clause 24 CFR 100.70 actually hangs on to both places this post
     * summarises it; see docs/parity/ROUND47-RELEVANCE-PASS.md. First real revision. C3 stays
     * red, no film, so the slug ships at 18/19. */
    excerpt:
      "A page for every town you serve is the oldest tactic in local marketing, and Google's spam policy names it twice, once in an example that is about generative AI specifically. Where the line between a real area page and a doorway actually falls, how cheap sameness is to measure, and the fair housing rule nobody selling this will mention.",
    seoDescription:
      "What Google's spam policy actually says about location pages, what separates a real area page from a doorway, and the fair housing rules that govern advertising an area.",
    cover: "/images/counties/orange.jpg",
    body: [],
    placeholder: false,
    markdown: GEO_LANDING_PAGES_POST,
    flagship: GEO_PAGES_FLAGSHIP,
  },
  {
    slug: "local-seo-real-estate-map-pack-google-business-profile",
    cluster: "visibility",
    title: "Three Businesses Show Up. Yours Is Not One of Them.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27 when the relevance
     * pass restored the exception Google's own service-area guideline carries in its very next
     * sentence; see docs/parity/ROUND47-RELEVANCE-PASS.md. First real revision. C3 stays red, no
     * film, so the slug ships at 18/19. */
    excerpt:
      "Somebody nearby searched for an agent this week and picked from three names on a phone. Google publishes what decides that list, one of the three inputs is a fact about you that nothing can change, and the rules for whether you may even have a profile name this industry by name.",
    seoDescription:
      "What Google publishes about local ranking, the profile rules that name real estate agents specifically, and what an experiment found about paid search traffic.",
    cover: "/images/hero/hudson-olana.jpg",
    body: [],
    placeholder: false,
    markdown: LOCAL_SEO_POST,
    flagship: LOCAL_SEO_FLAGSHIP,
  },
  {
    slug: "ai-appointment-booking-no-shows-real-estate",
    cluster: "appointments",
    title: "You Booked the Showing for Nine Days Out. Nobody Came.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47. Published 2026-08-25, revised 2026-08-27: the limitation
     * paragraph on the Hangzhou reminder trial asserted the participants had paid for their
     * appointments, which the paper does not say anywhere. See
     * docs/parity/ROUND47-RELEVANCE-PASS.md. First real revision. C3 stays red, no film, so the
     * slug ships at 18/19. */
    excerpt:
      "You answered, you were pleasant, you agreed on a time that suited everybody, and nobody came. What AI appointment booking actually does about the gap between the ask and the day, what 51,529 appointments say about booking too far ahead, and the one reminder with a randomised trial behind it.",
    seoDescription:
      "What AI appointment booking does about no-shows, what 51,529 appointments say about lead time, and why a calendar invitation is not the same as a text message.",
    cover: "/images/counties/rockland.jpg",
    body: [],
    placeholder: false,
    markdown: AI_APPOINTMENT_BOOKING_POST,
    flagship: BOOKING_FLAGSHIP,
  },
  {
    slug: "automated-google-review-requests-real-estate",
    cluster: "visibility",
    title: "Twelve Five-Star Reviews. The Newest One Is From 2023.",
    date: "2026-08-25",
    updated: "2026-08-27",
    /** `updated` SET IN ROUND 47, which is the condition the note below always named: the first
     * real revision. Published 2026-08-25, revised 2026-08-27 when the relevance pass found the
     * survey's minimum-rating figure read backwards, as 68% for whom four stars was enough
     * rather than 68% whose floor is four. See docs/parity/ROUND47-RELEVANCE-PASS.md. C3 stays
     * red, no film, so the slug ships at 18/19.
     *
     * The rule the superseded note recorded still stands and is worth keeping: set `updated`
     * when the article takes its first real revision, never to satisfy a gate. */
    excerpt:
      "Twelve five-star reviews, the newest from 2023, and the client who never told you she looked. What review automation actually does, exactly where Google's line between asking and gating falls, and what one extra star was worth in the one study that measured money instead of opinion.",
    seoDescription:
      "What automated Google review requests do, where Google's policy draws the line on review gating, and the FTC rule that governs reviews on your own website.",
    cover: "/images/lifestyle/selling.jpg",
    body: [],
    placeholder: false,
    markdown: REVIEW_AUTOMATION_POST,
    flagship: REVIEW_FLAGSHIP,
  },
  /* ── The AI exemplars. Real articles, full markdown bodies, not stubs. They are the long
     form behind /services/ai-voice-agents, /services/ai-chat-assistant and
     /services/workflow-automation, and those pages link back to them. The first two are
     flagships: full-bleed scenes, cited data graphics and their own cold opens. */
  {
    slug: "ai-lead-qualification-real-estate-scoring",
    cluster: "answering",
    title: "All Three Leads Look the Same. Two Are Worth Your Morning.",
    date: "2026-07-31",
    /** Shipped 07-31 with NO `updated`, deliberately, because a post written and shipped inside
     * one day has not been revised and inventing a date would have been exactly the freshness
     * fiction this page argues against. The revision has now happened: on 08-02 it gained a
     * section on why auditing your inputs is not enough (built on HUD's April 2024 guidance on
     * algorithmic housing advertising, a source the post did not have), a section on what it
     * costs, a calculator in the reader's own numbers, and a rewritten close. Roughly 950 words
     * of it are new. The date below is a true statement about that.
     *
     * ROUND 48 moved it to 08-27 for the first full-text pass over this post. Two claims went:
     * "How urgent it was", which said the survey measured urgency when the graphic three lines
     * below correctly says sellers SAID it, and "Every scoring system in this business measures
     * the same three things, because they are the three that predict", a universal about a
     * market nobody here has surveyed. See docs/parity/ROUND48-RELEVANCE-PASS.md. */
    updated: "2026-08-27",
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
    cluster: "records",
    title: "They Said Not Right Now. That Was Three Years Ago.",
    /** Researched and drafted 07-30, finished and shipped 07-31. Both dates are real: this
     * session began on the 30th and the piece was rewritten and verified on the 31st. */
    date: "2026-07-30",
    /** 07-31: rewritten and verified. 08-02: gained a calculator whose every multiplier is the
     * reader's own, because no independent study of cold database response rates exists, plus a
     * rewritten legal preamble and close.
     *
     * ROUND 48 moved it to 08-27 for the first full-text pass over this post. Three claims went:
     * the sixteen thousand dollar figure, which is a 2016 FTC ceiling and is now $53,088 rather
     * than a live number; the revocation rule stated without the reasonable-person condition the
     * regulation actually attaches (the scene file had it right, the prose had dropped it); and
     * "three hundred conversations to find four people", a conversion rate this same post calls
     * made up two screens later. See docs/parity/ROUND48-RELEVANCE-PASS.md. */
    updated: "2026-08-27",
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
    cluster: "answering",
    title: "Nobody Leaves a Voicemail Anymore. They Call the Next Agent.",
    date: "2026-07-30",
    /** A real revision, not a freshness fiction: the all-party-consent paragraph asserted a
     * count of states that had not been checked against the statutes, and now says only what
     * was verified plus advice to check the caller's own state. Shipped 2026-07-31.
     *
     * 08-02: a second real revision. It gained a calculator, and its "what it does not do"
     * section was rewritten from scratch because it had been the chat post's with the synonyms
     * swapped, down to the same divorce sale and the same contingency question.
     *
     * ROUND 48 moved it to 08-27 for the first full-text pass over this post. Two claims were
     * softened to what the sources say: "Nobody has published a study of how fast real estate
     * agents answer their phones" became a statement about our own search, matching the house
     * form used at the decay-rate heading; and the turn-gap note claimed the gaze finding flatly
     * where PNAS reports it in nine of ten languages and significant in five. Every other figure
     * on this post re-verified against HBR, PNAS, FCC 24-17, NY Penal Law and California.
     * See docs/parity/ROUND48-RELEVANCE-PASS.md. */
    updated: "2026-08-27",
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
    cluster: "building",
    title: "The Busywork Tax: What Workflow Automation Actually Removes",
    date: "2026-07-13",
    /** A REAL revision, not a freshness fiction. Shipped 07-13 as a plain 1,200-word article; on
     * 08-01 it was rebuilt onto the flagship path with a cited field study, an original data
     * graphic, the rebuilt chain as a diagram, its own film, and two sections it never had (what
     * it costs, and what it does not do). Roughly half the sentences on the page are new.
     * 08-02: gained a calculator that counts the typing and deliberately leaves out the 25 min
     * 26 sec interruption cost, for the reason the article itself gives.
     *
     * ROUND 48 moved it to 08-27 for the first full-text pass over this post. The 25 min 26 sec
     * figure is conditional in the paper ("When people did resume work on the same day"), and
     * four surfaces stated it unconditionally while the scene docstring already knew better; the
     * condition is now on all of them. A "three lies" card also derived an afternoon from forty
     * minutes, and a superlative claimed the study was the clearest anybody has published. Every
     * other figure re-verified in the CHI 2005 paper, on Zapier's two help pages and in n8n's
     * error-handling docs. See docs/parity/ROUND48-RELEVANCE-PASS.md. */
    updated: "2026-08-27",
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
    film: WORKFLOW_FILM,
    flagship: WORKFLOW_FLAGSHIP,
  },
  {
    slug: "ai-chat-assistant-real-estate-website",
    cluster: "answering",
    title: "Your Website Answered That Buyer at 11:40pm. Did You?",
    date: "2026-07-12",
    /** 08-02: the largest revision this post has had. It had been resting on an unsourced "78%"
     * and carried one citation, which the voice post also used, so it effectively had no source
     * of its own. It now names that problem, rests on research it can show you, and gains three
     * primary sources plus four sections its own successors already had. 1,030 words to 3,313.
     *
     * ROUND 48: the first full-text pass over the standard-bearer, and it held. Two changes
     * only. The body carried a rendered typo, "with akeyboard", in a bold section lead. And this
     * excerpt opened on "Most home searching happens at night, on a phone, and most real estate
     * websites answer the next morning", two magnitude claims the article itself never makes and
     * cannot support, sitting in the dek of the post whose second section exists to say that a
     * number nobody can check is a slogan. Replaced with the article's own opening. The same
     * pair of claims was swept off /services/ai-chat-assistant. `updated` moves to 08-27 because
     * the served text changed, and the change is recorded here rather than dressed up as more
     * than it was. See docs/parity/ROUND48-RELEVANCE-PASS.md. */
    updated: "2026-08-27",
    excerpt:
      "Somebody read your listing at twenty to midnight with one question, and you answered at nine the next morning. What an AI chat assistant actually does in that gap, why the number this whole category is sold on cannot be sourced, and what to ask before you buy one.",
    seoDescription:
      "What an AI chat assistant does when a buyer messages your site at 11:40pm, why the 78% everyone quotes has no study behind it, and how to test one before you buy.",
    cover: "/images/lifestyle/buying.jpg",
    body: [],
    placeholder: false,
    markdown: AI_CHAT_ASSISTANT_POST,
    film: FILM,
    flagship: AI_CHAT_FLAGSHIP,
  },

  {
    slug: "top-5-renovations-increase-home-value-ny",
    cluster: "owning",
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
    cluster: "owning",
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
    cluster: "moving",
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
    cluster: "moving",
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
    cluster: "moving",
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
    cluster: "moving",
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
    cluster: "moving",
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
    cluster: "owning",
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
    cluster: "owning",
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
    cluster: "owning",
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
