/** The ten-question check at the end of "Seller disclosure in New York"
 * (slug seller-disclosure-requirements-new-york).
 *
 * ROUND 15, 2026-10-31. The owner asked for "a little quiz at the end, about 10 questions,
 * multiple choice, four answers, the result at the end". This file is the DATA only: the quiz
 * component is built in the AI lane and the orchestrator wires the two together.
 *
 * THE RULES THIS FILE IS HELD TO (seller-disclosure-quiz.test.ts):
 *  - exactly ten questions, four distinct choices each, the answer index in range;
 *  - every question is a fact the post teaches, and every number in a `why` appears in the post;
 *  - `why` is one plain sentence that names the section of the post to reread;
 *  - no em dashes, no claim the post does not make. */

export type SellerQuizQuestion = {
  q: string;
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  why: string;
};

export const SELLER_DISCLOSURE_QUIZ: SellerQuizQuestion[] = [
  {
    q: "Until March 20, 2024, what could a New York seller do instead of handing over the disclosure form?",
    choices: [
      "Pay a $500 filing fee to the Department of State",
      "Give the buyer a $500 credit at closing",
      "Have the attorney sign a waiver for the buyer",
      "Let the buyer's inspector fill in the form",
    ],
    answer: 1,
    why: "The $500 credit at closing was repealed on March 20, 2024, so the form can no longer be replaced; see \"The form is required on most sales\".",
  },
  {
    q: "Since when has the current form, DOS-1614-f (Rev. 02/25), been required?",
    choices: ["March 20, 2024", "September 27, 2024", "July 1, 2025", "May 15, 2026"],
    answer: 2,
    why: "The Department of State has required Rev. 02/25 since July 1, 2025, so an older printed copy is out of date; see \"The current form is the February 2025 revision\".",
  },
  {
    q: "How many questions are on the current form?",
    choices: ["36", "49", "63", "56"],
    answer: 3,
    why: "Seven flood questions were added in 2024, taking the form from 49 to 56 questions; see \"What the 56 questions cover\".",
  },
  {
    q: "How many of the form's questions are about flooding?",
    choices: ["Eight", "Seven", "Three", "Twelve"],
    answer: 0,
    why: "The environmental section opens with eight flood questions, seven of them added in 2024; see \"What the 56 questions cover\".",
  },
  {
    q: "You do not know whether the house was ever tested for radon. What do you check?",
    choices: ["No", "Unkn", "NA", "Leave the line blank"],
    answer: 1,
    why: "Unkn means unknown and is a fair answer when you do not know, while a guess that proves wrong is not; see \"Answer from what you actually know\".",
  },
  {
    q: "When must the seller deliver the completed form?",
    choices: [
      "At the closing table",
      "Within 10 days after the contract is signed",
      "Before the buyer signs the contract of sale, not after it",
      "Before the first showing",
    ],
    answer: 2,
    why: "The law requires delivery to the buyer or the buyer's agent before the buyer signs a binding contract of sale; see \"The form is required on most sales\".",
  },
  {
    q: "Which of these sales is outside the disclosure act?",
    choices: [
      "A two-family house",
      "A four-unit building",
      "A single-family house sold as is",
      "A condominium unit",
    ],
    answer: 3,
    why: "The act covers one- to four-family homes and does not cover condominium units or co-op apartments; see \"Who is exempt\".",
  },
  {
    q: "For most homes built before 1978, which pair of federal lead paint rules is right?",
    choices: [
      "10 days for the buyer's lead inspection; signed copies kept three years",
      "3 days for the buyer's lead inspection; signed copies kept one year",
      "30 days for the buyer's lead inspection; signed copies kept until closing",
      "10 days for the buyer's lead inspection; signed copies kept ten years",
    ],
    answer: 0,
    why: "The buyer gets 10 days to arrange a lead inspection or risk assessment, and the seller keeps signed copies for three years after the sale; see \"Lead paint in homes built before 1978\".",
  },
  {
    q: "What does your attorney do in the disclosure plan?",
    choices: [
      "Fills in the answers for you",
      "Reviews the form with you and confirms your sale is covered",
      "Signs the form in your place",
      "Files the form with the state",
    ],
    answer: 1,
    why: "The form says to complete it yourself, and your attorney reviews it with you and confirms whether your sale is covered; see \"The disclosure plan\" and \"Who is exempt\".",
  },
  {
    q: "What is the free prep sheet for?",
    choices: [
      "It replaces the state's form",
      "It goes to the buyer instead of the form",
      "It gets your paper ready before you fill in the state's form",
      "It is filed with the town building department",
    ],
    answer: 2,
    why: "The prep sheet maps each document to the question that asks for it, and the answers still go on the state's form itself; see \"The disclosure plan\".",
  },
];
