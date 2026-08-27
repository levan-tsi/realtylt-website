import type { Service } from "./types";

/** COPY key `marketing` on realtylt.com/ai. Deep link: /ai#marketing */
export const marketingAutomation: Service = {
  slug: "marketing-automation",
  aiKey: "marketing",
  name: "Marketing Automation",
  tier: "core",

  eyebrow: "Marketing · Multi-channel Automation",
  title: "Campaigns that run themselves",
  lede: "Email and SMS drip, social posting, listing promotion, retargeting, and nurture sequences, all triggered by what each lead actually does. Behavior fires the next touch, so the right message lands at the right moment without you lifting a finger.",
  specs: ["email + SMS drip", "social + listing promotion", "behavior-triggered", "retargeting + nurture"],
  /** ROUND E. This read "Most leads aren't ready today. They're ready in six months, and they
   * buy from whoever stayed top of mind." Two unsourced claims about buyer behaviour in one
   * sentence, the second of them the same "stay top of mind and they buy from you" assertion
   * Round B killed on the voice page, and it is contradicted by this page's own first limit,
   * which says nurture does not create demand.
   *
   * THIS IS /ai COPY, seeded verbatim, so changing it widens the drift between the journey and
   * the services surface. That drift now covers five keys. Recorded in ROUND-E-LOG.md. */
  why: "A lead who is months from moving hears from a lot of people in between, and most of it is generic and forgettable. Behaviour-triggered nurture is how you stay useful across that wait without having to remember to.",
  keywords: [
    "real estate marketing automation",
    "automated email drip real estate",
    "real estate sms marketing",
    "lead nurturing automation real estate",
    "social media automation for realtors",
  ],

  seo: {
    title: "Real Estate Marketing Automation: Email, SMS, and Nurture",
    description:
      "Behavior-triggered email and SMS, social posting, listing promotion, and retargeting. The next touch fires from what the lead did, not from a calendar.",
  },

  /** ROUND E. The one number in this whole subject that both major mailbox providers publish in
   * the same words, and that almost nobody sending marketing email has seen. On Google's page it
   * sits under "Requirements for all senders" rather than in the bulk section, which is why the
   * label says every sender rather than bulk senders. */
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
    caption: "One buyer, six months, no manual sends",
    trigger: "She saves a listing in Beacon",
    nodes: [
      { label: "Same day", note: "Three similar listings by SMS. She opens two of them." },
      { label: "Week 2", note: "She viewed the same street twice. A Beacon market note goes out." },
      { label: "Month 3", note: "She has gone quiet. Cadence drops to monthly rather than stopping." },
      { label: "Month 6", note: "She opens two listings in a week. You get told to call her today." },
    ],
    footnote: "The sequence responds to behavior. A lead who goes quiet is nurtured, not hammered.",
  },

  whatItIs: [
    "It is marketing that reacts. Instead of a calendar that sends the same email to everyone on day three, the sequence watches what each lead actually does: what they opened, which listings they viewed, which street they keep coming back to, and it fires the next touch off that.",
    "It runs across the channels that reach people: email, SMS, social posting, listing promotion, and retargeting, all from one behavior signal rather than four disconnected tools. The lead who is heating up gets more contact. The lead who is six months out gets kept warm without being burned out.",
  ],

  howItWorks: [
    {
      title: "Behavior becomes the trigger",
      body: "Saving a listing, opening a text, viewing the same area three times, or going quiet for a month all mean something different, and each one starts a different sequence.",
    },
    {
      title: "The message matches the moment",
      // ROUND E: "Relevance is what stops the unsubscribe" is gone, and it was pointed at the
      // wrong thing. An unsubscribe is a healthy outcome and costs nothing. What relevance
      // actually protects you from is the button next to it, which is scored against your
      // domain and affects everybody else on the list.
      body: "Someone who just saved a listing gets similar ones today. Someone who has not engaged in weeks gets a market note, not a fifth showing request. Relevance is not about keeping people subscribed. It is about not being reported, which is the thing that quietly costs you the rest of the list.",
    },
    {
      title: "You get told when to step in",
      body: "The system nurtures, but it does not pretend to close. When a lead's behavior says they are ready now, it surfaces them and tells you to call.",
    },
    {
      title: "The sending domain is set up so the mail can arrive",
      // ROUND E: NEW STEP. The page previously described the campaign and said nothing at all
      // about delivery, which is the half the sender does not control. See
      // /blog/marketing-automation-real-estate-email-deliverability.
      body: "SPF, DKIM and DMARC are published for the domain you send from, and the address in your From line is aligned with them. Authentication is on Google's list of requirements for every sender; the alignment and the published DMARC policy are on its list for senders above five thousand messages a day, and mail that fails is filtered rather than bounced. One-click unsubscribe goes in the headers, and opt-outs are honored in days rather than in the ten business days the statute allows. None of this improves your message. It is what stops the message being judged before anybody reads it.",
    },
  ],

  useCases: [
    {
      title: "The buyer who is months away",
      // ROUND E: "Most leads are not ready today" is gone. It is a claim about the composition
      // of a lead pool with nothing under it, and it is repeated in `why` on this same page,
      // which is the Round B and C pattern of one unsourced claim appearing twice.
      body: "Somebody who enquires today and transacts next spring hears from a lot of people in between, and most of it is generic. Nurture keeps you present for the wait without asking you to remember, and remembering is the part that fails first.",
    },
    {
      title: "New listing, right audience",
      body: "A listing goes live and the people whose saved criteria it matches hear about it first, by text, before it appears on a portal.",
    },
    {
      title: "The lead who went quiet",
      body: "Silence gets a change of cadence and a change of message, rather than the same drip email arriving for the ninth time.",
    },
  ],

  limits: [
    "It does not create demand. It keeps you present for people who already raised their hand, and no cadence turns somebody who is not moving into somebody who is.",
    "It does not fix a bad message. Sending the wrong thing at the right moment is still the wrong thing, and behavior triggers only make it arrive faster.",
    "It does not override an opt-out. A person who asks to stop hearing from you stops hearing from you, and the cadence backs off on silence as well as on refusal.",
    "It does not get your mail delivered. Authentication removes a reason to reject you; whether a message reaches an inbox is a judgement made by the mailbox provider from how the people you sent to reacted last time, and there is no setting for it.",
    "It does not tell you whether anybody read anything. An open is recorded when a mail client fetches a tracking image, which some clients do automatically and others never do, so it is a proxy with known failure modes in both directions rather than a measurement of attention.",
    "It does not survive being aimed at everybody. Every send to somebody who did not want it is evidence handed to a filtering system, and the cost of that lands on the next message to the people who did want it.",
    "It does not replace you calling anyone. A sequence keeps a lead warm. It does not build a relationship, and the leads worth having can tell the difference.",
  ],

  faqs: [
    {
      q: "What is real estate marketing automation?",
      a: "It is software that sends the right message to a lead based on what they did rather than on a fixed schedule. Saving a listing, opening a text, or going quiet each trigger a different next step across email, SMS, and social, so the follow-up stays relevant without anyone sending it by hand.",
    },
    {
      q: "How is this different from a normal drip campaign?",
      a: "A drip campaign sends email three on day seven no matter who you are. Behavior-triggered nurture watches what the lead actually does and changes the message and the cadence accordingly, which is why it keeps working past the second email.",
    },
    {
      q: "Will automated marketing annoy my leads?",
      a: "It annoys them when it is irrelevant, which is exactly what behavior triggers fix. A lead who goes quiet gets less contact and different content, not more of the same. The opt-out is always honored, and cadence backs off automatically.",
    },
    {
      q: "Can it text leads, not just email them?",
      // ROUND E: "it is usually the channel that gets opened" is gone. It is a comparative
      // claim about channel performance with nothing under it.
      a: "Yes. SMS is part of the same sequence. Texts are sent under a different and stricter set of consent rules than email, with opt-outs honored automatically, and the rules that govern messaging somebody who has gone quiet have dates in them.",
    },
    {
      q: "Do I need permission before I email somebody?",
      // ROUND E: NEW, and the answer surprises people. CAN-SPAM at 15 U.S.C. 7704 sets
      // conditions on the MESSAGE and contains no requirement of prior consent. The binding
      // constraint is the mailbox providers, not the statute.
      a: "Not under the federal statute, which is the part most people have backwards. CAN-SPAM regulates the message rather than the relationship: it must identify itself as an advertisement, carry a valid physical postal address, and offer a working opt-out that stays live for at least thirty days, with the request honored within ten business days. Permission still matters enormously, for a different reason. Mailbox providers judge you on how the people you email react, and mail to people who never asked is what generates the reactions that get the rest of your mail filtered.",
    },
    {
      q: "Why did my open rate drop?",
      // ROUND E: NEW. Directly answers the most common panic on this topic and does it
      // honestly, which nothing else in this category does.
      a: "Possibly because fewer people opened it, and possibly for two reasons that have nothing to do with your writing. An open is only recorded when a mail client fetches a tracking image, so clients that block or proxy remote images distort the count and the mix of clients on a list changes over time. Separately, if more of your mail is being filtered, fewer people are being offered the chance to open it at all. Your spam complaint rate is a better health signal than your open rate, and Google publishes yours to you free through Postmaster Tools.",
    },
  ],

  /** ROUND E: its own flagship first. The skip-tracing post is second because it is the other
   * half of the same question, which is where the people on a list came from. Workflow stays
   * because it is genuinely the adjacent read for how the plumbing is built. */
  relatedPosts: [
    "marketing-automation-real-estate-email-deliverability",
    "skip-tracing-real-estate-legal-owner-phone-numbers",
    "workflow-automation-real-estate-business",
  ],
};
