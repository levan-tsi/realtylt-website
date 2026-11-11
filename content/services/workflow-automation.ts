import type { Service } from "./types";

/** COPY key `workflow` on realtylt.com/ai. Deep link: /ai#workflow
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's quotes, a dental
 * office's new-patient forms, an accounting office in tax season, a salon, a real estate office's
 * contract dates as one example), with the quote follow-up first, because the AI plan's film from
 * this page and its post is "How to follow up on every quote without chasing". Tool names out of
 * the copy (BRAND section 5); the error-pause rule is stated without the vendor's name.
 * Re-read 2026-11-11 and saved in realtylt-agents company/agents/seo/runs/r28-services/sources/
 * workflow/: Mark, Gonzalez and Harris, "No Task Left Behind?", CHI 2005 ("observation of 24
 * information workers"; "When people did resume work on the same day, it took an average length
 * of time of 25 min. 26 sec"); the automation tool's help page ("automatically pauses ... if it
 * hits an error 95% or more percent of the times that it has run in the last 7 days").
 * Cut as unsourced: "an afternoon a month". */
export const workflowAutomation: Service = {
  slug: "workflow-automation",
  aiKey: "workflow",
  name: "Workflow Automation",
  tier: "core",

  eyebrow: "Automation · Connect your tools",
  title: "Workflow automation: the busywork runs itself",
  lede: "A quote goes out on Tuesday and nobody remembers to follow it up until the customer has hired someone else. We connect the apps the business already uses so the steps between them happen on their own: a form comes in, a quote is sent, an invoice is paid, and the next task starts without anyone retyping. Where a step needs judgment, it stops and asks a person.",
  specs: ["connects the tools you use", "follows up on every quote", "stops and asks a person", "runs end to end"],
  why: "Every office loses time to the same steps done by hand: moving a detail from one app to the next, chasing the next task, retyping what a system already knows. When that chain runs itself, the time comes back, and so do the follow-ups that used to slip through.",
  keywords: [
    "workflow automation for small business",
    "how to automate repetitive tasks",
    "business process automation",
    "process automation for small business",
    "ai workflow automation for small business",
  ],

  seo: {
    title: "Workflow automation for small business: quotes, forms, follow-up",
    description:
      "Workflow automation for a small business: the apps you already use connected, so quotes get followed up, forms land in the right place and the next task starts itself.",
  },

  figure: {
    kind: "flow",
    caption: "One quote, followed up without anyone chasing it",
    trigger: "A roofing quote is sent on Tuesday at 4:10pm",
    nodes: [
      { label: "Logged", note: "The quote, the customer and the amount are written to the CRM, once." },
      { label: "Day 3", note: "A short note checks the customer got it and asks if there are questions." },
      { label: "A reply", note: "Any answer stops the sequence and goes to the owner, with the quote attached." },
      { label: "Day 7", note: "No reply: a task lands on the owner's list to call, not another automatic message." },
      { label: "Won or lost", note: "The outcome is marked, so the next month shows which quotes close." },
    ],
    footnote: "An invented example. The owner approves the wording and the days; a person makes every call.",
  },

  whatItIs: [
    "It is the connection between the tools a business already pays for. The CRM, the calendar, the email, the website forms, the quoting and invoicing app and the documents all hold pieces of the same job. The gap between them is where the time goes: copying a number from one tab to another, remembering to send the thing, retyping what a system already knows.",
    "We connect those tools so that a new inquiry, a sent quote, a paid invoice or a signed form starts everything that should follow it, end to end, at any hour. Where a step needs a decision rather than a copied field, an AI can make a small, checkable one, such as which person a request belongs to. Where it needs a person, the chain stops and asks.",
    "The cost of a manual step is not the ninety seconds of typing. In a 2005 field study at the University of California, Irvine, researchers timed 24 information workers at their desks. When interrupted work was picked up again the same day, getting back to it took an average of 25 minutes and 26 seconds. Those were office workers in one study, so read it as what interruption does to concentrated work, not as a number about any one business. The point stands either way: a step that fires by itself does not pull anyone out of anything.",
    "It fits any office that repeats the same steps every week: a contractor sending quotes, a dental office handling new-patient forms, an accounting office collecting documents in tax season, a salon or spa turning bookings into reminders and review requests, a real estate office tracking contract dates.",
  ],

  howItWorks: [
    {
      title: "Map what actually happens today",
      body: "We follow one real job through the business with the owner and write down every manual step, every tool it passes through and every place the same detail is typed twice. The list is usually longer than people expect, because the steps everyone has stopped noticing are on it too.",
    },
    {
      title: "Start with the boring one",
      body: "Rank that list by how often the step happens and how little judgment it needs, and build the top of it first. The interesting problem is the one with judgment in it, which is also the one most likely to be wrong in front of a customer. Trust gets earned by something whose failure costs an apology.",
    },
    {
      title: "Connect the chain",
      body: "The tools are connected so each step starts the next. Where a step needs a small judgment, an AI makes it and records why. Where it needs a person, it stops and asks, with everything that person needs to decide.",
    },
    {
      title: "Run it, and watch it",
      body: "Every run is logged, a failure sends a message to a person rather than disappearing, and the chain is versioned so a change can be rolled back. Automation nobody can see is automation nobody can trust.",
    },
    {
      title: "Check it after a month",
      body: "We sit with the owner and count how many times somebody still touched that job by hand. The chain stays, changes or comes out on that number, and the next one on the list is chosen the same way.",
    },
  ],

  handoff: {
    provides: [
      "One real job, walked through with us from the first touch to the last.",
      "Access to the tools that job passes through, with a login for each.",
      "The wording of every message a customer will see, or a yes on ours.",
      "The person who gets told when a chain fails, and how fast they look.",
    ],
    approves: [
      "Which job is automated first, and which is left alone.",
      "Every message a customer will see, before the chain goes live.",
      "Any step that spends money, changes a price or binds the business.",
      "Whether a chain stays on after its first month.",
    ],
  },

  useCases: [
    {
      title: "A contractor's quotes, followed up every time",
      body: "A sent quote starts a short sequence: a check that it arrived, a question after a few days, and a task on the owner's list if nobody replies. Any reply stops it and goes to a person. The quotes that used to go quiet because nobody had time to chase them get a follow-up every time.",
    },
    {
      title: "Lead intake that finishes itself",
      body: "A form submitted at midnight becomes one CRM record rather than a duplicate, a reply the person gets straight away, and a task with the details attached on the right person's list, without anyone opening a laptop.",
    },
    {
      title: "A dental office's new-patient forms",
      body: "The forms a new patient fills in land in the right place, the appointment is confirmed, and the front desk sees one finished record instead of retyping a clipboard. Nothing in the chain reads or moves anyone's treatment record.",
    },
    {
      title: "An accounting office in tax season",
      body: "A list of the documents each client still owes is kept current from what has actually arrived, and a polite reminder goes only to the clients still missing something. The partner sees who is complete without asking.",
    },
    {
      title: "A real estate office's contract dates",
      body: "A signed contract puts the inspection reminder, the document requests and the key dates on the calendar automatically, so a deadline stops depending on somebody remembering it. A person still reads the contract for what each date means.",
    },
    {
      title: "The chain that fails quietly",
      body: "One widely used automation tool, by default, pauses a chain only when it fails on 95 percent or more of its runs in the last seven days. A chain that fails once in twenty stays switched on and looks fine. On forty inquiries a month, that is two people who wrote and got nothing. That is why an error path that tells a person is part of every build here.",
    },
  ],

  /** Lifted from this service's own flagship post (content/blog/ai-posts.ts). The third entry
   * argues against the word "AI" on a page that sells AI, which is exactly why it stays. */
  limits: [
    "It does not fix a bad process. If the manual version loses customers, the automated version loses them faster, at three in the morning, with a log entry saying it worked.",
    "It does not remove judgment. Every chain worth building has a step where a person would have paused, and the right behaviour at that step is to stop and ask rather than guess.",
    "It is mostly not artificial intelligence, whatever it gets sold as. Most of the steps are a detail moving from one place to another with no cleverness in them at all, and they are more reliable for it.",
    "It does not hand back a whole day. It hands back the small steps and removes a kind of mistake. That is a duller promise than the usual one, and it is the one that survives contact with a real business.",
    "It does not keep itself working. A chain breaks the day a tool renames a field, so somebody is always named as the person who is told and who looks.",
  ],

  faqs: [
    {
      q: "What is workflow automation?",
      a: "It is connecting the software a business already uses so that finishing one step automatically starts the next. Instead of a person copying an inquiry from a form into a CRM, sending a reply and setting a reminder, the chain fires by itself the moment the form is submitted, and stops for a person where a decision is needed.",
    },
    {
      q: "How do I automate repetitive tasks in a small business?",
      a: "Write down one real job from start to finish, every step and every tool, then pick the step that happens most often and needs the least judgment, and automate only that. Check it after a month by counting how often somebody still did it by hand. Starting with one chain rather than a platform is what keeps the first month cheap and honest.",
    },
    {
      q: "Which repetitive tasks should a small business automate first?",
      a: "The boring, frequent ones whose failure is cheap and noticed: logging an inquiry, a follow-up on a sent quote, a reminder for documents still owed, an appointment confirmation. Leave anything that sets a price, judges a person or binds the business with a person, and automate the steps around it instead.",
    },
    {
      q: "Do I need to replace the software I already use?",
      a: "No. That is the point of it. Automation sits between the tools the business already has and connects them. The CRM, the calendar, the inbox and the invoicing app stay exactly where they are.",
    },
    {
      q: "Which automation tools do you use?",
      a: "The ones that fit the job: an established automation platform for most chains, and custom code where a chain needs it or where the data has to stay in the business's own environment. The choice is made per workflow, by what it has to do and what it has to protect, not by a preference.",
    },
    {
      q: "What happens when an automation breaks?",
      a: "It sends a message to a named person, logs what failed and why, and does not silently drop the work. Chains are versioned so a bad change can be rolled back, and steps that genuinely need judgment are built to stop and ask rather than guess.",
    },
    {
      q: "Is workflow automation worth it for a one-person business?",
      a: "Often more, not less. A one-person business has nobody to absorb the busywork, so every manual step comes out of the only calendar there is. Start with a single chain at the top of the frequency list rather than with a platform, then judge it after a month against how many times the job was still done by hand.",
    },
    {
      q: "How long does it take to automate a workflow?",
      a: "A simple chain, such as intake and an instant reply, can be live within days once the tools are connected. Chains across several systems with real branching take longer, mostly because mapping what the business actually does today is the slow part, not the building.",
    },
  ],

  relatedPosts: [
    "workflow-automation-real-estate-business",
    "ai-assessment-small-business-what-not-to-automate",
    "custom-automation-real-estate-bespoke-build",
  ],
};
