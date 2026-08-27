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
      "A real page for every area you serve, written to rank in Google and to be quoted in AI answers, with local proof and lead capture. Not thin doorway pages.",
  },

  /** A number in 96-point type is the most quoted thing on the page, so it carries its
   * derivation, and this one is the page's own argument rather than a flattering statistic. */
  stat: {
    value: "70%",
    label: "of pages that repeat themselves were judged spam in a hand-classified sample",
    source: {
      text: "Ntoulas, Najork, Manasse and Fetterly, WWW 2006. 17,168 English pages drawn at random from a 105 million page crawl and classified by hand; 13.8% were spam overall, against 70% among pages compressing at four times or better. It measures repetition inside one page, not across a set of them.",
      href: "https://www.ambuehler.ethz.ch/CDstore/www2006/devel-www2006.ecs.soton.ac.uk/programme/files/pdf/3052.pdf",
    },
  },

  figure: {
    kind: "flow",
    caption: "Why a real page beats a list of towns",
    trigger: "Someone searches “ai automation Poughkeepsie”",
    nodes: [
      { label: "The page exists", note: "A real URL for Poughkeepsie, not a hash fragment on a shared page." },
      { label: "It says something local", note: "What you do there, who you have done it for, what it cost them." },
      { label: "A person reads it", note: "Before it is published, not after somebody complains about it." },
      { label: "It captures the lead", note: "On your own site, rather than on a directory that rents you back the click." },
    ],
    /** REWRITTEN 2026-08-25 (Round C). It said "Twenty thin pages are a doorway page and Google
     * treats them as one", which is a mechanism claim we cannot source. What the spam policy
     * actually names is doorway abuse, whose example is pages targeted at specific regions or
     * cities that funnel users to one page, and scaled content abuse, whose first example is
     * generative AI generating many pages without adding value. */
    footnote: "Google's spam policy names this tactic twice, and one of the examples is generative AI making many pages without adding value. The work is in making each one real.",
  },

  whatItIs: [
    "It is a genuine page for each area you serve, rather than one page that lists them all. People search by where they are, and a page that mentions eight towns in a sentence ranks for none of them.",
    "Each page says what you actually do in that area, carries local proof, answers the questions people ask about it, and captures the lead on your own site. It is written for both audiences that now decide whether you are found: Google's index, and the AI assistants that increasingly answer the question before a search result is ever clicked.",
  ],

  howItWorks: [
    {
      title: "One page, one place, real content",
      body: "Written for the area, with the work you have actually done there. Google's own test for first-hand expertise gives visiting a place as its example, and there is no writing technique that produces it.",
    },
    {
      title: "Answers written to be quoted",
      body: "The real question as a heading and the answer in the sentence underneath it, plus the structured data that lets a machine understand the page. The same format is what works for a person in a hurry.",
    },
    {
      title: "Lead capture on your own ground",
      body: "The form is on your site, so the lead is yours, rather than a directory's to sell back to you.",
    },
  ],

  useCases: [
    {
      title: "Every town you have actually worked in",
      body: "A real page for each one, instead of a single page that mentions eight towns in a sentence and belongs to none of them.",
    },
    {
      title: "Being quoted in an AI answer",
      body: "Assistants answer from pages that answer questions directly, so a page written that way can be quoted. Nobody controls what gets quoted, and writing a page worth quoting is the only lever there is.",
    },
    {
      title: "Owning the lead instead of renting it",
      body: "The directory that ranks above you is selling your own market back to you. Your page captures it directly.",
    },
  ],

  limits: [
    "It is not a template with the town name swapped. Google's spam policy names doorway abuse and scaled content abuse separately, and the second one gives generative AI producing many pages without adding value as its first example.",
    "It does not rank a place you do not serve. A page for an area you have never worked has nothing true to put on it, and both a reader and an engine notice.",
    "It does not put you in an AI answer on request. Nobody controls what an assistant quotes. Writing a page that is quotable is the only lever there is.",
    "It does not replace the rest of local search. A page for each area is one surface. The Google Business Profile, the reviews and the links are another, and they are decided by different machinery.",
    "It does not make your list of areas longer than it is. How many places you can write honestly about is a fact about your career so far, and the honest version of this project usually produces a shorter list than the first meeting did.",
    // ROUND 47: the flagship lists five things this does not do and this page carried four. The
    // missing one is the one the lede's "evergreen" reads against, so it is the one worth having
    // here: the proof on these pages has a date on it whether or not the page prints one.
    "It does not survive being left alone. The closing was three years ago, the tax figure moved, the shop closed. Most of these pages need a short sitting once a year, and a set nobody goes back to becomes a record of when you stopped paying attention.",
  ],

  faqs: [
    {
      q: "What are GEO landing pages?",
      a: "They are pages built for a specific location and service, so that someone searching for that service in that place finds a page that is actually about it. GEO now carries a second meaning as well: generative engine optimisation, which is writing pages that AI assistants can quote when they answer a question.",
    },
    {
      q: "Are location pages considered doorway pages by Google?",
      a: "Only if they behave like one. Google's spam policy defines doorway abuse as pages created to rank for specific, similar queries that lead users to intermediate pages less useful than the final destination, and it gives pages targeted at specific regions or cities that funnel users to one page as an example. Nothing in the policy forbids having a page per area. A page that answers the question it was found for, on its own, is not doing what that entry describes.",
    },
    {
      q: "Is it against the rules to have AI write them?",
      a: "Not in itself, and Google's guidance on helpful content frames automation as a question about the output rather than the tool. What the spam policy names is using generative AI tools to generate many pages without adding value for users. The difference is whether anything was added between the draft and the publication, which in practice means a person who knows the place read it and changed it before it went live.",
    },
    {
      q: "Is there a fair housing issue with area pages?",
      // ROUND 47: both regulation summaries dropped the clause the prohibitions actually hang on,
      // "because of race, color, religion, sex, handicap, familial status, or national origin".
      // Without it the answer says the law forbids uneven pages, which it does not, and a page
      // that overstates a fair housing rule is not a safer page. Same fix made in the flagship.
      a: "Yes, and it is the part nobody raises. The advertising rules apply to a web page exactly as they apply to a flyer: 24 CFR 100.75 says written statements include any documents used with respect to the sale of a dwelling, and it names selecting locations for advertising that deny parts of the housing market information about housing opportunities because of race, colour, religion, sex, handicap, familial status or national origin. 24 CFR 100.70 names discouraging somebody, on those same grounds, by exaggerating drawbacks or failing to inform them of the desirable features of a community. Both turn on the reason, so an uneven set of pages is not unlawful by itself. Practically: write about the housing and the transaction rather than about who lives somewhere, and give your areas comparable effort, because the pattern across a set of pages is the thing a reason gets read off and it is invisible from inside any one of them.",
    },
    {
      q: "How do I get my business cited in ChatGPT or Google AI Overviews?",
      a: "Answer the question directly, in plain language, on a real page that an assistant can read. Structured data helps a machine understand the page, and a clear question-and-answer format is what gets quoted. Vague marketing copy does not get cited because there is nothing in it to quote. Nobody can promise the citation itself.",
    },
  ],

  /** Its own flagship first, then the article this page's argument starts from. The pair is
   * deliberate: local search ranks a business on a surface where distance is one of the inputs,
   * and this page exists for the places that input puts out of reach. The chat post came off; it
   * was a stand-in while this topic had no post of its own. */
  relatedPosts: [
    "geo-landing-pages-real-estate-doorway-pages",
    "local-seo-real-estate-map-pack-google-business-profile",
  ],
};
