import type { Service } from "./types";

/** COPY key `consult` on realtylt.com/ai. Deep link: /ai#consult
 *
 * Round 28 (2026-11-11): the service film ("What is an AI readiness assessment? One hour, then
 * a written plan", realtylt-agents company/plans/ai-week1/CTA-2 section 2) is cut from THIS
 * page, sentence by sentence: the hour with the owner, one real job traced, the three questions,
 * the ordered plan with reasons, the crossed-off list, "it decides nothing ... builds nothing on
 * its own", "No AI knowledge is needed". Those sentences keep their facts here; change one and the
 * film must change with it. Re-aimed at local owners with examples by trade (a contractor, a
 * dental or accounting office, a salon or gym, a real estate office as one example). Two facts
 * added from the claims register (company/CLAIMS-REGISTER.md, sources read 2026-11-05): the
 * Census Bureau's 19.8 percent (America Counts, May 26, 2026) and NIST AI RMF 1.0's go/no-go
 * (deciding not to build is a legitimate result). The close names the assessment door (CTA-2
 * version C). */
export const aiAudit: Service = {
  slug: "ai-readiness-assessment",
  aiKey: "consult",
  name: "AI Assessment",
  tier: "core",

  eyebrow: "AI Assessment · Start here",
  title: "An AI readiness assessment: see where AI pays off first",
  lede: "An owner knows AI could help and has no idea where to point it first. In one hour with you, or you and your manager, we map how the business really runs. Then we write the plan: what to build and in what order, how long each piece takes, the precautions, and which system does which job. It is the low-risk way to start when you know AI can help but not where.",
  specs: ["one hour with the owner", "an order, with reasons", "a written plan", "what stays with a person"],
  why: "Knowing AI could help is one problem. Knowing where to point it is a different one, and only the second gets anything built. An assessment turns an open question into a short list, with the reason for each spot beside it. It also gives you a second list: the things you have decided not to build. Some firms call this an AI audit.",
  keywords: [
    "ai readiness assessment",
    "how to use ai in my business",
    "ai assessment for small business",
    "where to use ai in my business",
    "ai audit for small business",
  ],

  seo: {
    title: "AI readiness assessment for small business: where AI pays off",
    description:
      "An AI readiness assessment for a small business: one hour with the owner, then a written plan of what to build first, in what order, and what to leave alone.",
  },

  /** Somebody else's measurement, and the one that resets an owner's sense of being behind.
   * Added in round H alongside the flagship; in the claims register under "Older sources". */
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
    headers: { before: "What the business does by hand today", after: "What the three questions said" },
    rows: [
      {
        before: "Answering website inquiries the next morning",
        after: ["happens daily", "rule is settled", "a wrong answer is visible"],
        tag: "first",
      },
      {
        before: "Retyping inquiry details from email into the CRM",
        after: ["happens daily", "rule is settled", "a wrong answer is easy to undo"],
        tag: "second",
      },
      {
        before: "Following up on quotes nobody answered",
        after: ["happens weekly", "rule is settled", "a person sends the last one"],
        tag: "third",
      },
      {
        before: "Chasing missing signatures on open files",
        after: ["happens weekly", "rule needs deciding", "needs system access"],
        tag: "later",
      },
    ],
    footnote: "An invented illustration of the shape of the output rather than a recording of anybody's business. No hours are shown, because nobody has measured that business. The columns are the three questions rather than a score.",
  },

  whatItIs: [
    "It is a one-hour call with the owner, or the owner and the manager, about how the business actually runs. We walk one real job end to end. We write down every step, every tool and every hour that goes into it. Most owners have never seen that written out, and it is always longer than they think.",
    "Then we write the plan, and it is shorter than what came in. Candidates get removed for stated reasons. What survives comes back in an order: what we would build, how, how long each piece takes, what precautions to take, and which system does which job. The list of what was removed comes back too, because those reasons are the part the owner will use again next year. If you ask us to build it and run it, the assessment is included in that work. If you build it yourself, the plan is your map.",
    "It fits an owner whose team repeats the same work every week: a contractor answering calls and chasing quotes, a dental or accounting office whose front desk is always full, a salon, spa or gym juggling bookings and reviews, a real estate office with more inquiries than people to answer them. No AI knowledge is needed. The questions are about the business.",
    "Deciding not to build something is a real result, not a failed assessment. NIST, the US standards agency, published an AI Risk Management Framework (version 1.0, January 2023, which NIST says it is revising), and the framework asks whether development should proceed at all. A plan that says leave this one with a person has done its job.",
  ],

  howItWorks: [
    {
      title: "We follow the work, not the org chart",
      body: "One hour with you on the last real week. One real job, traced from the first touch to the last. Every manual step. Every tool it passes through. And every place the same information gets typed twice.",
    },
    {
      title: "We cut the list before we order it",
      body: "Three questions, applied to every candidate. Does it happen often enough that someone would notice it breaking within a week. Could the rule be written down for a new hire. And where would a wrong answer end up. Any one of those can remove a candidate. The third removes the most.",
    },
    {
      title: "We order what survives, and write down why",
      body: "How contained the worst case is comes first. Whether the rule is actually settled comes second. The size of the saving comes third. Every position has its reason beside it, so the order survives someone asking why the third one is not the first.",
    },
    {
      title: "We hand over the plan",
      body: "What to build and in what order, how long each piece takes, the precautions, and which system does which job, with the crossed-off list and its reasons. We can build it and run it, with the assessment included, or you can build from it yourself.",
    },
  ],

  handoff: {
    provides: [
      "One hour of the owner's time, or the owner's and the manager's.",
      "One real job from the last week, walked through from the first touch to the last.",
      "The names of the tools the business already uses for it, no logins needed.",
      "An honest account of the workarounds, including the ones nobody writes down.",
    ],
    approves: [
      "Every item on the plan: what is built, what waits, and what is left with a person.",
      "The order, and whether to build at all.",
      "Who builds it: us, the business's own people, or nobody yet.",
      "Any change to how a customer is spoken to, before it happens.",
    ],
  },

  useCases: [
    {
      title: "Knowing AI would help, but not where",
      body: "The most common place to be stuck. An assessment turns an open-ended topic into a numbered list. That is the difference between thinking about AI and using it.",
    },
    {
      title: "A list that should get shorter, not longer",
      body: "Anybody can add candidates. The useful hour removes them, for reasons the owner can apply again alone. And it does that before any money has moved.",
    },
    {
      title: "A tool that was tried and did nothing",
      body: "An AI tool that did nothing was usually pointed at the wrong job. Mapping the work first is what stops that happening twice.",
    },
    {
      title: "A contractor or a busy office, one job at a time",
      body: "A roofer's evening calls, an accounting office's document chase in tax season, a salon's no-shows, a real estate office's late-night inquiries: each is one job, and the hour traces one of them in full rather than skimming ten.",
    },
  ],

  limits: [
    "It does not decide anything for you. The output is a shorter list and a plan. What the business actually changes stays the owner's call.",
    "It cannot see what nobody will say out loud. The account is only as honest as the description of how the work really happens. That includes the parts everyone quietly works around.",
    "It does not produce a saving on paper. Every hour on the list is an hour somebody still has to choose to spend on something else.",
    "It does not put a price on each candidate. What a build costs depends entirely on which one. A number attached to a candidate before anybody has looked at the systems is a guess with a decimal point in it.",
    "It does not stay true. The list has a shelf life measured in months, because the systems, the people and the volume all move.",
    "It does not build anything on its own. It ends with a written plan, and building it, by us or by you, is a separate decision.",
  ],

  faqs: [
    {
      q: "What is an AI readiness assessment?",
      a: "It is a one-hour review, with the owner, of how the business actually operates. It is done to find where AI or automation is worth building and, just as importantly, where it is not. What comes back is a written plan: a shortlist in an order with the reason for each position attached, what we would build and how, how long each piece takes, the precautions, and the list of candidates that were removed and why.",
    },
    {
      q: "How do I use AI in my business?",
      a: "Start with one job, not with a tool. Write down how that job runs today, every step and every tool, then ask three questions of each step: does it happen often enough that a failure gets noticed within a week, could the rule be written down for a new hire, and where would a wrong answer land. What survives all three is a candidate; the rest stays with a person. The assessment is that test, run with the owner in one hour, with the plan written down.",
    },
    {
      q: "Where should a small business start with AI?",
      a: "With whatever survives three questions and has the most contained failure, which is usually something unglamorous. There is no universal answer, and that is deliberate. In the 2018 Annual Business Survey, a Census Bureau sample of over 850,000 firms where answering is required by law, only 10.3 percent of firms used any advanced business technology at all. Asked a different question, the Census Bureau put AI use at 19.8 percent of US businesses as of May 3, 2026; by the Census count, most were not using AI. How many firms use it depends on the question asked, and neither count is enough for anybody to know what works in general.",
    },
    {
      q: "How do you decide what not to automate?",
      a: "Three tests, in order. It happens too rarely for anybody to notice it breaking. That is how a quarterly job fails in March and gets discovered in June. The rule behind it is not actually settled, which usually shows up as three people describing it three different ways. Or a wrong answer would reach a customer before a person saw it. Any one of those is enough on its own.",
    },
    {
      q: "What do I actually get at the end?",
      a: "A written plan. It maps how the work runs today, including the parts nobody had written down, and puts the shortlist in an order with the reason for each position beside it. It says what we would build, how, how long each piece takes, what precautions to take and which system does which job. It lists the candidates that were removed and why, which is the part to use again next year. If you ask us to build it and run it, the assessment is included in that work; if not, the plan is yours to build from.",
    },
    {
      q: "Do I need to know anything about AI beforehand?",
      a: "No. The assessment is about the business, not about the technology. The owner describes how the work happens, and choosing the tools is our job.",
    },
    {
      q: "Is an AI assessment the same as an AI audit?",
      a: "Mostly, yes: some firms call it an AI audit. The difference here is the output. It is not a score or a report card. It is a short, ordered plan with the reasons written beside each line, and a second list of what not to build, because a decision not to build is a legitimate result.",
    },
  ],

  door: "assessment",

  relatedPosts: [
    "ai-assessment-small-business-what-not-to-automate",
    "workflow-automation-real-estate-business",
    "custom-automation-real-estate-bespoke-build",
  ],
};
