import type { Service } from "./types";

/** COPY key `singularity` on realtylt.com/ai. Deep link: /ai#singularity
 *
 * THE TWENTY-FIRST SERVICE, and the first one written after the other twenty shipped. The /ai
 * journey has carried a Singularity panel since 2026-07-20 (`EYE_PROTO`, live on the main page,
 * `?eye=0` opts out) and it was the only panel on that page with no indexable page behind it, so
 * the panel's THE SERVICE PAGE box had nothing to light. This is that page.
 *
 * SOURCE: `COPY.singularity` in realtylt-ai-page/web/src/main.js, which is the owner's own pick
 * from the rendered candidate sheet (round 25, candidate B). eyebrow, title and why are carried
 * across essentially verbatim, the same as every other file here.
 *
 * REPOSITIONED 2026-08-27 (round 44), on the owner's reading of the live page. The first cut of
 * this file described a prompts-and-playbooks product: a weekly loop over conversations that
 * revises instructions, with `whatItIs` and `limits` both stating that nothing here rewrites its
 * own code. That was written as honest-limits copy and it is FALSE about the thing being sold,
 * which is the system this business actually runs: a coding agent with a file-based memory that
 * writes and ships real software, keeps what it learns in files it has to read before starting,
 * and records every correction once instead of being given it twice. See memory
 * `project-singularity-product-definition` before writing any Singularity copy.
 *
 * The honesty bar did not move, it changed sides. The safety claim used to be "it cannot touch
 * the software"; it is now "a test suite and a person stand between anything it writes and
 * anybody seeing it", which is true, checkable, and the stronger sentence of the two.
 *
 * WHAT IS STILL NOT CARRIED, and this remains a deliberate divergence from COPY. The panel's `p`
 * ends:
 *
 *   "Every other tool you own peaked the day you installed it. This one is past that point: it
 *    improves faster than you can shop for a replacement."
 *
 * The first sentence is an argument and it survives in `why`. The second is a comparative rate
 * claim against every other product a business owns, with no measurement of this system or of any
 * of them, and it is the exact shape this repo has killed nine times in the zombie table. A page
 * that ranks and that an AI assistant quotes is the worst place to keep it.
 *
 * `specs` is likewise not COPY's list: the panel says "remembers everything", which is an
 * absolute the limits section contradicts (it knows what it was connected to and nothing else),
 * and "gets better with every deal", which asserts a rate nobody has measured. Both are replaced
 * here with the product truth underneath them, which since this round is stronger rather than
 * weaker: it writes real code, and it learns from every correction.
 *
 * NOTE FOR THE /ai LANE: this file is the honest version. The panel copy is being rewritten in
 * the same round; if the two are ever made to agree word for word, COPY.singularity is the side
 * to change, not this one.
 *
 * NO `stat`. Every number that could go here would be about this system's own improvement and
 * nobody has measured it. The field is optional precisely so a page can decline it.
 *
 * House rules: no em dashes, no arrow glyphs, limits are required and are the load-bearing part. */
