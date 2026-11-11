import type { Service } from "./types";

/** COPY key `geopages` on realtylt.com/ai. Deep link: /ai#geopages
 *
 * REWRITTEN 2026-08-25 (Round C): "Twenty thin pages are a doorway page and Google treats them as
 * one" was a mechanism claim nobody can source; the page quotes what Google's spam policy actually
 * names (doorway abuse; scaled content abuse, whose example is generative AI making many pages
 * without adding value).
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a plumber's towns, an accounting
 * office serving several towns, a dental office with two locations, a landscaper, a real estate
 * office's area pages as ONE example, where the fair housing answer stays). The FAQ that named an
 * assistant product now says "AI answers" (BRAND section 5). Re-read 2026-11-11 and saved in
 * realtylt-agents company/agents/seo/runs/r28-services/sources/geopages/: Ntoulas, Najork, Manasse
 * and Fetterly, WWW 2006 ("17,168 pages", "13.8%", "70% of all sampled pages with a compression
 * ratio of at least 4.0 were judged to be spam"), Google's spam policies (doorway abuse with
 * "specific regions or cities"; scaled content abuse with "generative AI tools"), Google's helpful
 * content guidance (first-hand expertise, "visiting a place"), 24 CFR 100.75 and 100.70. */
export const geoLandingPages: Service = {
  slug: "geo-landing-pages",
  aiKey: "geopages",
  name: "Local & GEO Pages",
  tier: "more",

  eyebrow: "Local and GEO pages · Get found nearby",
  title: "Service area pages: a real page for every town served",
  lede: "A plumber works in nine towns, and the website has one page that lists all nine in a sentence, so it is found in none of them. We build a real page for each town and service the business genuinely covers, in its own look: what it does there, the jobs done there, the questions people there ask, and a way to book. Each page is written to be found in Google and quoted in AI answers, and a person who knows the place reads it before it goes live.",
  specs: ["one page per town served", "built to be found locally", "written to be quoted by AI", "the inquiry lands on your site"],
  why: "People search for a service by where they are: they type “near me”, or their town by name. A page for each area the business really covers meets them where they are looking, in Google and in AI answers, and the inquiry lands on the business's own website rather than on a directory's.",
  keywords: [
    "service area pages",
    "local landing pages for business",
    "geo landing pages",
    "near me seo pages",
    "ai search visibility local business",
  ],

  seo: {
    title: "Service area pages for local business: one real page per town",
    description:
      "Service area pages for a local business: a real page for every town it serves, written to be found in Google and quoted in AI answers. Not thin doorway pages.",
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
    trigger: "Someone searches “emergency plumber Fishkill”",
    nodes: [
      { label: "The page exists", note: "A real address for Fishkill, not a town name inside a shared page." },
      { label: "It says something local", note: "The jobs done there, with real photos and a date, and the questions people there ask." },
      { label: "A person reads it", note: "Before it is published, not after someone complains about it." },
      { label: "It captures the inquiry", note: "On the business's own site. Not on a directory that rents the click back." },
    ],
    footnote: "An invented example. Google's spam policy names this tactic twice. One of the examples is generative AI making many pages without adding value. The work is in making each one real.",
  },

  whatItIs: [
    "It is a genuine page for each service area, rather than one page that lists them all. People search by where they are, and a page that mentions eight towns in a sentence ranks for none of them.",
    "Each page says what the business actually does in that area. It carries local proof, answers the questions people ask about that place, and captures the inquiry on the business's own site. It is written for both audiences that now decide whether a business is found: Google's index, and the AI assistants that increasingly answer the question before a search result is ever clicked.",
    "It fits a business that works across several towns: a plumber, roofer or landscaper with a wide service area, an accounting office with clients in the next towns over, a dental office or salon with two locations, a real estate office covering several communities. The number of pages is the number of places the business can write about honestly, which is usually fewer than the first list.",
  ],

  howItWorks: [
    {
      title: "We agree the list of places with the owner",
      body: "Only towns and services the business genuinely covers and has done work in. A place with nothing true to say about it is left off, and the owner signs off the list before anything is written.",
    },
    {
      title: "One page, one place, real content",
      body: "Written for the area, with the work actually done there. Google's own test for first-hand expertise gives visiting a place as its example. There is no writing technique that produces it, so the owner supplies the jobs, the photos and the local detail.",
    },
    {
      title: "Answers written to be quoted",
      body: "The real question as a heading, the answer in the sentence underneath it, and the structured data that lets a machine understand the page. The same format is what works for a person in a hurry.",
    },
    {
      title: "A person reads it before it is published",
      body: "Every draft is read and changed by somebody who knows the place, usually the owner. That step is what separates a page from the scaled content Google's policy names.",
    },
    {
      title: "Inquiries on the business's own ground",
      body: "The form is on the business's site, so the inquiry is the business's. It is not a directory's to sell back.",
    },
  ],

  handoff: {
    provides: [
      "The towns and services the business really covers.",
      "Jobs done in each place: what, roughly when, and photos where the customer agreed.",
      "The questions customers in each place ask.",
      "An hour a year per set of pages to say what changed.",
    ],
    approves: [
      "The list of places, before anything is written.",
      "Every page, read and changed before it goes live.",
      "Any customer named or pictured, only with that customer's yes.",
      "Which pages come down when the business stops serving a place.",
    ],
  },

  useCases: [
    {
      title: "Every town a plumber or landscaper actually works in",
      body: "A real page for each one, about the jobs done there. Not a single page that mentions eight towns in a sentence and belongs to none of them.",
    },
    {
      title: "An accounting or dental office with two locations or several towns",
      body: "Each location and each town it draws from gets a page with its own address, hours, directions and questions, so a search for the service in that town finds a page that is about it.",
    },
    {
      title: "Being quoted in an AI answer",
      body: "Assistants answer from pages that answer questions directly, so a page written that way can be quoted. Nobody controls what gets quoted. Writing a page worth quoting is the only lever there is.",
    },
    {
      title: "Owning the inquiry instead of renting it",
      body: "The directory that ranks above the business is selling its market back to it. The business's own page captures the inquiry directly.",
    },
    {
      title: "A real estate office's community pages",
      body: "A page for each community the office works in, about the housing and the transaction rather than about who lives there, with comparable effort across every area. The fair housing answer below says why.",
    },
  ],

  limits: [
    "It is not a template with the town name swapped. Google's spam policy names doorway abuse and scaled content abuse separately. The second one gives generative AI producing many pages without adding value as its first example.",
    "It does not rank a place the business does not serve. A page for an area it has never worked has nothing true to put on it. Both a reader and an engine notice.",
    "It does not put anybody in an AI answer on request. Nobody controls what an assistant quotes. Writing a page that is quotable is the only lever there is.",
    "It does not replace the rest of local search. A page for each area is one surface. The Google Business Profile, the reviews and the links are another, and they are decided by different machinery.",
    "It does not make the list of areas longer than it is. How many places a business can write honestly about is a fact about its work so far. The honest version of this project usually produces a shorter list than the first meeting did.",
    "It does not survive being left alone. The job was three years ago, a figure moved, a shop closed. Most of these pages need a short sitting once a year. A set nobody goes back to becomes a record of when somebody stopped paying attention.",
  ],

  faqs: [
    {
      q: "What are GEO landing pages?",
      a: "They are pages built for a specific location and service, so someone searching for that service in that place finds a page that is actually about it. GEO now carries a second meaning as well: generative engine optimisation, which means writing pages AI assistants can quote when they answer a question.",
    },
    {
      q: "Are location pages considered doorway pages by Google?",
      a: "Only if they behave like one. Google's spam policy defines doorway abuse as pages created to rank for specific, similar queries that lead users to intermediate pages less useful than the final destination, and gives the example of pages targeted at specific regions or cities that funnel users to one page. Nothing in the policy forbids having a page per area. A page that answers the question it was found for, on its own, is not doing what that entry describes.",
    },
    {
      q: "Is it against the rules to have AI write them?",
      a: "Not in itself. Google's guidance on helpful content frames automation as a question about the output rather than the tool. What the spam policy names is using generative AI tools to generate many pages without adding value for users. The difference is whether anything was added between the draft and the publication. In practice that means a person who knows the place read it and changed it before it went live.",
    },
    {
      q: "How many service area pages should a business have?",
      a: "As many as it can write about honestly: one for each town or service where it has done real work and has something specific to say. A short set of real pages does better for a reader than a long set of near copies, and the near copies are what the spam policy describes.",
    },
    {
      q: "Is there a fair housing issue with area pages?",
      a: "For a real estate office, yes, and it is the part nobody raises. The advertising rules apply to a web page exactly as they apply to a flyer. 24 CFR 100.75 names selecting locations for advertising that deny parts of the housing market information about housing opportunities because of race, colour, religion, sex, handicap, familial status or national origin. 24 CFR 100.70 names discouraging someone, on those same grounds, by exaggerating drawbacks or failing to inform them of the desirable features of a community. Both turn on the reason, so an uneven set of pages is not unlawful by itself. In practice, write about the housing and the transaction rather than about who lives somewhere, and give every area comparable effort: the pattern across a set of pages is what a reason gets read off, and it is invisible from inside any one of them.",
    },
    {
      q: "How do I get my business quoted in AI answers?",
      a: "Answer the question directly, in plain language, on a real page that an assistant can read. Structured data helps a machine understand the page, and a clear question-and-answer format is what gets quoted. Vague marketing copy does not get cited, because there is nothing in it to quote. Nobody can promise the citation itself.",
    },
  ],

  /** Its own post first, then the article this page's argument starts from: local search ranks a
   * business on a surface where distance is one of the inputs, and this page exists for the
   * places that input puts out of reach. */
  relatedPosts: [
    "geo-landing-pages-real-estate-doorway-pages",
    "local-seo-real-estate-map-pack-google-business-profile",
  ],
};
