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
  why: "Buyers and sellers start on Google, and the agent they call is usually the one they find first. Ranking in local search puts you in front of your market before a competitor's ad does.",
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
      "Rank in the map pack and in local search for the terms your market actually types. Google Business Profile, citations, and city pages kept current so you are found before the ads are.",
  },

  figure: {
    kind: "flow",
    caption: "What actually moves you up the map pack",
    trigger: "Somebody nearby searches “realtor near me”",
    nodes: [
      { label: "The profile", note: "Categories, service areas, hours, and photos, correct and current." },
      { label: "The citations", note: "Your name, address, and phone identical everywhere they appear." },
      { label: "The reviews", note: "Recent and frequent, which is the signal that compounds fastest." },
      { label: "The pages", note: "A real page for each city and each service, not one page listing all of them." },
    ],
    footnote: "The agent they call is usually the one they found first, and that position is earned rather than bought.",
  },

  whatItIs: [
    "It is the work that decides whether you appear when someone nearby searches for an agent. Most of it is unglamorous: a Google Business Profile with the right categories and service areas, citations that agree with each other, a steady flow of recent reviews, and a real page for each place and each service you cover.",
    "The AI keeps that maintenance current, which is the part that fails in practice. Local rankings decay when the posts stop, the categories go stale, and a citation somewhere still lists your old phone number.",
  ],

  howItWorks: [
    {
      title: "Fix the profile properly",
      body: "Categories, service areas, hours, and photos, correct and complete. Most profiles are half-filled, and half-filled is what a competitor beats.",
    },
    {
      title: "Make the citations agree",
      body: "Your name, address, and phone number identical everywhere they appear. Inconsistency is a ranking drag that nobody sees until it is fixed.",
    },
    {
      title: "Keep it alive",
      body: "Posts, updates, and a steady flow of recent reviews. Local rankings reward recency, which is why they decay the moment maintenance stops.",
    },
  ],

  useCases: [
    {
      title: "The map pack",
      body: "The three results above everything else. Getting there is worth more than any single ad you will run this year, and it does not stop when the budget does.",
    },
    {
      title: "Every town you actually serve",
      body: "One page listing eight towns ranks for none of them. A page for each one ranks for each one.",
    },
    {
      title: "Traffic that is not rented",
      body: "Paid clicks stop when you stop paying. A local ranking keeps working.",
    },
  ],

  faqs: [
    {
      q: "How do real estate agents rank in Google Maps?",
      a: "Three things move the map pack more than anything else: a complete and correctly categorised Google Business Profile, consistent name, address, and phone details everywhere you appear online, and a steady flow of recent reviews. Proximity to the searcher matters too, which is why real pages for each area you serve are worth building.",
    },
    {
      q: "Is local SEO better than running ads?",
      a: "It is slower to arrive and it does not stop. Ads deliver traffic the day you turn them on and nothing the day you turn them off. Most agents want both, and want the ranking to eventually carry the load the ads are carrying now.",
    },
    {
      q: "How long does local SEO take to work?",
      a: "Profile and citation fixes can move things in weeks. Ranking properly for competitive terms takes months, and anyone promising otherwise is selling something. The compounding is the point: the position you earn keeps paying.",
    },
  ],
};
