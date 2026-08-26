/** Scene copy for the AI clone flagship post (topic 18).
 *
 * WHY THIS FILE: scene components are presentation, so the words they carry stay in the content
 * layer. Eighteenth topic on the flagship template and the SEVENTEENTH IN A ROW that adds no
 * component of its own: every scene below resolves to a primitive that already existed.
 *
 * NO FILM SCENE, same as topics 6 to 17. Videos are owner-held, so there is no `reel` key and
 * score-flagship reports C3 red for this slug on purpose. Never faked, never re-baselined.
 *
 * THE CONSTRAINT THAT SHAPED THE WHOLE ARTICLE, stated here because it will look like an
 * omission otherwise. Films, the HeyGen pipeline and the avatar itself are the owner's and were
 * not touched by this round. So this is an article about a digital twin written without building,
 * rendering or judging one, and rather than apologise for that, the piece is organised around
 * what the constraint makes it good at: **what a synthetic likeness may and may not do.** Nothing
 * anywhere on this post describes how our avatar is produced, how convincing it is, or what tool
 * makes it. Those are owner questions and they are listed in ROUND-H-LOG.md.
 *
 * SOURCE OF TRUTH for what the product does is content/services/ai-clone.ts, rewritten in the
 * same round.
 *
 * THE DELIBERATE DISTANCE FROM ITS SIBLINGS. `ai-voice-agents` owns the phone call and a synthetic
 * voice answering as the business. This one owns the LIKENESS: whose face and voice may be
 * reproduced, on whose written consent, and how a viewer is told. Nothing on this website has
 * previously mentioned a likeness, a right of publicity, an impersonation, a deep fake, a digital
 * replica, a content credential or C2PA. Checked by grep across every post body, every scene file
 * and every service page before this file was written.
 *
 * House rules apply: no em dashes, no arrow glyphs, no claims not already made on the site. */

import type { FlagshipContent, GridItem } from "@/lib/blog/flagship";

/** SCENE copy — "In short".
 *
 * Three lines, each checkable by somebody else in the primary document. The distinction the whole
 * topic turns on, the criminal statute nobody expects, and the measurement that decides how the
 * disclosure question has to be answered. */
export const IN_SHORT: string[] = [
  "There are two completely different products under the same word. One reproduces your own face and voice, with your own written permission, on your own content. The other reproduces somebody else, and in New York that second one is not a grey area: using a living person's name, portrait, picture, likeness or voice for advertising or trade without their written consent first is a misdemeanour under a statute that has been on the books since 1903.",
  "Federal law is narrower than most people assume. The Federal Trade Commission's impersonation rule, in force since March 2024, prohibits falsely posing as a government body or as a business or an officer of one. It does not cover individuals. The Commission has proposed adding them, and has proposed making it a violation to supply goods or services knowing they will be used to impersonate, which would reach the people who build these things as well as the people who use them. As of this writing that proposal is still a proposal.",
  "Whether the viewer can tell is not a matter of opinion. In a study of 315 people classifying real and synthetic faces one at a time, average accuracy was 48.2 percent against a chance level of 50. A second group of 219 people, given training and told after every single answer whether they were right, reached 59.0 percent and got no better with practice.",
];

/** SCENE copy — the distinction the article is built on.
 *
 * Four cards on a two column grid. This scene REPLACES the enumeration that would otherwise have
 * been four paragraphs of prose, and the body above it makes the argument rather than the list. */
export const TWO_HALVES: GridItem[] = [
  {
    lead: "Your own face, on your own content",
    body: "You sat in front of a camera, you agreed in writing what may be made from the recording, and what goes out is signed with your name on a page you control. This is the ordinary case and it is the only one this business builds. The interesting questions about it are not legal ones, they are about quality and about who checks what goes out.",
  },
  {
    lead: "A colleague's face, on the brokerage's content",
    body: "Also ordinary, and it needs one more thing than people expect: their written permission, separately from their employment, and an answer to what happens to the model when they leave. An agent who moves to another firm has not stopped owning their own likeness, and a library of videos of a person who no longer works for you is a problem you built yourself.",
  },
  {
    lead: "Somebody who never agreed",
    body: "A client, a seller, a person on the other side of a transaction, a public figure whose endorsement would be useful. There is no version of this that is a product. It is the thing several statutes exist to stop, and one of them attaches a criminal penalty to it in this state.",
  },
  {
    lead: "Somebody who has died",
    body: "The one people assume is free, and in New York it is the most precisely regulated of the four. A separate statute passed in 2020 defines a digital replica, gives the right to whoever inherited it, and lets an action be brought for up to forty years after the death. There is a public register of who holds those rights.",
  },
];

