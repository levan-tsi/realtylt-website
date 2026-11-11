import type { Service } from "./types";

/** COPY key `plus` on realtylt.com/ai. Deep link: /ai#plus
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor's estimate to schedule
 * handoff, a property manager's maintenance requests, an accounting office's month end, a
 * multi-location salon or gym, a real estate office's checklist as ONE example). Tool names out
 * of the copy (BRAND section 5); the FAQ that named the orchestration tool now says what the build
 * runs on in plain words. The project-risk figure is the claims register's wording (Budzier and
 * Flyvbjerg, "Double Whammy": 1,471 IT projects, a black swan at 17 percent) without its dollar
 * total, which the brand check fails on an AI page; "a thin-tailed distribution would have put
 * under one percent there" and "vendors document that they will add values" were cut (not
 * re-read today). Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/custom/: Google Cloud terms 1.4(e) ("Google will
 * notify Customer at least 12 months before ... significantly modifying a Customer-facing Google
 * API in a backwards-incompatible manner"). */
export const customAutomation: Service = {
  slug: "custom-automation",
  aiKey: "plus",
  name: "Custom Automation",
  tier: "core",

  eyebrow: "Custom builds · The step no tool covers",
  title: "Custom automation for the step no off-the-shelf tool fixes",
  lede: "Every business has one slow step that no app on the market fixes, because it is specific to how that business works, and it is usually the reason the owner thinks the next step is another hire. We build automation around that step from proven parts: agents that answer and call, data that is filled in and checked, scheduling, syncing and document reading, wired into the software the business already uses, with a person on every step that needs judgment.",
  specs: ["built around your workflow", "made from proven parts", "runs on your tools", "handed over in writing"],
  why: "Every team has one slow spot that no store-bought tool fixes. Custom automation removes the step done by hand that quietly limits what the business can take on. From the day it works, it is a thing the business owns: it runs, somebody understands it, and it stands on software that belongs to other companies, which is why it is handed over in writing.",
  keywords: [
    "custom automation for small business",
    "custom ai automation",
    "automate business processes",
    "bespoke workflow automation",
    "custom ai automation for realtors",
  ],

  seo: {
    title: "Custom AI automation for small business, built around the work",
    description:
      "Custom automation for a small business: the one slow step no app fixes, built from proven parts, wired into the tools already in use, and handed over in writing.",
  },

  /** A vendor's own published promise, and the shortest of the three the flagship draws: what a
   * business is buying with a bespoke build is an exposure to other companies' release
   * schedules. Added in round H; re-read 2026-11-11. */
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
    caption: "The pieces, assembled to fit what the business actually does",
    trigger: "The step that limits the business",
    nodes: [
      { label: "Agents", note: "Inbound and outbound, text and voice, wherever the conversation happens." },
      { label: "Data", note: "Records filled in, checked and sorted before anyone spends an hour on a bad one." },
      { label: "The chain", note: "Holds the steps together and keeps every run logged and auditable." },
      { label: "The business's tools", note: "It writes into the CRM, the calendar and the files already in use." },
    ],
    footnote: "Off-the-shelf tools solve the average problem. This one is built for the step that is actually limiting the business.",
  },

  whatItIs: [
    "It is the version of all of this that gets built around the business, instead of the other way round. Every team has one step that no product on the market fixes, because it is specific to how they work. That step is usually the thing quietly limiting what the business can take on.",
    "The parts are the same ones behind every other service here: agents that talk, data that is filled in and checked, and systems that qualify, schedule, sync and file. What changes is the way they are put together: connected into one chain and wired into the tools the business already runs.",
    "It fits a business whose bottleneck is specific: a contractor whose estimates turn into scheduled crews only after three people retype them, a property manager whose maintenance requests arrive in five places, an accounting office whose month end runs on one spreadsheet nobody else understands, a salon or gym with several locations and no shared view, a real estate office whose checklist lives in one person's head.",
  ],

  howItWorks: [
    {
      title: "Find the step that is actually limiting the business",
      body: "Not the one that is annoying. The one that is limiting. They are often different, and only one of them is worth building for. We find it with the owner by walking one real job through, step by step.",
    },
    {
      title: "Assemble it from proven parts",
      body: "Agents, enrichment, qualification, scheduling, sync and document processing already exist and already work. Building custom means arranging them for this workflow, not inventing from zero.",
    },
    {
      title: "Run it on the business's tools, with the lights on",
      body: "Wired to the business's systems, logged on every run, versioned so a change can be rolled back. It fails loudly rather than quietly, because the most common ending for a chain like this is silence, and silence looks exactly like having nothing to do.",
    },
    {
      title: "Hand it over so somebody else could pick it up",
      body: "A written description of what it does, kept with the thing itself, in the language of the business rather than of the software, with logins and an environment that belong to the business. That page costs an hour at the end of a build, and it is the difference between the next change being a change and being a rebuild.",
    },
    {
      title: "Set a review date",
      body: "Every build gets a date to be looked at again with the owner: is it still used, still right, still worth running. A build with no review date runs until something outside it breaks it.",
    },
  ],

  handoff: {
    provides: [
      "The step that limits the business, walked through with us on one real job.",
      "Access to the tools that step touches, under logins the business owns.",
      "The rule for each decision in the step, or the person who knows it.",
      "A named person who is told when the chain fails.",
    ],
    approves: [
      "What gets built, in writing, before the build starts.",
      "Every message a customer will see, and every step that spends or binds.",
      "The handover document, and who keeps it.",
      "Whether it stays on at each review date.",
    ],
  },

  useCases: [
    {
      title: "The step no tool covers",
      body: "Specific to how the business works, manual, and the reason hiring starts to feel like the only option. Sometimes it is. The useful question first is how many other businesses would recognise the description, because if the answer is thousands, there is probably a product.",
    },
    {
      title: "A contractor's estimate to a scheduled crew",
      body: "A signed estimate becomes a job in the scheduling app, a materials list for the supplier and a confirmation to the customer, without the three retypes in between. The foreman still decides the crew.",
    },
    {
      title: "Several tools that refuse to talk",
      body: "A property manager's requests arrive by email, text, a portal and a phone line. The systems are fine on their own; the cost is in the gaps between them, and the gaps are what get connected.",
    },
    {
      title: "An office where growth means more of the same work",
      body: "When doubling the work means doubling the retyping, the thing holding the business back is manual process. Automating it changes what growth costs, and the people doing the retyping move to the work that needs them.",
    },
    {
      title: "A real estate office's checklist out of one person's head",
      body: "The steps between a signed contract and a closing are written down once, then each one is triggered, reminded and logged, so the checklist no longer depends on one person remembering it.",
    },
  ],

  limits: [
    "It does not build what nobody can describe. The honest test is whether the task could be explained to a competent new hire. If it cannot, deciding how the work should run is the first job.",
    "It does not replace the business's software. Automation sits between the systems already in use and connects them, so nothing here is a reason to move the CRM.",
    "It does not survive a process that keeps changing. A chain wired to a workflow redrawn every month spends its life being rewired, and that cost is real.",
    "It does not take the person out of the steps that need one. A step that guesses where it ought to have asked will, on some future day, be confidently wrong to a customer's face.",
    "It does not stop existing once it is delivered. It runs. Somebody has to notice when it stops. And every system it touches belongs to a company with its own release schedule.",
    "It does not retire itself. A build with no review date runs until something outside it breaks it, so a vendor decides when the business stops, rather than the owner.",
  ],

  faqs: [
    {
      q: "What can actually be automated?",
      a: "Anything repetitive with a rule behind it, and a good deal that has a judgment behind it, since a model can make many kinds of judgment now. Inbound and outbound conversations, data enrichment, lead qualification, scheduling, CRM sync and document processing are all standard. Being able to describe the task to a competent new hire is the first test, and it is not the last: it also has to happen often enough that somebody would notice it breaking, and a wrong answer has to land somewhere that is not in front of a customer.",
    },
    {
      q: "Why build custom rather than buy an off-the-shelf product?",
      a: "Because an off-the-shelf product solves the average version of a problem, and the step limiting a particular business is usually not average. Where a product fits, buy the product; we will say so. Where it does not, a custom chain runs the business's own logic, on an established automation platform or custom code, and can be hosted so the data stays in the business's own environment.",
    },
    {
      q: "How do you decide what to build first?",
      a: "By how contained the worst case is, then by whether the rule is actually settled, and only then by the size of the saving. That order is deliberate. In a study of 1,471 IT projects, Budzier and Flyvbjerg put the chance of a black swan, a project whose overrun sits far out in the tail, at 17 percent. So an expected payback describes the middle of the range rather than what the business is exposed to. If none of this is mapped yet, the AI assessment is the place to start.",
    },
    {
      q: "What happens when the software it connects to changes?",
      a: "Usually nothing, occasionally something. Some platforms promise notice before a breaking change: Google's cloud terms promise twelve months. The awkward case is a change that is not officially breaking at all, such as a new value appearing in a field the chain reads. That is why the thing to specify in any build is what it does when it meets something unfamiliar, and the only good answers involve stopping and telling a person.",
    },
    {
      q: "Will it work with the tools I already have?",
      a: "Yes. Automation sits between the existing systems and connects them, so the CRM, the calendar and the files stay where they are. Replacing the business's software is not part of it.",
    },
    {
      q: "Who owns the build when it is finished?",
      a: "The business. It runs under logins and an environment that belong to the business, and it comes with a written description of what it does, so another builder, or the business's own staff, could pick it up. That is the difference between owning a build and renting one.",
    },
  ],

  relatedPosts: [
    "custom-automation-real-estate-bespoke-build",
    "workflow-automation-real-estate-business",
    "ai-assessment-small-business-what-not-to-automate",
  ],
};
