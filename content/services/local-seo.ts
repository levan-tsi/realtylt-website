import type { Service } from "./types";

/** COPY key `localseo` on realtylt.com/ai. Deep link: /ai#localseo
 *
 * REWRITTEN 2026-08-25 (Round C) against Google's own ranking page; "the agent they call is
 * usually the one they find first" and directory citations as a named ranking factor are gone
 * and stay gone.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a plumber, a dental or accounting
 * office, a salon or gym, a real estate office as ONE example), on the owners' phrases "how to
 * rank in google maps" and "google business profile optimization" (keyword map). Re-read
 * 2026-11-11 and saved in realtylt-agents company/agents/seo/runs/r28-services/sources/localseo/:
 * Google's "Tips to improve your local ranking" (support.google.com/business/answer/7091: "There's
 * no way to request or pay for a better local ranking"; "Local results are mainly based on
 * relevance, distance, and popularity"; under Prominence, "how many websites link to your business
 * and how many reviews you have"), the profile guidelines (answer/3038177: a service area
 * "shouldn't extend farther than about 2 hours of driving time", larger "may be appropriate"), and
 * Blake, Nosko and Tadelis, NBER w20171 (eBay's field experiments: brand-keyword ads had "no
 * measurable short-term benefits"). Note: Google's page says "popularity" in its summary and
 * "Prominence" as its heading; the page quotes both as written. */
