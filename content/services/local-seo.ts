import type { Service } from "./types";

/** COPY key `localseo` on realtylt.com/ai. Deep link: /ai#localseo */
export const localSeo: Service = {
  slug: "local-seo",
  aiKey: "localseo",
  name: "Local SEO",
  tier: "more",

  eyebrow: "Local SEO · Get found nearby",
  title: "Show up when your market searches",
  lede: "Your Google Business Profile, map listings, and city pages tuned to rank for the searches buyers and sellers actually type: “realtor near me,” “homes for sale in your city.” The AI keeps posts, categories, and citations current so you hold the top of local search instead of paying for every click.",
  specs: ["Google Business Profile", "local + map-pack ranking", "citations kept current", "city + service pages"],
  /** REWRITTEN 2026-08-25 (Round C), and this is /ai COPY drift the owner should see. It said
   * "the agent they call is usually the one they find first", which is an assertion about
   * behaviour with nothing under it. What replaces it is what the flagship post can actually
   * show: Google publishes the inputs, one of them is distance, and a share of the clicks at the
   * top of a short list are there because of the position rather than the merit. */
  why: "A nearby search returns three businesses above everything else, and Google publishes what decides that order: relevance, distance and popularity. Two of those three are work you can do, and the work compounds instead of stopping when a budget does.",
  keywords: [
    "local seo for real estate agents",
    "google business profile for realtors",
    "rank in google maps real estate",
    "realtor local search optimization",
    "real estate seo near me",
  ],

  seo: {
    title: "Local SEO for Real Estate Agents",
    description:
      "Rank in the map pack and local search for the terms your market types. Google Business Profile, citations, and city pages kept current so you are found.",
  },

  /** A number in 96-point type is the most quoted thing on the page, so it carries its
   * derivation. Google's own ranking page, quoted: "Local results are mainly based on relevance,
   * distance, and popularity." */
  stat: {
    value: "3",
    label: "inputs Google names for local results, and one of them is how far away you are",
    source: {
      text: "Google Business Profile Help, Tips to improve your local ranking on Google. The same page states there is no way to request or pay for a better local ranking, and publishes no weights.",
      href: "https://support.google.com/business/answer/7091",
    },
  },

  figure: {
    kind: "flow",
    caption: "What actually moves you up the map pack",
    trigger: "Somebody nearby searches “realtor near me”",
    /** REWRITTEN 2026-08-25 (Round C) against Google's own ranking page. The old middle two
     * nodes described directory citations as a ranking factor and called review recency "the
     * signal that compounds fastest". Neither is in the document: what it names under prominence
     * is how many websites link to your business and how many reviews you have. */
    nodes: [
      { label: "The profile", note: "Categories, service areas, hours, and photos, correct and current." },
      { label: "The links", note: "Other people's websites mentioning yours, which Google's page names under prominence." },
      { label: "The reviews", note: "The other thing that page names, and the one that only arrives if somebody asks." },
      { label: "The pages", note: "A real page for each city and each service, not one page listing all of them." },
    ],
    footnote: "There is no way to request or pay for a better local ranking, in Google's own words. What is left is the work.",
  },

  whatItIs: [
    "It is the work that decides whether you appear when someone nearby searches for an agent. Most of it is unglamorous: a Google Business Profile with the right categories and service areas, details that agree with each other wherever they appear, a steady flow of reviews, and a real page for each place and each service you cover.",
    "The AI keeps that maintenance current, which is the part that fails in practice. A profile is at its most accurate on the day somebody fills it in: hours change, a service stops, a number moves, and none of those events tell the listing about themselves.",
  ],

  howItWorks: [
    {
      title: "Fix the profile properly",
      body: "Categories, service areas, hours, and photos, correct and complete. Google's own advice for the relevance half is to provide complete and detailed business information, and there is no trick hiding inside that instruction.",
    },
    {
      title: "Feed the two things Google names",
      body: "Reviews, and other people's websites mentioning yours. Those are the two the ranking page lists under prominence, and neither can be bought without buying a problem.",
    },
    {
      title: "Keep it true, and read the report",
      body: "Details corrected wherever they appear, and the profile's own performance screen read every month: calls, direction requests, and the searches you were surfaced for.",
    },
  ],

  useCases: [
    {
      title: "The map pack",
      body: "The three results above everything else, on the search a stranger runs when they do not know your name. It is the one position that keeps working after a budget stops.",
    },
    {
      title: "Every town you actually serve",
      body: "One page that lists eight towns in a sentence belongs to none of them. A page written about one place has something to compete with, which is the other half of this work.",
    },
    {
      title: "Traffic that is not rented",
      body: "Paid clicks stop when you stop paying. A local ranking keeps working.",
    },
  ],

  limits: [
    "It does not buy you a position. Google's own page says there is no way to request or pay for a better local ranking, so anybody promising one is selling something that does not exist.",
    "It does not move you closer to anybody. Distance is one of the three inputs Google publishes and it is a physical fact about your address, which is why a business on one edge of a county loses searches on the other edge.",
    "It does not replace ads while it is still arriving. A ranking keeps paying after you stop spending, and until it exists it is delivering nothing.",
    "It does not manufacture reviews. Reviews are one of the two things Google's ranking page names, they cannot be bought without breaking policy, and getting them means asking every client, which is review automation rather than this.",
    "It does not stay done. A profile is at its most accurate the day it is filled in, and a listing nobody maintains becomes wrong quietly and in public.",
  ],

  faqs: [
    {
      q: "How do real estate agents rank in Google Maps?",
      a: "Google publishes the inputs rather than the recipe: local results are mainly based on relevance, distance and popularity, and the same page says the details are kept confidential and that no position can be requested or paid for. Relevance is the profile being complete and correctly categorised. Distance is where the searcher is standing, which you cannot change. Under prominence the page names how many websites link to your business and how many reviews you have. Directory consistency is worth keeping right, but it is not named on that page.",
    },
    {
      q: "Is local SEO better than running ads?",
      a: "It is slower to arrive and it does not stop. Ads deliver traffic the day you turn them on and nothing the day you turn them off. The harder question is what your ads are actually adding, and the one large field experiment on that found the returns measured by ordinary reporting were wildly overstated compared with the returns measured by switching the spend off in one place and leaving it on in another.",
    },
    {
      q: "How long does local SEO take to work?",
      a: "The accuracy half changes the day you do it, because a finished profile with the right categories, real photographs and current hours is immediately more convincing to whoever reads it. Position is slower and is not promised by anybody, including us, for the reason printed at the top of Google's own ranking page. What you are buying is the removal of the reasons you are not currently eligible for a place.",
    },
    {
      q: "Can I show up in a town my office is not in?",
      a: "In the map pack, not really, because distance is one of the three inputs and the profile's service area is capped by Google's own guidelines at roughly two hours of driving from where the business is based. The other route is an ordinary page on your own website about the work you have genuinely done in that town, which is judged on what is written on it rather than on where you sit. That is a different piece of work with a different risk attached, and it has its own article.",
    },
  ],

  /** Its own flagship first, then the article that starts where this page stops. The pair is
   * deliberate and the two posts were written to be different products: this page is about being
   * ranked as a business on a surface where distance is an input, and the area pages piece is
   * about the only surface where it is not. The chat post came off: it was a stand-in while this
   * topic had no post of its own. */
  relatedPosts: [
    "local-seo-real-estate-map-pack-google-business-profile",
    "geo-landing-pages-real-estate-doorway-pages",
  ],
};
