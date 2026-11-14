/** The ten-question check at the end of "How to reduce no-shows: AI appointment booking and
 * reminders" (slug ai-appointment-booking-no-shows-real-estate).
 *
 * ROUND 29, 2026-11-14, the refresh that re-aimed the post at local business owners. The owner's
 * quiz rule (2026-10-31): about ten questions, four answers each, the result at the end. DATA only.
 * Held by booking-quiz.test.ts: ten questions, four distinct choices, every number in a `why` in
 * the post, every `why` names a heading the post has, no em dashes. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const BOOKING_QUIZ: QuizQuestion[] = [
  {
    q: "At the University of Virginia eye clinic, what share of the resident clinic's appointments made six months ahead were missed?",
    choices: ["9.1 percent", "21.7 percent", "38.3 percent", "6.9 percent"],
    answer: 2,
    why: 'The resident clinic missed 38.3% of appointments made six months ahead, against 9.1% for nought to two weeks; see "The gap between the ask and the day does not look like a loss".',
  },
  {
    q: "What carries over from the eye clinic study to a roofer or a salon?",
    choices: [
      "The exact percentages",
      "The direction: the further ahead it is booked, the more are missed",
      "The size of the clinic",
      "The time of day",
    ],
    answer: 1,
    why: 'The percentages are not a benchmark for anything you do; the direction is the finding; see "The gap between the ask and the day does not look like a loss".',
  },
  {
    q: "In the Hangzhou trial, what was attendance with one text reminder sent 72 hours ahead?",
    choices: ["80.5 percent", "88.3 percent", "91 percent", "87.5 percent"],
    answer: 3,
    why: 'Attendance was 80.5% with no reminder, 87.5% with a text and 88.3% with a call; see "The second half, which is the reminder".',
  },
  {
    q: "In the same trial, was the difference between the text and the call significant?",
    choices: [
      "Yes, the call was far better",
      "No, and the text cost less per person who turned up",
      "Yes, the text was far better",
      "The paper did not compare them",
    ],
    answer: 1,
    why: 'The difference was not significant, and the text cost 0.31 Yuan per attendance against 0.48 for the call; see "The second half, which is the reminder".',
  },
  {
    q: "What did the March 2026 review of 10 randomised trials find about reminders overall?",
    choices: [
      "Attendance 11 percent higher with reminders",
      "No effect on attendance",
      "Attendance 50 percent higher",
      "Lower attendance",
    ],
    answer: 0,
    why: 'Pooled attendance was 11 percent higher with reminders (risk ratio 1.11); see "The second half, which is the reminder".',
  },
  {
    q: "According to RFC 5545, what is a calendar object with no METHOD property?",
    choices: [
      "A scheduling request",
      "An alarm",
      "A snapshot of calendar information, not a scheduling transaction",
      "A reminder text",
    ],
    answer: 2,
    why: 'Without a METHOD a scheduling transaction must not be assumed; see "What a booking is, technically, and why many of them are not one".',
  },
  {
    q: "What does a free and busy query return?",
    choices: [
      "The titles and attendees of every event",
      "Just the busy blocks, with no event details",
      "The addresses of your jobs",
      "Your whole calendar",
    ],
    answer: 1,
    why: 'It returns free and busy information only, a wall of blocks; see "What reading your calendar should actually mean".',
  },
  {
    q: "A salon books 30 appointments a week and 3 are no-shows. How many empty slots is that a year?",
    choices: ["36", "90", "156", "1,560"],
    answer: 2,
    why: '3 x 52 = 156 empty slots a year in the invented example; see "Is it worth automating".',
  },
  {
    q: "A job scores 1 or 2 for impact. What is the verdict?",
    choices: [
      "Automate it at once",
      "Buy a second tool",
      "Hire someone to do it",
      "Leave it alone and send a text by hand the evening before",
    ],
    answer: 3,
    why: 'At 1 or 2, leave it alone; a text sent by hand the day before is enough; see "Is it worth automating".',
  },
  {
    q: "What happens in week 1 of the roadmap?",
    choices: [
      "Count the last twenty appointments you agreed",
      "Install a booking tool",
      "Switch on automatic reminders",
      "Offer the two soonest slots",
    ],
    answer: 0,
    why: 'Week 1 counts the last twenty appointments: the days between the conversation and the slot, and whether it happened; see "What to do first".',
  },
];
