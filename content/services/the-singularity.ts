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
 * WHAT IS NOT CARRIED, and this is the one deliberate divergence from COPY. The panel's `p` ends:
 *
 *   "Every other tool you own peaked the day you installed it. This one is past that point: it
 *    improves faster than you can shop for a replacement."
 *
 * The first sentence is an argument and it survives in `why`. The second is a comparative rate
 * claim against every other product a business owns, with no measurement of this system or of any
 * of them, and it is the exact shape this repo has killed nine times in the zombie table. A page
 * that ranks and that an AI assistant quotes is the worst place to keep it. The lede therefore
 * ends on the weekly loop, which is a description of what the thing does.
 *
 * `specs` is likewise trimmed: COPY says "remembers everything" and "gets better with every deal".
 * The first is an absolute the limits section contradicts four lines later (it knows what it is
 * connected to and nothing else) and the second asserts a rate nobody has measured. Both are
 * replaced with the product truth underneath them.
 *
 * NOTE FOR THE /ai LANE: this file is the honest version. If the panel and the page should agree
 * word for word, COPY.singularity is the side to change, not this one.
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
  lede: "Scattered tools become one brain, and the Singularity is the moment that brain turns on itself. It builds the other agents, hands each one its job, and remembers every call, every chat and every deal they touch. Each week it finds a weak spot, tests the fix against conversations that already happened, and keeps what wins.",
  specs: [
    "builds and runs your agents",
    "one shared memory",
    "a weekly improvement loop",
    "learns how you work",
    "always on",
  ],
  why: "Most tools are worth the most on the day you install them, then they age. A system that keeps its own memory and revises its own playbook is worth more a year in than on day one. Everything else you buy gets older. This gets better.",
  keywords: [
    "ai agent orchestration real estate",
    "self improving ai agents",
    "ai operating system for a brokerage",
    "multi agent ai real estate",
    "ai memory across calls and chats",
  ],

  seo: {
    title: "The Singularity: AI Agents That Improve Their Own Playbook",
    description:
      "One system that builds and runs your other AI agents, keeps a single memory across every call and chat, and tests its own improvements every week.",
  },

  figure: {
    kind: "flow",
    caption: "One brain, the agents it runs, and the loop that changes them",
    trigger: "Every conversation the agents had this week",
    nodes: [
      {
        label: "One memory",
        note: "Calls, chats and deals land in the same place, instead of four tools that have never compared notes.",
      },
      {
        label: "The agents",
        note: "It stands each one up, hands it its job, and keeps their instructions in one version rather than five.",
      },
      {
        label: "The weekly read",
        note: "It looks for the place the answers were worst and proposes one change, not twenty.",
      },
      {
        label: "The test",
        note: "The change is run against conversations that already happened, and kept only if it beats what is live.",
      },
    ],
    footnote:
      "The loop is the product. A person still approves what ships, which is the step that makes the rest of it safe to run.",
  },

  whatItIs: [
    "It is the layer above everything else on this site. Instead of a chat assistant here, a voice agent there, and a pile of automations that have never met, one system stands them up, gives each one its job, and holds the memory they all read from. A caller who explained their situation on the phone on Tuesday does not explain it again to the website on Thursday.",
    "The second half is the part the name is about. A system that can see every conversation its agents had can also see where they went wrong. Once a week it reads that record, picks the weakest point, proposes a single change, and tests it against conversations that already happened before the change reaches anybody. What wins is kept and what does not is thrown away.",
    "It is worth saying plainly what that is and is not. Nothing here rewrites its own code and nothing here is a different kind of intelligence. It is an ordinary evaluation loop, run on your own material, with a person approving what ships. The reason it earns a name is that almost nothing else a business buys has one at all.",
  ],

  howItWorks: [
    {
      title: "Put the agents under one roof",
      body: "The chat assistant, the voice agent, the follow-up and the automations stop being four purchases with four sets of instructions. One system runs them, which is what makes the next three steps possible at all.",
    },
    {
      title: "Give them one memory",
      body: "Every call, chat and deal the agents touch is written to the same place, so what a person said once is known everywhere afterwards. This is the part that changes what a client experiences, and it changes it on day one rather than in month six.",
    },
    {
      title: "Read the week, and change one thing",
      body: "It looks for the weakest point in what actually happened: the question that got the worst answers, the handoff that kept failing, the sentence that made people leave. Then it proposes one change. One, because a week in which twenty things changed is a week in which nobody can say which of them helped.",
    },
    {
      title: "Test it before anybody sees it, then keep the receipts",
      body: "The proposed change is run against conversations that already happened and compared against what is live. It ships only if it wins and only after a person approves it, and both the comparison and the approval are written down, so a change that turns out to be wrong can be found and undone rather than argued about.",
    },
  ],

  useCases: [
    {
      title: "The answer that was wrong in March and is still wrong",
      body: "Somewhere in your funnel a question gets an answer that quietly costs you people, and nobody has read enough transcripts to notice. A loop that reads all of them every week is looking for exactly that, and it is the kind of thing that never gets found by anyone who has a day job.",
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
    "It does not rewrite its own code. The loop revises instructions, examples and routing, and a person approves every change before it ships, which is the entire reason it is safe to let it run.",
    "It does not know anything it was not connected to. A deal that lived in a spreadsheet nobody wired in is a deal it has never heard of, and the useful version of this system is one that says so rather than guessing.",
    "It does not improve on a schedule you can bank on. A week in which nothing went obviously wrong is a week whose honest output is no change, and anybody promising a measurable gain every week is describing a sales cycle rather than a system.",
    "It does not decide what good looks like. The loop can find the weakest answer in a week of conversations; only somebody who knows the business can say whether the replacement is better or merely different.",
    "It does not make the underlying models ours. The agents run on licensed platforms belonging to other companies, and their pricing and release schedules are something this system is exposed to exactly like everything else here.",
    "It does not start as any of this. On day one it is a handful of agents and an empty memory, and the compounding everything above describes needs months of real conversations before there is anything to compound.",
  ],

  faqs: [
    {
      q: "What does the Singularity do that the individual services do not?",
      a: "Two things, and neither is available to a service bought on its own. The first is one memory: every agent reads from and writes to the same record, so a client explains themselves once rather than once per channel. The second is a weekly loop that reads what actually happened, proposes one improvement, and tests it against real past conversations before it ships. A single service can be good. Only a system that sees all of them can tell you which part of the whole is worst this week.",
    },
    {
      q: "What does improving itself actually mean?",
      a: "It means the instructions change, not the software. Once a week the system reads the conversations its agents had, finds the weakest point, and proposes a revision to a prompt, an example, a rule or a routing decision. That revision is replayed against conversations that already happened and compared against what is currently live, and it ships only if it wins and only after a person approves it. Nothing rewrites its own code, and nothing changes without a record of what changed and why.",
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

  relatedPosts: [
    "ai-agent-workforce-real-estate-assistants",
    "custom-automation-real-estate-bespoke-build",
    "workflow-automation-real-estate-business",
  ],
};
