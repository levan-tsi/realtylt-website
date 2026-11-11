import type { Service } from "./types";

/** COPY key `marketing` on realtylt.com/ai. Deep link: /ai#marketing
 *
 * ROUND E killed two unsourced claims about buyer behaviour ("they buy from whoever stayed top of
 * mind", "most leads are not ready today"); neither comes back in any field.
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a landscaper's estimate requests, an
 * accounting office in tax season, a salon or spa's past clients, a gym, a real estate office's
 * listing alerts as ONE example), on "email marketing automation for small business" and "why do
 * my emails go to spam" (keyword map). No tool names in the copy; the mailbox providers are named
 * only as the source of their own rules. Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/marketing/: Google's Email sender guidelines
 * ("Requirements for all senders ... Keep spam rates reported in Postmaster Tools below 0.3%";
 * "Set up SPF or DKIM"; the 5,000-a-day section), Yahoo's Sender Best Practices (0.3%), and
 * CAN-SPAM at 15 U.S.C. 7704 (a valid physical postal address, an opt-out live for 30 days,
 * honored within 10 business days). */
export const marketingAutomation: Service = {
  slug: "marketing-automation",
  aiKey: "marketing",
  name: "Marketing Automation",
  tier: "core",

  eyebrow: "Marketing · Email and text that react",
  title: "Email and text marketing that reacts to customers",
  lede: "Somebody asked about a patio in March, got one reply, and heard nothing until a generic newsletter in July. We set up email and text marketing that reacts to what each customer actually does: a question, an opened estimate, a click on a seasonal offer. The next message goes out on its own, the quiet ones hear less rather than more, and the owner is told the moment someone looks ready.",
  specs: ["email and text that react", "set off by what people do", "backs off on silence", "sent so it arrives"],
  why: "A customer who is months from deciding hears from a lot of businesses in between, and most of it is generic and easy to forget. Messages set off by what a customer does are how a business stays useful across that wait, and nobody has to remember to send them.",
  keywords: [
    "email marketing automation for small business",
    "marketing automation for small businesses",
    "what is email marketing automation",
    "how to automate follow up emails",
    "why do my emails go to spam",
  ],

  seo: {
    title: "Email and text marketing automation for small business",
    description:
      "Email and text marketing automation for a small business: each message set off by what a customer did, quiet ones contacted less, and sent so it reaches the inbox.",
  },

  /** ROUND E. The one number in this subject that both major mailbox providers publish in the
   * same words. On Google's page it sits under "Requirements for all senders" rather than in the
   * bulk section, which is why the label says every sender rather than bulk senders. */
  stat: {
    value: "0.3%",
    label:
      "the spam-complaint ceiling Google and Yahoo both publish, and on Google's page it applies to every sender rather than only to bulk senders",
    source: {
      text: "Google Email sender guidelines and Yahoo Sender Best Practices",
      href: "https://support.google.com/a/answer/81126",
    },
  },

  figure: {
    kind: "flow",
    caption: "One homeowner, six months, no manual sends",
    trigger: "She asks a landscaper for a patio estimate in March",
    nodes: [
      { label: "Same day", note: "A reply with three photos of past patios and a link to book the visit. She opens it twice." },
      { label: "Week 2", note: "She has not booked. One short note asks if spring or fall suits her better." },
      { label: "Month 2", note: "She has gone quiet. The cadence drops to monthly rather than stopping." },
      { label: "Month 6", note: "She clicks the fall cleanup note twice in a week. The owner is told to call her today." },
    ],
    footnote: "An invented example. The sequence responds to behaviour. A customer who goes quiet is nurtured, not hammered, and one who says stop hears nothing more.",
  },

  whatItIs: [
    "It is marketing that reacts. A calendar sends the same email to everyone on day three. Instead, the sequence watches what each customer actually does: what they opened, which service they looked at, which offer they keep coming back to. It sends the next message off that.",
    "It runs across the channels that reach people, email and text first, from one signal rather than from four tools that do not talk to each other. The customer who is warming up hears more. The customer who is six months out is kept in touch with, without being worn out. Where the owner wants it, the same signal also schedules the business's social posts and shows ads to people who already visited the website, so a listing, an offer or a season reaches them more than once.",
    "Half of it is getting the mail delivered at all. Google's sender guidelines, under the requirements for every sender, ask for authentication on the sending domain and a spam complaint rate kept below 0.3 percent, and Yahoo publishes the same ceiling. So the setup includes the domain records, one-click unsubscribe and a list of people who asked to hear from the business. None of that improves a message. It stops the message being judged before anybody reads it.",
    "It fits a business with customers who decide slowly: a landscaper or contractor whose estimates turn into jobs months later, an accounting office whose clients come back each season, a salon or spa with past clients, a gym with lapsed members, a real estate office sending listing alerts to people who asked for them.",
  ],

  howItWorks: [
    {
      title: "We write the sequences with the owner",
      body: "Which moments matter for this business, what each message says, how often a quiet customer hears from it, and when a person should step in. The owner approves every message before it is switched on.",
    },
    {
      title: "Behaviour becomes the trigger",
      body: "An estimate requested, an email opened twice, a service page viewed again, or a month of silence all mean something different. Each one starts a different sequence.",
    },
    {
      title: "The message matches the moment",
      body: "Someone who just asked for an estimate gets the answer and a way to book today. Someone who has not engaged in weeks gets a seasonal note, not a fifth booking request. Relevance is not about keeping people subscribed. It is about not being reported, which is the thing that quietly costs the business the rest of the list.",
    },
    {
      title: "The owner gets told when to step in",
      body: "The system follows up, but it does not pretend to close. When a customer's behaviour says they are ready now, it brings them up and tells a person to call.",
    },
    {
      title: "The sending domain is set up so the mail can arrive",
      body: "SPF, DKIM and DMARC are published for the domain the business sends from, and the From line is aligned with them. Authentication is on Google's list of requirements for every sender; the alignment and the published DMARC policy are on its list for senders above five thousand messages a day. Mail that fails is filtered rather than bounced. One-click unsubscribe goes in the headers, and opt-outs are honored in days rather than in the ten business days the statute allows.",
    },
  ],

  handoff: {
    provides: [
      "The customer list, with where each person came from and what they agreed to receive.",
      "Access to the domain's settings, so the sending records can be published.",
      "The offers, the seasons and the services worth writing about.",
      "The person who is told when a customer looks ready.",
    ],
    approves: [
      "Every message and every sequence, before it is switched on.",
      "Who is on the list, and who is never on it.",
      "Any discount or offer, and when it ends.",
      "A monthly look at complaints, unsubscribes and replies.",
    ],
  },

  useCases: [
    {
      title: "The customer who is months away",
      body: "Someone who asks about a patio today and books next spring hears from a lot of businesses in between, and most of it is generic. Behaviour-set follow-up keeps the landscaper present for the wait without anybody remembering to send it. Remembering is the part that fails first.",
    },
    {
      title: "An accounting office in tax season",
      body: "Last year's clients get one note when the season opens, a reminder only if they have not booked, and nothing more once they have. Clients who replied with a question go to a person.",
    },
    {
      title: "A salon or spa's past clients",
      body: "Clients who have not booked in three months get a note about the services they actually had, not a blast about everything. Anyone who says stop is off the list the same day.",
    },
    {
      title: "A real estate office, the right listing to the right person",
      body: "A listing goes live. The people whose saved criteria it matches, and who asked for alerts, hear about it first.",
    },
    {
      title: "The customer who went quiet",
      body: "Silence gets a change of cadence and a change of message, rather than the same email arriving for the ninth time.",
    },
  ],

  limits: [
    "It does not create demand. It keeps the business present for people who already raised their hand. No cadence turns someone who does not need the service into someone who does.",
    "It does not fix a bad message. Sending the wrong thing at the right moment is still the wrong thing. Behaviour triggers only make it arrive faster.",
    "It does not override an opt-out. A person who asks to stop hearing from the business stops hearing from it. The cadence backs off on silence as well as on refusal.",
    "It does not get the mail delivered on its own. Authentication removes a reason to reject it. Whether a message reaches an inbox is a judgement made by the mailbox provider, from how the people it went to reacted last time. There is no setting for it.",
    "It does not say whether anybody read anything. An open is recorded when a mail client fetches a tracking image. Some clients do that automatically and others never do, so it is a proxy with known failures in both directions rather than a measurement of attention.",
    "It does not survive being aimed at everybody. Every send to someone who did not want it is evidence handed to a filtering system, and the cost lands on the next message to the people who did want it.",
    "It is not the relationship. A sequence keeps a customer in touch; a person builds the relationship, and the customers worth having can tell the difference.",
  ],

  faqs: [
    {
      q: "What is email marketing automation?",
      a: "It is software that sends the right message to a customer based on what they did rather than on a fixed schedule. Asking for an estimate, opening an email or going quiet each start a different next step across email and text, so the follow-up stays relevant without anyone sending it by hand.",
    },
    {
      q: "What is a drip campaign, and how is this different?",
      a: "A drip campaign sends email three on day seven no matter who the customer is. Behaviour-set follow-up watches what the customer actually does and changes the message and the cadence to match, which is why it keeps working past the second email.",
    },
    {
      q: "How do I automate follow-up emails?",
      a: "Pick one moment that matters, such as an estimate sent or a first visit done, write the two or three messages that should follow it, and set each to go only if the customer has not already replied or booked. Stop the sequence on any reply and hand it to a person. Start with one sequence and read the replies for a month before adding a second.",
    },
    {
      q: "Will automated marketing annoy my customers?",
      a: "It annoys them when it is irrelevant, which is exactly what behaviour triggers fix. A customer who goes quiet gets less contact and different content, not more of the same. The opt-out is always honored, and the cadence backs off automatically.",
    },
    {
      q: "Can it text customers, not just email them?",
      a: "Yes. Texts are part of the same sequence. They are sent under a different and stricter set of consent rules than email, with opt-outs honored automatically, and the rules that govern messaging someone who has gone quiet have dates in them.",
    },
    {
      q: "Do I need permission before I email somebody?",
      a: "Not under the federal statute, which is the part most people have backwards. CAN-SPAM sets rules for the message rather than for the relationship: it must identify itself as an advertisement, carry a valid physical postal address, and offer a working opt-out that stays live for at least thirty days, with the request honored within ten business days. Permission still matters enormously, for a different reason: mailbox providers judge a sender on how the people it emails react, and mail to people who never asked is what generates the reactions that get the rest filtered.",
    },
    {
      q: "Why do my emails go to spam?",
      a: "The causes a sender controls are three: the sending domain is not authenticated, people are marking the mail as spam, or the list includes people who never asked for it. The complaint rate matters most; Google and Yahoo both publish 0.3 percent as the ceiling. Google shows a sender its own complaint rate for free, and that number is a better health check than the open rate.",
    },
    {
      q: "Why did my open rate drop?",
      a: "Possibly because fewer people opened it, and possibly for two reasons that have nothing to do with the writing. An open is only recorded when a mail client fetches a tracking image, so clients that block or reroute remote images bend the count, and the mix of clients on a list changes over time. Separately, if more of the mail is being filtered, fewer people are offered the chance to open it at all.",
    },
  ],

  /** ROUND E: its own flagship first. Workflow stays because it is the adjacent read for how the
   * plumbing is built. */
  relatedPosts: [
    "marketing-automation-real-estate-email-deliverability",
    "workflow-automation-real-estate-business",
  ],
};
