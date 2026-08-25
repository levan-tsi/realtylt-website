/** Scene copy for the review automation flagship post (topic 6).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Sixth topic on the flagship template and the FIFTH IN A ROW that adds no component of
 * its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE. Videos are owner-held and this topic has none, so there is no `reel` key at
 * all. A film scene with no film renders as a silent hole; lib/blog/flagship.test.ts fails on
 * that combination rather than letting it ship, and the honest way to satisfy it is to not place
 * the scene. `scripts/score-flagship.mjs` therefore reports C3 red for this slug, on purpose,
 * and that is never to be faked or re-baselined.
 *
 * SOURCE OF TRUTH for what the product does is content/services/review-automation.ts, whose
 * mechanic was rewritten on 2026-08-25 to the only version that is actually allowed: everyone
 * gets the same Google link whatever they scored, and a low score ALSO opens a private line to
 * the owner. Nothing here claims a capability that page does not claim, and nothing here
 * describes a mechanic that page does not describe. Where this piece goes further it goes into
 * published policy, published regulation and published research, each read in the primary
 * document rather than in a summary of it.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines carrying the whole argument, for the reader who is skimming and for the assistants
 * that increasingly answer on somebody's behalf. Each one is checkable by somebody else: the
 * first is Google's own policy text, the second is the survey's own published figure, the third
 * is the finding of the one study that put a number on what reviews are worth in money. */
export const IN_SHORT: string[] = [
  "Asking only the customers you expect to be kind is called review gating, and Google's contribution policy lists it under what merchants may not do, in the same breath as paying for reviews. The compliant version is also the better one: everyone gets the same link, and a rough score reaches you privately as well.",
  "Volume is not the goal, recency is. In BrightLocal's 2026 survey of 1,002 US adults, 74% said they look for reviews written in the last three months, and only 10% said they will use nothing below five stars.",
  "The one study that measured money rather than opinion found a one-star increase worth 5 to 9 percent of revenue, and only for independent businesses. It was done on Seattle restaurants, which is why this article will not turn it into a commission figure for you.",
];

/** SCENE copy — the thresholds chart. Cited data graphic ONE.
 *
 * A SIXTH body of evidence, deliberately: the five earlier topics rest on HBR/Oldroyd on
 * response speed, Stivers on conversational timing, the NAR generational survey, HUD guidance
 * and Mark/Gonzalez/Harris on interruption. None of them is evidence about how anybody chooses
 * a business from a profile page, which is this piece's whole argument.
 *
 * BrightLocal, Local Consumer Review Survey 2026. Read on the survey's own page, not in a
 * secondary write-up. Its published method, quoted from the page: "The Local Consumer Review
 * Survey 2026 was conducted using a representative panel of 1,002 US adult consumers via
 * SurveyMonkey", with an age split of 22% aged 18-29, 25% aged 30-44, 28% aged 45-59 and 25%
 * aged 60 or over.
 *
 * The four operative sentences, quoted as written on the page:
 *   "74% seek reviews written in the last three months."
 *   "47% of consumers won't use a business with fewer than 20 reviews, and only 9% are willing
 *    to use one with five or fewer."
 *   "Seven in ten (68%) will only use a business with four or more stars, up from 55% in 2025."
 *   "just 10% of consumers say they will only use businesses with a five-star rating"
 *
 * THE FOUR BARS ANSWER FOUR DIFFERENT QUESTIONS and the basis line says so. This is the exact
 * defect the workflow chart shipped with and had to be corrected for: four numbers side by side
 * invite a reader to treat them as one distribution. They are not one, they do not add up to
 * anything, and the only comparison available is between what each threshold demands.
 *
 * THE 73% IS NOT HERE, and hunting for it is how this chart was built. "73% of customers read
 * reviews before they book" was on our own service page with nothing under it. This survey is
 * the only annually repeated primary survey of the behaviour and 73 is not a figure in it; what
 * is in it is 97% who read reviews for local businesses and 41% who say they always do. */
