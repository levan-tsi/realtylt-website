import type { Service } from "./types";

/** COPY key `consult` on realtylt.com/ai. Deep link: /ai#consult */
export const aiAudit: Service = {
  slug: "ai-audit",
  aiKey: "consult",
  name: "AI Audit",
  tier: "core",

  eyebrow: "AI Audit · Start here",
  title: "See exactly where AI pays off first",
  lede: "We map how your business actually runs, cut the candidates that should not be built, and hand you what is left in an order with the reason for each position beside it. Then we build the first win. The low-risk way to start when you know AI can help but not where to point it.",
  specs: ["full workflow review", "an order, with reasons", "clear build plan", "a quick first win"],
  why: "Knowing AI could help and knowing where to point it are different problems, and only the second one produces anything. An audit turns an open topic into a short list with the reason for each position written beside it, and into a shorter list of the things you have decided not to build.",
  keywords: [
    "ai consulting for small business",
    "ai automation audit",
    "where to use ai in my business",
    "ai readiness assessment",
    "ai opportunity assessment",
  ],

  seo: {
    title: "AI Audit: Find Where AI Pays Off in Your Business First",
    description:
      "A mapped review of how your business actually runs, an ordered shortlist with the reasoning attached, the list of what not to build, and a first win shipped.",
  },

  /** Somebody else's measurement, and the one that resets an owner's sense of being behind.
   * Added in round H alongside the flagship. */
  stat: {
    value: "10.3%",
    label: "of US firms used any advanced business technology, on a survey of over 850,000 of them",
    source: {
      text: "Zolas and others, Advanced Technologies Adoption and Use by U.S. Firms: Evidence from the Annual Business Survey, NBER, 2020",
      href: "https://www.nber.org/system/files/working_papers/w28290/w28290.pdf",
    },
  },

  figure: {
    kind: "records",
    caption: "What the shortlist looks like when it lands",
    headers: { before: "What you do by hand today", after: "What the three questions said" },
    rows: [
      {
        before: "Answering website inquiries the next morning",
        after: ["happens daily", "rule is settled", "a wrong answer is visible"],
        tag: "first",
      },
      {
        before: "Retyping lead details from email into the CRM",
        after: ["happens daily", "rule is settled", "a wrong answer is easy to undo"],
        tag: "second",
      },
      {
        before: "Chasing missing signatures on open files",
        after: ["happens weekly", "rule needs deciding", "needs system access"],
        tag: "later",
      },
    ],
    footnote: "An illustration of the shape of the output rather than a recording of anybody's business. No hours are shown, because nobody has measured yours, and the columns are the three questions rather than a score.",
  },

  whatItIs: [
    "It is a mapped review of how your business actually runs, done by walking one real job end to end and writing down every step, every tool and every hour that goes into it. Most owners have never seen that written out, and it is always longer than they think.",
    "What you get back is shorter than what you brought. Candidates get removed for stated reasons, what survives comes back in an order with the reason for each position beside it, and the list of what was removed comes back too, because those reasons are the part you will use again next year. Then we build the first one, so the audit ends in a working thing rather than a document.",
  ],

  howItWorks: [
    {
      title: "We follow the work, not the org chart",
      body: "One real job, traced from the first touch to the last. Every manual step, every tool it passes through, and every place the same information gets typed twice.",
    },
    {
      title: "We cut the list before we order it",
      body: "Three questions, applied to every candidate. Does it happen often enough that somebody would notice it breaking within a week. Could you write the rule down for a new hire. And where would a wrong answer end up. Any one of those can remove a candidate, and the third removes the most.",
    },
    {
      title: "We order what survives, and write down why",
      body: "How contained the worst case is comes first, whether the rule is actually settled comes second, and the size of the saving comes third. Every position has its reason beside it, so the order survives somebody asking why the third one is not the first.",
    },
    {
      title: "We build the first win",
      body: "The audit ends with something running, not with a deck. Shipping one automation is what turns AI from a topic into a habit.",
    },
  ],

  useCases: [
    {
      title: "You know AI would help, but not where",
      body: "The most common place to be stuck. An audit turns an open-ended topic into a numbered list, which is the difference between thinking about AI and using it.",
    },
    {
      title: "You want the list to get shorter, not longer",
      body: "Anybody can add candidates. The useful hour removes them, for reasons you can apply again yourself, and it does that before any money has moved.",
    },
    {
      title: "You tried a tool and it did nothing",
      body: "Usually because it was pointed at the wrong problem. Mapping the work first is what stops that happening twice.",
    },
  ],

  limits: [
    "It does not decide anything for you. The output is a shorter list and a plan, and what your business actually changes stays your call.",
    "It cannot see what nobody will say out loud. The account is only as honest as the description of how the work really happens, including the parts everyone quietly works around.",
    "It does not produce a saving on paper. Every hour on the list is an hour you still have to choose to spend on something else.",
    "It does not put a price on each candidate. What a build costs depends entirely on which one, and a number attached to a candidate before anybody has looked at the systems is a guess with a decimal point in it.",
    "It does not stay true. The list has a shelf life measured in months, because your systems, your people and your volume all move.",
    "It is not a strategy document. It ends with one automation built and running, and anything past that first build is a separate decision.",
  ],

  faqs: [
    {
      q: "What is an AI audit?",
      a: "It is a review of how your business actually operates, done to find where AI or automation is worth building and, just as importantly, where it is not. The output is a written account of the work, a shortlist in an order with the reason for each position attached, the list of candidates that were removed and why, and one automation built and running.",
    },
    {
      q: "Where should a small business start with AI?",
      a: "With whatever survives three questions and has the most contained failure, which is usually something unglamorous. There is deliberately no universal answer here: in the 2018 Annual Business Survey, a Census Bureau sample of over 850,000 firms where answering is required by law, only 10.3 percent of firms used any advanced business technology at all, which is not enough adoption for anybody to have learned what works in general. A confident universal answer is a guess.",
    },
    {
      q: "How do you decide what not to automate?",
      a: "Three tests, in order. It happens too rarely for anybody to notice it breaking, which is how a quarterly job fails in March and gets discovered in June. The rule behind it is not actually settled, which usually shows up as three people describing it three different ways. Or a wrong answer would reach a client before a person saw it. Any one of those is enough on its own.",
    },
    {
      q: "What do I actually get at the end?",
      a: "A written map of how the work runs today, including the parts nobody had written down. A shortlist in an order, with the reason for each position beside it. The list of candidates that were removed and why, which is the part you will use again next year. A plan for building the top of that list. And one automation actually built and running, so it ends in something real rather than a document.",
    },
    {
      q: "Do I need to know anything about AI beforehand?",
      a: "No. The audit is about your business, not about the technology. You describe how the work happens, and choosing the tools is our job.",
    },
  ],

  relatedPosts: [
    "ai-audit-small-business-what-not-to-automate",
    "workflow-automation-real-estate-business",
    "custom-automation-real-estate-bespoke-build",
  ],
};
