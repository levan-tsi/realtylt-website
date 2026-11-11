import type { Service } from "./types";

/** COPY key `agents` on realtylt.com/ai. Deep link: /ai#agents
 *
 * "unlimited parallel agents" (Round D) and "adding a fifth costs a conversation, not a salary"
 * are gone and guarded in lib/blog/zombie-claims.test.ts: nothing is unlimited, and the division
 * against a wage is invalid (the flagship post says why).
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's quotes from site notes,
 * a dental or accounting office's inbox, a salon's posts, a real estate office's market reports as
 * ONE example), and re-framed on the brand's rule (BRAND section 3: AI augments people; the person
 * stays and gets more done). "Nobody hired" and "a staff that never sleeps" are gone; every
 * assistant drafts for a named person who reads. The FAQ that named a chatbot product now says "a
 * general chatbot". Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/workforce/: Cemri et al., "Why Do Multi-Agent LLM
 * Systems Fail?" (arXiv 2503.13657, NeurIPS 2025 Datasets and Benchmarks): "our analysis of 1642
 * MAS execution traces"; System Design Issues 44.2%, "Failures originate from system design
 * decisions, and poor or ambiguous prompt specifications". */
export const aiAgentWorkforce: Service = {
  slug: "ai-agent-workforce",
  aiKey: "agents",
  name: "AI Agent Workforce",
  tier: "core",

  eyebrow: "AI assistants · One per repeated job",
  title: "AI assistants for the jobs a small team repeats",
  lede: "The same quote gets written from site notes every evening, the same inbox gets sorted every morning, the same paperwork gets chased every week, and the owner does all of it after hours. We set up AI assistants, each one briefed for a single job the team repeats, connected to the tools that job needs. They draft and prepare; a named person on the team reads, approves and sends, and gets the evenings back.",
  specs: ["one assistant per job", "briefed in writing", "plugs into your tools", "drafts for a person to approve"],
  why: "A small team cannot add a person for every task that repeats. It can hand each one to its own AI assistant that drafts the work, so the people spend their time on the reading, the deciding and the customers rather than on the typing.",
  keywords: [
    "ai assistant for small business",
    "ai agents for small business",
    "personal ai assistant for business owners",
    "ai agents for real estate",
    "automate repetitive office tasks",
  ],

  seo: {
    title: "AI assistants for small business: one per repeated job",
    description:
      "AI assistants for a small business: each briefed for one job the team repeats, connected to its tools, drafting the work for a person on the team to approve.",
  },

  /** ROUND D: the finding that decides how this should be built rather than a number that
   * flatters it. Re-read 2026-11-11. */
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
    caption: "Four assistants, one morning, one person reading",
    trigger: "The office opens",
    nodes: [
      { label: "Inbox assistant", note: "Sorted overnight mail, flagged the three that matter, drafted replies for the office manager." },
      { label: "Quote assistant", note: "Turned yesterday's site notes into two draft quotes for the owner to check and send." },
      { label: "Paperwork assistant", note: "Listed the two signatures still missing and drafted the reminders." },
      { label: "Follow-up assistant", note: "Drafted notes to the customers who went quiet, waiting for a yes." },
    ],
    footnote: "An invented example. They run at the same time. What grows with each one added is not the payroll; it is the amount of output somebody has to read.",
  },

  whatItIs: [
    "It is a set of AI assistants, each one pointed at a single recurring job. An assistant is not a general chatbot somebody has to re-explain the business to every morning. It is set up for one task, it knows the tools that task uses, and it does that task the same way every time.",
    "The gain is that they all run at once, and that each one hands a person a draft instead of a blank page. The inbox one, the quote one and the paperwork one can all run overnight. What grows with each one added is the reading, and that is the limit that actually binds, rather than the software.",
    "It fits a small team that repeats the same written work every week: a contractor writing quotes from site notes, a dental or accounting office sorting the same kinds of email, a salon or gym drafting the week's posts and replies, a real estate office preparing the same market report before every appointment. The people stay on the work; the assistants take the first draft.",
  ],

  howItWorks: [
    {
      title: "Name the job the team keeps redoing",
      body: "We start with the tasks that repeat: the emails drafted from the same template, the quotes written the same way, the document chased on every job. Repeating is what makes a job one that can be handed to an assistant.",
    },
    {
      title: "Write the brief, then tune an assistant to it",
      body: "The document comes before the software. It sets out the task, the rules, and what should happen in the cases that are not the normal case. Each assistant is an AI agent given that brief and the tools it needs and nothing else, and it is tested against work the team has already done by hand.",
    },
    {
      title: "It drafts; a person approves",
      body: "Nothing an assistant writes reaches a customer until a named person reads it. Anything unclear stops and asks rather than decides. Every assistant keeps a readable record of what it did.",
    },
    {
      title: "Run them together, and read a sample weekly",
      body: "The assistants work at the same time and do not stop at 5pm. The team reviews the output rather than producing it, and on a fixed day each week somebody reads a sample and fixes the brief where it drifted.",
    },
  ],

  handoff: {
    provides: [
      "The jobs the team repeats, with a few real examples of each done by hand.",
      "The rules for each job, and the cases that are not the normal case.",
      "Access to the tools each job uses: the inbox, the CRM, the files.",
      "The person who reads each assistant's work, and a weekly hour to check a sample.",
    ],
    approves: [
      "Every brief, before the assistant runs.",
      "Everything that reaches a customer: an assistant drafts, a person sends.",
      "Any change to an assistant's brief or its access.",
      "Whether each assistant stays on, at each weekly read.",
    ],
  },

  useCases: [
    {
      title: "The inbox that is sorted before the office opens",
      body: "An assistant sorts the overnight email by what matters, brings up what truly needs a person, and drafts the replies to the rest, so the office manager is approving instead of typing.",
    },
    {
      title: "A contractor's quotes from site notes",
      body: "Notes and measurements from the day become a draft quote in the business's own format by morning. The owner checks the numbers, changes what needs changing and sends it.",
    },
    {
      title: "The paperwork chaser",
      body: "An assistant watches every open job or file for the missing signature, the date about to pass and the document nobody sent, and drafts the reminder for a person to send.",
    },
    {
      title: "A real estate office's report before the appointment",
      body: "The comparable sales are pulled, filtered and laid out before the agent walks in. The hour that used to go on building the deck goes to the conversation instead, and the agent still checks every number.",
    },
  ],

  limits: [
    "It does not think for anyone. An assistant does one job the way it was described, so a vague brief produces output that is fast, consistent and useless.",
    "It is not a hire. There is nobody to take responsibility, notice that the job has changed, or say the process itself is wrong. Those stay with the people in the business.",
    "It does not remove the review. Anything that reaches a customer is read by a person first. An assistant that drafts is worth more than one that sends.",
    "It does not fix a job nobody has written down. If the task lives only in someone's head and changes every time, describing it is the first piece of work, not building it.",
    "It does not scale the way the word workforce suggests. Four assistants are four times the output somebody has to read. And chaining one into the next adds a whole category of failure that separate assistants do not have.",
  ],

  faqs: [
    {
      q: "What is an AI agent workforce?",
      a: "It is a set of AI assistants, each set up for one recurring task and connected to the tools that task needs. Instead of one general chatbot that has to be briefed every time, there is an assistant for the inbox, one for quotes and one for paperwork, all running at once and all drafting for a person on the team to approve.",
    },
    {
      q: "How many AI assistants can I run at once?",
      a: "In theory, as many as there are jobs for, because they run at the same time and one does not queue behind another. In practice the limit is not the software. It is how many streams of output one person can read before the reading quietly stops. It is a number worth working out rather than assuming, and it is the one to settle first.",
    },
    {
      q: "What happens when one of them gets something wrong?",
      a: "It produces something wrong that reads exactly like everything it produced when it was right. That is why the answer has to be built in rather than left to attention: anything unclear stops and asks rather than decides, anything that goes to a customer is drafted rather than sent, there is a readable record of what each assistant did, and somebody reads a sample of the output on a fixed day each week.",
    },
    {
      q: "Do I need technical skills to use them?",
      a: "No. The owner describes the job the way they would describe it to a new assistant on their first day, and we build and tune the agent. The team deals with the output, not the plumbing.",
    },
    {
      q: "How is this different from using a general AI chatbot?",
      a: "A general chatbot starts from zero every session and cannot touch the business's systems. These assistants are tuned to one job, hold the context of the business, have real access to the CRM, the calendar and the files, and run on a schedule or a trigger without anyone opening a tab.",
    },
    {
      q: "Will AI assistants take over my staff's jobs?",
      a: "No. They take the first draft of the repeated written work, and every draft still goes to a person who reads, decides and sends. The team gets time back for the customers and the judgment calls, which is the part of the work only they can do.",
    },
  ],

  relatedPosts: [
    "ai-agent-workforce-real-estate-assistants",
    "crm-sync-real-estate-duplicate-contact-records",
    "workflow-automation-real-estate-business",
  ],
};
