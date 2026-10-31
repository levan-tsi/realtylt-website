"use client";

import { useEffect, useRef, useState } from "react";
import type { QuizQuestion } from "@/lib/blog/flagship";
import { LETTERS, scoreQuiz, shuffleQuiz } from "@/lib/blog/quiz";

/** PRIMITIVE: a short quiz on what the post taught. Round 15, 2026-10-31.
 *
 * The owner's brief, in his words: "a little quiz at the end: what did you learn, multiple
 * choice, about 10 questions, four answers each, the result at the end. Below 50 percent: it
 * takes you to the black hole and tells you to try again. Pass: the galaxy comes out and the
 * brain shines." For the real estate posts the same scene draws a house: dark on a fail, the
 * porch light and the windows on, and the stars out, on a pass. The two brands never share a
 * motif, so `brand` picks the whole drawing rather than a colour.
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
 * (and the site's own reduced-motion block) gets the lit brain or the lit house, standing still. */

type Brand = "ai" | "realtylt";

const ACCENT: Record<Brand, string> = { ai: "#c79bff", realtylt: "#28a8e0" };
const WRONG = "#f2a38f";

export function Quiz({
  band,
  ariaLabel,
  eyebrow,
  title,
  brand,
  questions,
  passLine,
  failLine,
}: {
  band: "night" | "light";
  ariaLabel: string;
  eyebrow: string;
  title: string;
  brand: Brand;
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
  const accent = ACCENT[brand];

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
            brand={brand}
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
  brand,
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
  brand: Brand;
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
  const heading =
    brand === "ai"
      ? pass
        ? "The galaxy is out and the brain is lit"
        : "The black hole: try again"
      : pass
        ? "The porch light is on"
        : "The house stays dark: try again";
  const link =
    brand === "ai"
      ? { label: "Talk to us about running the audit", href: "/connect" }
      : { label: "Talk to Levan", href: "/connect" };
  return (
    <div className="mt-10 grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-quiz-result={pass ? "pass" : "fail"}>
      <div className="mx-auto w-full max-w-[26rem] md:order-2">
        <QuizArt brand={brand} pass={pass} />
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

/** The result drawing for a brand and an outcome. Exported so the four states can be rendered
 * and looked at on their own. */
export function QuizArt({ brand, pass }: { brand: Brand; pass: boolean }) {
  return brand === "ai" ? pass ? <GalaxyBrain /> : <BlackHole /> : <House lit={pass} />;
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

/** A spiral galaxy as dots: two arms plus a scatter. Wider than the brain, so the arms show
 * on both sides of it. */
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

/** The brain, side view facing left: the outline, the fold between the lobes, the cerebellum
 * and the stem, the folds (gyri) that make it read as a brain at phone size, and a small
 * network of nodes inside it. Drawn at 0.82 scale around the middle of the galaxy. */
const BRAIN_OUTLINE =
  "M110,142 C100,104 128,70 168,62 C194,48 240,50 264,68 C294,76 310,104 304,132 C308,152 294,168 276,170 C264,178 248,180 238,174 C226,186 204,190 188,182 C166,188 142,180 132,168 C118,164 110,154 110,142 Z";
const BRAIN_FOLDS = [
  "M146,96 C156,84 170,100 182,88 C194,76 206,92 218,80",
  "M228,80 C238,94 252,82 262,96 C270,106 284,98 290,112",
  "M126,126 C138,114 152,130 164,118 C176,106 190,122 204,110",
  "M214,110 C226,124 240,112 252,124 C262,134 276,126 290,140",
  "M138,156 C164,144 204,148 236,164",
  "M196,62 C204,78 194,94 204,108",
];
const CEREBELLUM = "M246,176 C250,196 284,198 292,176";
const CEREBELLUM_LINES = ["M254,182 C264,188 278,188 286,180", "M258,190 C266,194 276,194 282,188"];
const BRAIN_STEM = "M234,180 C236,198 230,212 224,226";
const NODES: [number, number][] = [
  [140, 112], [170, 80], [208, 68], [244, 82], [276, 106], [152, 146], [186, 118],
  [224, 102], [262, 138], [196, 160], [230, 140], [168, 136], [288, 124],
];
const LINKS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [0, 6], [1, 6], [6, 7], [2, 7], [7, 3], [7, 10], [4, 8],
  [10, 8], [6, 11], [11, 5], [11, 9], [9, 10], [6, 10], [4, 12], [12, 8],
];

function GalaxyBrain() {
  return (
    <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label="A spiral galaxy opens behind a drawn brain whose network lights up.">
      <defs>
        <filter id="qz-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="qz-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c79bff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#c79bff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className="qz-galaxy">
        <ellipse cx="200" cy="130" rx="190" ry="92" fill="url(#qz-core)" opacity="0.5" />
        {GALAXY.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={p.s.toFixed(2)} fill="#f2f2ee" opacity={p.o.toFixed(2)} />
        ))}
      </g>
      <g className="qz-brain" filter="url(#qz-glow)" transform="translate(36 22) scale(0.82)">
        <path d={BRAIN_OUTLINE} fill="rgba(10,8,20,0.78)" stroke="#c79bff" strokeWidth="2.4" className="qz-draw" pathLength={1} />
        <path d={CEREBELLUM} fill="rgba(10,8,20,0.78)" stroke="#c79bff" strokeWidth="2.2" className="qz-draw" pathLength={1} />
        <path d={BRAIN_STEM} fill="none" stroke="#c79bff" strokeWidth="2.4" strokeLinecap="round" className="qz-draw" pathLength={1} />
        {[...BRAIN_FOLDS, ...CEREBELLUM_LINES].map((d) => (
          <path key={d} d={d} fill="none" stroke="#a78bfa" strokeWidth="1.7" strokeLinecap="round" opacity="0.75" className="qz-draw" pathLength={1} />
        ))}
        {LINKS.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} stroke="#e4d4ff" strokeWidth="1" opacity="0.5" className="qz-link" />
        ))}
        {NODES.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.6" fill="#f4ecff" className="qz-node" style={{ animationDelay: `${0.9 + i * 0.07}s` }} />
        ))}
      </g>
    </svg>
  );
}

