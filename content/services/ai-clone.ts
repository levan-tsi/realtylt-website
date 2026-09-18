import type { Service } from "./types";

/** COPY key `clone` on realtylt.com/ai. Deep link: /ai#clone */
export const aiClone: Service = {
  slug: "ai-clone",
  aiKey: "clone",
  name: "AI Clone",
  tier: "core",

  eyebrow: "AI Clone · Video + Voice + Memory",
  title: "A second you, working around the clock",
  lede: "A video copy of you, with a copy of your voice. It works from a private library of your listings, your scripts, and your market. “You” greet new leads, record a personal video tour for each home, and follow up day and night. All of it in your own face and voice.",
  specs: ["HeyGen-class avatar", "ElevenLabs-class voice", "private knowledge base", "always-on follow-up"],
  why: "You can only be on one call, one video, one showing at a time. A digital twin is a copy of you that can be in many places at once. It multiplies the two things clients really buy: your face and your voice. Personal attention stops being the thing that slows you down.",
  keywords: [
    "ai avatar for real estate agents",
    "ai clone of yourself",
    "personalized listing video ai",
    "digital twin real estate agent",
    "ai voice clone real estate",
  ],

  seo: {
    title: "AI Clone for Real Estate Agents: Video Avatar and Voice Twin",
    description:
      "A video avatar and voice clone of you, wired to your listings and your market, recording personalized walkthroughs and following up in your own face and voice.",
  },

  /** The number that decides how the disclosure question has to be answered, and it is somebody
   * else's measurement rather than ours. Added in round H alongside the flagship. */
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
    caption: "One new listing, twelve personal videos, zero recording sessions",
    trigger: "A listing goes live",
    nodes: [
      { label: "Script written", note: "From the listing data, the neighborhood, and your own talking points." },
      { label: "Your face records it", note: "The avatar delivers the walkthrough. You were at a closing." },
      { label: "Your voice narrates", note: "The voice clone reads it the way you would say it." },
      { label: "Sent personally", note: "Each buyer gets a video addressed to them, not a mass email." },
    ],
    footnote: "The knowledge base is private. It knows your listings and your market, and nobody else's.",
  },

  whatItIs: [
    "It is a digital twin. That means a video avatar that looks like you, and a voice clone that sounds like you. Both are wired to a private knowledge base of your listings, your scripts, and your market. It can greet a lead. It can walk a buyer through a property. It can follow up on a quiet thread, in your face and your voice, while you are somewhere else.",
    "It matters because the two things clients really buy from an agent are your face and your voice. Both of them are stuck in one place at a time. A twin does not replace you on the deals that need you. It lifts the ceiling on the personal attention you can give everyone else.",
  ],

  howItWorks: [
    {
      title: "Build the twin",
      body: "A short recording session makes the avatar and the voice. The platform that renders them is licensed from its vendor. Nobody here owns it. What is yours is your likeness, the footage it was built from, the scripts and the finished videos. Those are only ever used on your own content.",
    },
    {
      title: "Give it what it needs to know",
      body: "Your listings, your market data, your scripts, and the way you really explain things go into a private knowledge base. That is what stops the twin sounding like a stranger wearing your face.",
    },
    {
      title: "Decide what it may never say, and who watches",
      body: "The sentences that are costly to get wrong in this trade look quite plain. A tax figure. A school. A boundary. A permit. A timeline. Those get named in advance. Each one either comes from the record that governs it, or does not get said at all. Then one person is named to watch what goes out, before it goes.",
    },
    {
      title: "Put it to work, and say so",
      body: "Personalized listing walkthroughs, lead greetings and follow-up messages get made without a recording session. Each one carries a spoken line saying it was assembled by software, from a recording of you. That line costs four seconds. It is the only thing that reliably tells a viewer, because the research says they cannot work it out for themselves.",
    },
  ],

  useCases: [
    {
      title: "A personal video for every buyer on a new listing",
      body: "Twelve buyers matched a new listing. Each gets a walkthrough addressed to them by name, in your voice. Not the same blast email everyone else sent.",
    },
    {
      title: "The greeting that runs while you sleep",
      body: "A lead arrives at midnight and sees you welcome them by name. The first impression is made before you have read the notification.",
    },
    {
      title: "Follow-up in your face rather than a fourth email",
      body: "The lead who went quiet three weeks ago gets a short video from you. Not the next identical message in a sequence. What that does to a reply rate is not something anybody has measured honestly. So this page does not claim it.",
    },
  ],

  limits: [
    "It does not speak for anyone but you. It carries your likeness and your voice, only ever on your own content. We do not build a likeness of anybody else, living or dead, at any price.",
    "It does not say anything you have not already stood behind. The scripts come from your own material, so what it can say is bounded by what you put in it.",
    "It does not know which sentences are the costly ones. A tax figure, a school district, a boundary or a permit status all read like plain data. They all behave like liability. So those get decided by a person in advance rather than by a script.",
    "It does not belong in the moments that need you. A twin scales the greeting, the walkthrough and the follow-up. The listing appointment and the hard conversation are still yours.",
    "It does not cut the amount of checking a business has to do. It raises it, because it raises the volume. Someone has to watch what goes out.",
    "It is not a secret. Every video says it was made with an AI avatar, and a twin that has to be hidden is being used for the wrong thing.",
  ],

  faqs: [
    {
      q: "What is an AI clone for a real estate agent?",
      a: "It is a video avatar that looks like you, and a voice clone that sounds like you. Both are wired to a knowledge base of your listings and your market. It records personalized listing videos, greets leads, and follows up. So your face and your voice are no longer limited to one conversation at a time.",
    },
    {
      q: "Will the videos actually look like me?",
      a: "The avatar is built from a recording of you, and the voice from your own speech. So what it is built from is entirely you. How convincing any particular result is depends on the recording and on the platform. Judge it on your own footage rather than on a promise from a website. What anybody can control is the writing. The scripts come from your own material, and that is what stops it reading like a template.",
    },
    {
      q: "Is it legal to use an AI video of myself in my marketing?",
      a: "Yes, and the paperwork is worth doing properly anyway. New York Civil Rights Law section 50 requires written consent obtained in advance before a living person's likeness or voice is used for advertising or trade. Where the person is you, that is a document you sign once. Do it properly rather than informally. Consent for one video is not consent for a model that can produce a thousand. The useful part is that it forces you to write down what may be produced.",
    },
    {
      q: "Can I make one of a colleague, or of a client?",
      a: "A colleague, yes, with their own written permission, given apart from their employment. Write down what happens to the model when they leave. A client, no. A real client recorded with their permission is plain marketing. A synthesised version of them is not. Nor are words they did not say, assembled into their voice. That is what several statutes exist to stop, and one of them is criminal in this state.",
    },
    {
      q: "Do I have to tell people the video was made with AI?",
      a: "Treat it as required whatever any particular rule says today. Published research says the viewer cannot work it out. 315 people sorting synthetic faces from real ones averaged 48.2 percent, against a 50 percent coin flip. Another 219 people were trained and told the answer every time. They reached 59.0 percent, and got no better with practice. A spoken sentence at the start costs four seconds. It turns something a person could discover into something you told them.",
    },
    {
      q: "Who owns the avatar and the voice?",
      a: "Two answers, and they are worth keeping apart. The technology is licensed, not owned. The video runs on a HeyGen-class avatar platform and the voice on an ElevenLabs-class engine. Those models belong to the vendors who built them. What is yours is your likeness, the recording it was built from, the scripts and the finished videos. Those are used only on your content. They are never licensed on to anybody else. And they are deleted on request.",
    },
  ],

  relatedPosts: [
    "ai-clone-real-estate-agent-video-avatar",
    "ai-voice-agent-missed-calls-real-estate",
    "ai-chat-assistant-real-estate-website",
  ],
};
