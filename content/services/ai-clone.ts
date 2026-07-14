import type { Service } from "./types";

/** COPY key `clone` on realtylt.com/ai. Deep link: /ai#clone */
export const aiClone: Service = {
  slug: "ai-clone",
  aiKey: "clone",
  name: "AI Clone",
  tier: "core",

  eyebrow: "AI Clone · Video + Voice + Memory",
  title: "A second you, working around the clock",
  lede: "A HeyGen-class video avatar plus an ElevenLabs-class voice clone, wired to a private knowledge base of your listings, scripts, and market. “You” greet leads, record personalized listing walkthroughs, and follow up 24/7, in your own face and voice.",
  specs: ["HeyGen-class avatar", "ElevenLabs-class voice", "private knowledge base", "always-on follow-up"],
  why: "You can only be on one call, one video, one showing at a time. A digital twin scales the two things clients actually buy, your face and your voice, so personal attention stops being a bottleneck.",
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
      "A video avatar and voice clone of you, wired to your listings and your market, recording personalized walkthroughs and following up with leads in your own face and voice.",
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
    "It is a digital twin: a video avatar that looks like you and a voice clone that sounds like you, both connected to a private knowledge base of your listings, your scripts, and your market. It can greet a lead, walk a buyer through a property, and follow up on a quiet conversation, in your face and your voice, while you are somewhere else.",
    "The reason it matters is that the two things clients actually buy from an agent are your face and your voice, and both of them are stuck in one place at a time. A twin does not replace you on the deals that need you. It removes the ceiling on the personal attention you can give everyone else.",
  ],

  howItWorks: [
    {
      title: "Build the twin",
      body: "A short recording session produces the avatar and the voice. The likeness and the voice are yours, they stay yours, and they are only ever used on your own content.",
    },
    {
      title: "Give it what it needs to know",
      body: "Your listings, your market data, your scripts, and the way you actually explain things go into a private knowledge base. That is what stops the twin from sounding like a stranger wearing your face.",
    },
    {
      title: "Put it to work",
      body: "Personalized listing walkthroughs, lead greetings, and follow-up messages get produced and sent without a recording session. One listing can generate a dozen individually addressed videos in an afternoon.",
    },
  ],

  useCases: [
    {
      title: "A personal video for every buyer on a new listing",
      body: "Twelve buyers matched a new listing. Each gets a walkthrough addressed to them by name, in your voice, instead of the same blast email everyone else sent.",
    },
    {
      title: "The greeting that runs while you sleep",
      body: "A lead arrives at midnight and sees you welcome them by name. The first impression is made before you have read the notification.",
    },
    {
      title: "Follow-up that does not feel automated",
      body: "The lead who went quiet three weeks ago gets a short video from you rather than the fourth identical drip email, which is why they answer it.",
    },
  ],

  faqs: [
    {
      q: "What is an AI clone for a real estate agent?",
      a: "It is a video avatar that looks like you and a voice clone that sounds like you, connected to a knowledge base of your listings and your market. It records personalized listing videos, greets leads, and follows up, so your face and your voice are no longer limited to one conversation at a time.",
    },
    {
      q: "Will the videos actually look like me?",
      a: "Yes. The avatar is built from a recording of you, and the voice is cloned from your own speech, so what goes out looks and sounds like you rather than a generic presenter. The scripts come from your own knowledge base, which is what makes it read as you and not as a template.",
    },
    {
      q: "Is it ethical to send AI videos to clients?",
      a: "It is when it is honestly your own likeness saying things you stand behind, and we build it that way. The twin only ever speaks for you, only from your own content, and never impersonates anyone else. We recommend being straightforward that a video was produced with an AI avatar.",
    },
    {
      q: "Who owns the avatar and the voice?",
      a: "You do. The likeness and the voice are yours, they are used only on your content, and they are not shared, licensed on, or reused anywhere else.",
    },
  ],
};
