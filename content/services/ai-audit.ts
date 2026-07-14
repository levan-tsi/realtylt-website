import type { Service } from "./types";

/** COPY key `consult` on realtylt.com/ai. Deep link: /ai#consult */
export const aiAudit: Service = {
  slug: "ai-audit",
  aiKey: "consult",
  name: "AI Audit",
  tier: "core",

  eyebrow: "AI Audit · Start here",
  title: "See exactly where AI pays off first",
  lede: "We map how your business actually runs, find the spots where AI saves the most time or money, and hand you a plan ranked by payback, then build the first win. The low-risk way to start when you know AI can help but not where to point it.",
  specs: ["full workflow review", "ranked by payback", "clear build plan", "a quick first win"],
  why: "Most owners know AI could help but freeze on where to begin, so nothing ships. An audit turns that into a short, prioritized list of what to automate first, so you spend on the change with the biggest return instead of guessing.",
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
      "A mapped review of how your business actually runs, a list of AI opportunities ranked by payback, a clear build plan, and a first win shipped. The low-risk way to start.",
  },

  figure: {
    kind: "records",
    caption: "What the ranked list looks like when it lands",
    headers: { before: "What you do by hand today", after: "What it is worth to fix" },
    rows: [
      {
        before: "Answering website inquiries the next morning",
        after: ["~6 hrs/week", "highest payback", "build first"],
        tag: "rank 1",
      },
      {
        before: "Retyping lead details from email into the CRM",
        after: ["~4 hrs/week", "cheap to automate", "build second"],
        tag: "rank 2",
      },
      {
        before: "Chasing missing signatures on open files",
        after: ["~3 hrs/week", "needs system access", "phase two"],
        tag: "rank 3",
      },
    ],
    footnote: "Ranked by payback, not by how impressive it sounds. The boring one at the top is usually the one that pays.",
  },

  whatItIs: [
    "It is a mapped review of how your business actually runs, done by walking one real job end to end and writing down every step, every tool, and every hour that goes into it. Most owners have never seen that written out, and it is always longer than they think.",
    "What you get back is a short list of AI and automation opportunities, ranked by payback rather than by novelty, with a build plan attached. Then we build the first one, so the audit ends in a working thing rather than a document.",
  ],

  howItWorks: [
    {
      title: "We follow the work, not the org chart",
      body: "One real job, traced from the first touch to the last. Every manual step, every tool it passes through, and every place the same information gets typed twice.",
    },
    {
      title: "We rank by payback",
      body: "Hours saved, errors removed, and revenue recovered, weighed against how hard each one is to build. The list comes back in the order you should actually do it.",
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
      title: "You want a number before you commit",
      body: "The list tells you what each fix is worth before you pay to build any of it, so the first spend is on the change with the biggest return.",
    },
    {
      title: "You tried a tool and it did nothing",
      body: "Usually because it was pointed at the wrong problem. Mapping the work first is what stops that happening twice.",
    },
  ],

  faqs: [
    {
      q: "What is an AI audit?",
      a: "It is a review of how your business actually operates, done to find where AI or automation would save the most time or money. The output is a list of opportunities ranked by payback and a plan for building them, starting with the one that returns the most for the least effort.",
    },
    {
      q: "Where should a small business start with AI?",
      a: "With the task you repeat most often and enjoy least, which is almost never the one that sounds most impressive. In practice the first win is usually instant response to inbound inquiries, or removing the copy-paste between two systems. An audit exists to identify which one it is for you rather than guessing.",
    },
    {
      q: "What do I actually get at the end?",
      a: "A written map of how the work runs today, a ranked list of what to automate and what each one is worth, a build plan, and one automation actually shipped and running.",
    },
    {
      q: "Do I need to know anything about AI beforehand?",
      a: "No. The audit is about your business, not about the technology. You describe how the work happens, and choosing the tools is our job.",
    },
  ],

  relatedPosts: ["workflow-automation-real-estate-business"],
};