/** SCENE copy — can a person tell? Cited data graphic ONE.
 *
 * Sophie J. Nightingale and Hany Farid, "AI-synthesized faces are indistinguishable from real
 * faces and more trustworthy", PNAS 119(8), 2022, read in the full text on PubMed Central.
 *
 * Experiment 1, quoted: "In this study, 315 participants classified, one at a time, 128 of the 800
 * faces as real or synthesized... The average accuracy is 48.2% (95% CI [47.1%, 49.2%]), close to
 * chance performance of 50%, with no response bias."
 *
 * Experiment 2, quoted: "In this study, 219 new participants, with training and trial-by-trial
 * feedback, classified 128 faces taken from the same 800 set of faces as in experiment 1... The
 * average accuracy improved slightly to 59.0% (95% CI [57.7%, 60.4%])... Despite providing
 * trial-by-trial feedback, there was no improvement in accuracy over time, with an average accuracy
 * of 59.3% for the first set of 64 faces and 58.8% for the second set of 64 faces."
 *
 * AXIS MAXIMUM 100 because these are shares of a whole. Scaling 59 to full width would draw it as
 * everything, and the entire point of the chart is where these two sit against the 50 that a coin
 * would produce. The 50 is not drawn as a third bar for the reason round G removed a $25,000 bar:
 * a chance line is not a measurement anybody made, and drawing it beside two that were measured
 * would put a reference on the same axis as a finding. It is in the basis line and in the note.
 *
 * WHY THE FIRST BAR IS LIT: the untrained number is the one that describes a person scrolling.
 *
 * THE CAVEAT THAT TRAVELS WITH IT, and it is a real limit rather than a formality: these were
 * STILL IMAGES of people who do not exist, not video of a specific person somebody knows. The
 * study measures whether a face can be told apart from a real one, which is the question this
 * article needs, and it does not measure whether your own clients would recognise a video of you
 * as synthetic. Nobody has published that, and the note says so. */
export const TELL_APART = {
  eyebrow: "The evidence",
  caption: "How often people correctly sorted synthetic faces from real ones",
  bars: [
    { label: "315 people, no training", value: 48.2, display: "48.2%" },
    { label: "219 people, trained and told the answer every time", value: 59.0, display: "59.0%" },
  ],
  max: 100,
  lit: 0,
  basis:
    "Percentage of faces correctly classified as real or synthesized, from two experiments on the same set of 800 faces, half of them generated and half of them real photographs matched to them for age, gender and appearance. Chance performance is 50 percent and is not drawn, because a coin is not a measurement. The first group saw the faces cold. The second group was trained first and told after every single answer whether they had been right, and the paper records that they got no better across the session.",
  sourceText:
    "Nightingale and Farid, AI-synthesized faces are indistinguishable from real faces and more trustworthy, Proceedings of the National Academy of Sciences, 2022.",
  sourceHref: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8872790/",
  note: "Read the second bar rather than the first, because it is the one that closes the argument. Practice did not help. The paper is explicit that accuracy in the first half of the trained session and in the second half were within half a point of each other, and it puts that down to some synthetic faces simply having no detectable artefact in them to find. Two honest limits on what this can be used for. These were still photographs of people who do not exist, not video of somebody the viewer knows personally, and a face you have met every week for three years is a different task from a stranger's. And the same paper found the synthetic faces were rated slightly MORE trustworthy than the real ones, 4.82 against 4.48 on a seven point scale, which is a small effect and an uncomfortable one. What none of this measures is whether your own clients would spot a video of you, and nobody has published that.",
};

/** SCENE copy — can a machine tell? Cited data graphic TWO.
 *
 * Dolhansky, Bitton, Pflaum, Lu, Howes, Wang and Canton Ferrer, "The DeepFake Detection Challenge
 * (DFDC) Dataset", arXiv:2006.07397v4, Facebook AI. Read in the arXiv PDF with pdftotext.
 *
 * The dataset, quoted: "over 100,000 total clips sourced from 3,426 paid actors"; and the sentence
 * worth carrying because so few datasets can say it, "all recorded subjects agreed to participate
 * in and have their likenesses modified during the construction of the face-swapped dataset."
 *
 * The competition: "During the course of the competition, 2,114 teams participated." And on the
 * private test set, "60% of submissions had a log loss lower than or equal to 0.69, which is
 * roughly the score if one were to predict a probability of 0.5 for every video."
 *
 * THE THREE BARS ARE ONE ROW OF THE PAPER'S OWN TABLE 2: the winning entry's precision on REAL
 * videos, reported at recall 0.1, 0.3 and 0.9. Nothing here is arithmetic of mine. The paper's own
 * framing of why precision is the right metric is quoted in the prose: "In realistic distributions,
 * the ratio of Deepfaked videos to real videos may be less than one in a million."
 *
 * AXIS MAXIMUM 100 because these are shares.
 *
 * WHY THE THIRD BAR IS LIT: it is the setting a business would actually want, and it is the one
 * that falls over. */
