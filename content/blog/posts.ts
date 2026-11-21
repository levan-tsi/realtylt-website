/** Blog content collection — seeded with the 10 live post titles (docs/reference/page-inventory.json).
 * BODIES ARE PLACEHOLDERS: owner supplies final articles from Drive (CHECKPOINT.md).
 * Adding a post = add an entry here; pages generate automatically. */

import type { FlagshipContent } from "@/lib/blog/flagship";
import type { Cluster } from "@/lib/blog/related";
import {
  BUYER_CLOSING_COSTS_POST,
  DOWN_PAYMENT_POST,
  FINAL_WALK_THROUGH_POST,
  FIRST_TIME_BUYER_CHECKLIST_POST,
  HOME_INSPECTION_POST,
  HOW_MUCH_HOUSE_POST,
  MORTGAGE_TYPES_POST,
  PRE_APPROVAL_POST,
  REAL_ESTATE_ATTORNEY_POST,
  WINNING_OFFER_POST,
} from "./real-estate-posts";
import {
  BEST_TOWNS_POST,
  BRRRR_POST,
  EXCHANGE_1031_POST,
  FIRST_RENTAL_POST,
  HOUSE_HACKING_POST,
  MULTI_VS_SINGLE_POST,
  PROPERTY_MANAGEMENT_POST,
  ROI_CAP_RATE_POST,
  STR_VS_LTR_POST,
  TENANT_SCREENING_POST,
} from "./investing-posts";
import {
  FSBO_VS_AGENT_POST,
  SELLER_DISCLOSURE_POST,
  SELLER_INSPECTION_PREP_POST,
  SELLER_MISTAKES_POST,
  SELLING_TIMELINE_POST,
} from "./seller-posts";
import { BASEMENT_POST, EIGHT_WEEK_POST, ENERGY_POST, MOVERS_POST, PACKING_POST, RELOCATING_POST, RENT_VS_BUY_POST, SEASONAL_MAINTENANCE_POST, TOOLKIT_POST, UNDER_1000_POST } from "./homeowner-posts";
import { SELLER_DISCLOSURE_FLAGSHIP } from "./seller-disclosure-scenes";

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
  /** <title> override, for search only. The `title` above is the H1 and the share-card headline
   * and it is a STORY line ("Nobody Leaves a Voicemail Anymore. They Call the Next Agent."): it
   * earns the click once it is seen, but it carries none of the words anybody types into a
   * search box, and the title tag is the strongest on-page signal a page sends. So the tag gets
   * the phrase the slug was already chosen for, in 60 characters or fewer, and the page keeps
   * its voice. scripts/seo-audit.mjs holds both halves: length, and at least three slug words.
   * Mirrors the DB path's `seo_title`. */
  seoTitle?: string;
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
  /** Scene payloads, for a markdown body that places [[scene:...]] markers. */
  flagship?: FlagshipContent;
  placeholder: boolean;
  /** Which group of articles this one belongs with, for the "Keep reading" block at the foot
   * of the page. See lib/blog/related.ts for why one word per post beats deriving the block
   * from the posts' own links. */
  cluster?: Cluster;
  /** Older URLs this article must still answer to, each permanently redirected here by
   * app/blog/[slug]/page.tsx. The reposted Drive articles carry the slugs the CRM's drip emails
   * have been linking since 2025 (docs/handoff/BLOG-REPOST-URLS-2026-09-24.md) and the slugs
   * the seeded stubs used. An alias is never also a live slug (lib/blog/aliases.test.ts). */
  aliases?: string[];
}

const PLACEHOLDER_BODY = (topic: string): string[] => [
  `[Placeholder draft. The owner's final article replaces this text.]`,
  `This post will cover ${topic} for Hudson Valley homeowners and buyers, written from local experience across Dutchess, Westchester, Putnam, Rockland, Ulster and Orange counties.`,
  `In the meantime, if this topic is on your mind, call us at (914) 415-7185 or send a message from any page, and we're happy to talk it through, seven days a week.`,
];

/* NOTE ON ORDER: this array is authored NEWEST-FIRST, and lib/blog's merge relies on the
   sort being stable so an empty blog_posts table reproduces exactly this ordering. A new
   post therefore goes at the TOP, not the bottom. */
/* 2026-09-24: the reposted consumer articles carry spread-out dates, so hand-keeping the array
   newest-first became error-prone. The array is now SORTED ON EXPORT (stable, newest first):
   entries already in order keep their exact order, ties keep authoring order, and an entry
   added anywhere lands where its date puts it. */
