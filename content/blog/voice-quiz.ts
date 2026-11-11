/** The ten-question check at the end of "AI voice agent for small business" (slug
 * ai-voice-agent-missed-calls-real-estate; round 28 re-aimed the post at local owners, the
 * questions already were).
 *
 * ROUND 24, 2026-11-03, the refresh of the voice post. The owner's quiz rule (2026-10-31): about
 * ten questions, four answers each, the result at the end. DATA only.
 *
 * THE RULES THIS FILE IS HELD TO (voice-quiz.test.ts): ten questions, four distinct choices, every
 * number in a `why` appears in the post, every `why` names a heading the post has, no em dashes.
 * The second reader's corrections of 2026-11-02 are in the questions: a missed call may not reveal
 * the caller's purpose (not "it leaves no record"); New York's one-party rule is taught as the
 * definition's reading with the stricter state named, never as unconditional permission; only a
 * settled, approved decision becomes a default. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const VOICE_QUIZ: QuizQuestion[] = [
  {
    q: "In the 2011 study, what counted as a qualified lead?",
    choices: [
      "An opened email",
      "A completed web form",
      "Having a meaningful conversation with the decision maker",
      "A booked appointment",
    ],
    answer: 2,
    why: 'The study defined a qualified lead as a meaningful conversation with a key decision maker; see "What a missed call actually costs".',
  },
  {
    q: "What does a missed call with no message usually leave you?",
    choices: [
      "The caller's name and question",
      "A number and a time, but not why they called",
      "Nothing at all, not even the number",
      "A recording of what they wanted",
    ],
    answer: 1,
    why: 'The call log keeps the number and the time, not the purpose; see "Why nobody leaves the voicemail".',
  },
  {
    q: "What should the agent do when asked something it cannot verify?",
    choices: [
      "Give its best guess",
      "Change the subject",
      "Say it does not know and book a call with you",
      "Hang up politely",
    ],
    answer: 2,
    why: 'It says it does not know and puts a call on your calendar; see "What it does not do, and should not pretend to".',
  },
  {
    q: "In the 2009 study of ten languages, about how long was the average gap before an answer?",
    choices: ["About two tenths of a second", "About two seconds", "About five seconds", "About half a minute"],
    answer: 0,
    why: 'About two tenths of a second, measured face to face, not on the phone; see "The one thing that decides whether it works".',
  },
  {
    q: "What did the FCC's ruling of February 2024 confirm?",
    choices: [
      "AI calls need no consent",
      "Only text messages are covered",
      "Recording calls is banned",
      "AI-generated voices count as artificial voices under the TCPA, so prior express consent is needed",
    ],
    answer: 3,
    why: 'The ruling brought AI voices under the TCPA\'s artificial-voice rules; see "The legal part nobody sells you".',
  },
  {
    q: "Under New York's definition of wiretapping, whose consent can be enough to record a call?",
    choices: [
      "Nobody's: recording is always banned",
      "One party to the call, though a caller in a stricter state such as California brings in that state's rule",
      "Only a court's",
      "Every party's, in every state",
    ],
    answer: 1,
    why: 'The New York definition turns on the consent of the sender or the receiver, and California requires all parties; see "The legal part nobody sells you".',
  },
  {
    q: "Which decisions become defaults the agent reads on every call?",
    choices: [
      "Only settled, approved ones, such as the opening sentence or the times it may offer",
      "Every decision the owner makes",
      "Whatever the agent decides on its own",
      "None: the agent improvises",
    ],
    answer: 0,
    why: 'An unsettled judgement, a sensitive decision or an exception stays with a person; see "Is it worth automating".',
  },
  {
    q: "Answering a caller reaches a customer. What does that set in our scoring?",
    choices: [
      "Nothing: risk stays at 1",
      "The agent may call anyone it likes",
      "A risk of at least 3, so a person stays on it",
      "An automatic impact of 5",
    ],
    answer: 2,
    why: 'One yes on the four checks means the risk is at least 3; see "Is it worth automating".',
  },
  {
    q: "Before an agent dials a new form inquiry, what has to be checked?",
    choices: [
      "Nothing: a form is permission",
      "Only that the phone number is valid",
      "That the owner is awake",
      "The consent for that kind of call and the calling hours where the person lives",
    ],
    answer: 3,
    why: 'If either check fails, a person calls instead; see "The same agent, pointed the other way".',
  },
  {
    q: "What is the first thing to do this week?",
    choices: [
      "Buy an agent",
      "Call your own line from a phone the office has never saved",
      "Call a list of past leads",
      "Rewrite the website",
    ],
    answer: 1,
    why: 'Hear what a stranger hears before anything else; see "What to do first".',
  },
];