export const localSeo: Service = {
  slug: "local-seo",
  aiKey: "localseo",
  name: "Local SEO",
  tier: "more",

  eyebrow: "Local SEO · Get found nearby",
  title: "How to rank in Google Maps: the profile, the reviews, the pages",
  lede: "Somebody nearby searches “plumber near me”, three businesses show up on the map, and the one with the half-finished profile is not one of them. We fix and keep current the business's Google profile, its details wherever they appear, the reviews that come in and a real page for each place and service it covers, so it competes for those three spots on the searches local customers actually type.",
  specs: ["Google Business Profile", "map and local ranking", "details kept current", "a page per town and service"],
  why: "A nearby search shows three businesses above everything else. Google publishes what decides that order: relevance, distance and popularity. Two of the three are work a business can do, and that work keeps adding up after a budget stops, which a paid click never does.",
  keywords: [
    "how to rank in google maps",
    "google business profile optimization",
    "local seo for small business",
    "is seo worth it for small business",
    "local seo for real estate agents",
  ],

  seo: {
    title: "Local SEO for small business: rank in Google Maps",
    description:
      "Local SEO for a small business: the Google profile fixed and kept current, reviews and links that Google names, and a real page for each town and service covered.",
  },

  /** A number in 96-point type is the most quoted thing on the page, so it carries its
   * derivation. Google's own ranking page, quoted: "Local results are mainly based on relevance,
   * distance, and popularity." */
  stat: {
    value: "3",
    label: "inputs Google names for local results, and one of them is how far away the business is",
    source: {
      text: "Google Business Profile Help, Tips to improve your local ranking on Google. The same page states there is no way to request or pay for a better local ranking, and publishes no weights.",
      href: "https://support.google.com/business/answer/7091",
    },
  },

  figure: {
    kind: "flow",
    caption: "What actually moves a business up the map",
    trigger: "Somebody nearby searches “plumber near me”",
    nodes: [
      { label: "The profile", note: "Categories, service area, hours and photos, correct and current." },
      { label: "The links", note: "Other people's websites mentioning the business, which Google's page names under prominence." },
      { label: "The reviews", note: "The other thing that page names, and the one that only arrives if someone asks." },
      { label: "The pages", note: "A real page for each town and each service, not one page listing all of them." },
    ],
    footnote: "There is no way to request or pay for a better local ranking, in Google's own words. What is left is the work.",
  },

  whatItIs: [
    "It is the work that decides whether a business appears when someone nearby searches for what it does. Most of it is unglamorous: a Google Business Profile with the right categories and service area, details that agree with each other wherever they appear, a steady flow of reviews, and a real page for each place and each service the business covers.",
    "We keep that maintenance current, which is the part that fails in practice. A profile is at its most accurate on the day someone fills it in. Hours change. A service stops. A number moves. None of those events tell the listing about themselves.",
    "It fits any business customers find by searching nearby: a plumber, roofer or landscaper, a dental or accounting office, a salon, spa or gym, a real estate office. It matters most where people search for the service rather than for the business's name, which is how a new customer who has never heard of it searches.",
  ],

  howItWorks: [
    {
      title: "Fix the profile properly",
      body: "Categories, service area, hours and photos, correct and complete. Google's own advice for the relevance half is to provide complete and detailed business info. There is no trick hiding inside that instruction.",
    },
    {
      title: "Feed the two things Google names",
      body: "Reviews, and other people's websites mentioning the business. Those are the two the ranking page lists under prominence. Neither can be bought without buying a problem.",
    },
    {
      title: "A real page for each town and service",
      body: "One page that lists eight towns in a sentence belongs to none of them. A page written about the work done in one place, with its own photos and its own questions, has something to compete with.",
    },
    {
      title: "Keep it true, and read the report",
      body: "Details corrected wherever they appear, and the profile's own performance screen read every month: calls, direction requests and the searches the business was shown for. The owner gets the three numbers and what changed.",
    },
  ],

  handoff: {
    provides: [
      "Manager access to the business's Google profile, which stays in the business's name.",
      "The real service area, hours, services and photos of real work.",
      "The towns and services worth a page, and what was actually done there.",
      "Customers to ask for reviews, through the review requests or by hand.",
    ],
    approves: [
      "Every change to the profile before it is published.",
      "Every page before it goes live, word for word.",
      "Every reply to a review posted in the business's name.",
      "Whether to spend on ads alongside it, which is the owner's call.",
    ],
  },

  useCases: [
    {
      title: "The three spots on the map",
      body: "The three results above everything else. They appear on the search a stranger runs when they do not know the business's name. It is the one position that keeps working after a budget stops.",
    },
    {
      title: "A plumber or roofer with a wide service area",
      body: "The profile's service area is set to where the business really works, and each town that matters gets an ordinary page about the jobs done there, rather than one page that lists them all.",
    },
    {
      title: "A dental or accounting office with good reviews and a weak profile",
      body: "Five-star reviews do not lift a profile with the wrong category, missing hours and no photos. Fixing the relevance half is the first afternoon of the work, and it changes what a searcher sees that day.",
    },
    {
      title: "A salon, gym or real estate office in a crowded town",
      body: "When ten businesses are equally close, prominence decides more of the order: the reviews and the other websites that mention the business. That is steady work rather than a single fix.",
    },
    {
      title: "Traffic that is not rented",
      body: "Paid clicks stop when the payments stop. A local ranking keeps working, and the work behind it keeps adding up.",
    },
  ],

  limits: [
    "It does not buy a position. Google's own page says there is no way to request or pay for a better local ranking, so anyone promising one is selling something that does not exist.",
    "It does not move a business closer to anybody. Distance is one of the three inputs Google publishes, and it is a physical fact about the address. That is why a business on one edge of a county loses searches on the other edge.",
    "It does not replace ads while it is still arriving. A ranking keeps paying after the spending stops, and until it exists it is delivering nothing.",
    "It does not manufacture reviews. Reviews are one of the two things Google's ranking page names under prominence. They cannot be bought without breaking policy. Getting them means asking every customer, which is review requests rather than this.",
    "It does not stay done. A profile is at its most accurate the day it is filled in. A listing nobody maintains becomes wrong quietly, and in public.",
  ],

  faqs: [
    {
      q: "How do I rank in Google Maps?",
      a: "Google publishes the inputs rather than the recipe. Local results are mainly based on relevance, distance and popularity; the same page says the details are kept confidential, and that no position can be requested or paid for. Relevance is the profile being complete and correctly categorised. Distance is where the searcher is, which nobody can change. Under prominence the page names how many websites link to the business and how many reviews it has. Directory consistency is worth keeping right, but it is not named on that page.",
    },
    {
      q: "We have many five-star reviews. Why are we not higher on the map?",
      a: "Because reviews are only part of one of the three inputs. A searcher further away sees closer businesses first, and a profile with the wrong main category or missing details is less relevant to the search however good its reviews are. Check the category, the service area and the details first; then the links from other websites, which Google names beside reviews.",
    },
    {
      q: "Is SEO worth it for a small business?",
      a: "It is slower to arrive, and it does not stop. Ads deliver traffic the day they are turned on and nothing the day they are turned off. The harder question is what ads are actually adding. eBay tested that in a series of large field experiments, published by the National Bureau of Economic Research: the returns from paid search were a fraction of what ordinary reporting suggested, and brand-keyword ads had no measurable short-term benefit. What transfers to a business nobody searches for by name is set out in the post.",
    },
    {
      q: "How long does local SEO take to work?",
      a: "The accuracy half changes the day it is done. A finished profile with the right categories, real photographs and current hours is immediately more convincing to whoever reads it. Position is slower, and is not promised by anybody, including us. The reason is printed at the top of Google's own ranking page. What is being bought is the removal of the reasons the business is not currently eligible for a place.",
    },
    {
      q: "Can I show up in a town my office is not in?",
      a: "On the map, not really. Distance is one of the three inputs, and Google's own guidelines say a profile's service area should not reach farther than about two hours of driving from where the business is based, while allowing that some businesses will need more. The other route is an ordinary page on the business's own website about the work genuinely done in that town. A page is judged on what is written on it rather than on where the office sits. That is a different piece of work with a different risk attached, and it has its own article.",
    },
  ],

  /** Its own post first, then the article that starts where this page stops: this page is about
   * being ranked as a business on a surface where distance is an input; the area pages piece is
   * about the only surface where it is not. */
  relatedPosts: [
    "local-seo-real-estate-map-pack-google-business-profile",
    "geo-landing-pages-real-estate-doorway-pages",
  ],
};
