import type { Service } from "./types";

/** COPY key `agents` on realtylt.com/ai. Deep link: /ai#agents */
export const aiAgentWorkforce: Service = {
  slug: "ai-agent-workforce",
  aiKey: "agents",
  name: "AI Agent Workforce",
  tier: "core",

  eyebrow: "Agent Workforce · On-demand LLM assistants",
  title: "Hire as many assistants as you want",
  lede: "Spin up a personal AI assistant for any job. One drafts your emails, one preps CMAs, one chases paperwork, one watches your inbox. Each assistant is an LLM agent tuned to the task you hand it, and you can run as many as you want, in parallel, around the clock.",
  specs: ["unlimited parallel agents", "task-tuned LLMs", "plugs into your tools", "always on"],
  why: "You can't hire a person for every recurring task, but you can delegate each one to its own AI assistant. You stop doing the busywork and start managing a staff that never sleeps.",
  keywords: [
    "personal ai assistant for realtors",
    "ai agents for real estate",
    "hire ai assistant",
    "llm agent workforce",
    "ai staff automation real estate",
  ],

  seo: {
    title: "AI Agent Workforce: Personal AI Assistants for Realtors",
    description:
      "Run a staff of task-tuned AI assistants in parallel. One drafts emails, one preps CMAs, one chases paperwork. Always on, plugged into the tools you already use.",
  },

  /** ROUND D: `stat` added, carrying the finding that decides how this should be built rather
   * than a number that flatters it. Across 1,642 annotated multi-agent runs, the largest share
   * of failures came from how the system and its instructions were specified, not from the
   * model. That is the argument for spending an hour writing each brief properly, which is the
   * part of this service that is actually hard. External figure, so it carries its source. */
  stat: {
    value: "44.2%",
    label: "of failures in 1,642 annotated multi-agent runs came from how the system and its instructions were specified, not from the model",
    source: {
      text: "M. Cemri et al. (UC Berkeley), Why Do Multi-Agent LLM Systems Fail?, arXiv:2503.13657, 2025",
      href: "https://arxiv.org/abs/2503.13657",
    },
  },

  figure: {
    kind: "flow",
    caption: "Four assistants, one morning, nobody hired",
    trigger: "Your day starts",
    nodes: [
      { label: "Inbox agent", note: "Reads overnight mail, flags the three that matter, drafts the replies." },
      { label: "CMA agent", note: "Pulls comps for tomorrow's listing appointment and builds the deck." },
      { label: "Paperwork agent", note: "Chases the two signatures still missing on the Beacon file." },
      { label: "Follow-up agent", note: "Works the leads that went quiet and reports who re-engaged." },
    ],
    // ROUND D: was "They run at the same time, and adding a fifth costs a conversation, not a
    // salary." That is the same comparative-salary claim Round B killed on the voice page, and
    // the flagship post for this service now explains at length why the division is invalid:
    // the published median wage for an administrative assistant buys accountability, judgement
    // and somebody who notices the job has changed, and none of those are on offer here.
    // Guarded in lib/blog/zombie-claims.test.ts.
    footnote: "They run at the same time. What grows with each one you add is not the payroll, it is the amount of output somebody has to read.",
  },

  whatItIs: [
    "It is a set of AI assistants, each one pointed at a single recurring job. An assistant is not a general chatbot you have to re-explain your business to every morning. It is configured for one task, it knows your tools, and it does that task the same way every time.",
    "The unlock is parallelism. You can only do one thing at a time, and you can only afford so many people. Assistants have neither limit: the inbox one, the CMA one, and the paperwork one all run at once, all night, and adding another one is a decision rather than a hire.",
  ],

  howItWorks: [
    {
      title: "Name the job you keep redoing",
      body: "We start with the tasks that repeat: the emails you draft from the same template, the comps you pull the same way, the document you chase every deal. Repetition is what makes a job delegable.",
    },
    {
      title: "Write the brief, then tune an assistant to it",
      // ROUND D: "write the brief" added to the title and the first sentence, because the
      // research this page now cites puts most of an agent's usable ability in that document.
      // Removing the written policy from one benchmark agent took it from 33.2% to 10.8% on
      // the domain whose rules were specific rather than commonsense.
      body: "The document comes before the software: the task, the rules, and what should happen in the cases that are not the normal case. Each assistant is an LLM agent given that brief and the tools it needs and nothing else, and it is tested against work you have already done by hand.",
    },
    {
      title: "Run as many as you need, always on",
      body: "The assistants work in parallel and do not stop at 5pm. You review the output rather than produce it, which is the difference between doing the busywork and managing it.",
    },
  ],

  useCases: [
    {
      title: "The inbox that reads itself",
      body: "An assistant triages overnight email, surfaces what genuinely needs you, and drafts the replies to the rest so you are approving instead of typing.",
    },
    {
      title: "CMA prep before the appointment",
      body: "Comps pulled, filtered, and laid out before you walk in, so the hour you used to spend building the deck goes to the conversation instead.",
    },
    {
      title: "The transaction chaser",
      body: "An assistant watches every open file for the missing signature, the expiring contingency, and the document nobody sent, and it does the chasing.",
    },
  ],

  limits: [
    "It does not think for you. An assistant does one job the way you described it, so a vague brief produces output that is fast, consistent and useless.",
    "It is not a hire. There is nobody to take responsibility, notice that the job has changed, or tell you the process itself is wrong.",
    "It does not remove the review. Anything that reaches a client should be read by a person first, and an assistant that drafts is worth more than one that sends.",
    "It does not fix a job nobody has written down. If the task lives only in your head and changes every time, describing it is the first piece of work, not building it.",
    "It does not scale the way the word workforce suggests. Four assistants are four times the output somebody has to read, and chaining one into the next adds a whole category of failure that separate assistants do not have.",
  ],

  faqs: [
    {
      q: "What is an AI agent workforce?",
      a: "It is a set of AI assistants, each configured for one recurring task and each connected to the tools that task needs. Instead of one general chatbot you have to brief every time, you have a staff: an assistant for email, an assistant for comps, an assistant for paperwork, all running at once.",
    },
    {
      q: "How many AI assistants can I run at once?",
      // ROUND D: the second half is new. The technical answer was true and incomplete: they do
      // not queue behind each other, and the limit that actually binds is how much output one
      // person can review before the reviewing stops happening.
      a: "Technically as many as you have jobs for, because they run in parallel and the inbox assistant does not queue behind the CMA assistant. Practically the limit is not the software, it is how many streams of output one person can read before the reading quietly stops. It is a number worth working out rather than assuming, and it is the one to settle before you commit.",
    },
    {
      q: "What happens when one of them gets something wrong?",
      a: "It produces something wrong that reads exactly like everything it produced when it was right, which is why the answer has to be structural rather than a matter of paying attention. Anything ambiguous should stop and ask rather than decide, anything client-facing should be drafted rather than sent, there should be a readable record of what each assistant did, and somebody should actually read a sample of the output on a fixed day each week.",
    },
    {
      q: "Do I need technical skills to use them?",
      a: "No. You describe the job the way you would describe it to a new assistant on their first day, and we build and tune the agent. You interact with the output, not the plumbing.",
    },
    {
      q: "How is this different from just using ChatGPT?",
      a: "A general chatbot starts from zero every session and cannot touch your systems. These assistants are tuned to one job, hold the context of your business, have real access to your CRM, calendar, and files, and run on a schedule or a trigger without you opening a tab.",
    },
  ],

  relatedPosts: [
    "ai-agent-workforce-real-estate-assistants",
    "crm-sync-real-estate-duplicate-contact-records",
    "workflow-automation-real-estate-business",
  ],
};