export const theSingularity: Service = {
  slug: "the-singularity",
  aiKey: "singularity",
  name: "The Singularity",
  tier: "core",

  eyebrow: "The Singularity · the tipping point",
  title: "The point where it starts improving itself",
  lede: "Scattered tools become one brain, and the Singularity is the moment that brain starts working on itself. It builds and runs the other agents, remembers every call, chat and deal they touch, and writes and changes the software around them. Every correction you give it is written down once and applied from then on, and nothing ships until the tests pass and you approve it.",
  specs: [
    "builds and runs your agents",
    "writes and ships real code",
    "durable project memory",
    "learns from every correction",
    "nothing ships without approval",
  ],
  why: "Most tools are worth the most on the day you install them, then they age. A system that keeps its own memory, writes down the corrections you give it, and can change the software it runs on is worth more a year in than on day one. Everything else you buy gets older. This gets better.",
  keywords: [
    "ai agent orchestration real estate",
    "self improving ai system",
    "ai that writes and ships code",
    "ai with persistent project memory",
    "ai memory across calls and chats",
  ],

  seo: {
    title: "The Singularity: AI That Builds, Remembers and Improves",
    description:
      "One system that builds and runs your AI agents, keeps what it learns in files you can read, and improves the software it runs on under your approval.",
  },

  figure: {
    kind: "flow",
    caption: "One memory, the agents it runs, and the gate every change has to pass",
    trigger: "A task, and everything the last one wrote down",
    nodes: [
      {
        label: "The memory",
        note: "Calls, chats and deals in one place, plus a file it has to read first holding every correction you have given it.",
      },
      {
        label: "The agents",
        note: "It stands each one up, hands it its job, and keeps their instructions in one version rather than five.",
      },
      {
        label: "The change",
        note: "One thing at a time, and when the fix belongs in the software it writes the software rather than filing a request.",
      },
      {
        label: "The gate",
        note: "Tests that cannot be talked round, then a person reading the change. Nothing reaches a client before both.",
      },
    ],
    footnote:
      "The loop is the product and the gate is what makes it safe to run. One change at a time, tested before anybody sees it, and yours to approve or refuse.",
  },

  whatItIs: [
    "It is the layer above everything else on this site. Instead of a chat assistant here, a voice agent there, and a pile of automations that have never met, one system stands them up, gives each one its job, and holds the memory they all read from. A caller who explained their situation on the phone on Tuesday does not explain it again to the website on Thursday.",
    "The second half is the part the name is about. A system that can see everything its agents did can also see where they went wrong, and it can do something about it: change the instructions, change the routing, and when the fix belongs in the software, write and test the software. What it learns does not stay in a conversation. It goes into files that the next piece of work has to read before it starts, which is why a correction you give once is a correction you only have to give once.",
    "It is worth saying plainly what that is and is not. It is not a different kind of intelligence, and there is no point at which it stops needing you. It writes real changes, code included, and not one of them reaches a client until a test suite has run over it and a person has approved it. The reason it earns a name is not that it runs on its own. It is that almost nothing else a business buys has any way of remembering what it got wrong.",
  ],

  howItWorks: [
    {
      title: "Put the agents under one roof",
      body: "The chat assistant, the voice agent, the follow-up and the automations stop being four purchases with four sets of instructions. One system runs them, which is what makes the next three steps possible at all.",
    },
    {
      title: "Give them one memory, kept in files",
      body: "Every call, chat and deal the agents touch is written to the same place, so what a person said once is known everywhere afterwards. Alongside it sits what the system has learned about your business, kept in files you can open rather than inside a model you cannot. This is the part that changes what a client experiences, and it changes it on day one rather than in month six.",
    },
    {
      title: "Find the weak point, and change one thing",
      body: "It looks for the weakest point in what actually happened: the question that got the worst answers, the handoff that kept failing, the sentence that made people leave. Then it proposes one change, and if the fix belongs in the software it writes that too. One change, because a round in which twenty things changed is a round in which nobody can say which of them helped.",
    },
    {
      title: "Put it through the gate, then keep the receipts",
      body: "A change to the software is run against a test suite that does not care how confident anything sounded. A change to what an agent says is replayed against conversations that already happened and compared against what is live. Either way it ships only if it wins and only after a person approves it, and both the comparison and the approval are written down, so a change that turns out to be wrong can be found and undone rather than argued about.",
    },
  ],

  useCases: [
    {
      title: "The answer that was wrong in March and is still wrong",
      body: "Somewhere in your funnel a question gets an answer that quietly costs you people, and nobody has read enough transcripts to notice. A loop that reads all of them is looking for exactly that, and it is the kind of thing that never gets found by anyone who has a day job.",
    },
    {
      title: "Four tools, four versions of the same client",
      body: "The phone knows one thing, the website another, the CRM a third, and the client can tell. One memory is not a feature so much as the removal of a problem you have stopped noticing you have.",
    },
    {
      title: "The thing you explained once and now explain every month",
      body: "How you price, what you will not say, which questions go to a person. Told to one system it stays told, and it stays told to the agent you add next year rather than being re-explained to each new tool in turn.",
    },
  ],

  limits: [
    "It does not ship anything on its own. It writes real changes, code included, and not one of them reaches a client until the tests have run over it and you have read it and approved it. That gate is the entire reason it is safe to let it run.",
    "It does not remember what nobody wrote down. What survives the end of a working session is what got written to a file, so a correction given in passing and never recorded is a correction you will be giving again.",
    "It does not know anything it was not connected to. A deal that lived in a spreadsheet nobody wired in is a deal it has never heard of, and the useful version of this system is one that says so rather than guessing.",
    "It does not improve on a schedule you can bank on. A week in which nothing went obviously wrong is a week whose honest output is no change, and anybody promising a measurable gain every week is describing a sales cycle rather than a system.",
    "It does not decide what good looks like. The loop can find the weakest answer in a week of conversations; only somebody who knows the business can say whether the replacement is better or merely different.",
    "It does not make the underlying models ours. The agents run on licensed platforms belonging to other companies, and their pricing and release schedules are something this system is exposed to exactly like everything else here.",
    "It does not start as any of this. On day one it is a handful of agents and an empty memory, and the compounding everything above describes needs months of real conversations before there is anything to compound.",
  ],

  faqs: [
    {
      q: "What does the Singularity do that the individual services do not?",
      a: "Two things, and neither is available to a service bought on its own. The first is one memory: every agent reads from and writes to the same record, so a client explains themselves once rather than once per channel, and a correction you give is written down once rather than repeated to each tool in turn. The second is a loop that reads what actually happened, proposes one improvement, and proves it before it ships, including improvements that mean changing the software. A single service can be good. Only a system that sees all of them can tell you which part of the whole is worst this week.",
    },
    {
      q: "What does improving itself actually mean, and does it write real code?",
      a: "It writes real code, and that is worth saying plainly because most descriptions of this category promise the opposite. It changes two things: the written layer, meaning prompts, worked examples, routing rules and standing constraints, and the software itself. Which one is being changed decides what grades it. A change to the software goes through a type checker and a test suite that do not care how confident anything sounded. A change to what an agent says is replayed against conversations that already happened and compared against what is currently live. Either way it is one change at a time, it ships only if it wins and only after you approve it, and nothing changes without a record of what changed and why.",
    },
    {
      q: "Where does the memory actually live?",
      a: "In files you can open, not inside a model. There is the record of the conversations, the written instructions your agents run on, and a set of notes about your business that the system has to read before it starts any piece of work. That last one is where a correction goes when you give it: a line in a file, with a date on it, rather than something a model is trusted to have absorbed. It is worth insisting on that shape whoever you buy from, because a memory kept in files is one you can read, correct and take with you, and a memory kept inside somebody else's model is one you are renting.",
    },
    {
      q: "Does it learn from my data, and can that data reach anybody else?",
      a: "It learns from your own conversations, which is the only material that could make it better at your business specifically. Where that material is held and what the underlying model vendors may do with it are two separate contract questions, and they are worth asking in writing rather than assuming: that your conversations are stored in an environment you control, that they are not used to train anything general, and that they can be deleted on request. Those are the same three lines worth insisting on with any vendor in this category.",
    },
    {
      q: "How long before it is actually better than what I started with?",
      a: "The shared memory helps immediately, because it removes repetition from the first conversation onwards. The improvement loop is slower and honestly so: it needs enough real conversations to tell a genuine weak point from a bad week, which for most brokerages is a matter of months rather than weeks. Anybody quoting a timeline shorter than that is quoting one they have not measured.",
    },
    {
      q: "What happens if one of its changes makes things worse?",
      a: "It gets undone, and the reason that is a short answer is that the loop is built backwards from it. Every change is one change rather than a batch, it is compared against what was live before it shipped, and the comparison and the approval are both written down. So a change that looks wrong a fortnight later can be identified and reversed rather than debated, which is the difference between a system that learns and a system that drifts.",
    },
  ],

  /** Its own flagship post leads, as on every other service page. It landed the day after this
   * file did (round 43), which is why the list shipped without it for one day. */
  relatedPosts: [
    "the-singularity-self-improving-ai-system",
    "ai-agent-workforce-real-estate-assistants",
    "custom-automation-real-estate-bespoke-build",
  ],
};
