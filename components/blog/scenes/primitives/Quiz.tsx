"use client";

import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/blog/flagship";
import { LETTERS, scoreQuiz, shuffleQuiz } from "@/lib/blog/quiz";

/** PRIMITIVE: a short quiz on what the post taught. Round 15, 2026-10-31.
 *
 * The owner's brief, in his words: "a little quiz at the end: what did you learn, multiple
 * choice, about 10 questions, four answers each, the result at the end." The result draws a
 * house: dark on a fail, the porch light and the windows on, and the stars out, on a pass.
 *
 * WITHOUT JAVASCRIPT the server markup is the whole quiz as a list, each answer folded inside a
 * <details>, so nothing is hidden behind a script. With JavaScript the list is swapped for the
 * one-question-at-a-time run after mount; the run is shuffled on the client only, which keeps
 * the server and the first client render identical.
 *
 * Teaching, not scolding: whichever choice is tapped, the right answer is shown with its one
 * line of why, and the wrong pick is marked in words as well as in colour.
 *
 * Motion is CSS only and every animated part rests on its finished frame, so reduced motion
 * (and the site's own reduced-motion block) gets the lit house, standing still. */

const ACCENT = "#28a8e0";
const WRONG = "#f2a38f";

export function Quiz({
  band,
  ariaLabel,
  eyebrow,
  title,
  questions,
  passLine,
  failLine,
}: {
  band: "night" | "light";
  ariaLabel: string;
  eyebrow: string;
  title: string;
  questions: QuizQuestion[];
  passLine: string;
  failLine: string;
  label?: string;
}) {
  const dark = band === "night";
  const [live, setLive] = useState(false);
  const [run, setRun] = useState<QuizQuestion[]>(questions);
  const [at, setAt] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>([]);
  const [done, setDone] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  useEffect(() => {
    setRun(shuffleQuiz(questions));
    setLive(true);
  }, [questions]);

  // Focus follows the reader: the next question's heading, or the result. Skipped on the first
  // render so the page never jumps to the quiz on load.
  useEffect(() => {
    if (!moved.current) return;
    (done ? resultRef.current : headRef.current)?.focus({ preventScroll: false });
  }, [at, done]);

  const muted = dark ? "text-paper/65" : "text-stone";
  const strong = dark ? "text-paper" : "text-ink";
  const rule = dark ? "border-white/15" : "border-line-strong";
  const accent = ACCENT;

  const start = () => {
    moved.current = true;
    setRun(shuffleQuiz(questions));
    setPicks([]);
    setAt(0);
    setDone(false);
  };

  return (
    <section
      aria-label={ariaLabel}
      className={dark ? "bg-ink py-20 text-paper md:py-28" : "bg-mist py-20 md:py-28"}
    >
      <style>{QUIZ_CSS}</style>
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-paper/60" : "text-stone"}`}>{eyebrow}</p>
        <h2 className={`mt-5 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px] ${strong}`}>
          {title}
        </h2>

        {!live ? (
          <QuizList questions={questions} dark={dark} muted={muted} strong={strong} rule={rule} />
        ) : done ? (
          <Result
            dark={dark}
            score={scoreQuiz(run, picks)}
            passLine={passLine}
            failLine={failLine}
            onAgain={start}
            headingRef={resultRef}
            muted={muted}
            strong={strong}
            accent={accent}
          />
        ) : (
          <Ask
            item={run[at]}
            n={at}
            total={run.length}
            picked={picks[at] ?? null}
            dark={dark}
            muted={muted}
            strong={strong}
            rule={rule}
            accent={accent}
            headingRef={headRef}
            nextRef={nextRef}
            onPick={(c) => {
              if (picks[at] != null) return;
              const next = picks.slice();
              next[at] = c;
              setPicks(next);
              requestAnimationFrame(() => nextRef.current?.focus());
            }}
            onNext={() => {
              moved.current = true;
              if (at + 1 >= run.length) setDone(true);
              else setAt(at + 1);
            }}
          />
        )}
      </div>
    </section>
  );
}

