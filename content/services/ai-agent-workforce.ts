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
      "Run a staff of task-tuned AI assistants in parallel. One drafts emails, one preps CMAs, one chases paperwork, one watches the inbox. Always on, plugged into the tools you already use.",
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
    footnote: "They run at the same time, and adding a fifth costs a conversation, not a salary.",
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
      title: "Tune an assistant to it",
      body: "Each assistant is an LLM agent given the task, the tools, and the standard you want. It gets access to the systems it needs and nothing else, and it is tested against work you have already done by hand.",
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

  faqs: [
    {
      q: "What is an AI agent workforce?",
      a: "It is a set of AI assistants, each configured for one recurring task and each connected to the tools that task needs. Instead of one general chatbot you have to brief every time, you have a staff: an assistant for email, an assistant for comps, an assistant for paperwork, all running at once.",
    },
    {
      q: "How many AI assistants can I run at once?",
      a: "As many as you have jobs for. They run in parallel, so the inbox assistant and the CMA assistant do not queue behind each other, and adding one more is a configuration change rather than a hire.",
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

  relatedPosts: ["workflow-automation-real-estate-business"],
};
