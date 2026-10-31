import type { Service } from "./types";

/** COPY key `consult` on realtylt.com/ai. Deep link: /ai#consult */
export const aiAudit: Service = {
  slug: "ai-readiness-assessment",
  aiKey: "consult",
  name: "AI Assessment",
  tier: "core",

  eyebrow: "AI Assessment · Start here",
  title: "An AI readiness assessment: see where AI pays off first",
  lede: "In one hour with you, or you and your manager, we map how your business really runs. Then we write the plan: what to build and in what order, how long each piece takes, the precautions, and which system does which job. It is the low-risk way to start when you know AI can help but not where to point it.",
  specs: ["one hour with the owner", "an order, with reasons", "a written plan", "what stays with a person"],
  why: "Knowing AI could help is one problem. Knowing where to point it is a different one, and only the second gets anything built. An assessment turns an open question into a short list, with the reason for each spot beside it. It also gives you a second list: the things you have decided not to build. Some firms call this an AI audit.",
  keywords: [
    "ai readiness assessment",
    "ai assessment for small business",
    "ai consulting for small business",
    "where to use ai in my business",
    "ai opportunity assessment",
  ],

  seo: {
    title: "AI Readiness Assessment: Find Where AI Pays Off First",
    description:
      "An AI readiness assessment for a small business: one hour with the owner, then a written plan of what to build first, in what order, and what to leave alone.",
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
    footnote: "An illustration of the shape of the output rather than a recording of anybody's business. No hours are shown, because nobody has measured yours. The columns are the three questions rather than a score.",
  },

  whatItIs: [
    "It is a one-hour call with the owner, or the owner and the manager, about how your business actually runs. We walk one real job end to end. We write down every step, every tool and every hour that goes into it. Most owners have never seen that written out, and it is always longer than they think.",
    "Then we write the plan, and it is shorter than what you brought. Candidates get removed for stated reasons. What survives comes back in an order: what we would build, how, how long each piece takes, what precautions to take, and which system does which job. The list of what was removed comes back too, because those reasons are the part you will use again next year. If you ask us to build it and run it, the assessment is included in that work. If you build it yourself, the plan is your map.",
  ],

  howItWorks: [
    {
      title: "We follow the work, not the org chart",
      body: "One hour with you on the last real week. One real job, traced from the first touch to the last. Every manual step. Every tool it passes through. And every place the same information gets typed twice.",
    },
    {
      title: "We cut the list before we order it",
      body: "Three questions, applied to every candidate. Does it happen often enough that someone would notice it breaking within a week. Could you write the rule down for a new hire. And where would a wrong answer end up. Any one of those can remove a candidate. The third removes the most.",
    },
    {
      title: "We order what survives, and write down why",
      body: "How contained the worst case is comes first. Whether the rule is actually settled comes second. The size of the saving comes third. Every position has its reason beside it, so the order survives someone asking why the third one is not the first.",
    },
    {
      title: "We hand you the plan",
      body: "What to build and in what order, how long each piece takes, the precautions, and which system does which job. We can build it and run it, with the assessment included, or you can build from it yourself.",
    },
  ],

  useCases: [
    {
      title: "You know AI would help, but not where",
      body: "The most common place to be stuck. An assessment turns an open-ended topic into a numbered list. That is the difference between thinking about AI and using it.",
    },
    {
      title: "You want the list to get shorter, not longer",
      body: "Anybody can add candidates. The useful hour removes them, for reasons you can apply again yourself. And it does that before any money has moved.",
    },
    {
      title: "You tried a tool and it did nothing",
      body: "Usually because it was pointed at the wrong problem. Mapping the work first is what stops that happening twice.",
    },
  ],

  limits: [
    "It does not decide anything for you. The output is a shorter list and a plan. What your business actually changes stays your call.",
    "It cannot see what nobody will say out loud. The account is only as honest as the description of how the work really happens. That includes the parts everyone quietly works around.",
    "It does not produce a saving on paper. Every hour on the list is an hour you still have to choose to spend on something else.",
    "It does not put a price on each candidate. What a build costs depends entirely on which one. A number attached to a candidate before anybody has looked at the systems is a guess with a decimal point in it.",
    "It does not stay true. The list has a shelf life measured in months, because your systems, your people and your volume all move.",
    "It does not build anything on its own. It ends with a written plan, and building it, by us or by you, is a separate decision.",
  ],

  faqs: [
    {
      q: "What is an AI readiness assessment?",
      a: "It is a one-hour review, with the owner, of how your business actually operates. It is done to find where AI or automation is worth building and, just as importantly, where it is not. You get back a written plan: a shortlist in an order with the reason for each position attached, what we would build and how, how long each piece takes, the precautions, and the list of candidates that were removed and why.",
    },
    {
      q: "Where should a small business start with AI?",
      a: "With whatever survives three questions and has the most contained failure, which is usually something unglamorous. There is no universal answer here, and that is deliberate. Take the 2018 Annual Business Survey, a Census Bureau sample of over 850,000 firms where answering is required by law. Only 10.3 percent of firms used any advanced business technology at all. That is not enough adoption for anybody to have learned what works in general. A confident universal answer is a guess.",
    },
    {
      q: "How do you decide what not to automate?",
      a: "Three tests, in order. It happens too rarely for anybody to notice it breaking. That is how a quarterly job fails in March and gets discovered in June. The rule behind it is not actually settled, which usually shows up as three people describing it three different ways. Or a wrong answer would reach a client before a person saw it. Any one of those is enough on its own.",
    },
    {
      q: "What do I actually get at the end?",
      a: "A written plan. It maps how the work runs today, including the parts nobody had written down, and puts the shortlist in an order with the reason for each position beside it. It says what we would build, how, how long each piece takes, what precautions to take and which system does which job. It lists the candidates that were removed and why, which is the part you will use again next year. If you ask us to build it and run it, the assessment is included in that work; if not, the plan is yours to build from.",
    },
    {
      q: "Do I need to know anything about AI beforehand?",
      a: "No. The assessment is about your business, not about the technology. You describe how the work happens, and choosing the tools is our job.",
    },
  ],

  relatedPosts: [
    "ai-assessment-small-business-what-not-to-automate",
    "workflow-automation-real-estate-business",
    "custom-automation-real-estate-bespoke-build",
  ],
};
