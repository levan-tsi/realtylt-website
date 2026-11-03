/** The ten-question check at the end of "Workflow automation for small business"
 * (slug workflow-automation-real-estate-business).
 *
 * ROUND 24, 2026-11-03, the refresh of the workflow post. The owner's quiz rule (2026-10-31):
 * about ten questions, four answers each, the result at the end. DATA only; the quiz primitive
 * renders it.
 *
 * THE RULES THIS FILE IS HELD TO (workflow-quiz.test.ts):
 *  - exactly ten questions, four distinct choices each, the answer index in range;
 *  - every question is a fact the post teaches, and every number in a `why` appears in the post;
 *  - every `why` names, in double quotes, a heading the post actually has;
 *  - no em dashes, no claim the post does not make. In particular question 2 tests the second
 *    reader's point of 2026-11-03: the study's figure is elapsed time before resumption, not
 *    time lost to a task, and question 8 tests only what the platform's documentation says. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const WORKFLOW_QUIZ: QuizQuestion[] = [
  {
    q: "What is workflow automation for small business, as this guide defines it?",
    choices: [
      "New software that replaces the tools you have",
      "Plumbing between the tools you already pay for, so finishing one step starts the next",
      "A chat window on your website",
      "A monthly report on staff hours",
    ],
    answer: 1,
    why: 'It is plumbing between the tools you already pay for, from "What workflow automation for small business is, without the jargon".',
  },
  {
    q: "In the study from UC Irvine, what does the twenty five minutes and twenty six seconds measure?",
    choices: [
      "The time lost to every small task",
      "How long each interruption lasted",
      "The average time that passed before interrupted work was resumed, counting work picked up the same day",
      "How long people spent on one piece of work before switching",
    ],
    answer: 2,
    why: 'It is elapsed time before same-day resumption, usually with other activities in between, not time thrown away; see "What ninety seconds actually costs".',
  },
  {
    q: "In our assessment, what sets the order of the list of jobs?",
    choices: [
      "Two scores from 1 to 5, impact and risk, each with a written reason",
      "How often a step happens, on its own",
      "Which job the owner finds most interesting",
      "How many steps the job has",
    ],
    answer: 0,
    why: 'Each job gets an impact score and a risk score from 1 to 5, and frequency only feeds them; see "How to find your own version of this".',
  },
  {
    q: "A job's result reaches a customer. What is the lowest its risk score can be?",
    choices: ["1", "2", "3", "5"],
    answer: 2,
    why: 'One yes on the four checks means the risk is at least 3 and a person approves every result; see "How to find your own version of this".',
  },
  {
    q: "In the two-minute test, under which four headings is the job written?",
    choices: [
      "Who, what, when, where",
      "Input, do, output and the person's check",
      "Cost, time, risk, value",
      "Trigger, filter, delay, send",
    ],
    answer: 1,
    why: 'Input, do, output and the person\'s check, handed to a colleague who does not know the job; see "How to find your own version of this".',
  },
  {
    q: "The stop question returns \"nothing breaks and nobody notices\". What is the verdict?",
    choices: [
      "Automate it first, because it is easy",
      "Hire someone to do it",
      "Buy a new tool for it",
      "Stop doing it rather than automate it",
    ],
    answer: 3,
    why: 'A job nobody needs is stopped, not wired; see "Is it worth automating".',
  },
  {
    q: "In our method, what happens to a job with an impact of 1 or 2 out of 5?",
    choices: [
      "It is left alone, at any risk",
      "It is built first, because it is small",
      "It is handed to a language model",
      "It runs twice a day",
    ],
    answer: 0,
    why: 'A low-impact job saves little and is one more thing that can break, so it is left alone; see "Is it worth automating".',
  },
  {
    q: "A chain fails one run in twenty. What does the documented default pause rule do about it?",
    choices: [
      "It pauses the chain at once",
      "Nothing: the default pause is for errors on 95 percent or more of runs in 7 days, so the failed runs sit in the run history",
      "It emails every customer the chain touched",
      "It deletes the failed records",
    ],
    answer: 1,
    why: 'The default pause is at 95 percent or more of runs in the last 7 days; see "The failure nobody warns you about".',
  },
  {
    q: "What is the safe way to break a chain on purpose in its first month?",
    choices: [
      "Switch off the shared login for the whole office",
      "Send a deliberately wrong reply to a real customer",
      "Delete the run history and start again",
      "Use a copy of the chain on test records and test logins, and try to send without approval",
    ],
    answer: 3,
    why: 'A test copy, test records and test logins, so nothing reaches a customer; see "The first month, and the two things to do in it".',
  },
  {
    q: "What does week four of the roadmap end with?",
    choices: [
      "A second chain built",
      "A price for the build",
      "A decision written down: keep it, change it or switch it off, and who owns it",
      "A new customer list",
    ],
    answer: 2,
    why: 'Week four breaks the test copy on purpose and ends with the decision and its owner written down; see "What to do first".',
  },
];
