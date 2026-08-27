import type { Service } from "./types";

/** COPY key `plus` on realtylt.com/ai. Deep link: /ai#plus */
export const customAutomation: Service = {
  slug: "custom-automation",
  aiKey: "plus",
  name: "Custom Automation",
  tier: "core",

  eyebrow: "Sky's the limit · Anything",
  title: "If it's repetitive, it can run itself",
  lede: "Inbound and outbound agents, enrichment, qualification, scheduling, CRM sync, document processing, all orchestrated in n8n and wired to your stack. The same machine drops into almost any workflow.",
  specs: ["n8n orchestration", "your workflow", "your tools", "your scale"],
  why: "Every team has a bottleneck no off-the-shelf tool fixes. Custom automation removes the manual step quietly capping your growth, and it becomes a thing you own from the day it works: something that runs, that somebody understands, and that stands on interfaces belonging to other companies.",
  keywords: [
    "real estate workflow automation",
    "custom ai automation for realtors",
    "n8n real estate automation",
    "crm automation real estate",
    "automate real estate tasks",
  ],

  seo: {
    title: "Custom AI Automation Built Around Your Workflow",
    description:
      "Inbound and outbound agents, enrichment, qualification, scheduling, CRM sync, and document processing, orchestrated in n8n and wired to your stack.",
  },

  /** A vendor's own published promise, and the shortest of the three the flagship draws. It is
   * here rather than a claim of ours because what a business is buying with a bespoke build is an
   * exposure to other companies' release schedules. Added in round H alongside the flagship. */
  stat: {
    value: "12 months",
    label: "the notice Google's cloud terms promise before a backwards-incompatible change to a customer-facing API",
    source: {
      text: "Google Cloud Platform Terms of Service, section 1.4(e), Discontinuation of Services",
      href: "https://cloud.google.com/terms/",
    },
  },

  figure: {
    kind: "flow",
    caption: "The pieces, assembled to fit whatever you actually do",
    trigger: "Your bottleneck",
    nodes: [
      { label: "Agents", note: "Inbound and outbound, text and voice, wherever the conversation happens." },
      { label: "Data", note: "Enrichment, validation, and qualification before anyone spends an hour on a bad record." },
      { label: "Orchestration", note: "n8n holds the chain together and keeps every run auditable." },
      { label: "Your stack", note: "It writes into the CRM, calendar, and files you already use." },
    ],
    footnote: "Off-the-shelf tools solve the average problem. This one is built for the step that is actually capping you.",
  },

  whatItIs: [
    "It is the version of all of this that gets built around your business instead of the other way round. Every team has one step that no product on the market fixes, because it is specific to how they work, and that step is usually the thing quietly capping their growth.",
    "The components are the same ones behind every other service here: agents that talk, pipelines that enrich, systems that qualify, schedule, sync, and file. What changes is the assembly. It gets orchestrated in n8n and wired into the tools you already run.",
  ],

  howItWorks: [
    {
      title: "Find the step that is actually capping you",
      body: "Not the one that is annoying, the one that is limiting. They are frequently different, and only one of them is worth building for.",
    },
    {
      title: "Assemble it from proven parts",
      body: "Agents, enrichment, qualification, scheduling, sync, and document processing already exist and already work. Building custom means arranging them for your workflow, not inventing from zero.",
    },
    {
      title: "Run it in your stack, with the lights on",
      body: "Orchestrated in n8n, wired to your systems, logged on every run, versioned so a change can be rolled back. It fails loudly rather than quietly, because the most common ending for a chain like this is silence, and silence looks exactly like having nothing to do.",
    },
    {
      title: "Hand it over so somebody else could pick it up",
      body: "A written description of what it does in the language of the business rather than of the software, kept with the thing itself, plus credentials and an environment that are yours. That page costs an hour at the end of a build and it is the difference between the next change being a change and being a rebuild.",
    },
  ],

  useCases: [
    {
      title: "The step no tool covers",
      body: "Specific to how you work, manual, and the reason hiring starts to feel like the only option. Sometimes it is. The useful question first is how many other businesses would recognise the description, because if the answer is thousands there is probably a product.",
    },
    {
      title: "Several tools that refuse to talk",
      body: "The systems are fine on their own. The cost is in the gaps between them, and the gaps are what get wired shut.",
    },
    {
      title: "Growth that means more headcount",
      body: "When doubling the work means doubling the people, the constraint is manual process. Automating it changes what growth costs.",
    },
  ],

  limits: [
    "It does not build what you cannot describe. The honest test is whether you could explain the task to a competent new hire, and if you cannot, deciding how the work should run is the first job.",
    "It does not replace your stack. Automation sits between the systems you already run and connects them, so nothing here is a reason to migrate your CRM.",
    "It does not survive a process that keeps changing. A chain wired to a workflow redrawn every month spends its life being rewired, and that cost is real.",
    "It does not take the person out of the steps that need one. A step that guesses where it ought to have asked is one that will, on some future day, be confidently wrong to a client's face.",
    "It does not stop existing once it is delivered. It runs, somebody has to notice when it stops, and every system it touches belongs to a company with its own release schedule.",
    "It does not retire itself. A build with no review date runs until something outside it breaks it, which means a vendor decides when you stop, rather than you.",
  ],

  faqs: [
    {
      q: "What can actually be automated?",
      a: "Anything repetitive with a rule behind it, and a good deal that has a judgment behind it, since a model can make many kinds of judgment now. Inbound and outbound conversations, data enrichment, lead qualification, scheduling, CRM sync and document processing are all standard. Being able to describe the task to a competent new hire is the first test and it is not the last: it also has to happen often enough that somebody would notice it breaking, and a wrong answer has to land somewhere that is not in front of a client.",
    },
    {
      q: "Why n8n rather than an off-the-shelf product?",
      a: "Because an off-the-shelf product solves the average version of a problem, and the step capping your growth is usually not average. n8n orchestrates custom chains, runs your own logic, and can be self-hosted so the data stays in your environment.",
    },
    {
      q: "How do you decide what to build first?",
      a: "By how contained the worst case is, then by whether the rule is actually settled, and only then by the size of the saving. That order is deliberate: on a sample of 1,471 technology projects worth 241 billion dollars, 17 percent landed in a fat right hand tail where a thin-tailed distribution would have put under one percent, so an expected payback describes the middle of the range rather than what you are exposed to. If you have not mapped any of this yet, the AI audit is the place to start.",
    },
    {
      q: "What happens when the software it connects to changes?",
      a: "Usually nothing, occasionally something, and the awkward middle case is a change that is not officially a breaking change at all. Vendors are allowed to add new values to a field without changing an API version and they document that they will. Which is why the thing to specify in any build is what it does when it meets something unfamiliar, and the only good answers involve stopping and telling a person.",
    },
    {
      q: "Will it work with the tools I already have?",
      a: "Yes. Automation sits between your existing systems and connects them, so your CRM, calendar, and files stay where they are. Replacing your stack is not part of it.",
    },
  ],

  relatedPosts: [
    "custom-automation-real-estate-bespoke-build",
    "workflow-automation-real-estate-business",
    "ai-audit-small-business-what-not-to-automate",
  ],
};