export const DETECTOR = {
  eyebrow: "The evidence",
  caption: "The winning detector's precision on real-world fakes, at three settings",
  bars: [
    { label: "Set to catch 1 in 10 of them", value: 98.03, display: "98.0%" },
    { label: "Set to catch 3 in 10", value: 76.1, display: "76.1%" },
    { label: "Set to catch 9 in 10", value: 53.89, display: "53.9%" },
  ],
  max: 100,
  lit: 2,
  basis:
    "Precision, meaning the share of the videos it flagged that really were fakes, for the first placed entry in the DeepFake Detection Challenge, measured on real videos gathered outside the competition's own dataset rather than on the ones it was trained against. The three bars are the same model at three sensitivities, reported by the organisers at recall levels of one tenth, three tenths and nine tenths. Turning it up to catch more fakes is what makes it flag more things that were not fakes.",
  sourceText: "Dolhansky and others, The DeepFake Detection Challenge (DFDC) Dataset, Facebook AI, 2020.",
  sourceHref: "https://arxiv.org/abs/2006.07397",
  note: "The shape is the finding, not the decimals. A detector you can tune has a dial on it, and turning the dial toward catching more fakes is the same movement as turning it toward accusing more honest videos. At the setting where it caught nine in ten, about half of what it pointed at was innocent. Two things this cannot be stretched to say. It is a 2020 competition against 2020 fakes, and both sides of that race have moved since, in directions this article has no measurement of. And the organisers report that 2,114 teams entered and that most submissions on the hidden test set scored around what guessing would have scored, which says more about the difficulty than any single number here does. The reason it is on this page at all is that it removes an excuse: you cannot leave the disclosing to a detector.",
};

/** SCENE copy — what a content credential is, and what it does not say.
 *
 * Three cards. The middle one is the important one and it is quoted from the C2PA specification's
 * own guiding principles rather than paraphrased, because every summary of provenance marking
 * turns it into a truth badge, which is exactly what the specification says it is not. */
export const CREDENTIALS: GridItem[] = [
  {
    lead: "It records what was done, cryptographically",
    body: "A Content Credential is a set of signed statements travelling with the file: what created it, what was done to it afterwards, and whether any of that has been altered since it was signed. There is a specific value for a file that came out of a generative model, and it is a machine-readable string rather than a phrase somebody chose, which is the part that makes it checkable at all.",
  },
  {
    lead: "It does not tell anybody the video is honest",
    body: "The specification refuses that job in its own guiding principles, and the wording is worth reading twice. It says the specifications should not provide value judgments about whether a given set of provenance data is good or bad, merely whether the assertions included within can be validated as associated with the underlying asset, correctly formed, and free from tampering. Signed and true are different words.",
  },
  {
    lead: "And it can simply be absent",
    body: "The trust decision rests on the identity of whoever signed the claim, so a file with no credential at all is not evidence of anything, and a great deal of ordinary honest video has none. Anybody stripping provenance on purpose is not going to be stopped by a standard. Which is why the useful version of this is not detection, it is you saying so in the first frame.",
  },
];

/** SCENE copy — the path a lawful twin actually takes.
 *
 * THE FIRST CAPTION HAS TO BE THE SHORTEST. Captions are centred under their node and the first
 * node sits at the very start of the scroll container, so anything wider than the node spacing is
 * clipped by the container edge at 390px. 33 characters lost a letter on the reactivation post;
 * "One person, in writing" is 22. */
export const CONSENT_PATH: { label: string; connects: string; at?: string }[] = [
  { label: "The consent", connects: "One person, in writing" },
  { label: "The recording", connects: "Held, and revocable" },
  { label: "The model", connects: "Yours, not licensed on" },
  { label: "The script", connects: "Only what you stand behind" },
  { label: "The review", connects: "Somebody watches it" },
  { label: "The label", connects: "Said, not buried" },
];