export const THRESHOLDS = {
  eyebrow: "The evidence",
  caption: "What people say they require before they will use a business",
  bars: [
    { label: "Look for reviews written in the last three months", value: 74, display: "74%" },
    { label: "Will only use a business rated four stars or better", value: 68, display: "68%" },
    { label: "Will not use a business with fewer than 20 reviews", value: 47, display: "47%" },
    { label: "Will use nothing below a five-star rating", value: 10, display: "10%" },
  ],
  /** Shares of a whole panel, so the axis runs to 100. Scaled to its own largest bar the 74%
   * would be drawn full width, and full width reads as everybody. */
  max: 100,
  /** The accent goes on recency, which is the finding this article is built on. The five-star
   * bar is the one most worth reading and it is deliberately not lit: it is the answer to the
   * fear that produces gating in the first place. */
  lit: 0,
  basis:
    "Share of a representative panel of 1,002 US adult consumers. Each bar answers a different question, so they are four separate thresholds rather than four slices of one pie, and nothing here adds up to a hundred.",
  sourceText:
    "BrightLocal, Local Consumer Review Survey 2026, conducted on a representative panel of 1,002 US adult consumers via SurveyMonkey.",
  sourceHref: "https://www.brightlocal.com/research/local-consumer-review-survey/",
  note: "This is what people say they do, collected by a company that sells review software, and both halves of that sentence are worth holding on to. Self-reported behaviour and observed behaviour are different measurements, nobody in the panel was asked about a real estate agent specifically, and a business that sells the tool has an interest in the answer. It is quoted here because it is the only annually repeated survey of this behaviour that publishes its sample and its method, and because the figure this article actually needs from it is a direction rather than a decimal: recent beats plentiful.",
};

/** SCENE copy — what a stranger does with your profile.
 *
 * Four moves in the order they actually happen, on a phone, in under fifteen seconds. This scene
 * REPLACES the prose that used to describe the same sequence, so these words appear once. */
export const PROFILE_SCAN: GridItem[] = [
  {
    lead: "The number, then the count beside it.",
    body: "A 4.8 with nine reviews and a 4.8 with ninety are the same number and not the same signal, and everybody knows it without being told. The count is the first thing that decides whether the rating means anything at all.",
  },
  {
    lead: "The date on the newest one.",
    body: "This is the move almost nobody optimises for and the one the survey above puts highest. A wall of praise from three years ago tells a stranger that you were good in 2023 and says nothing whatever about whether you are busy now.",
  },
  {
    lead: "The worst review on the first screen.",
    body: "Not the best. People go looking for the bad one on purpose, because it is the only part of the page they believe has not been managed, and they read it to find out what you are like when something goes wrong.",
  },
  {
    lead: "Whether anybody answered it.",
    body: "A complaint with a straight reply under it does more work than the four fives above it. It is the only place on the page where you get to speak, and it is read by people who will never leave a review themselves.",
  },
];

/** SCENE copy — the Yelp revenue study. Cited data graphic TWO.
 *
 * Michael Luca, "Reviews, Reputation, and Revenue: The Case of Yelp.com", Harvard Business
 * School Working Paper 12-016 (copyright 2011, 2016). Read in the paper itself via pdftotext,
 * not in any of the hundreds of pages that quote its headline.
 *
 * Method, from the paper's own Data section: Yelp reviews matched by hand to revenue records for
 * every restaurant in Seattle held by the Washington State Department of Revenue, January 2003
 * to October 2009. 3,582 restaurants across the period, about 1,587 open in an average quarter,
 * 143 of them chain affiliated. By October 2009, 69% of Seattle restaurants were on Yelp.
 *
 * The two figures on the chart, quoted from the paper:
 *   OLS, section 4: "A one-star increase is associated with a 5.4% increase in revenue,
 *     controlling for restaurant and quarter specific unobservables."
 *   Regression discontinuity, section 4.1: "I find that an exogenous one-star improvement leads
 *     to a roughly 9% increase in revenue."
 *
 * WHY BOTH BARS AND NOT JUST THE BIG ONE. The 9% is the causal estimate and the 5.4% is the
 * correlation, and a chart showing only the 9% would be quoting the paper's best number without
 * its own author's caution. Showing the pair is what the paper does: the abstract reports the
 * finding as a range, "a one-star increase in Yelp rating leads to a 5-9 percent increase in
 * revenue", precisely because the estimate depends on the specification.
 *
 * The finding that matters most is NOT on the chart because it has no bar: the effect is
 * "statistically insignificant and close to zero for chains". It is in the basis line instead,
 * because a zero-length bar reads as a rendering fault rather than as a result. */