/** The black hole: a dark core inside a slow swirl. */
const SWIRL = (() => {
  const arms: string[] = [];
  for (let arm = 0; arm < 4; arm += 1) {
    const pts: string[] = [];
    for (let k = 0; k <= 40; k += 1) {
      const t = k / 40;
      const a = arm * (Math.PI / 2) + t * 5.2;
      const rad = 120 - t * 88;
      pts.push(`${(200 + Math.cos(a) * rad).toFixed(1)},${(130 + Math.sin(a) * rad * 0.5).toFixed(1)}`);
    }
    arms.push(`M${pts.join(" L")}`);
  }
  return arms;
})();
const DIM_STARS = GALAXY.filter((_, i) => i % 5 === 0);

function BlackHole() {
  return (
    <svg viewBox="0 0 400 260" className="h-auto w-full" role="img" aria-label="A dark vortex: stars drawn into a black hole.">
      <defs>
        <radialGradient id="qz-rim" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#000" stopOpacity="1" />
          <stop offset="72%" stopColor="#8b5cf6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      {DIM_STARS.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={(p.s * 0.8).toFixed(2)} fill="#9b9b96" opacity={(p.o * 0.6).toFixed(2)} />
      ))}
      <g className="qz-swirl">
        {SWIRL.map((d) => (
          <path key={d} d={d} fill="none" stroke="#6d5a9e" strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
        ))}
        <ellipse cx="200" cy="130" rx="118" ry="58" fill="none" stroke="#3a3350" strokeWidth="1" />
        <ellipse cx="200" cy="130" rx="80" ry="38" fill="none" stroke="#4b3f6e" strokeWidth="1" />
      </g>
      <circle cx="200" cy="130" r="46" fill="url(#qz-rim)" />
      <circle cx="200" cy="130" r="26" fill="#000" />
    </svg>
  );
}

/** The house: dark on a fail; on a pass the porch light and the windows come on and the stars
 * come out. Real estate only; it never borrows the galaxy or the brain. */
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
@keyframes qz-bloom { from { opacity: 0; transform: scale(0.82); } to { opacity: 1; transform: scale(1); } }
@keyframes qz-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes qz-on { from { opacity: 0.08; } to { opacity: 1; } }
@keyframes qz-turn { to { transform: rotate(-360deg); } }
.qz-galaxy { transform-origin: 200px 130px; animation: qz-bloom 1.4s cubic-bezier(.2,.7,.2,1) both; }
.qz-draw { stroke-dasharray: 1; stroke-dashoffset: 0; animation: qz-draw 1.6s ease-out 0.35s both; }
.qz-link { animation: qz-on 0.8s ease-out 1.2s both; }
.qz-node { animation: qz-on 0.6s ease-out both; }
.qz-swirl { transform-origin: 200px 130px; transform-box: view-box; animation: qz-turn 40s linear infinite; }
.qz-lamp { animation: qz-on 0.9s ease-out both; }
.qz-star { animation: qz-on 1.2s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .qz-galaxy, .qz-draw, .qz-link, .qz-node, .qz-swirl, .qz-lamp, .qz-star { animation: none !important; }
}
`;