/** SCENE copy — three ways a working twin costs you something.
 *
 * Deliberately not the limits section restated: limits are what the product cannot do, and these
 * are what a twin that works perfectly still does to a business that stops paying attention. Also
 * deliberately not the voice post's three, which are about a caller on a telephone. */
export const WASTED: GridItem[] = [
  {
    lead: "Nobody watches them any more",
    body: "The first fortnight, every video gets checked. By the second month it is a pipeline, and a pipeline is exactly the thing whose output stops being read. The failure is not that the twin says something outrageous. It is that it says something slightly wrong about a property, in your face, to a person who now believes you said it.",
  },
  {
    lead: "It answers a question it should have refused",
    body: "A script generated from a listing will happily state a school district, a tax figure, a boundary or a permit status, and every one of those is a thing an agent gets asked and answers carefully. A twin has no sense of which sentences are the expensive ones, so the sentences it should decline to say have to be decided in advance by a person.",
  },
  {
    lead: "The library outlives the arrangement",
    body: "A colleague's model, a client's testimonial, a video made for a listing that has since sold twice. Somebody has to own the question of what gets deleted and when, and if nobody does, the answer is nothing, forever, including the material of people who have long since left.",
  },
];

/** ─────────────────────────────────────────────────────────────────────────────────────────
 * THE TOPIC'S FLAGSHIP CONTENT.
 *
 * Fifteen scenes, zero components, no film. */