export const YELP_LIFT = {
  eyebrow: "The evidence",
  caption: "What one extra star did to revenue, in Seattle, over seven years",
  bars: [
    { label: "One extra star, correlated with revenue", value: 5.4, display: "5.4%" },
    { label: "One extra star, isolated by the rounding test", value: 9, display: "about 9%" },
  ],
  /** Two estimates of one effect rather than shares of a whole, so the axis scales to the larger
   * of them. A max of 100 here would draw both as slivers and lose the only comparison the chart
   * is making, which is between the correlation and the causal estimate. */
  lit: 1,
  basis:
    "Percentage change in quarterly revenue. The second bar comes from a rounding experiment: Yelp displays a rating rounded to the nearest half star, so restaurants whose true average sat a hair either side of a threshold were shown different ratings for the same underlying reviews. Both estimates are for independent restaurants. The same paper found the effect statistically insignificant and close to zero for chain-affiliated restaurants, which has no bar because a bar of nothing reads as a broken chart.",
  sourceText:
    "Michael Luca, Reviews, Reputation, and Revenue: The Case of Yelp.com, Harvard Business School Working Paper 12-016. Yelp reviews matched to Washington State Department of Revenue records for every restaurant in Seattle, January 2003 to October 2009.",
  sourceHref: "https://www.hbs.edu/ris/Publication%20Files/12-016_a7e4a5a2-03f9-490d-b093-8f951238dba2.pdf",
  note: "Restaurants, in one city, ending in 2009, measured against sales tax records. Nobody has run this study on real estate agents and nobody should pretend the multiplier transfers: a restaurant is chosen dozens of times a year by people spending forty dollars, and an agent is chosen once by somebody spending the largest sum of their life. What does transfer is the direction and the shape of the mechanism, including the part that is genuinely useful to a small business: the effect showed up for independents and not for chains, because a brand name already answers the question that reviews answer.",
};

/** SCENE copy — the four moves.
 *
 * The mechanic, in the article's voice, matching content/services/review-automation.ts step for
 * step. The third card is the one the whole page turns on and it is written to be unambiguous:
 * the link is not conditional on the score. */
export const FOUR_MOVES: GridItem[] = [
  {
    lead: "It asks on the day, not on Friday.",
    body: "The message goes out while the thing that happened is still the most recent thing that happened. Enthusiasm has a half-life measured in hours, and almost every review a business never got was lost to a delay rather than to a refusal.",
  },
  {
    lead: "It asks everybody, in the same words.",
    body: "Every customer gets the same Google link, whatever they scored a minute earlier. That is not a compliance concession bolted onto the product. It is the product, and the section below explains why the alternative is the one thing in this category that is actually against the rules.",
  },
  {
    lead: "A rough answer also reaches you, at once.",
    body: "As well as the link and never instead of it. You get the score, what they wrote and who wrote it, in the same minute, which buys you the afternoon to make the call rather than the fortnight to discover the review.",
  },
];

/** SCENE copy — the line, and where exactly it is.
 *
 * Six cards, three either side, all six drawn from the operative text of Google's contribution
 * policy rather than from anybody's summary of it. Under "We do not allow merchants to" the
 * policy lists, verbatim: "Offer incentives - such as payment, discounts, free goods and/or
 * services - in exchange for posting any review or revision or removal of a negative review" and
 * "Discourage or prohibit negative reviews, or selectively solicit positive reviews from
 * customers". It continues: "When soliciting reviews, merchants should not require or pressure
 * users to leave ratings or write reviews while on the premises, nor should they request that
 * specific content be included", and gives two examples of the latter, "Merchants requesting
 * that staff solicit a certain number of reviews" and "Merchants requesting that staff solicit
 * reviews that include specific content, including content that identifies a staff member".
 *
 * Under "We do allow merchants to" it lists exactly one thing: "Solicit or encourage the posting
 * of content that does represent a genuine experience, without offering incentives to do so or
 * attempting to influence the rating or the contents of the review."
 *
 * That last sentence is why the allowed column is short and the article says so. The permission
 * is narrow and the prohibitions are specific, and three of the six below are practices that are
 * sold openly as best practice at conferences. */
