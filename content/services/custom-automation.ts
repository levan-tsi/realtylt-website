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
  why: "Every team has a bottleneck no off-the-shelf tool fixes. Custom automation removes the manual step quietly capping your growth. Once, then forever.",
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
      "Inbound and outbound agents, enrichment, qualification, scheduling, CRM sync, and document processing, orchestrated in n8n and wired to the stack you already run.",
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
      body: "Orchestrated in n8n, wired to your systems, logged on every run, versioned so a change can be rolled back. Built once, then it just runs.",
    },
  ],

  useCases: [
    {
      title: "The step no tool covers",
      body: "Every business has one. It is specific, it is manual, and it is why hiring feels like the only option. It usually is not.",
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

  faqs: [
    {
      q: "What can actually be automated?",
      a: "Anything repetitive with a rule behind it, and increasingly anything repetitive with a judgment behind it, since an LLM can make the judgment. Inbound and outbound conversations, data enrichment, lead qualification, scheduling, CRM sync, and document processing are all standard now. The honest test is whether you could describe the task to a competent new hire, because if you can, it can be built.",
    },
    {
      q: "Why n8n rather than an off-the-shelf product?",
      a: "Because an off-the-shelf product solves the average version of a problem, and the step capping your growth is usually not average. n8n orchestrates custom chains, runs your own logic, and can be self-hosted so the data stays in your environment.",
    },
    {
      q: "How do you decide what to build first?",
      a: "By payback. The step that costs the most hours and is cheapest to remove goes first. If you have not mapped that yet, the AI audit is the place to start, and it is designed to end with the first build rather than a document.",
    },
    {
      q: "Will it work with the tools I already have?",
      a: "Yes. Automation sits between your existing systems and connects them, so your CRM, calendar, and files stay where they are. Replacing your stack is not part of it.",
    },
  ],

  relatedPosts: ["workflow-automation-real-estate-business"],
};