export const CLONE_FLAGSHIP: FlagshipContent = {
  /** The cohort's held moments have been 11:40pm, 9:42pm, 2023, 15%, 25 minutes, 12 reviews, 9
   * days, 3 results, 1 word, 2 records, 10 mornings, $2,500, 0.3 percent, 3 business days, 20
   * sources, 1 of three and 0 invoices. This one is a COUNT OF THINGS PUBLISHED IN YOUR NAME
   * that nobody watched: fourteen videos went out in one afternoon and the person whose face is
   * in all of them has seen none of them. */
  hero: {
    moment: "14",
    suffix: "videos",
    /** NOT either plate. The plates are letterpress type and a gramophone; this is a room set up
     * for an audience with nobody in it, which is texture behind type rather than a subject. */
    photo: "/images/editorial/empty-theatre.jpg",
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
    "two-halves": {
      kind: "grid",
      band: "dark",
      eyebrow: "Four likenesses",
      heading: "Only one of these is a product.",
      columns: 2,
      glow: true,
      items: TWO_HALVES,
      label: "Whose likeness",
    },
    "pull-quote": {
      kind: "statement",
      band: "dark",
      field: "river",
      tone: "quote",
      /** Verbatim from New York Civil Rights Law section 50. Quoted rather than paraphrased
       * because two things get softened in every summary of it: the consent has to be WRITTEN and
       * has to be obtained FIRST, and the section is a criminal one. */
      text: "A person, firm or corporation that uses for advertising purposes, or for the purposes of trade, the name, portrait, picture, likeness, or voice of any living person without having first obtained the written consent of such person, or if a minor of such minor's parent or guardian, is guilty of a misdemeanor.",
    },
    plate: {
      kind: "plate",
      band: "light",
      src: "/images/editorial/type-case.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS and which contains the 21:9
      // crop a laptop ships. Measured in round F: the Plate primitive renders 2.33 at 1440 and
      // 1.78 at 390, so the phone sees a taller slice. The taller crop adds the paper labels along
      // the top edge and the pink cloth at the bottom right corner. Only legible letters are named.
      alt: "Wooden letterpress type lying face up in rows, seen at a low angle, the large sans serif letters reading t, t, q, q, a, a, p and a question mark across the middle of the frame with the figures 2, 1, 2 and 2 at the right hand edge, several printed paper labels tucked among the blocks along the top, and a fold of pink cloth at the bottom right corner",
      caption:
        "Every one of these blocks is a copy. Somebody cut a master letter once, and everything printed afterwards came from a duplicate of it, which is why the same q could be set in a thousand shops at once and still be that q. What the case does not settle is who is allowed to pick a block up. That has never been a property of the type.",
      credit: "Photograph by Kyle Van Horn, CC BY 2.0.",
      ariaLabel: "Wooden letterpress type lying face up",
    },
    "tell-apart": {
      kind: "statbars",
      band: "dark",
      label: "Can a person tell",
      ...TELL_APART,
    },
    detector: {
      kind: "statbars",
      band: "light",
      label: "Can a machine tell",
      ...DETECTOR,
    },
    credentials: {
      kind: "grid",
      band: "dark",
      eyebrow: "Provenance marking",
      heading: "A signature on a file is not a statement that the file is true.",
      columns: 3,
      items: CREDENTIALS,
    },
    promise: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "quote",
      glow: true,
      /** OUR OWN POLICY, which is the one kind of statement this page can make without a primary
       * source: it is a commitment rather than a claim about the world. It matches what the /ai
       * page already says about voice ("We do not build agents that pretend to be a specific human
       * being") and extends it to a likeness. Nothing here describes how our avatar is produced. */
      text: "We build a likeness of the person who sat in front of the camera and said in writing that we could. We do not build a likeness of anybody else, living or dead, for any reason, at any price, and we would rather lose the work than argue about it.",
    },
    "consent-path": {
      kind: "diagram",
      band: "dark",
      label: "The path",
      eyebrow: "The system",
      heading: "Six steps, and only two of them are technical.",
      lede: "This is the whole of a lawful twin, drawn as the order it has to happen in. Every product in the category is sold on the third box. The first two are what makes the third one yours rather than borrowed, and the last two are the entire difference between a tool and a problem. Note that the two nobody budgets for are at the end.",
      steps: CONSENT_PATH,
      altPrefix:
        "The path from one person's written consent, through a recording and a model that stays yours, to a script bounded by what you stand behind, a person reviewing what goes out, and a plainly spoken label",
    },
    "videos-calculator": {
      kind: "calculator",
      band: "light",
      label: "Your numbers",
      eyebrow: "In your numbers",
      heading: "How long would it take to watch everything that goes out in your face?",
      ariaLabel: "How many hours a year it takes to review synthetic video before it is sent",
      inputs: [
        {
          kind: "range",
          id: "events",
          label: "Things a year you would make a video about",
          hint: "New listings, price changes, open houses, market notes, anything you would currently record yourself for if you had the time.",
          min: 6,
          max: 120,
          step: 2,
          initial: 40,
          format: "count",
          width: "w-[4.5rem]",
        },
        {
          kind: "range",
          id: "each",
          label: "Videos produced for each one",
          hint: "One general version, or one addressed to every buyer who asked. This is the number the whole category is sold on.",
          min: 1,
          max: 20,
          step: 1,
          initial: 6,
          format: "count",
          width: "w-[4rem]",
        },
        {
          kind: "range",
          id: "minutes",
          label: "Minutes to watch one properly before it goes",
          hint: "Watching it, not skimming the script. The point of checking is to catch the sentence that reads fine and is wrong.",
          min: 1,
          max: 10,
          step: 1,
          initial: 2,
          format: "count",
          width: "w-[4rem]",
        },
      ],
      chain: [
        { label: "Things you would make a video about", by: { from: "input", id: "events" }, format: "count", unit: "a year" },
        { label: "Videos going out in your face", by: { from: "input", id: "each" }, format: "count", unit: "videos" },
        {
          label: "At your review time",
          by: { from: "input", id: "minutes" },
          format: "count",
          /** SHORT ON PURPOSE. A chain unit renders inside a shrink-0 cell and cannot wrap; round
           * E shipped 66px and 32px of horizontal overflow from exactly this. The explanation
           * belongs in the row label on the left, which does wrap. */
          unit: "minutes",
        },
        {
          label: "In hours",
          by: { from: "rate", value: 1 / 60, display: "60 minutes in an hour" },
          format: "hours",
          unit: "hours a year",
        },
      ],
      headline: 3,
      resultLabel: "Hours a year to watch everything that goes out in your face",
      note: "This is the only number in the whole topic that is definitely yours, and it is deliberately small at the settings it opens with. That is the argument rather than a weakness in it. A few hours a year is not a reason to say no to anything, which means there is no honest excuse for the second row going out unwatched, and the second row is the one that matters: those are statements published in your name to people who will remember them as yours. Watch the second row rather than the headline as you move the sliders. Four things this refuses to put a number on. There is no response rate, no reply rate and no conversion figure for personalised video anywhere on this page, because every figure of that kind that could be found is published by a company selling the software and none of them states a sample. There is no comparison against how long it takes to record one yourself, because nobody has timed that either. There is no dollar value, because the value depends entirely on what the video is for. And there is no estimate of how many viewers would notice, because the research on this page measures a different task.",
      action: { label: "See how it is built", href: "/services/ai-clone" },
      secondary: { label: "Talk it through with us", href: "/connect" },
    },
    offer: {
      kind: "offer",
      band: "light",
      eyebrow: "The honest read",
      text: "Tell us the three things you would put in front of a camera every week if the recording took no time at all. We will tell you which of them actually needs your face, which would be better as two lines of writing, and which one is the sort of thing you should never let a script write on your behalf.",
      reassure:
        "It is a short reply from a person, it costs nothing, we do not need a recording session to answer it, and the answer is often that one of the three is not worth building.",
      action: { label: "Send us the three", href: "/connect" },
      ariaLabel: "Send us the three things you would put on camera",
    },
    "plate-two": {
      kind: "plate",
      band: "dark",
      src: "/images/editorial/victrola.jpg",
      // WRITTEN FROM THE 16:9 CROP, WHICH IS THE ONE A PHONE SHIPS. The taller crop adds the
      // lower half of the wooden cabinet with its metal band and a keyhole, neither of which is
      // in the 21:9 slice. Nothing in this photograph carries legible lettering.
      alt: "An antique wind-up gramophone standing against a plain yellow wall, its wide metal horn opening toward the left of the frame and mottled with age, the horn's neck curving down to a small brass tone arm over a turntable on a square wooden box, all of it sitting on a darker cabinet whose lower half carries a metal band and a keyhole",
      caption:
        "This was the first machine that let a voice arrive somewhere its owner had never been. Nobody thought the singer was in the room, and nobody was fooled, because the horn is enormous and the whole object announces itself. That is the part worth keeping rather than the technology. A reproduction that is obviously a reproduction has never needed anybody's permission to be honest about what it is.",
      credit: "Photograph by Vince Alongi, CC BY 2.0.",
      ariaLabel: "An antique wind-up gramophone against a yellow wall",
    },
    wasted: {
      kind: "grid",
      /** DARK for the same measured reason as topics 6 to 17: on light, the cost section, the
       * limits section and the how-to run as one long pale band. Flipping this one breaks it. */
      band: "dark",
      eyebrow: "Three ways a working twin costs you something",
      heading: "None of them are the technology failing.",
      columns: 3,
      items: WASTED,
    },
    funnel: {
      kind: "statement",
      band: "dark",
      field: "ink",
      tone: "close",
      glow: true,
      ariaLabel: "What to do next",
      text: "Before you record anything, write two lists. On the first, every sentence you are happy for a machine to say in your voice without you hearing it first. On the second, every sentence you would want to be in the room for. Most people find the second list is shorter than they expected and contains the only sentences that were ever worth saying on camera.",
      actions: [
        { label: "See it on the AI page", href: "/ai#clone", variant: "light" },
        { label: "How it is built", href: "/services/ai-clone", variant: "outline-light" },
      ],
      footnote:
        "There is no price on this page and the reason is unusually specific to this topic: the recording session and the model are the small, predictable part, and the work that decides whether the thing is any good is the script boundary and the review step, which are yours to set and take a conversation rather than a quote. The AI audit is an hour, done with you, and for this topic it starts with the two lists above rather than with a camera.",
    },
  },

  /** Short rail labels for the prose headings. Ids and ORDER are derived from the document, so a
   * renamed heading degrades to its full text rather than leaving a dead row. */
  headingLabels: {
    "what-a-digital-twin-actually-is-and-the-line-everything-rests-on": "What it is",
    "the-oldest-statute-of-its-kind-in-the-country-and-it-is-a-criminal-one": "Written consent",
    "what-happens-to-a-likeness-after-the-person-has-died": "After a death",
    "the-federal-rule-that-covers-businesses-and-does-not-yet-cover-people": "The federal rule",
    "nobody-can-reliably-tell-and-that-is-measured-rather-than-assumed": "Can anyone tell",
    "so-the-telling-has-to-come-from-you": "Saying so",
    "what-we-will-and-will-not-build": "What we build",
    "what-a-twin-honestly-does-for-a-brokerage": "What it does",
    "the-cost-nobody-quotes-which-is-watching-them": "The real cost",
    "what-nobody-has-measured-and-what-this-page-will-not-print-because-of-it": "What it refuses",
    "how-to-test-one-before-you-commission-it": "Test one yourself",
    "what-it-costs-and-how-long-it-takes": "Cost and time",
    "what-it-does-not-do-and-should-not-pretend-to": "What it will not do",
    "common-questions-answered-honestly": "Common questions",
    "what-to-do-about-it": "What to do",
  },
};
