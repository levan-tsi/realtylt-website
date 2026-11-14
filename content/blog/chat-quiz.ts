/** The ten-question check at the end of "AI chatbot for small business" (slug
 * ai-chat-assistant-real-estate-website).
 *
 * ROUND 29, 2026-11-14, the refresh that re-aimed the post at local business owners. The owner's
 * quiz rule (2026-10-31): about ten questions, four answers each, the result at the end. DATA only.
 * Held by chat-quiz.test.ts: ten questions, four distinct choices, every number in a `why` in
 * the post, every `why` names a heading the post has, no em dashes. */

import type { QuizQuestion } from "@/lib/blog/flagship";

export const CHAT_QUIZ: QuizQuestion[] = [
  {
    q: "In the Harvard Business Review audit of 2,241 US companies sent a web test lead, what share never responded?",
    choices: ["37 percent", "23 percent", "16 percent", "42 percent"],
    answer: 1,
    why: 'The audit found that 23 percent of the companies never responded at all; see "The number everyone quotes, and where it actually comes from".',
  },
  {
    q: "What does the 2011 response-speed chart count?",
    choices: [
      "Closed sales",
      "Replies landing in an inbox",
      "Whether the firm got into a real exchange with somebody who could decide",
      "Visits to the website",
    ],
    answer: 2,
    why: 'It counts the conversation, a lower bar than closing and a higher one than an inbox reply; see "The number everyone quotes, and where it actually comes from".',
  },
  {
    q: "A visitor asks something the assistant cannot know. What is the right behaviour?",
    choices: [
      "Give its best guess, labelled as a guess",
      "Quote a typical price",
      "Repeat the question back",
      "Say it cannot confirm that, and offer a person",
    ],
    answer: 3,
    why: 'When a lookup returns nothing, the assistant says it does not know and offers a person instead; see "What makes an answer true, which is the whole job".',
  },
  {
    q: "In the 2024 airline chatbot decision, who was responsible for what the chatbot said?",
    choices: [
      "The chatbot, as a separate entity",
      "The software vendor",
      "Nobody, because it was automated",
      "The company, because the chatbot is part of its website",
    ],
    answer: 3,
    why: 'The tribunal held that a chatbot is still part of the website and the company answers for all the information on it; see "The part nobody selling you a chat widget mentions".',
  },
  {
    q: "Under California's bot disclosure law, what keeps a person from liability?",
    choices: [
      "Disclosing that it is a bot, clearly and conspicuously",
      "A line in the terms of service",
      "Giving the bot a first name",
      "Asking the visitor to agree first",
    ],
    answer: 0,
    why: 'A person using a bot is not liable if they disclose that it is a bot, in a way that is clear and conspicuous; see "The part nobody selling you a chat widget mentions".',
  },
  {
    q: "What does the third question of the worth-it test ask?",
    choices: [
      "Whether the software is cheap",
      "Whether a wrong answer lands where a person sees it first",
      "Whether the vendor is well known",
      "Whether competitors have one",
    ],
    answer: 1,
    why: 'Every conversation is stored and someone reads the week\'s transcripts; see "Is it worth automating".',
  },
  {
    q: "A salon gets 6 website questions a week and answers each in 4 minutes. What is the verdict?",
    choices: [
      "Automate it at once",
      "Leave it alone: a clear contact form and a kept promise do the job",
      "Switch on a pop-up",
      "Buy two tools",
    ],
    answer: 1,
    why: '6 x 4 = 24 minutes a week is a leave-it-alone answer; see "Is it worth automating".',
  },
  {
    q: "How much time a week do we suggest for reading the conversations?",
    choices: ["Twenty minutes", "None", "Two hours", "Five minutes"],
    answer: 0,
    why: 'We suggest twenty minutes a week, in your own name, for as long as it runs; see "What it takes to run".',
  },
  {
    q: "What happens in week 1 of the roadmap?",
    choices: [
      "A widget is installed",
      "A domain is bought",
      "The five test questions go to a vendor",
      "The last thirty website messages are read and the page of answers is written",
    ],
    answer: 3,
    why: 'Week 1 reads the messages and writes the page of answers a new hire would need; see "What to do first".',
  },
  {
    q: "Which is a real reason to leave the assistant switched off?",
    choices: [
      "Nobody will read the weekly transcripts",
      "The website has a footer",
      "The owner prefers the phone",
      "The widget has the wrong colour",
    ],
    answer: 0,
    why: 'A wrong answer nobody reads is a wrong answer that can be given again; see "Who this fits, and who it does not".',
  },
];
