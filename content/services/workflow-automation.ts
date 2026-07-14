import type { Service } from "./types";

/** COPY key `workflow` on realtylt.com/ai. Deep link: /ai#workflow */
export const workflowAutomation: Service = {
  slug: "workflow-automation",
  aiKey: "workflow",
  name: "Workflow Automation",
  tier: "core",

  eyebrow: "Automation · Connect your tools",
  title: "The busywork runs itself now",
  lede: "We wire your tools together (Make, n8n, Zapier, plus AI) so the repetitive steps between them just happen. A new lead, a paid invoice, a signed form: the follow-on tasks fire on their own, across every app you already use, without anyone copy-pasting between tabs.",
  specs: ["Make / n8n / Zapier", "connects your existing tools", "AI in the loop", "runs end to end"],
  why: "Every business loses hours to the same manual steps: moving data between apps, chasing the next task, retyping what a system already knows. Automating that chain hands those hours back and quietly removes the mistakes that come from doing it by hand.",
  keywords: [
    "business workflow automation",
    "n8n automation services",
    "zapier automation for business",
    "connect your apps with ai",
    "automate repetitive tasks",
  ],

  seo: {
    title: "Workflow Automation with n8n, Make, and Zapier",
    description:
      "Wire the tools you already use into one chain so the repetitive steps between them fire on their own. A new lead, a paid invoice, a signed form: what follows happens without copy-paste.",
  },

  figure: {
    kind: "flow",
    caption: "One new lead, seven steps, nobody touching a keyboard",
    trigger: "A form is submitted at 11:47pm",
    nodes: [
      { label: "Written to the CRM", note: "Deduped against the existing record instead of creating a second one." },
      { label: "Enriched", note: "Phone validated, address resolved, source tagged." },
      { label: "Replied to", note: "A text goes out in seconds, not in the morning." },
      { label: "Routed", note: "Scored on intent, then assigned to the right person." },
      { label: "Scheduled", note: "The follow-up task lands on the calendar with the context attached." },
    ],
    footnote: "Every step here is one somebody used to do by hand, badly, at 9am the next day.",
  },

  whatItIs: [
    "It is the plumbing between the tools you already pay for. Your CRM, your calendar, your email, your forms, your invoicing, and your documents all hold pieces of the same job, and the gap between them is where the hours go: copying a number from one tab to another, remembering to send the thing, retyping what a system already knows.",
    "We wire those tools together with Make, n8n, or Zapier, and we put AI in the loop where a decision has to be made rather than just a field copied. A new lead, a paid invoice, or a signed form triggers everything that should follow it, end to end, in seconds, at any hour.",
  ],

  howItWorks: [
    {
      title: "Map what actually happens today",
      body: "We follow one real job through your business and write down every manual step. The list is always longer than people expect, and the worst offenders are usually invisible because everyone has stopped noticing them.",
    },
    {
      title: "Wire the chain",
      body: "The tools get connected so each step triggers the next. Where a step needs a judgment call rather than a field copy, an AI makes it, and where it needs a human, it stops and asks.",
    },
    {
      title: "Let it run, and watch it",
      body: "Every run is logged, failures alert rather than disappear, and the chain is versioned so a change can be rolled back. Automation you cannot see is automation you cannot trust.",
    },
  ],

  useCases: [
    {
      title: "Lead intake that finishes itself",
      body: "A form submission at midnight becomes a deduped CRM record, an enriched contact, an instant reply, a scored priority, and a task on your calendar, without anyone opening a laptop.",
    },
    {
      title: "The transaction checklist that runs itself",
      body: "A signed contract fires the inspection reminder, the document requests, and the key-date calendar entries automatically, so a deadline never depends on somebody remembering it.",
    },
    {
      title: "No more copy-paste between tabs",
      body: "The data a system already holds stops being retyped into the next system. That is where most of the reclaimed hours come from, and most of the eliminated mistakes.",
    },
  ],

  faqs: [
    {
      q: "What is workflow automation?",
      a: "It is connecting the software you already use so that finishing one step automatically starts the next. Instead of a person copying a lead from a form into a CRM, sending a reply, and setting a reminder, the chain fires by itself the moment the form is submitted.",
    },
    {
      q: "What is the difference between n8n, Make, and Zapier?",
      a: "They are all tools for wiring apps together, and they differ in depth. Zapier is the simplest and the most limited. Make handles branching and more complex logic. n8n is self-hostable and the most flexible, which matters when a workflow needs custom code or has to keep data in your own environment. We pick based on the workflow, not on a preference.",
    },
    {
      q: "Do I need to replace the software I already use?",
      a: "No. That is the point of it. Automation sits between your existing tools and connects them. Your CRM, your calendar, and your inbox stay exactly where they are.",
    },
    {
      q: "What happens when an automation breaks?",
      a: "It alerts, it logs what failed and why, and it does not silently drop the work. Chains are versioned so a bad change can be rolled back, and steps that genuinely need human judgment are built to stop and ask rather than guess.",
    },
    {
      q: "How long does it take to automate a workflow?",
      a: "Simple chains, like intake and instant reply, are typically live in days. Multi-system workflows with real branching take longer, mostly because mapping what your business actually does today is the slow part, not the building.",
    },
  ],

  relatedPosts: ["workflow-automation-real-estate-business", "ai-chat-assistant-real-estate-website"],
};