export const GATING_LINE: GridItem[] = [
  {
    lead: "Allowed: asking every customer, every time.",
    body: "The policy's own permission is to solicit content that represents a genuine experience, without incentives and without trying to influence the rating or what the review says. Automating when that ask happens does not touch any part of that sentence.",
  },
  {
    lead: "Allowed: surveying people first, to find out what went wrong.",
    body: "Screening feedback so you can fix things is a normal thing to do and nothing in the policy speaks against it. What the score is allowed to change is what reaches you. What it is not allowed to change is who gets the link.",
  },
  {
    lead: "Allowed: replying to every review, including the bad ones.",
    body: "This is the part of the page you control and the part prospects read first. It is also free, and it is the single highest-return thing an owner can do with fifteen minutes on a Sunday.",
  },
  {
    lead: "Not allowed: sending the link only to the happy ones.",
    body: "The policy lists, under what merchants may not do, discouraging or prohibiting negative reviews or selectively soliciting positive ones. Nearly every reputation product sold to small businesses does exactly this, and most of them describe it as catching problems early.",
  },
  {
    lead: "Not allowed: paying for it, in any currency.",
    body: "Incentives are named specifically and the list is broad: payment, discounts, free goods or services, offered for posting a review, for revising one, or for taking a negative one down. A closing gift that arrives with a request attached is inside that sentence.",
  },
  {
    lead: "Not allowed: telling them what to say, or standing over them.",
    body: "The policy says merchants should not pressure people to write a review while on the premises, and should not ask for specific content to be included. Asking a client to mention your name, or the town you would like to rank for, is a request for specific content. The policy's own example of that is a merchant asking staff to solicit reviews naming a particular member of staff.",
  },
];

/** SCENE copy — the staged exchange.
 *
 * STAGED AND SAID TO BE STAGED, in the `note`, which the primitive requires for exactly this
 * reason. The customer, the timings and the wording are invented. What is not invented is the
 * mechanic, which is the one content/services/review-automation.ts describes.
 *
 * A FOUR, NOT A ONE. A transcript in which the unhappy customer is furious lets the reader
 * conclude the private line is for disasters. The harder and truer case is the perfectly
 * satisfied client with one real complaint, because that is the customer a gating product
 * silently deletes and this one publishes. */
export const THE_ASK = {
  eyebrow: "The mechanic",
  heading: "A four, and what happens to it.",
  note: "A staged illustration, not a client's messages. The names, times and wording are invented; the sequence is the one the service page describes.",
  themLabel: "The client",
  usLabel: "The assistant",
  turnsHeading: "The exchange",
  eventsHeading: "What happened on your side",
  turns: [
    { who: "us" as const, at: "4:12 pm", text: "Hi Marcus, congratulations on closing today. One question while it is fresh: how did we do, one to five?" },
    { who: "them" as const, at: "4:31 pm", text: "4. Honestly you were great, the lender just took three weeks to send the clear to close and nobody told me it was normal." },
    { who: "us" as const, at: "4:31 pm", text: "That is fair and it is useful, thank you. I have sent the lender point straight to Levan and he will call you today. Here is the Google link as well, if you want to put that in your own words: [link]" },
    { who: "them" as const, at: "4:40 pm", text: "Will do. Probably say the same thing there." },
    { who: "us" as const, at: "4:40 pm", text: "Please do. A four that says what actually happened is worth more to the next person than a five that says nothing." },
  ],
  events: [
    { at: "4:12 pm", label: "The trigger", detail: "The file moved to closed. Nobody typed anything." },
    { at: "4:31 pm", label: "The link goes out", detail: "The same Google link every customer gets, sent regardless of the score." },
    { at: "4:31 pm", label: "The private line opens", detail: "Score, verbatim comment and contact pushed to the owner, as well as the link and not instead of it." },
    { at: "4:33 pm", label: "The call happens", detail: "Two minutes on the phone about the lender, on the day, while it can still be fixed for the next client." },
  ],
};

/** SCENE copy — the three ways this is wasted.
 *
 * Deliberately not any sibling's three. These are the ways the whole exercise fails while every
 * individual message sends perfectly, which is a different list from the limits section. */
