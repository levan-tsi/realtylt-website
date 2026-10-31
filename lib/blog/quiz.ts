/** The quiz's arithmetic, kept out of the component so it can be tested without a browser.
 *
 * Round 15 (2026-10-31). The owner asked for "a little quiz at the end: what did you learn,
 * multiple choice, about 10 questions, four answers each, the result at the end", with the fail
 * state below 50 percent and the pass state at 50 percent and above. Both posts' lanes plug
 * their own questions into the same scene kind, so the rules live here once.
 *
 * Everything below is pure: `shuffleQuiz` takes the random source as an argument, so a test can
 * pin it and the component can hand it `Math.random`. */
import type { QuizQuestion } from "./flagship";

/** The pass line. At or above this share of right answers the reader passes. */
export const PASS_SHARE = 0.5;

export interface QuizScore {
  correct: number;
  total: number;
  /** Whole percent, rounded half up, for the result line. */
  percent: number;
  passed: boolean;
}

/** Score a finished run. `picks[i]` is the choice index the reader tapped for question i, or
 * null if they never answered it (which counts as wrong). */
export function scoreQuiz(questions: readonly QuizQuestion[], picks: readonly (number | null)[]): QuizScore {
  const total = questions.length;
  let correct = 0;
  questions.forEach((q, i) => {
    if (picks[i] === q.answer) correct += 1;
  });
  const share = total === 0 ? 0 : correct / total;
  return { correct, total, percent: Math.round(share * 100), passed: total > 0 && share >= PASS_SHARE };
}

/** Fisher-Yates on a copy. `rand` returns a number in [0, 1), like Math.random. */
export function shuffle<T>(items: readonly T[], rand: () => number = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A new run: the questions in a new order, and each question's four choices in a new order,
 * with `answer` re-pointed at wherever the right choice landed. The `why` line travels with
 * its question, so the teaching can never be attached to the wrong one. */
export function shuffleQuiz(questions: readonly QuizQuestion[], rand: () => number = Math.random): QuizQuestion[] {
  return shuffle(questions, rand).map((q) => {
    const order = shuffle([0, 1, 2, 3] as const, rand);
    const choices = order.map((k) => q.choices[k]) as QuizQuestion["choices"];
    const answer = order.indexOf(q.answer) as QuizQuestion["answer"];
    return { ...q, choices, answer };
  });
}

/** Which letter a choice carries, for the list version and for screen readers. */
export const LETTERS = ["A", "B", "C", "D"] as const;