export const POSTS: BlogPost[] = ([
  {
    slug: "top-5-renovations-increase-home-value-ny",
    cluster: "owning",
    title: "The top 5 renovations that actually increase your homes value in New York",
    date: "2025-10-24",
    excerpt:
      "You watch the home improvement shows, you see the stunning transformations, but which projects actually pay you back at the closing table in New York?",
    cover: "/images/listings/house-16.jpg",
    body: PLACEHOLDER_BODY("the five renovations with the best resale return in New York, and the popular ones that don't pay back"),
    placeholder: true,
  },
  {
    slug: "high-roi-home-improvements-under-1000",
    cluster: "owning",
    title: "9 high-ROI home improvements you can tackle for under $1,000",
    seoTitle: "9 High-ROI Home Improvements Under $1,000 in New York",
    /** Homeownership #2, reposted 2026-09-24. Slug = the CRM drip link (day 36) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2026-03-25",
    updated: "2026-09-24",
    excerpt:
      "Nine small, visible updates that change how a home looks in photos and feels at a showing, with lead-safe painting and electrical safety points for older Hudson Valley houses.",
    seoDescription:
      "Nine high-ROI home improvements under $1,000: entry, paint, lighting, hardware, faucets, smart thermostat, grout, power washing, and lead-safe tips.",
    cover: "/images/listings/house-14.jpg",
    body: [],
    placeholder: false,
    markdown: UNDER_1000_POST,
    aliases: ["high-roi-improvements-under-1000"],
  },
  {
    slug: "seasonal-home-maintenance-checklist-hudson-valley",
    cluster: "owning",
    title: "Your essential seasonal home maintenance checklist for Hudson Valley homes",
    seoTitle: "Seasonal Home Maintenance Checklist for Hudson Valley Homes",
    /** Homeownership #1, reposted 2026-09-24. Slug = the CRM drip link (day 134) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2025-09-30",
    updated: "2026-09-24",
    excerpt:
      "Autumn, winter, spring and summer, task by task, for a Hudson Valley house, plus the year-round care that wells, septic systems and chimneys need.",
    seoDescription:
      "A seasonal home maintenance checklist for Hudson Valley homes: fall and winter prep, ice dams, spring repairs, summer ticks, and septic and well care.",
    cover: "/images/hero/hudson-olana.jpg",
    body: [],
    placeholder: false,
    markdown: SEASONAL_MAINTENANCE_POST,
    aliases: ["seasonal-home-maintenance-checklist"],
  },
  {
    slug: "hiring-property-management-company-hudson-valley",
    cluster: "investing",
    title: "The pros and cons of hiring a property management company in the Hudson Valley",
    seoTitle: "Hiring a Property Management Company in the Hudson Valley",
    /** Investing #10, reposted 2026-09-24. Slug = the CRM drip link (day 410) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2026-08-12",
    updated: "2026-09-24",
    excerpt:
      "What a manager does, what it costs, the New York rules it helps you get right (including Good Cause Eviction where it applies), and a checklist for deciding when to hire one.",
    seoDescription:
      "Hiring a property management company in the Hudson Valley: services, costs, NY licensing, notice and Good Cause Eviction rules, and when to hire one.",
    cover: "/images/editorial/office-stamps.jpg",
    body: [],
    placeholder: false,
    markdown: PROPERTY_MANAGEMENT_POST,
    aliases: ["pros-cons-hiring-property-management-company"],
  },
  {
    slug: "short-term-vs-long-term-rentals-hudson-valley",
    cluster: "investing",
    title: "Short-term vs. long-term rentals in the Hudson Valley: what's more profitable?",
    seoTitle: "Short-Term vs Long-Term Rentals in the Hudson Valley",
    /** Investing #9, reposted 2026-09-24. Slug = the CRM drip link (day 370) and the draft's. */
    date: "2026-06-24",
    updated: "2026-09-24",
    excerpt:
      "Revenue, true costs, workload and the rules that decide it: the 2025 state sales tax, county occupancy taxes, Kingston, Woodstock and Rhinebeck, and a worked break-even comparison.",
    seoDescription:
      "Short-term vs long-term rentals in the Hudson Valley: 2025 STR sales tax, county occupancy tax, Kingston and Woodstock rules and a worked profit comparison.",
    cover: "/images/counties/putnam.jpg",
    body: [],
    placeholder: false,
    markdown: STR_VS_LTR_POST,
  },
  {
    slug: "how-to-find-screen-tenants-ny",
    cluster: "investing",
    title: "Managing your first rental: a guide to finding and screening tenants in New York",
    seoTitle: "How to Find and Screen Tenants in New York: A 2026 Guide",
    /** Investing #8, reposted 2026-09-24. Slug = the CRM drip link (day 330). */
    date: "2026-04-22",
    updated: "2026-09-24",
    excerpt:
      "Written criteria, the $20 screening fee cap, housing court records, source of income, NYC's Fair Chance Housing Law, deposits, late fees and adverse action notices.",
    seoDescription:
      "How to find and screen tenants in New York lawfully: written criteria, the $20 fee cap, source of income rules, deposits, late fees and denial notices.",
    cover: "/images/editorial/index-drawers.jpg",
    body: [],
    placeholder: false,
    markdown: TENANT_SCREENING_POST,
  },
  {
    slug: "1031-exchange-rules-new-york",
    cluster: "investing",
    title: "A guide to the 1031 exchange in New York",
    seoTitle: "1031 Exchange Rules in New York: A 2026 Investor Guide",
    /** Investing #7, reposted 2026-09-24. Slug = the CRM drip link (day 316) and the draft's;
     * the drip doc's alternate redirects here. The H1 drops the draft's "(2025 Rules)". */
    date: "2026-02-25",
    updated: "2026-09-24",
    excerpt:
      "How a 1031 exchange defers federal and New York tax on the sale of an investment property: the 45- and 180-day deadlines, the intermediary, like-kind, boot, and a Hudson Valley example.",
    seoDescription:
      "1031 exchange rules in New York: the 45-day and 180-day deadlines, identification limits, the qualified intermediary, boot, and a Hudson Valley tax example.",
    cover: "/images/editorial/ledger-names.jpg",
    body: [],
    placeholder: false,
    markdown: EXCHANGE_1031_POST,
    aliases: ["understanding-1031-exchange-ny"],
  },
  {
    slug: "best-places-to-invest-hudson-valley",
    cluster: "investing",
    title: "Which Hudson Valley towns offer the best opportunities for real estate investors?",
    seoTitle: "Best Places to Invest in Real Estate in the Hudson Valley",
    /** Investing #6, reposted 2026-09-24. Slug = the CRM drip link (day 302) and the draft's;
     * the drip doc's alternate redirects here. The H1 drops the draft's "A 2025 Analyst Report". */
    date: "2026-05-06",
    updated: "2026-09-24",
    excerpt:
      "Match the town to the strategy: Poughkeepsie for cash flow, Beacon for appreciation, White Plains for stability, Kingston and Newburgh for growth, with 2026 HUD rent benchmarks and local rules.",
    seoDescription:
      "The best places to invest in real estate in the Hudson Valley by strategy: Poughkeepsie, Beacon, White Plains, Kingston and Newburgh, with 2026 rent data.",
    cover: "/images/counties/rockland.jpg",
    body: [],
    placeholder: false,
    markdown: BEST_TOWNS_POST,
    aliases: ["hudson-valley-towns-best-for-real-estate-investors"],
  },
  {
    slug: "brrrr-method-hudson-valley",
    cluster: "investing",
    title: "BRRRR method 101: how to build your real estate portfolio faster in NY",
    seoTitle: "BRRRR Method in the Hudson Valley, NY: 2026 Guide",
    /** Investing #5, reposted 2026-09-24. Slug = the CRM drip link (day 288) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2026-03-18",
    updated: "2026-09-24",
    excerpt:
      "Buy, rehab, rent, refinance, repeat: how BRRRR recycles capital, the 2026 cash-out refinance rules that govern it, and an honest Westchester example with its risks.",
    seoDescription:
      "The BRRRR method in the Hudson Valley, NY: the 70% rule, 2026 cash-out refinance limits and seasoning, a worked Westchester example and the real risks.",
    cover: "/images/editorial/tool-wall.jpg",
    body: [],
    placeholder: false,
    markdown: BRRRR_POST,
    aliases: ["brrrr-method-101-ny"],
  },
  {
    slug: "multi-family-vs-single-family-investing-ny",
    cluster: "investing",
    title: "The pros and cons of investing in multi-family vs. single-family homes",
    seoTitle: "Multi-Family vs Single-Family Investing in NY: Pros and Cons",
    /** Investing #4, reposted 2026-09-24. Slug = the CRM drip link (day 274) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2026-01-07",
    updated: "2026-09-24",
    excerpt:
      "Cash flow, vacancy risk, financing, management and resale compared, with a side-by-side single-family and duplex example at 2026 rates and what the Hudson Valley changes.",
    seoDescription:
      "Multi-family vs single-family investing in NY: financing, cash flow, vacancy, management and resale, with a side-by-side example at 2026 rates and costs.",
    cover: "/images/counties/ulster.jpg",
    body: [],
    placeholder: false,
    markdown: MULTI_VS_SINGLE_POST,
    aliases: ["pros-cons-investing-multi-family-vs-single-family"],
  },
  {
    slug: "calculate-roi-cap-rate-investment-property-ny",
    cluster: "investing",
    title: "How to calculate ROI & cap rate on investment property",
    seoTitle: "How to Calculate ROI and Cap Rate on NY Investment Property",
    /** Investing #3, reposted 2026-09-24. Slug = the CRM drip link (day 260) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2025-11-12",
    updated: "2026-09-24",
    excerpt:
      "Cap rate judges the property, cash-on-cash return judges your deal. The formulas step by step, and a worked Poughkeepsie duplex at 2026 rents and rates that shows why the math matters.",
    seoDescription:
      "How to calculate ROI and cap rate on an investment property in NY: NOI, cap rate and cash-on-cash formulas with a worked Poughkeepsie duplex at 2026 rates.",
    cover: "/images/editorial/adding-machine.jpg",
    body: [],
    placeholder: false,
    markdown: ROI_CAP_RATE_POST,
    aliases: ["how-to-calculate-roi-and-cap-rate"],
  },
  {
    slug: "house-hacking-hudson-valley-ny",
    cluster: "investing",
    title: "'House hacking' 101: how to live for free in the Hudson Valley",
    seoTitle: "House Hacking in the Hudson Valley, NY: A 2026 Guide",
    /** Investing #2, reposted 2026-09-24. Slug = the CRM drip link (day 246); the draft's own
     * Westchester slug and the drip doc's alternate redirect here. */
    date: "2025-10-15",
    updated: "2026-09-24",
    excerpt:
      "Buy a two- to four-family, live in one unit, rent the rest. The owner-occupant loans that make it work, the 2026 Westchester loan limits, real numbers at today's rates, and the risks.",
    seoDescription:
      "House hacking in the Hudson Valley, NY: 3.5% and 5% down owner-occupant loans, 2026 Westchester loan limits, worked examples at 2026 rates and the risks.",
    cover: "/images/counties/westchester.jpg",
    body: [],
    placeholder: false,
    markdown: HOUSE_HACKING_POST,
    aliases: ["house-hacking-westchester-county-ny", "house-hacking-101-hudson-valley"],
  },
  {
    slug: "how-to-buy-your-first-rental-property-in-the-hudson-valley",
    cluster: "investing",
    title: "How to buy your first rental property in the Hudson Valley (a step-by-step guide)",
    seoTitle: "How to Buy Your First Rental Property in the Hudson Valley",
    /** Investing #1, reposted 2026-09-24. Slug = the CRM drip link (day 232) and the draft's;
     * the drip doc's alternate redirects here. */
    date: "2025-09-25",
    updated: "2026-09-24",
    excerpt:
      "Financing, strategy, finding the property, a worked 2026 cash flow example, due diligence and becoming a landlord: the step-by-step plan for a first Hudson Valley rental.",
    seoDescription:
      "How to buy your first rental property in the Hudson Valley: investor loan rules, house hacking, 2026 rents and rates, a cash flow example and NY landlord rules.",
    cover: "/images/counties/orange.jpg",
    body: [],
    placeholder: false,
    markdown: FIRST_RENTAL_POST,
    aliases: ["beginners-guide-buying-first-rental-property"],
  },
  {
    slug: "fsbo-vs-agent-new-york-guide",
    cluster: "selling",
    title: "For sale by owner (FSBO) vs. using an agent: the pros and cons in New York",
    seoTitle: "FSBO vs Agent in New York: The Pros and Cons in 2026",
    /** Seller Education #9, reposted 2026-09-24. Slug = the CRM drip link (day 120) and the
     * draft's; the drip doc's alternate redirects here. */
    date: "2026-07-15",
    updated: "2026-09-24",
    excerpt:
      "What selling by owner really involves in New York: the 2025 NAR price data read honestly, the workload, the mandatory disclosure, the attorney you still need, and when FSBO fits.",
    seoDescription:
      "FSBO vs an agent in New York: NAR's 2025 price data, marketing, negotiation, the mandatory disclosure and attorney, and the one case where FSBO makes sense.",
    cover: "/images/listings/house-01.jpg",
    body: [],
    placeholder: false,
    markdown: FSBO_VS_AGENT_POST,
    aliases: ["fsbo-vs-using-agent-pros-cons-ny"],
  },
  {
    slug: "common-home-seller-mistakes-hudson-valley",
    cluster: "selling",
    title: "Common mistakes Hudson Valley home sellers make (and how to avoid them)",
    seoTitle: "Common Home Seller Mistakes in the Hudson Valley, NY",
    /** Seller Education #8, reposted 2026-09-24. Slug = the CRM drip link (day 106) and the
     * draft's; the drip doc's alternate redirects here. */
    date: "2026-02-02",
    updated: "2026-09-24",
    excerpt:
      "Overpricing, a poor first impression, weak photos, the septic, well and permit surprises specific to the Hudson Valley, and the 2024 disclosure change, with the fix for each.",
    seoDescription:
      "Common home seller mistakes in the Hudson Valley, NY: overpricing, weak photos, septic, well and permit surprises, disclosure errors, and how to avoid them.",
    cover: "/images/listings/house-08.jpg",
    body: [],
    placeholder: false,
    markdown: SELLER_MISTAKES_POST,
    aliases: ["common-mistakes-hudson-valley-home-sellers-make"],
  },
  {
    slug: "seller-guide-prepare-home-inspection",
    cluster: "selling",
    title: "Preparing for the home inspection: a seller's guide to a smooth process",
    seoTitle: "Seller's Guide to Prepare for a Home Inspection in NY",
    /** Seller Education #7, reposted 2026-09-24. Slug = the CRM drip link (day 190) and the
     * draft's; the drip doc's alternate redirects here. */
    date: "2026-06-10",
    updated: "2026-09-24",
    excerpt:
      "The easy fixes that keep an inspection report short, the septic, well, radon and permit paperwork Hudson Valley buyers ask for, and how to answer repair requests.",
    seoDescription:
      "A seller's guide to prepare for a home inspection in New York: easy fixes, septic, well and permit records, inspection day etiquette and repair negotiations.",
    cover: "/images/listings/house-09.jpg",
    body: [],
    placeholder: false,
    markdown: SELLER_INSPECTION_PREP_POST,
    aliases: ["preparing-for-home-inspection-sellers-guide"],
  },
  {
    slug: "seller-disclosure-requirements-new-york",
    cluster: "selling",
    title: "Seller disclosure in New York: the property condition disclosure statement in 2026",
    seoTitle: "NY property condition disclosure statement 2026 seller guide",
    /** Seller Education #10, reposted 2026-09-24. Slug = the CRM drip link (day 218) and the
     * draft's; the drip doc's alternate redirects here. ROUND 14 (2026-10-30): the refreshed post
     * from the agents' review chain, approved on his desk, built as a flagship with its data points
     * as scenes (content/blog/seller-disclosure-scenes.ts). */
    date: "2025-12-17",
    updated: "2026-10-30",
    excerpt:
      "Nearly every seller of a one- to four-family home in New York now completes the property condition disclosure statement. What the current form asks, its 56 questions by section, who is exempt, the 2025 septic change, the bill pending in 2026, the federal lead paint rule, and how to answer from what a seller actually knows.",
    seoDescription:
      "The NY property condition disclosure statement in 2026: the current form, its 56 questions by section, who is exempt, the lead paint rule and seller liability.",
    cover: "/images/editorial/signature-ink.jpg",
    body: [],
    placeholder: false,
    markdown: SELLER_DISCLOSURE_POST,
    flagship: SELLER_DISCLOSURE_FLAGSHIP,
    aliases: ["seller-disclosures-in-new-york"],
  },
  {
    slug: "timeline-selling-a-house-ny",
    cluster: "selling",
    title: "From listing to closing: a step-by-step timeline for selling your home",
    seoTitle: "Timeline for Selling a House in NY, from Listing to Closing",
    /** Seller Education #6, reposted 2026-09-24. Slug = the CRM drip link (day 92) and the
     * draft's; the old site's title slug redirects here. */
    date: "2026-03-05",
    updated: "2026-09-24",
    excerpt:
      "Every phase of a New York home sale, from pricing and the disclosure form to the attorneys' contract, the buyer's inspection and appraisal, and closing day.",
    seoDescription:
      "The timeline for selling a house in New York: preparation, listing, the attorney contract stage, inspection, appraisal and closing, with 2026 disclosure rules.",
    cover: "/images/lifestyle/selling.jpg",
    body: [],
    placeholder: false,
    markdown: SELLING_TIMELINE_POST,
    aliases: ["from-listing-to-closing-a-step-by-step-timeline-for-selling-your-home", "listing-to-closing-timeline-selling-home"],
  },
  {
    slug: "final-walk-through-checklist",
    cluster: "buying",
    title: "The final walk-through: your last chance checklist before closing",
    seoTitle: "Final Walk-Through Checklist Before Closing in New York",
    /** Buyer Education #10, reposted 2026-09-24. Slug = the drip doc's link; the draft's longer
     * slug redirects here. */
    date: "2026-05-21",
    updated: "2026-09-24",
    excerpt:
      "What to test, room by room, in the last visit before closing, what \"broom clean\" means, and the calm three-step plan if something is wrong.",
    seoDescription:
      "A final walk-through checklist for New York home buyers: systems, appliances, repairs, inclusions, broom clean, and what to do if you find a problem.",
    cover: "/images/listings/house-11.jpg",
    body: [],
    placeholder: false,
    markdown: FINAL_WALK_THROUGH_POST,
    aliases: ["final-walk-through-checklist-before-closing"],
  },
  {
    slug: "home-inspection-checklist-hudson-valley-ny",
    cluster: "buying",
    title: "The ultimate home inspection checklist: 9 critical things you can't overlook",
    seoTitle: "Home Inspection Checklist for Hudson Valley, NY Buyers",
    /** Buyer Education #5, reposted 2026-09-24 at the draft's own slug. */
    date: "2026-02-19",
    updated: "2026-09-24",
    excerpt:
      "Nine areas to watch in a New York home inspection, from stone foundations and ice dams to wells, septic systems and buried oil tanks, and how to sort the report.",
    seoDescription:
      "A home inspection checklist for Hudson Valley, NY buyers: foundations, roofs, wiring, lead and radon, wells, septic and buried oil tanks, and deal breakers.",
    cover: "/images/listings/house-05.jpg",
    body: [],
    placeholder: false,
    markdown: HOME_INSPECTION_POST,
    aliases: ["home-inspection-checklist-ny"],
  },
  {
    slug: "buyer-closing-costs-new-york",
    cluster: "buying",
    title: "What are buyer's closing costs in New York? A complete, no-surprise breakdown",
    seoTitle: "Buyer Closing Costs in New York: A 2026 Breakdown",
    /** Buyer Education #4, reposted 2026-09-24 at the draft's own slug. */
    date: "2025-12-03",
    updated: "2026-09-24",
    excerpt:
      "Every line a New York buyer pays at closing, including the mortgage recording tax and the mansion tax, who pays the agents since 2024, and four ways to lower the total.",
    seoDescription:
      "Buyer closing costs in New York, line by line: lender fees, the mortgage recording tax, the mansion tax, title, escrow and how to lower the total in 2026.",
    cover: "/images/listings/house-04.jpg",
    body: [],
    placeholder: false,
    markdown: BUYER_CLOSING_COSTS_POST,
  },
  {
    slug: "mortgage-pre-approval-requirements-ny",
    cluster: "buying",
    title: "Getting pre-approved for a mortgage: what lenders are looking for",
    seoTitle: "Mortgage Pre-Approval Requirements in NY: A 2026 Guide",
    /** Buyer Education #3, reposted 2026-09-24 at the draft's own slug. The draft's "in 2025-26"
     * was dropped from the H1: the page says 2026 where a figure is dated. */
    date: "2026-01-14",
    updated: "2026-09-24",
    excerpt:
      "What lenders check before they put a number in writing: credit, debt-to-income, income and assets, with the documents to gather and how to make your letter count with sellers.",
    seoDescription:
      "Mortgage pre-approval requirements in New York for 2026: credit scores, debt-to-income limits, income and asset rules, and the documents lenders ask for.",
    cover: "/images/listings/house-02.jpg",
    body: [],
    placeholder: false,
    markdown: PRE_APPROVAL_POST,
  },
  {
    slug: "down-payment-hudson-valley-ny",
    cluster: "buying",
    title: "How much do you really need for a down payment in the Hudson Valley, NY?",
    seoTitle: "Down Payment in the Hudson Valley, NY: What You Need in 2026",
    /** Buyer Education #2, reposted 2026-09-24 at the draft's own slug. */
    date: "2025-11-06",
    updated: "2026-09-24",
    excerpt:
      "Twenty percent down is not a rule. The 3.5%, 3% and 0% loan programs, the 2026 assistance that can cover part of the rest, and the real dollar amounts on a $450,000 home.",
    seoDescription:
      "How much down payment you need in the Hudson Valley, NY: FHA, conventional, VA and USDA minimums, 2026 assistance programs, and the dollars on a real example.",
    cover: "/images/listings/house-13.jpg",
    body: [],
    placeholder: false,
    markdown: DOWN_PAYMENT_POST,
  },
  {
    slug: "winning-offer-competitive-market-ny-hudson-valley",
    cluster: "buying",
    title: "How to make a winning offer in the NY Hudson Valley's competitive market",
    seoTitle: "How to Make a Winning Offer in a Competitive NY Market",
    /** Buyer Education #6, reposted 2026-09-24. Slug = the CRM drip link (day 650) and the
     * draft's; the old site's title-derived slug and the drip doc's alternate redirect here. */
    date: "2026-04-08",
    updated: "2026-09-24",
    excerpt:
      "In a multiple-offer situation the strongest offer is often not the highest. Price from the comps, escalation clauses, narrower contingencies, the deposit and the terms that win.",
    seoDescription:
      "How to make a winning offer in a competitive New York market: pricing from comps, escalation clauses, appraisal gaps, safer inspection terms and deposits.",
    cover: "/images/listings/house-06.jpg",
    body: [],
    placeholder: false,
    markdown: WINNING_OFFER_POST,
    aliases: [
      "how-to-make-winning-offer-ny",
      "how-to-make-a-winning-offer-in-the-ny-hudson-valleys-competitive-market",
    ],
  },
  {
    slug: "why-you-need-real-estate-attorney-ny",
    cluster: "buying",
    title: "Why you need a real estate attorney in New York (and what they do)",
    seoTitle: "Why You Need a Real Estate Attorney in NY, and What They Do",
    /** Buyer Education #9, reposted 2026-09-24. Slug = the CRM drip link (day 530) and the draft's. */
    date: "2025-10-02",
    updated: "2026-09-24",
    excerpt:
      "Why nearly every New York home sale has an attorney on each side, what yours does from the accepted offer to the closing table, and how to choose one.",
    seoDescription:
      "Do you need a real estate attorney in New York? What buyer and seller attorneys do, why an accepted offer is not yet a contract, and how to choose one.",
    cover: "/images/editorial/deed-1825.jpg",
    body: [],
    placeholder: false,
    markdown: REAL_ESTATE_ATTORNEY_POST,
  },
  {
    slug: "how-much-house-can-i-afford-ny-guide",
    cluster: "buying",
    title: "\"How much house can I afford?\" A simple guide to calculating your real budget",
    seoTitle: "How Much House Can I Afford in NY? A 2026 Budget Guide",
    /** Buyer Education #8, reposted 2026-09-24. Slug = the CRM drip link (day 490) and the draft's. */
    date: "2026-01-29",
    updated: "2026-09-24",
    excerpt:
      "The simple math lenders use, worked through with a Hudson Valley example at September 2026 rates, and the costs their calculation leaves out.",
    seoDescription:
      "How much house can I afford in New York? The 28/36 rule, a worked Hudson Valley example at 2026 mortgage rates, and the costs a lender's math leaves out.",
    cover: "/images/listings/house-10.jpg",
    body: [],
    placeholder: false,
    markdown: HOW_MUCH_HOUSE_POST,
    aliases: ["how-much-house-can-i-afford"],
  },
  {
    slug: "fha-va-conventional-mortgage-loans-ny",
    cluster: "buying",
    title: "Understanding different mortgages: FHA, VA, and conventional loans explained",
    seoTitle: "FHA vs VA vs Conventional Loans in NY: A 2026 Guide",
    /** Buyer Education #7, reposted 2026-09-24. Slug = the CRM drip link and the draft's own. */
    date: "2025-11-20",
    updated: "2026-09-24",
    excerpt:
      "Conventional, FHA or VA: what each asks of you, what each costs over time, and how the 2026 loan limits play out in Westchester, Dutchess and the rest of the Hudson Valley.",
    seoDescription:
      "FHA, VA and conventional loans explained for New York buyers: down payments, credit, PMI vs MIP, the VA funding fee and the 2026 Hudson Valley loan limits.",
    cover: "/images/lifestyle/financing.jpg",
    body: [],
    placeholder: false,
    markdown: MORTGAGE_TYPES_POST,
    aliases: ["understanding-mortgages-fha-va-conventional"],
  },
  {
    slug: "first-time-home-buyer-ny-10-step-checklist",
    cluster: "buying",
    title: "First-time home buyer in NY? Here's your 10-step checklist from start to finish",
    seoTitle: "First-Time Home Buyer NY Checklist: 10 Steps for 2026",
    /** Reposted from the Drive draft (Buyer Education #1) and re-verified 2026-09-24. The date
     * is the one this stub carried from the old site's post list; see
     * docs/handoff/BLOG-REPOST-URLS-2026-09-24.md. The draft's own slug is kept as an alias. */
    date: "2025-10-24",
    updated: "2026-09-24",
    excerpt:
      "From the first look at your credit to the day you get the keys: the ten steps every first-time buyer in New York walks through, with the 2026 SONYMA, HomeFirst and bank program figures.",
    seoDescription:
      "A first-time home buyer checklist for New York: credit, pre-approval, SONYMA and NYC HomeFirst aid, the attorney, inspections and closing, updated for 2026.",
    cover: "/images/listings/house-03.jpg",
    body: [],
    placeholder: false,
    markdown: FIRST_TIME_BUYER_CHECKLIST_POST,
    aliases: ["first-time-home-buyer-checklist-ny"],
  },
  {
    slug: "rent-vs-buy-hudson-valley-ny",
    cluster: "moving",
    title: "Moving to the Hudson Valley: rental vs. buying, and what makes the most sense",
    seoTitle: "Rent vs. Buy in the Hudson Valley, NY: How to Decide",
    /** Moving #5 (moving folder done), reposted 2026-09-24. Slug = the CRM drip link and the draft's; the
     * stub's slug redirects here. Dated 2025-11-26 (the stub's 2025-09-13 went to the relocating post). */
    date: "2025-11-26",
    updated: "2026-09-24",
    excerpt:
      "Renting first versus buying now in the Hudson Valley: the case for each, a worked monthly comparison at today's mortgage rate, the five-year rule and four questions that settle it.",
    seoDescription:
      "Rent vs. buy in the Hudson Valley, NY: the case for each, a monthly cost example at the current 30-year rate, the five-year rule, and the questions to decide.",
    cover: "/images/listings/house-12.jpg",
    body: [],
    placeholder: false,
    markdown: RENT_VS_BUY_POST,
    aliases: ["moving-to-hudson-valley-rental-vs-buying", "hudson-valley-rental-vs-buying"],
  },
  {
    slug: "relocating-to-hudson-valley-ny-guide",
    cluster: "moving",
    title: "Relocating to the Hudson Valley: a newcomer's guide to small-town charm and big-city access",
    seoTitle: "Relocating to the Hudson Valley: A Newcomer's Guide",
    /** Moving #4, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the stub's slug redirects
     * here. The stub's date (2025-09-13) carries over. */
    date: "2025-09-13",
    updated: "2026-09-24",
    excerpt:
      "What life in the Hudson Valley is really like: the towns, Metro-North and the drive, the counties at a glance, and the car, winter, well and septic realities newcomers meet.",
    seoDescription:
      "Relocating to the Hudson Valley from NYC: the towns, Metro-North commute times and fares, a guide to the counties, and the car, winter, well and septic basics.",
    cover: "/images/counties/dutchess.jpg",
    body: [],
    placeholder: false,
    markdown: RELOCATING_POST,
    aliases: ["relocating-to-hudson-valley-newcomers-guide", "relocating-to-hudson-valley"],
  },
  {
    slug: "how-to-hire-local-movers-ny",
    cluster: "moving",
    title: "How to hire the best local movers: 7 questions you must ask before signing",
    seoTitle: "How to Hire Local Movers in NY: 7 Questions to Ask",
    /** Moving, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the stub's slug redirects
     * here. Dated 2025-10-22. */
    date: "2025-10-22",
    updated: "2026-09-24",
    excerpt:
      "Seven questions that separate a licensed, accountable mover from a problem, with New York's own rules on licenses, estimates, valuation coverage and damage claims.",
    seoDescription:
      "How to hire local movers in New York: 7 questions to ask, how to verify a NYSDOT or USDOT license, binding estimates, valuation coverage and damage claims.",
    cover: "/images/listings/house-09.jpg",
    body: [],
    placeholder: false,
    markdown: MOVERS_POST,
    aliases: ["how-to-hire-best-local-movers-7-questions", "how-to-hire-best-local-movers"],
  },
  {
    slug: "packing-tips-hacks-for-moving",
    cluster: "moving",
    title: "Packing 101: pro tips and hacks for a faster, more organized move",
    seoTitle: "Packing Tips for Moving: 10 Hacks for a Faster Move",
    /** Moving #3, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the stub's slug redirects
     * here. Dated 2026-05-13, ahead of the summer moving season. */
    date: "2026-05-13",
    updated: "2026-09-24",
    excerpt:
      "Ten packing hacks that save hours, a first-night box checklist, and what New York says should never go on the moving truck, from propane to untreated firewood.",
    seoDescription:
      "Packing tips for moving: 10 hacks that save time, a first-night box checklist, and what not to pack under New York rules, from propane to untreated firewood.",
    cover: "/images/listings/house-15.jpg",
    body: [],
    placeholder: false,
    markdown: PACKING_POST,
    aliases: ["packing-101-pro-tips-organized-move", "packing-101-pro-tips-hacks"],
  },
  {
    slug: "ultimate-8-week-moving-checklist",
    cluster: "moving",
    title: "The ultimate moving checklist: your 8-week guide to a stress-free move",
    seoTitle: "The Ultimate 8-Week Moving Checklist: A Stress-Free Plan",
    /** Moving #1, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the stub's slug redirects
     * here. Dated 2025-09-19 (the stub's 2025-09-12 now belongs to the basement post). */
    date: "2025-09-19",
    updated: "2026-09-24",
    excerpt:
      "Eight weeks to moving day, week by week: choosing a licensed mover, packing, the change of address, utilities, and the New York DMV deadlines people remember too late.",
    seoDescription:
      "An 8-week moving checklist, week by week: hire a licensed mover, pack, change your address with USPS and the NY DMV, set up utilities, and plan moving day.",
    cover: "/images/listings/house-18.jpg",
    body: [],
    placeholder: false,
    markdown: EIGHT_WEEK_POST,
    aliases: ["ultimate-moving-checklist-8-week-guide"],
  },
  {
    slug: "lower-energy-bills-new-york-homeowners",
    cluster: "owning",
    title: "Lower your energy bills: 9 efficiency tips for New York homeowners",
    seoTitle: "Lower Energy Bills in New York: 9 Tips for Homeowners",
    /** Homeownership #5, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the stub's slug
     * redirects here. Dated 2025-10-08 (the stub's 2025-09-12 now belongs to the basement post). */
    date: "2025-10-08",
    updated: "2026-09-24",
    excerpt:
      "Nine ways to cut heating and cooling costs in a New York home, from free thermostat and water heater settings to insulation, plus the NYSERDA programs that help pay for it.",
    seoDescription:
      "Nine ways to lower energy bills in New York: thermostat and water heater settings, air sealing, insulation, ENERGY STAR, and NYSERDA assessments and rebates.",
    cover: "/images/listings/house-07.jpg",
    body: [],
    placeholder: false,
    markdown: ENERGY_POST,
    aliases: ["lower-energy-bills-9-efficiency-tips-ny", "lower-energy-bills-ny"],
  },
  {
    slug: "new-homeowner-toolkit-essentials",
    cluster: "owning",
    title: "The ultimate new homeowner's toolkit: 9 essentials every owner needs",
    seoTitle: "The New Homeowner Toolkit: 9 Essentials Every Owner Needs",
    /** Homeownership #4, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the stub's slug
     * redirects here. Dated 2025-09-17 (the stub's 2025-09-12 now belongs to the basement post). */
    date: "2025-09-17",
    updated: "2026-09-24",
    excerpt:
      "Nine versatile tools that cover most first-year jobs, a bonus tool for drafty older houses, and the safety checks every new owner should make in the first week.",
    seoDescription:
      "New homeowner toolkit essentials: the 9 tools for most first-year repairs, a caulking gun for drafty older homes, and New York smoke, CO and 811 basics.",
    cover: "/images/editorial/tool-wall.jpg",
    body: [],
    placeholder: false,
    markdown: TOOLKIT_POST,
    aliases: ["new-homeowners-toolkit-9-essentials", "new-homeowner-toolkit"],
  },
  {
    slug: "cost-vs-value-finishing-basement-hudson-valley",
    cluster: "owning",
    title: "Thinking of finishing your basement? What to know about cost and value",
    seoTitle: "Finishing a Basement in the Hudson Valley: Cost and Value",
    /** Homeownership #3, reposted 2026-09-24. Slug = the CRM drip link and the draft's; the
     * stub's slug and date (2025-09-12) carry over, and the stub slug redirects here. */
    date: "2025-09-12",
    updated: "2026-09-24",
    excerpt:
      "What finishing a basement costs, what it adds at resale, how appraisers treat below-grade space, and the water, radon, egress and permit checks to do first.",
    seoDescription:
      "What it costs to finish a basement in the Hudson Valley, what it adds at resale (about 71% recouped), and the appraisal, egress, radon and permit rules.",
    cover: "/images/listings/house-17.jpg",
    body: [],
    placeholder: false,
    markdown: BASEMENT_POST,
    aliases: ["finishing-your-basement-cost-and-value", "finishing-your-basement-cost-value"],
  },

] as BlogPost[]).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