/** The list version: what a reader without JavaScript gets, and what the server renders. */
export function QuizList({
  questions,
  dark,
  muted,
  strong,
  rule,
}: {
  questions: QuizQuestion[];
  dark: boolean;
  muted: string;
  strong: string;
  rule: string;
}) {
  return (
    <ol className="m-0 mt-10 max-w-3xl list-none space-y-10 p-0" data-quiz-list>
      {questions.map((item, n) => (
        <li key={item.q} className={`border-t pt-6 ${rule}`}>
          <p className={`text-sm font-bold ${muted}`}>
            {n + 1} of {questions.length}
          </p>
          <p className={`mt-2 text-xl leading-snug ${strong}`}>{item.q}</p>
          <ul className="m-0 mt-4 list-none space-y-2 p-0">
            {item.choices.map((c, k) => (
              <li key={c} className={`text-base leading-relaxed ${strong}`}>
                <span className={`mr-2 font-bold ${muted}`}>{LETTERS[k]}.</span>
                {c}
              </li>
            ))}
          </ul>
          <details className="mt-4">
            <summary
              className={`inline-flex min-h-11 cursor-pointer items-center rounded-xl border px-4 text-base font-bold ${rule} ${strong}`}
            >
              Show the answer
            </summary>
            <p className={`mt-3 text-base leading-relaxed ${strong}`}>
              <span className="font-bold">
                {LETTERS[item.answer]}. {item.choices[item.answer]}
              </span>{" "}
              <span className={dark ? "text-paper/80" : "text-ink-soft"}>{item.why}</span>
            </p>
          </details>
        </li>
      ))}
    </ol>
  );
}

function Ask({
  item,
  n,
  total,
  picked,
  dark,
  muted,
  strong,
  rule,
  accent,
  headingRef,
  nextRef,
  onPick,
  onNext,
}: {
  item: QuizQuestion;
  n: number;
  total: number;
  picked: number | null;
  dark: boolean;
  muted: string;
  strong: string;
  rule: string;
  accent: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  nextRef: React.RefObject<HTMLButtonElement | null>;
  onPick: (choice: number) => void;
  onNext: () => void;
}) {
  const answered = picked != null;
  const right = picked === item.answer;
  return (
    <div className="mt-10 max-w-3xl" data-quiz-live>
      <div className="flex items-center gap-4">
        <p className={`shrink-0 text-sm font-bold ${muted}`} data-quiz-count>
          {n + 1} of {total}
        </p>
        <div aria-hidden className="flex min-w-0 flex-1 gap-1.5">
          {Array.from({ length: total }, (_, k) => (
            <span
              key={k}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: k <= n ? accent : dark ? "rgba(255,255,255,0.14)" : "var(--color-line)" }}
            />
          ))}
        </div>
      </div>

      <h3
        ref={headingRef}
        tabIndex={-1}
        className={`mt-6 text-xl leading-snug outline-none md:text-2xl md:font-light ${strong}`}
      >
        {item.q}
      </h3>

      <ul className="m-0 mt-6 grid list-none gap-3 p-0">
        {item.choices.map((c, k) => {
          const isAnswer = k === item.answer;
          const isPick = k === picked;
          const state = !answered ? "open" : isAnswer ? "right" : isPick ? "wrong" : "rest";
          const border =
            state === "right" ? accent : state === "wrong" ? WRONG : dark ? "rgba(255,255,255,0.18)" : "var(--color-line-strong)";
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => onPick(k)}
                aria-disabled={answered || undefined}
                data-choice={k}
                data-state={state}
                className={`qz-choice flex min-h-[52px] w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base leading-snug transition-colors ${strong} ${
                  answered ? "cursor-default" : dark ? "hover:bg-white/[0.06]" : "hover:bg-paper"
                } ${state === "rest" ? "opacity-60" : ""}`}
                style={{ borderColor: border }}
              >
                <span
                  aria-hidden
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  style={
                    state === "right"
                      ? { background: accent, color: "#0b0b12" }
                      : state === "wrong"
                        ? { background: WRONG, color: "#0b0b12" }
                        : { border: `1px solid ${dark ? "rgba(255,255,255,0.3)" : "var(--color-line-strong)"}` }
                  }
                >
                  {state === "right" ? <Tick /> : state === "wrong" ? <Cross /> : LETTERS[k]}
                </span>
                <span className="min-w-0 flex-1">{c}</span>
                {state === "right" && <span className="shrink-0 text-sm font-bold">Right answer</span>}
                {state === "wrong" && <span className="shrink-0 text-sm font-bold">Your pick</span>}
              </button>
            </li>
          );
        })}
      </ul>

      <div aria-live="polite" className="mt-6 min-h-[1px]">
        {answered && (
          <div className={`rounded-2xl border px-5 py-4 ${rule}`} data-quiz-why>
            <p className={`text-base font-bold ${strong}`}>
              {right ? "Right." : `Not quite. The answer is ${LETTERS[item.answer]}: ${item.choices[item.answer]}.`}
            </p>
            <p className={`mt-1 text-base leading-relaxed ${dark ? "text-paper/80" : "text-ink-soft"}`}>{item.why}</p>
          </div>
        )}
      </div>

      {answered && (
        <button
          ref={nextRef}
          type="button"
          onClick={onNext}
          data-quiz-next
          className={`mt-6 inline-flex min-h-12 items-center rounded-xl px-6 text-base font-bold ${
            dark ? "bg-paper text-ink hover:bg-paper/90" : "bg-ink text-paper hover:bg-ink-soft"
          }`}
        >
          {n + 1 >= total ? "See your score" : "Next question"}
        </button>
      )}
      {!answered && <p className={`mt-6 text-sm ${muted}`}>Tap the answer you think is right.</p>}
    </div>
  );
}

