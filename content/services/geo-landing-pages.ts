import type { Service } from "./types";

/** COPY key `geopages` on realtylt.com/ai. Deep link: /ai#geopages */
export const geoLandingPages: Service = {
  slug: "geo-landing-pages",
  aiKey: "geopages",
  name: "Local & GEO Pages",
  tier: "more",

  eyebrow: "Local / GEO Pages · Get found nearby",
  title: "A landing page for every area you serve",
  lede: "Give us your service areas and we build a real, on-brand landing page for each one: what you do there, local proof, and a booking form, written to show up both in Google and in AI answers when someone nearby searches for what you offer. Evergreen pages that pull in local customers around the clock.",
  specs: ["one page per area you serve", "built to rank locally", "tuned for AI search too", "built-in lead capture"],
  why: "People search for services by where they are, either “near me” or their town by name. A page for each area you cover meets them exactly where they are looking, in Google and in AI answers, and captures the lead on your own site instead of a directory's.",
  keywords: [
    "local landing pages for business",
    "geo landing pages",
    "near me seo pages",
    "local service area pages",
    "ai search visibility local business",
  ],

  seo: {
    title: "Local and GEO Landing Pages Built to Rank",
    description:
      "A real page for every area you serve, written to rank in Google and to be quoted in AI answers, with local proof and lead capture built in. Not thin doorway pages.",
  },

  figure: {
    kind: "flow",
    caption: "Why a real page beats a list of towns",
    trigger: "Someone searches “ai automation Poughkeepsie”",
    nodes: [
      { label: "The page exists", note: "A real URL for Poughkeepsie, not a hash fragment on a shared page." },
      { label: "It says something local", note: "What you do there, who you have done it for, what it cost them." },
      { label: "It answers questions", note: "Structured so an AI assistant can quote it, not just crawl it." },
      { label: "It captures the lead", note: "On your own site, rather than on a directory that rents you back the click." },
    ],
    footnote: "Twenty thin pages are a doorway page and Google treats them as one. The work is in making each one real.",
  },

  whatItIs: [
    "It is a genuine page for each area you serve, rather than one page that lists them all. People search by where they are, and a page that mentions eight towns in a sentence ranks for none of them.",
    "Each page says what you actually do in that area, carries local proof, answers the questions people ask about it, and captures the lead on your own site. It is written for both audiences that now decide whether you are found: Google's index, and the AI assistants that increasingly answer the question before a search result is ever clicked.",
  ],

  howItWorks: [
    {
      title: "One page, one place, real content",
      body: "Written for the area, with the work you have done there. A page that could be about anywhere ranks for nowhere, and Google reads a set of those as a doorway.",
    },
    {
      title: "Structured so an assistant can quote it",
      body: "Direct answers to the questions people actually ask, plus the structured data that lets a machine understand what it is reading. Being quotable is the new being ranked.",
    },
    {
      title: "Lead capture on your own ground",
      body: "The form is on your site, so the lead is yours, rather than a directory's to sell back to you.",
    },
  ],

  useCases: [
    {
      title: "Every town in your service area",
      body: "A real page for each one, ranking for each one, instead of a single page that ranks for none of them.",
    },
    {
      title: "Being cited in AI answers",
      body: "Assistants answer from pages that answer questions directly. A page structured that way gets quoted, and the citation is the new click.",
    },
    {
      title: "Owning the lead instead of renting it",
      body: "The directory that ranks above you is selling your own market back to you. Your page captures it directly.",
    },
  ],

  faqs: [
    {
      q: "What are GEO landing pages?",
      a: "They are pages built for a specific location and service, so that someone searching for that service in that place finds a page that is actually about it. GEO now carries a second meaning as well: generative engine optimisation, which is writing pages that AI assistants can quote when they answer a question.",
    },
    {
      q: "Are location pages considered doorway pages by Google?",
      a: "They are if they are thin, which is to say if they are the same page with the town name swapped and nothing else. Google explicitly treats those as doorway pages. A page that carries real, area-specific content and genuinely serves the person who lands on it is not a doorway page, and the difference is entirely in the work.",
    },
    {
      q: "How do I get my business cited in ChatGPT or Google AI Overviews?",
      a: "Answer the question directly, in plain language, on a real page that an assistant can read. Structured data helps a machine understand the page, and a clear question-and-answer format is what gets quoted. Vague marketing copy does not get cited because there is nothing in it to quote.",
    },
  ],
};
