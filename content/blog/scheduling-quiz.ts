/** The ten-question check at the end of "AI scheduling assistant for appointments other people must
 * confirm" (slug ai-scheduling-real-estate-showing-confirmations).
 *
 * ROUND 28, 2026-11-11, the refresh that re-aimed the post at local business owners. The owner's
 * quiz rule (2026-10-31): about ten questions, four answers each, the result at the end. DATA only.
 * Held by scheduling-quiz.test.ts: ten questions, four distinct choices, every number in a `why` in
 * the post, every `why` names a heading the post has, no em dashes. The questions are the SEO
 * agent's draft of 2026-11-08, with the headings it named. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const SCHEDULING_QUIZ: QuizQuestion[] = [
  {
    q: "What moves an invitation's participation status out of NEEDS-ACTION?",
    choices: ["A reply from that attendee", "The appointment time arriving", "A day passing with no objection", "The organizer marking it in bold"],
    answer: 0,
    why: 'Only a reply from that person moves it; see "The standard already has a word for an appointment nobody agreed to".',
  },
  {
    q: "What happens to attendees' answers when an appointment's start time changes?",
    choices: ["They carry over unchanged", "They reset to needs action", "Only the organizer's answer resets", "They turn tentative"],
    answer: 1,
    why: 'A new start, end or duration resets every attendee; see "Moving the time throws away every yes you had".',
  },
  {
    q: "In the 2016 study, where did the three commonest escalation reasons sit?",
    choices: ["In the calendar software", "With the other people in the conversation", "In the subscriber's own calendar", "In message delivery"],
    answer: 1,
    why: 'An unexpected reply, no time suiting everyone, and no reply at all; see "The part nobody automates is the part that is other people".',
  },
  {
    q: "What does the study's 39 percent measure?",
    choices: [
      "Requests no person touched",
      "Requests that never needed the skilled scheduler",
      "Meetings with three or more attendees",
      "Invitees who never replied",
    ],
    answer: 1,
    why: 'It covers both tiers, software and a person on one small task; see "The part nobody automates is the part that is other people".',
  },
  {
    q: "What does a \"delivered\" status tell you?",
    choices: ["The person is coming", "The person read the message", "The person accepted", "The server got the message"],
    answer: 3,
    why: 'Delivered is a fact about a server, accepted a fact about a person; see "Your own system knows whether the message arrived".',
  },
  {
    q: "What is a counter?",
    choices: ["A rejection", "An acceptance", "A request to change the appointment, such as a new time", "A failed delivery"],
    answer: 2,
    why: 'A counter is neither a yes nor a no; see "The standard already has a word for an appointment nobody agreed to".',
  },
  {
    q: "Why is offering a slot you cannot hold worse than offering nothing?",
    choices: [
      "It sends more messages",
      "The customer learns your \"confirmed\" may not hold",
      "It breaks the calendar standard",
      "It slows the system down",
    ],
    answer: 1,
    why: 'A withdrawn slot costs something a message cannot buy back; see "Why offering a slot you cannot hold is worse than offering nothing".',
  },
  {
    q: "In the worth-automating test, what does an impact of 1 or 2 mean?",
    choices: ["Leave it alone", "Automate it first", "Buy a new tool", "Score it again next month"],
    answer: 0,
    why: 'A rare job costs less to do by hand than to set up, watch and repair; see "Is it worth automating".',
  },
  {
    q: "Which of these is a decision, not a click?",
    choices: ["Sending the request", "Sending the chase", "How long to hold your calendar waiting for an answer", "Releasing a dead slot"],
    answer: 2,
    why: 'Sending, chasing, blocking and releasing are clicks; the hold is a decision; see "What it costs, and how long it takes".',
  },
  {
    q: "What is the first step of the roadmap?",
    choices: [
      "Buy a scheduling tool",
      "Automate every appointment type",
      "Pick the appointment type with the biggest gap and write its defaults",
      "Ask other businesses for access to their calendars",
    ],
    answer: 2,
    why: 'One appointment type, never the whole calendar; see "What to do first".',
  },
];