function Result({
  dark,
  score,
  passLine,
  failLine,
  onAgain,
  headingRef,
  muted,
  strong,
  accent,
}: {
  dark: boolean;
  score: ReturnType<typeof scoreQuiz>;
  passLine: string;
  failLine: string;
  onAgain: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  muted: string;
  strong: string;
  accent: string;
}) {
  const pass = score.passed;
  const heading = pass ? "The porch light is on" : "The house stays dark: try again";
  const link = { label: "Talk to Levan", href: "/connect" };
  return (
    <div className="mt-10 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-quiz-result={pass ? "pass" : "fail"}>
      <div className="mx-auto w-full max-w-[26rem] md:order-2">
        <House lit={pass} />
      </div>
      <div aria-live="polite">
        <p className={`text-sm font-bold uppercase tracking-[0.16em] ${muted}`}>Your score</p>
        <p className={`mt-3 text-6xl font-light leading-none tracking-[-0.02em] ${strong}`} data-quiz-score>
          {score.correct} of {score.total}
        </p>
        <h3 ref={headingRef} tabIndex={-1} className={`mt-6 text-2xl font-light leading-snug outline-none ${strong}`}>
          {heading}
        </h3>
        <p className={`mt-3 max-w-md text-base leading-relaxed ${dark ? "text-paper/80" : "text-ink-soft"}`}>
          {pass ? passLine : failLine}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {pass ? (
            <>
              <a
                href={link.href}
                className={`inline-flex min-h-12 items-center rounded-xl px-6 text-base font-bold ${
                  dark ? "bg-paper text-ink hover:bg-paper/90" : "bg-ink text-paper hover:bg-ink-soft"
                }`}
              >
                {link.label}
              </a>
              <button
                type="button"
                onClick={onAgain}
                className={`inline-flex min-h-12 items-center rounded-xl px-2 text-base underline underline-offset-4 ${muted}`}
              >
                Take it again
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onAgain}
              data-quiz-again
              className={`inline-flex min-h-12 items-center rounded-xl px-6 text-base font-bold ${
                dark ? "bg-paper text-ink hover:bg-paper/90" : "bg-ink text-paper hover:bg-ink-soft"
              }`}
              style={{ outlineColor: accent }}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/* ── The drawings. Deterministic geometry (no Math.random at render), so server and client
   agree and a screenshot is the same every time. ─────────────────────────────────────────── */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** A field of dots: two spiral arms plus a scatter. The house's stars are a subset of it, so
 * the generator stays exactly as drawn and the stars land where they always have. */
const GALAXY = (() => {
  const r = seeded(7);
  const pts: { x: number; y: number; s: number; o: number }[] = [];
  for (let arm = 0; arm < 2; arm += 1) {
    for (let k = 0; k < 110; k += 1) {
      const t = k / 110;
      const a = t * 5.2 + arm * Math.PI + (r() - 0.5) * 0.45;
      const rad = 10 + t * 186 + (r() - 0.5) * 16;
      pts.push({ x: 200 + Math.cos(a) * rad, y: 130 + Math.sin(a) * rad * 0.48, s: 0.7 + r() * 1.5, o: 0.45 + r() * 0.55 });
    }
  }
  for (let k = 0; k < 70; k += 1) {
    pts.push({ x: r() * 400, y: r() * 260, s: 0.4 + r() * 0.9, o: 0.2 + r() * 0.5 });
  }
  return pts;
})();

/** The house: dark on a fail; on a pass the porch light and the windows come on and the stars
 * come out. */
const HOUSE_STARS = GALAXY.filter((p, i) => i % 3 === 0 && p.y < 120);

function House({ lit }: { lit: boolean }) {
  const win = lit ? "var(--color-window, #f6c781)" : "#2a2b2f";
  return (
    <svg
      viewBox="0 0 400 260"
      className="h-auto w-full"
      role="img"
      aria-label={lit ? "A house at night with its porch light and windows on under the stars." : "A house at night with every light off."}
    >
      <defs>
        <radialGradient id="qz-porch" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f6c781" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#f6c781" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lit &&
        HOUSE_STARS.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={(p.y * 0.8).toFixed(1)} r={p.s.toFixed(2)} fill="#f2f2ee" className="qz-star" style={{ animationDelay: `${(i % 9) * 0.12}s` }} />
        ))}
      <line x1="20" y1="236" x2="380" y2="236" stroke="#3a3b40" strokeWidth="2" />
      <path d="M110,236 V140 L200,82 L290,140 V236 Z" fill="#17181c" stroke="#4a4b50" strokeWidth="2" strokeLinejoin="round" />
      <path d="M96,146 L200,74 L304,146" fill="none" stroke="#6d6d67" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="132" y="158" width="40" height="34" rx="3" fill={win} className={lit ? "qz-lamp" : undefined} />
      <rect x="228" y="158" width="40" height="34" rx="3" fill={win} className={lit ? "qz-lamp" : undefined} style={{ animationDelay: "0.25s" }} />
      <rect x="186" y="180" width="28" height="56" rx="3" fill="#0e0f12" stroke="#4a4b50" strokeWidth="1.5" />
      {lit && <circle cx="226" cy="186" r="34" fill="url(#qz-porch)" className="qz-lamp" />}
      <circle cx="226" cy="186" r="5" fill={lit ? "#ffe6b8" : "#3a3b40"} className={lit ? "qz-lamp" : undefined} />
    </svg>
  );
}

/** Every animation starts from the dim frame and rests on the lit one (fill-mode both), so
 * with reduced motion, where animation is removed, the base style IS the finished frame. */
const QUIZ_CSS = `
.qz-choice:focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }
@keyframes qz-on { from { opacity: 0.08; } to { opacity: 1; } }
.qz-lamp { animation: qz-on 0.9s ease-out both; }
.qz-star { animation: qz-on 1.2s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .qz-lamp, .qz-star { animation: none !important; }
}
`;