export const FAILURE_MODES: GridItem[] = [
  {
    lead: "You turn it on and stop replying.",
    body: "A profile that suddenly grows reviews nobody has answered reads worse than a quiet one. The ask is the automatable half. The reply is not, it is fifteen minutes a week, and it is the half a stranger actually reads.",
  },
  {
    lead: "It gets pointed at the wrong moment.",
    body: "The moment a job is finished is not always the moment the customer feels finished. Ask the seller the day the sign goes up and you are asking somebody in the middle of the stressful part. The trigger is a decision about your business, not a setting.",
  },
  {
    lead: "You treat a bad review as a problem with the review.",
    body: "The instinct is to get it removed, and there is an industry that will take money to try. The people who come out of a bad review well are the ones who answered it in public, fixed the thing underneath it, and let the next twelve reviews do the rest.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Thirteen scenes, zero components, no film. */
export const REVIEW_FLAGSHIP: FlagshipContent = {
  /** A COUNT rather than a clock, a year, a share or a duration. The five heroes before this one
   * were 11:40pm, 9:42pm, 2023, 15% and 25 minutes; this is twelve reviews, which is the whole
   * of the profile in the title and the thing the opening moment is about. */
  hero: {
    moment: "12",
    suffix: "reviews",
    photo: "/images/hero/hudson-olana.jpg",
    signature: "porchlight",
  },
  scenes: {
    "in-short": {
      kind: "summary",
      band: "light",
      ariaLabel: "In short",
      eyebrow: "In short",
      claims: IN_SHORT,
    },
    thresholds: {
      kind: "statbars",
      band: "light",
      label: "What they need",
      ...THRESHOLDS,
    },
    "profile-scan": {
      kind: "grid",
      band: "dark",
      // NO RAIL LABEL, and the same for four-moves below. Both scenes sit immediately
      // under the heading they stage, and that heading is already a rail row pointing at the
      // same place. A rail with two rows a thumb apart that land on the same content is a
      // longer rail, not a better one.
      eyebrow: "What actually gets read",
      heading: "The fifteen second scan, in order.",
      columns: 2,
      glow: true,
      items: PROFILE_SCAN,
    },
    "yelp-lift": {
      kind: "statbars",
      band: "light",
      label: "The money",
      ...YELP_LIFT,
    },
    plate: {
      kind: "plate",
      band: "dark",
      src: "/images/listings/house-10.jpg",
      // THE FIRST ALT AND CAPTION HERE DESCRIBED A PHOTOGRAPH THAT IS NOT THIS ONE. They were
      // written from the file's catalogue title ("Houses . Logan Circle . 1500 block of Q
      // Street") as "a terrace of near-identical row houses ... every front is the same", and
      // the picture is two visibly different houses behind heavy planting. Only looking at the
      // image found it, which is the standing lesson about this class of defect: an alt text is
      // a factual claim about a picture, and on a page arguing that the details are checkable a
      // wrong one is not cosmetic.
      alt: "Two adjoining houses on a city block in late summer, one grey with a mansard roof and one red brick, both well kept, seen from the pavement through heavy planting",
      caption:
        "Two houses on the same block, both in good order, and nothing on either front tells you which one has a wet basement. That is the position a stranger is in with your business, and your reviews are the only part of the picture you did not write yourself. Which is exactly why a page of nothing but fives stops being information.",
      credit: "Photograph by Elvert Barnes, CC BY 2.0.",
      ariaLabel: "Two fronts, nothing to choose between them",
    },
    /** KEY IS "three-moves", NOT "four-moves", and the rename was found by reading the
     * rendered aria-labels rather than the source. components/blog/scenes/registry.tsx keeps a
     * GRID_LABELS map with a hardcoded entry for "four-moves", so a three-item grid on this key
     * announced itself to a screen reader as "The four moves". */
    "three-moves": {
      kind: "grid",
      band: "light",
      eyebrow: "The mechanic, in three parts",
      heading: "It asks, it asks everybody, and it tells you.",
      columns: 3,
      items: FOUR_MOVES,
    },
    "the-ask": {
      kind: "conversation",
      band: "dark",
      label: "The four",
      ...THE_ASK,
    },
    "gating-line": {
      kind: "grid",
      band: "light",
      label: "Both sides",
      eyebrow: "Read in the policy itself",
      heading: "Three things you may do, three you may not.",
      columns: 3,
      items: GATING_LINE,
    },
    "review-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How many of your reviews were written this quarter?",
      ariaLabel: "How many recent reviews your business would collect",
      inputs: [
        {
          kind: "range",
          id: "jobs",
          label: "Closings, sales or jobs you finish in a month",
          hint: "Whatever counts as finished for you: the thing after which it would be reasonable to ask somebody how it went.",
          min: 1,
          max: 40,
          step: 1,
          initial: 6,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "choice",
          id: "asked",
          label: "How consistently does the ask happen today?",
          hint: "Be honest rather than aspirational. Almost everybody sits in the middle option and believes they are in the third.",
          initial: 1,
          options: [
            { value: 0.15, label: "Rarely", sub: "Only when it comes up on its own", display: "15% of them" },
            { value: 0.4, label: "When I remember", sub: "Some weeks yes, most weeks no", display: "40% of them" },
            { value: 1, label: "Every one", sub: "Automatically, which is the point", display: "all of them" },
          ],
        },
        {
          kind: "range",
          id: "writes",
          label: "Of the people asked, the share who actually write one",
          hint: "This one is yours to set and it is deliberately not ours. Nobody publishes an honest conversion rate for review requests, so a number here would be invented, and it would be invented in our favour.",
          min: 5,
          max: 60,
          step: 5,
          initial: 20,
          format: "percent",
          width: "w-[4.5rem]",
        },
      ],
      chain: [
        { label: "Jobs finished", by: { from: "input", id: "jobs" }, format: "count", unit: "a month" },
        { label: "Over a quarter", by: { from: "rate", value: 3, display: "3 months" }, format: "count", unit: "jobs" },
        { label: "Actually asked", by: { from: "input", id: "asked" }, format: "count", unit: "asks" },
        { label: "Who write one", by: { from: "input", id: "writes" }, format: "count", unit: "reviews" },
        { label: "If the same year repeats", by: { from: "rate", value: 4, display: "4 quarters" }, format: "count", unit: "reviews a year" },
      ],
      /** The HEADLINE IS NOT THE LAST ROW and that is the argument. The bigger number is the
       * annual one, and the number that decides what a stranger sees is the quarterly one,
       * because 74% of the panel above look for reviews from the last three months. A
       * calculator that headlined the year would be making the case for volume on a page whose
       * evidence is about recency. */
      headline: 3,
      resultLabel: "Reviews dated in the last three months",
      note: "This counts reviews and stops there. It deliberately does not multiply anything by the five to nine percent revenue figure further up this page: that was measured on Seattle restaurants against quarterly sales tax records, its author found the effect only among independent businesses, and turning it into a commission forecast for a brokerage is arithmetic he never did and we are not going to do on his behalf. The share who actually write one is yours for the same reason. There is no published conversion rate for review requests in any vertical, and the one number we would most benefit from inventing is the one we will not.",
      action: { label: "See how it is built", href: "/services/review-automation" },
      secondary: { label: "Ask us to look at your profile", href: "/connect" },
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      text: "A profile with nothing but fives on it has told a stranger one thing, and it is not that you are good. It is that somebody is choosing who gets to speak.",
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The read, at least",
      text: "Send us the link to your Google profile and we will send back what a stranger sees in the first fifteen seconds: the date on your newest review, the worst one on the first screen, and which of them have never been answered.",
      reassure: "It takes us ten minutes, it is yours whether or not we ever build you anything, and there is nothing to install.",
      action: { label: "Ask for the read", href: "/connect" },
      ariaLabel: "Ask for a read of your review profile",
    },
    "failure-modes": {
      kind: "grid",
      /** DARK, and it is a rhythm decision measured rather than guessed. On the light band this
       * post ran 7,296px (28% of the article) in one unbroken light tone from the bad-review
       * section through the cost section to the end of the FAQ, against 24% on the worst shipped
       * post. Flipping this one band splits that run and takes the worst to 18%. */
      band: "dark",
      eyebrow: "Three ways it is wasted",
      heading: "None of them are the software.",
      columns: 3,
      items: FAILURE_MODES,
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Somebody stood in a kitchen last week with your name and one other on a phone screen, and picked the other one on the strength of a date. Neither of you will ever hear about it, and it will happen again this week.",
      actions: [
        { label: "See it on the AI page", href: "/ai#reviews", variant: "light" },
        { label: "How it is built", href: "/services/review-automation", variant: "outline-light" },
      ],
      footnote:
        "There is no price on this page because the cost is mostly not the software: it is the messaging that carries the ask, which is billed by the message, and the fifteen minutes a week that somebody has to spend replying. The AI audit is an hour, done with you, and it ends with the ask switched on for one real trigger rather than with a document.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "the-number-this-is-usually-sold-on-and-why-it-is-not-in-here": "The number",
    "what-a-stranger-actually-does-with-your-profile": "The scan",
    "what-one-extra-star-was-worth-in-the-only-study-that-measured-money": "The one study",
    "why-the-ask-does-not-happen": "Why nobody asks",
    "what-review-automation-actually-does": "What it does",
    "the-line-you-may-not-cross-and-exactly-where-it-is": "The line",
    "the-federal-half-which-is-about-your-own-website": "Your own site",
    "what-to-do-when-the-review-is-genuinely-bad": "The bad one",
    "how-to-test-one-before-you-buy-it": "How to test one",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
