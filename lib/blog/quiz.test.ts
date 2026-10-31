import { describe, expect, it } from "vitest";
import type { QuizQuestion } from "./flagship";
import { PASS_SHARE, scoreQuiz, shuffle, shuffleQuiz } from "./quiz";

const Q = (n: number, answer: 0 | 1 | 2 | 3): QuizQuestion => ({
  q: `Question ${n}`,
  choices: [`${n}a`, `${n}b`, `${n}c`, `${n}d`],
  answer,
  why: `Because of fact ${n}.`,
});
const TEN = Array.from({ length: 10 }, (_, i) => Q(i + 1, (i % 4) as 0 | 1 | 2 | 3));

/** A pinned random source, so a shuffle is the same on every run. */
function seq(...values: number[]) {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("scoreQuiz", () => {
  it("counts right answers and treats an unanswered question as wrong", () => {
    const picks = TEN.map((q, i) => (i < 6 ? q.answer : null));
    expect(scoreQuiz(TEN, picks)).toEqual({ correct: 6, total: 10, percent: 60, passed: true });
  });

  it("passes at exactly half, the owner's line", () => {
    const picks = TEN.map((q, i) => (i < 5 ? q.answer : (q.answer + 1) % 4));
    const s = scoreQuiz(TEN, picks);
    expect(PASS_SHARE).toBe(0.5);
    expect(s.percent).toBe(50);
    expect(s.passed).toBe(true);
  });

  it("fails below half", () => {
    const picks = TEN.map((q, i) => (i < 4 ? q.answer : (q.answer + 1) % 4));
    expect(scoreQuiz(TEN, picks)).toMatchObject({ correct: 4, percent: 40, passed: false });
  });

  it("scores a perfect run and an empty run", () => {
    expect(scoreQuiz(TEN, TEN.map((q) => q.answer)).percent).toBe(100);
    expect(scoreQuiz(TEN, []).passed).toBe(false);
    expect(scoreQuiz([], []).passed).toBe(false);
  });
});

describe("shuffle", () => {
  it("returns a permutation and leaves the input alone", () => {
    const input = [1, 2, 3, 4, 5];
    const out = shuffle(input, seq(0.9, 0.1, 0.5, 0.3));
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("shuffleQuiz", () => {
  it("keeps every question, and re-points each answer at the same right choice", () => {
    for (const r of [seq(0.1, 0.7, 0.3, 0.9, 0.5), seq(0.99, 0.01), Math.random]) {
      const run = shuffleQuiz(TEN, r);
      expect(run.map((q) => q.q).sort()).toEqual(TEN.map((q) => q.q).sort());
      for (const q of run) {
        const original = TEN.find((o) => o.q === q.q)!;
        expect(q.choices[q.answer]).toBe(original.choices[original.answer]);
        expect([...q.choices].sort()).toEqual([...original.choices].sort());
        expect(q.why).toBe(original.why);
      }
    }
  });

  it("actually reorders: two different random sources give two different runs", () => {
    const a = shuffleQuiz(TEN, seq(0.1, 0.8, 0.4)).map((q) => q.q).join();
    const b = shuffleQuiz(TEN, seq(0.9, 0.2, 0.6)).map((q) => q.q).join();
    expect(a).not.toBe(b);
  });
});
