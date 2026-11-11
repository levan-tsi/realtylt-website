import type { Service } from "./types";

/** COPY key `qualify` on realtylt.com/ai. Deep link: /ai#qualify
 *
 * Round 28 (2026-11-11): re-aimed at local business owners (a roofer's quote requests, an
 * accounting office's new clients, a gym's trial requests, a real estate office as ONE example),
 * on the owner's phrases "lead scoring", "how to qualify leads", "lead qualification process"
 * (keyword map). The rule under it stays and widens: change the order, never the access; the
 * score reads the job and never the person. The Fair Housing Act and Article 10 now sit where
 * they apply, on the real estate office's case. Re-read 2026-11-11 and saved in realtylt-agents
 * company/agents/seo/runs/r28-services/sources/qualify/: 42 U.S.C. 3604 (Cornell LII) and the
 * NAR Code of Ethics 2026, Article 10 ("sexual orientation, or gender identity"). */
export const leadQualification: Service = {
  slug: "lead-qualification",
  aiKey: "qualify",
  name: "Lead Qualification",
  tier: "more",

  eyebrow: "Qualification · Score and route",
  title: "Lead scoring that puts the ready customers first",
  lede: "Thirty quote requests came in this week and they all look the same in the inbox: a name, a number, “please call”. We set up lead scoring that reads what each person actually said, how soon they need it, what the job is and whether it fits, and ranks the list by who to call now. Everyone still gets an answer. The score only changes the order.",
  specs: ["reads what they said", "scores need, fit and timing", "routes to the right person", "every score shows its reason"],
  why: "Treating every lead the same spends the best hours of the day on people who were only pricing. Sorting leads this way is called qualification. It puts the customers who are ready to go ahead at the top of the list, and every other lead still gets its answer, just later in the day or on a slower track.",
  keywords: [
    "lead scoring",
    "how to qualify leads",
    "lead qualification process",
    "ai lead qualification",
    "lead scoring real estate",
  ],

  seo: {
    title: "Lead scoring and qualification for small business, with AI",
    description:
      "AI lead scoring for a small business: every inquiry ranked on need, fit and timing from what the person said, routed to the right person, and never ignored.",
  },

  figure: {
    kind: "records",
    caption: "The same three quote requests, before and after they are read",
    headers: { before: "What the form said", after: "What the conversation said" },
    rows: [
      {
        before: "D. Okafor, roof repair",
        after: ["Leak in two rooms", "Insurance adjuster booked", "Wants it fixed this week"],
        tag: "call now",
      },
      {
        before: "T. Reyes, roof replacement",
        after: ["Getting three quotes", "Thinking about next summer", "No damage yet"],
        tag: "this week",
      },
      {
        before: "M. Lund, gutters",
        after: ["Selling the house in May", "Inspection flagged the gutters", "Needs it before listing"],
        tag: "call now",
      },
    ],
    footnote: "An invented example. All three look identical in the inbox. Two of them are worth the morning, and the third still gets a reply.",
  },

  whatItIs: [
    "It is the difference between a list of inquiries and a ranked list. Every inbound lead looks the same on a form. What separates them is what they say next, and that is where the need, the fit and the timing actually live.",
    "The AI reads the conversation, the chat, the email or the call transcript, and scores the lead on those three things. Then it routes it: to a person straight away if it is ready, to a slower follow-up if it is not. The list the owner looks at in the morning is ordered by who is worth calling first, with the reason written beside each name.",
    "There is a line under all of this, and it belongs on the page that sells it: change the order, never the access. Qualification decides who gets called first. It must never decide who gets an answer, who gets a fair price or who is allowed to reach a person. So the score reads the job and never the person: never a name, a language, an accent or a neighborhood, and every point of it traces back to a sentence the lead actually wrote.",
    "It fits a business that gets more inquiries than it can answer in the order they arrive: a roofer or a landscaper after a storm or in spring, an accounting office in tax season, a gym or a salon with more trial requests than open sessions, a real estate office with more buyer inquiries than agents. For a real estate office the same rule is the law: the Fair Housing Act, at 42 U.S.C. 3604, has no software exemption, and Article 10 of the NAR Code of Ethics is broader still.",
  ],

  howItWorks: [
    {
      title: "We write the scoring rules with the owner",
      body: "What makes a lead ready for this business: the job, the area, the timing, the size. What never counts: anything about who the person is. The owner approves the rules, and they are written in plain words, not hidden in a model.",
    },
    {
      title: "It reads what they actually said",
      body: "Not the checkbox they ticked. The chat, the call and the email together say far more about readiness than any form field.",
    },
    {
      title: "It scores on the three things that matter",
      body: "Need, fit and timing. A homeowner with water in two rooms and an adjuster booked is not the same lead as someone collecting quotes for next summer, and should not sit next to them on the list.",
    },
    {
      title: "It routes and it ranks",
      body: "Ready goes to a person, straight away. Everything else goes to the follow-up that suits it, and the list stays ordered by who to call now. Every lead gets a reply; the score sets when, not whether.",
    },
    {
      title: "It shows its working",
      body: "Every score points at a sentence the lead actually wrote. Anyone can open a lead and read the words that produced the number. That is what makes it correctable when it is wrong, and explainable when somebody asks about it.",
    },
  ],

  handoff: {
    provides: [
      "What makes a lead ready for this business, in the owner's own words.",
      "The places leads arrive: the website form, the inbox, the phone line, the chat.",
      "Who should get which kind of lead, by job or area, and how fast.",
      "The follow-up for leads that are not ready yet, or a yes on ours.",
    ],
    approves: [
      "The scoring rules, and every change to them.",
      "A look at last month's low-scored leads, to check they still got an answer.",
      "Any lead that is turned away, which only a person decides.",
      "The first reply to every lead marked ready.",
    ],
  },

  useCases: [
    {
      title: "A roofer's morning call list that is actually ordered",
      body: "After a storm the quote requests pile up. The best hours go to the leaks and the deadlines rather than to working down the list in the order the forms arrived, and the quote-collectors still get their reply that afternoon.",
    },
    {
      title: "The urgent lead that did not look urgent",
      body: "A gutter request from someone selling their house in May reads as routine on a form and as urgent in the conversation, because an inspection already flagged it.",
    },
    {
      title: "An accounting office in tax season",
      body: "A new business owner who has to file next month and a household asking about next year both fill in the same form. The first is routed to a partner today; the second gets a booking for after the season, with the reason written down.",
    },
    {
      title: "A gym or salon with more requests than sessions",
      body: "Trial requests are ranked by when the person wants to start and what they asked for, so the open sessions go to the people ready to come this week, and everyone else is offered the next opening.",
    },
    {
      title: "A real estate office, the right agent on the right lead",
      body: "Routing by area, price band or specialty, automatically, instead of by whoever happened to grab it. Area routing is also the classic fair housing proxy, so it is allowed to decide which agent picks up and never how fast, how fully, or whether anybody answers at all.",
    },
    {
      title: "The date with a reason behind it",
      body: "Spring is not a timeline. A house going on the market in May is a timeline. The reason is what makes the date real, and when somebody volunteers it unprompted they have said they are not browsing. That sentence never appears on a form.",
    },
    {
      title: "The report almost nobody runs",
      body: "Take the leads scored low last quarter and check what they actually received: answers, quotes, a person on the phone. If the low group got less of the owner's time, the ranking did its job. If they got less service, then it stopped being a ranking, and no audit of the inputs would have caught it.",
    },
  ],

  /** Lifted from this service's own flagship post (content/blog/ai-posts.ts). The last entry is
   * the same rule as the access paragraph in `whatItIs`, said from the product's side: scoring
   * suggests an order and never decides an outcome. */
  limits: [
    "It is not a prediction about a person. It is a guess about a date, made from limited evidence, and it will be wrong regularly. Somebody twelve months out calls in March because a storm took their roof.",
    "It does not do the reading for anyone. The score is a sort order, not a summary, and calling the top of the list without opening the conversation underneath it is a faster way to be unprepared.",
    "It does not work on nothing. A lead who filled in a form, said no more and never replied has given the system exactly what they gave the business. No model extracts intent from silence.",
    "It never reads who a person is. A name, a language, an accent or a neighborhood is not an input, and a score that leans on one has been built wrong.",
    "It does not decide anything. Every score is a suggestion about the order of an afternoon. Nobody is refused and nothing is closed off, and if it is ever doing more than suggesting, it has been built wrong.",
  ],

  faqs: [
    {
      q: "How do I qualify leads?",
      a: "Read what the person actually said rather than the form, and score three things a person can be specific about before anything has happened: what they need, whether it fits what the business does, and how soon. Call the ready ones first and give everyone else a reply on a slower track. Write the rules down so anyone in the business can see why a lead sits where it does.",
    },
    {
      q: "What is lead scoring?",
      a: "It is ranking leads by how soon they are likely to go ahead, so the team's time goes first to the ones that are ready. Without it, every inquiry in the CRM looks identical and the order of the day is set by whatever arrived first.",
    },
    {
      q: "Does a low score mean the lead is dropped?",
      a: "No. It means the lead goes to a slower follow-up instead of the morning call list. Many leads are not ready today and are ready later, and the point of scoring is to stop those two groups getting the same treatment. A low score changes when somebody calls. It never changes what that person can ask or be told.",
    },
    {
      q: "Can the score be wrong?",
      a: "Regularly, and in both directions. A cautious person underplays their timeline and scores low. Somebody who talks a good game scores high and never goes ahead. Treat the ranking as a sort order that saves starting at a random point rather than as a verdict, and read the conversation before dialing either way.",
    },
    {
      q: "How does AI qualify a real estate lead?",
      a: "The same way, with the real estate office's three questions: whether a buyer is pre-approved, whether they have a house to sell, and when they need to move. Those are things a person can be specific about before anything has happened, and none of them appear on a contact form. The score sets the order of calls, never who gets to see a listing.",
    },
    {
      q: "Is it legal to score and route leads with software?",
      a: "Scoring the team's own time is not the risk. The risk is scoring on anything that stands in for who a person is rather than what they said, and then delivering a different level of service on the back of it. For a real estate office, the Fair Housing Act, at 42 U.S.C. 3604, makes no exception for a routing rule, and Article 10 of the NAR Code of Ethics covers sexual orientation and gender identity, which the federal statute does not. Keep the inputs to the plans people describe, keep every score traceable to their own words, and never let the ranking change what anybody is allowed to see or ask. None of this is legal advice.",
    },
  ],

  /** Own post FIRST. Two cards, because RelatedPosts is a two-column grid and an odd count leaves
   * a visible empty cell. */
  relatedPosts: [
    "ai-lead-qualification-real-estate-scoring",
    "ai-chat-assistant-real-estate-website",
  ],
};
