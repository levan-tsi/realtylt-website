import type { Service } from "./types";

/** COPY key `clone` on realtylt.com/ai. Deep link: /ai#clone
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a contractor explaining a quote, an
 * accountant explaining a deadline, a dentist or salon owner welcoming new clients, a real estate
 * agent's listing walkthrough as ONE example). Vendor names out of the copy (BRAND section 5): the
 * platforms are "a licensed avatar platform" and "a licensed voice engine". Every video says it
 * was made with an AI avatar. Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/clone/: Nightingale and Farid, PNAS 2022
 * (PMC8872790: "315 participants ... The average accuracy is 48.2%"; with training and
 * feedback "improved slightly to 59.0%", "no improvement in accuracy over time"; 219 trained
 * participants), and New York Civil Rights Law section 50 (FindLaw copy, "last updated January
 * 01, 2026": the likeness or voice of a living person used for advertising or trade "without
 * having first obtained the written consent of such person ... is guilty of a misdemeanor"). */
export const aiClone: Service = {
  slug: "ai-clone",
  aiKey: "clone",
  name: "AI Clone",
  tier: "core",

  eyebrow: "AI clone · Video and voice of the owner",
  title: "An AI video avatar and voice clone of the owner",
  lede: "Customers trust the owner's face and voice, and the owner has no time to record a video for every new client, quote or question. We build a video avatar and a voice clone of the owner, with the owner's written consent, working only from the business's own scripts and information. It records the welcome, the walkthrough and the explainer in the owner's face and voice, each one says it was made with AI, and a person approves every video before it goes out.",
  specs: ["a licensed avatar platform", "a licensed voice engine", "only your own scripts", "every video labelled AI"],
  why: "An owner can only be on one call, one video, one visit at a time. A digital twin can be in many places at once. It multiplies the two things customers really buy from a small business, the owner's face and voice, so personal attention stops being the thing that slows the business down.",
  keywords: [
    "ai avatar for business",
    "ai clone of yourself",
    "ai video avatar for small business",
    "ai voice clone",
    "ai avatar for real estate agents",
  ],

  seo: {
    title: "AI video avatar and voice clone for small business owners",
    description:
      "An AI video avatar and voice clone of the owner, with written consent, working from the business's own scripts, every video labelled AI and approved by a person.",
  },

  /** The number that decides how the disclosure question has to be answered, and it is somebody
   * else's measurement rather than ours. Added in round H; re-read 2026-11-11. */
  stat: {
    value: "48.2%",
    label: "how often 315 people correctly sorted synthetic faces from real ones, against a 50% coin",
    source: {
      text: "Nightingale and Farid, AI-synthesized faces are indistinguishable from real faces and more trustworthy, PNAS, 2022",
      href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8872790/",
    },
  },

  figure: {
    kind: "flow",
    caption: "Twelve new clients, twelve personal welcomes, no recording session",
    trigger: "An accounting office books twelve new clients in January",
    nodes: [
      { label: "Script written", note: "From the office's own welcome notes and the client's first appointment." },
      { label: "The avatar records it", note: "The owner's face delivers the welcome. The owner was with a client." },
      { label: "The voice narrates", note: "The voice clone reads it the way the owner would say it, and says it was made with AI." },
      { label: "Approved, then sent", note: "The office manager watches each one before it goes out, addressed to that client." },
    ],
    footnote: "An invented example. The knowledge behind it is private: it knows the business's own scripts and information, and nobody else's.",
  },

  whatItIs: [
    "It is a digital twin of the owner: a video avatar that looks like them and a voice clone that sounds like them, both working from a private library of the business's own scripts and information. It can welcome a new customer, walk someone through a quote or a property, or explain a deadline, in the owner's face and voice, while the owner is somewhere else.",
    "It matters because in a small business the owner's face and voice are what customers buy, and both are stuck in one place at a time. A twin does not stand in for the owner on the conversations that need them. It lifts the ceiling on the personal attention everyone else can get.",
    "It fits an owner customers already know by face: a contractor who explains every quote, an accountant who sends the same deadline explanation to fifty clients, a dentist or salon owner who welcomes every new client, a real estate agent who records a walkthrough for every listing. It is built only of the owner, with the owner's written consent.",
  ],

  howItWorks: [
    {
      title: "Written consent, then the twin",
      body: "The owner signs a written consent first, covering what may be produced and for how long. Then a short recording session makes the avatar and the voice. The platform that renders them is licensed from its maker and nobody here owns it. What belongs to the owner is the likeness, the footage it was built from, the scripts and the finished videos, used only on the business's own content.",
    },
    {
      title: "Give it what it needs to know",
      body: "The business's services, its scripts and the way the owner really explains things go into a private library. That is what stops the twin sounding like a stranger wearing the owner's face.",
    },
    {
      title: "Decide what it may never say, and who watches",
      body: "The sentences that are costly to get wrong look completely plain: a price, a deadline, a diagnosis, a tax figure, a permit. Those get named in advance. Each one either comes from the record that governs it or does not get said at all. Then one person is named to watch every video before it goes out.",
    },
    {
      title: "Put it to work, and say so",
      body: "Welcomes, walkthroughs, explainers and follow-up videos get made without a recording session. Each one carries a spoken line saying it was made with an AI avatar, from a recording of the owner. That line costs four seconds, and it is the only thing that reliably tells a viewer, because the research says they cannot work it out for themselves.",
    },
  ],

  handoff: {
    provides: [
      "The owner's written consent, covering what may be produced and for how long.",
      "A short recording session of the owner, on camera and on voice.",
      "The scripts, the services and the way the owner explains them.",
      "The person who watches every video before it is sent.",
    ],
    approves: [
      "Every video, before it goes out.",
      "The list of things the twin may never say.",
      "Every use of the twin beyond what the consent covers, in writing.",
      "Deleting the twin and its footage, whenever the owner asks.",
    ],
  },

  useCases: [
    {
      title: "A personal welcome for every new client",
      body: "An accounting office, a dental practice or a salon books new clients every week. Each gets a short welcome from the owner, by name, in the owner's voice, with what to bring and what happens next. Not the same email everyone else sent.",
    },
    {
      title: "A contractor's quote, explained on video",
      body: "Every quote goes out with a two-minute video of the owner walking through what is included, built from the quote itself and approved before sending. Anything about the price is read from the quote, never invented.",
    },
    {
      title: "The same explanation, fifty times",
      body: "An accountant's deadline reminder, a gym's induction, a property manager's move-in steps: the owner explains it once in writing and the twin delivers it to everyone who needs it, labelled as made with AI.",
    },
    {
      title: "A real estate agent's walkthrough for every buyer",
      body: "Twelve buyers matched a new listing. Each gets a walkthrough addressed to them by name, in the agent's voice. What that does to a reply rate is not something anybody has measured honestly, so this page does not claim it.",
    },
  ],

  limits: [
    "It does not speak for anyone but the owner who consented. It carries one person's likeness and voice, only on that business's own content. We do not build a likeness of anybody else, living or dead, at any price.",
    "It does not say anything the owner has not already stood behind. The scripts come from the business's own material, so what it can say is bounded by what goes into it.",
    "It does not know which sentences are the costly ones. A price, a deadline, a diagnosis or a permit status all read like plain data and all behave like liability, so those get decided by a person in advance rather than by a script.",
    "It does not belong in the moments that need the owner. A twin scales the welcome, the walkthrough and the explainer. The hard conversation and the decision are still the owner's.",
    "It does not cut the amount of checking a business has to do. It raises it, because it raises the volume. Someone has to watch what goes out.",
    "It is not a secret. Every video says it was made with an AI avatar, and a twin that has to be hidden is being used for the wrong thing.",
  ],

  faqs: [
    {
      q: "What is an AI clone for a business owner?",
      a: "It is a video avatar that looks like the owner and a voice clone that sounds like them, both working from a private library of the business's own scripts and information. It records personal welcome videos, walkthroughs and explainers, so the owner's face and voice are no longer limited to one conversation at a time. Every video says it was made with AI.",
    },
    {
      q: "Will the videos actually look like me?",
      a: "The avatar is built from a recording of the owner and the voice from the owner's own speech, so what it is built from is entirely them. How convincing any particular result is depends on the recording and on the platform; judge it on your own footage rather than on a promise from a website. What anybody can control is the writing. The scripts come from the business's own material, and that is what stops it reading like a template.",
    },
    {
      q: "Is it legal to use an AI video of myself in my marketing?",
      a: "Yes, and the paperwork is worth doing properly anyway. New York Civil Rights Law section 50 makes it a misdemeanor to use a living person's likeness or voice for advertising or trade without first obtaining that person's written consent. Where the person is the owner, that is a document signed once. Do it properly rather than informally: consent for one video is not consent for a model that can produce a thousand, and writing it down forces a decision about what may be produced.",
    },
    {
      q: "Can I make one of a colleague, or of a customer?",
      a: "A colleague, only with their own written permission, given apart from their employment, and with a written answer to what happens to the model when they leave. A customer, no. A real customer recorded with their permission is plain marketing; a synthesised version of them, or words they did not say assembled into their voice, is what statutes like section 50 exist to stop.",
    },
    {
      q: "Do I have to tell people the video was made with AI?",
      a: "Treat it as required whatever any particular rule says today, because published research says the viewer cannot work it out. In a 2022 study, 315 people sorting synthetic faces from real ones averaged 48.2 percent, against a 50 percent coin flip. Another 219 people were trained and told the answer every time; they reached 59.0 percent and got no better with practice. A spoken sentence at the start costs four seconds and turns something a person could discover into something they were told.",
    },
    {
      q: "Who owns the avatar and the voice?",
      a: "Two answers, worth keeping apart. The technology is licensed, not owned: the video runs on a licensed avatar platform and the voice on a licensed voice engine, and those models belong to the companies that built them. What belongs to the owner is the likeness, the recording it was built from, the scripts and the finished videos. Those are used only on the business's own content, never licensed on to anybody else, and deleted on request.",
    },
  ],

  relatedPosts: [
    "ai-clone-real-estate-agent-video-avatar",
    "ai-voice-agent-missed-calls-real-estate",
    "ai-chat-assistant-real-estate-website",
  ],
};
