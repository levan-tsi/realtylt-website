"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConsentCheckbox } from "@/components/leads/ConsentCheckbox";
import {
  CEILING_ASSUMPTIONS,
  MONTHLY_OPTIONS,
  MUST_HAVES,
  planFor,
  type MustHaveKey,
  type QuizAnswers,
  type QuizHomeType,
  type QuizPath,
  type QuizPreapproval,
  type QuizTimeline,
} from "@/lib/plan-quiz";
import { INTEREST_REASONS, SERVED_AREAS, SITE, type CountySlug } from "@/lib/site";

/** The plan quiz (design: docs/parity/DESIGN-ROUND24.md). A takeover of large choosable
 * "shapes" that draws a route as you answer, then renders a TAILORED PLAN into /plan:
 * ceiling from the same bridge as /financing, live counts, one pre-filtered search link.
 * Contact info is asked for LAST and is optional; skipping keeps everything on-page. */

// ── The shapes' drawings — the rail's line language: 1.8 stroke, round caps, no fills. ──
const draw = (paths: React.ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {paths}
  </svg>
);

const SHAPES = {
  buy: draw(<path d="M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9" />),
  sell: draw(
    <>
      <path d="M3 11.5 12 4l9 7.5M5 10v9h14v-9" />
      <path d="M9 19v-4.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5V19" />
    </>,
  ),
  both: draw(
    <>
      <path d="M2.5 9.5 7.5 5l5 4.5M4.5 8.5V15h6V8.5" />
      <path d="M11.5 15l5-4.5 5 4.5M13.5 14v6.5h6V14" />
    </>,
  ),
  now: draw(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>,
  ),
  soon: draw(
    <>
      <rect x="4" y="5" width="16" height="15" rx="1.5" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3M9.5 14.5h5" />
    </>,
  ),
  later: draw(
    <>
      <path d="M3 18h18" />
      <path d="M6.5 18a5.5 5.5 0 0 1 11 0" />
      <path d="M12 6v2.5M5.6 8.6l1.8 1.8M18.4 8.6l-1.8 1.8" />
    </>,
  ),
  approved: draw(
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="m9.5 13.5 2 2 3.5-4" />
    </>,
  ),
  notyet: draw(
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M9.5 12.5h6M9.5 16h6" />
    </>,
  ),
  cash: draw(
    <>
      <rect x="3" y="7" width="18" height="11" rx="1.5" />
      <circle cx="12" cy="12.5" r="2.6" />
      <path d="M6 10.5v.01M18 14.5v.01" />
    </>,
  ),
  house: draw(<path d="M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9" />),
  condo: draw(
    <>
      <path d="M6 21V4.5h9V21M15 8.5h4V21M3 21h19" />
      <path d="M8.5 7.5h1.5M11.5 7.5H13M8.5 11h1.5M11.5 11H13M8.5 14.5h1.5M11.5 14.5H13" />
    </>,
  ),
  coop: draw(
    <>
      <path d="M4 21V9l8-4.5L20 9v12M3 21h18" />
      <path d="M7.5 21v-8M12 21v-8M16.5 21v-8M6 10.5h12" />
    </>,
  ),
  multi: draw(
    <>
      <path d="M2.5 10.5 8 6l5.5 4.5M4.5 9.5V20h7V9.5" />
      <path d="M13 20h6.5v-8L16 9.2l-3 2.3" />
      <path d="M3 20h18.5" />
    </>,
  ),
} as const;

// ── Step definitions. The seller path skips the buyer-only steps (lib/plan-quiz decides
// the plan; this list decides only what to ASK). ─────────────────────────────────────────
type StepId = "path" | "timeline" | "monthly" | "preapproval" | "areas" | "homeType" | "mustHaves";
const BUYER_STEPS: StepId[] = ["path", "timeline", "monthly", "preapproval", "areas", "homeType", "mustHaves"];
const SELLER_STEPS: StepId[] = ["path", "timeline"];

const STEP_META: Record<StepId, { eyebrow: string; question: string }> = {
  path: { eyebrow: "Your journey", question: "What brings you here?" },
  timeline: { eyebrow: "Timing", question: "When do you want this to happen?" },
  monthly: { eyebrow: "Budget", question: "What monthly payment feels comfortable?" },
  preapproval: { eyebrow: "Financing", question: "Where does financing stand?" },
  areas: { eyebrow: "Where", question: "Which areas should we look in?" },
  homeType: { eyebrow: "The home", question: "What kind of home?" },
  mustHaves: { eyebrow: "Must-haves", question: "Anything the home has to have?" },
};

const fmtMoney = (n: number) => `$${n.toLocaleString("en-US")}`;

/** The word a finished step contributes to the route spine. */
function stopLabel(step: StepId, a: QuizAnswers): string | null {
  switch (step) {
    case "path":
      return a.path === "buying" ? "Buying" : a.path === "selling" ? "Selling" : a.path === "both" ? "Buying and selling" : null;
    case "timeline":
      return a.timeline === "now" ? "Ready now" : a.timeline === "soon" ? "3 to 6 months" : a.timeline === "later" ? "Next year or later" : null;
    case "monthly":
      return a.monthly ? `${fmtMoney(a.monthly)}/mo` : null;
    case "preapproval":
      return a.preapproval === "yes" ? "Pre-approved" : a.preapproval === "cash" ? "Paying cash" : a.preapproval === "not-yet" ? "Letter next" : null;
    case "areas":
      return a.areas?.length ? (a.areas.length === 1 ? SERVED_AREAS.find((c) => c.slug === a.areas![0])?.name ?? null : `${a.areas.length} areas`) : null;
    case "homeType":
      return a.homeType === "house" ? "House" : a.homeType === "condo" ? "Condo" : a.homeType === "coop" ? "Co-op" : a.homeType === "multi-family" ? "Multi-family" : null;
    case "mustHaves":
      return a.mustHaves?.length ? `${a.mustHaves.length} must-have${a.mustHaves.length > 1 ? "s" : ""}` : null;
  }
}

/** Live Active count for one county — the same API every search answers with. */
function useAreaCounts(slugs: CountySlug[]): Record<string, number> {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let cancelled = false;
    for (const slug of slugs) {
      if (counts[slug] !== undefined) continue;
      fetch(`/api/idx/search?county=${slug}&status=Active&pageSize=1`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (!cancelled && j && typeof j.total === "number") setCounts((c) => ({ ...c, [slug]: j.total }));
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);
  return counts;
}

// ── Shared control styles (the site's grammar: 16px cards, chip selection states). ──────
const shapeCls = (active: boolean) =>
  `group flex min-h-28 flex-col items-center justify-center gap-2.5 rounded-2xl border px-3 py-5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
    active ? "border-ink bg-ink text-paper" : "border-line-strong bg-white text-ink hover:bg-mist"
  }`;
const chipCls = (active: boolean) =>
  `rounded-xl border px-3.5 py-2 text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
    active ? "border-ink bg-ink text-paper" : "border-line-strong bg-white text-ink-soft hover:bg-mist"
  }`;
const skipCls =
  "text-xs font-bold uppercase tracking-[0.12em] text-stone underline underline-offset-4 transition-colors hover:text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river";

export function PlanQuizHost() {
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [touched, setTouched] = useState(false); // any answer given → the plan section exists

  // The rail's Plan item lands on /plan?quiz=1 — "click on things, popup quiz".
  useEffect(() => {
    if (params.get("quiz") === "1") setOpen(true);
  }, [params]);

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Two minutes, seven questions</p>
            <p className="mt-1 max-w-lg text-sm text-ink-soft">
              Answer a few questions and this page becomes your plan: your price ceiling, your
              areas with live counts, and your next concrete step.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
          >
            {touched ? "Keep planning" : "Build my plan"}
          </button>
        </div>
      </section>

      {touched && <TailoredPlan answers={answers} />}

      {open && (
        <QuizTakeover
          answers={answers}
          onAnswer={(a) => {
            setAnswers(a);
            setTouched(true);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function QuizTakeover({
  answers,
  onAnswer,
  onClose,
}: {
  answers: QuizAnswers;
  onAnswer: (a: QuizAnswers) => void;
  onClose: () => void;
}) {
  const steps = answers.path === "selling" ? SELLER_STEPS : BUYER_STEPS;
  const firstUnanswered = steps.findIndex((s) => stopLabel(s, answers) === null);
  const [idx, setIdx] = useState(firstUnanswered === -1 ? steps.length - 1 : firstUnanswered);
  const step = steps[Math.min(idx, steps.length - 1)];

  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Open: remember focus, lock scroll, tuck the chat launcher under the scrim (globals.css
  // rlt-quiz-open — its z-index 999998 is the one thing the overlay cannot outrank).
  // Close: restore all three (QualifyingWizard's contract).
  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("rlt-quiz-open");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("rlt-quiz-open");
      restoreRef.current?.focus?.();
    };
  }, []);
  useEffect(() => {
    titleRef.current?.focus();
  }, [step]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const advance = (a: QuizAnswers) => {
    onAnswer(a);
    const nextSteps = a.path === "selling" ? SELLER_STEPS : BUYER_STEPS;
    if (idx + 1 >= nextSteps.length) onClose();
    else setIdx(idx + 1);
  };
  const skip = () => {
    if (idx + 1 >= steps.length) onClose();
    else setIdx(idx + 1);
  };

  const set = <K extends keyof QuizAnswers>(k: K, v: QuizAnswers[K]) => advance({ ...answers, [k]: v });
  const toggleIn = (list: string[] | undefined, v: string) =>
    list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v];

  const meta = STEP_META[step];
  const stops = steps.map((s) => ({ step: s, label: stopLabel(s, answers) }));

  // PORTALED to <body>: an ancestor of /plan's content creates a CSS containing block
  // (transform/filter), so a fixed overlay rendered in place anchored BELOW the header —
  // watched in the round-24 screenshot, header and chat bubble sitting on the scrim.
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-quiz-title"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 sm:items-center sm:p-6"
    >
      <div
        ref={panelRef}
        className="flex max-h-[92dvh] w-full flex-col overflow-y-auto rounded-t-3xl bg-paper sm:max-w-2xl sm:rounded-3xl"
      >
        {/* Header: the route so far. Desktop keeps the labels; phones keep the dots. */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 pb-4 pt-5 sm:px-8">
          <ol aria-label="Your route so far" className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
            {stops.map((s, i) => (
              <li key={s.step} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden className={`h-px w-4 ${i <= idx ? "bg-ink" : "bg-line-strong"}`} />}
                <span
                  aria-hidden
                  className={`grid h-2.5 w-2.5 place-items-center rounded-full ${
                    s.label ? "bg-ink motion-safe:animate-[rise-in_.25s_ease-out]" : i === idx ? "border-[1.8px] border-ink bg-paper" : "border border-line-strong bg-paper"
                  }`}
                />
                {s.label && (
                  <span className="hidden text-[11px] font-bold uppercase tracking-[0.08em] text-ink sm:inline">{s.label}</span>
                )}
              </li>
            ))}
          </ol>
          <button type="button" onClick={onClose} aria-label="Close and keep my plan" className={skipCls}>
            Close
          </button>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">
            Step {idx + 1} of {steps.length} · {meta.eyebrow}
          </p>
          {/* Focused programmatically per step so screen readers announce the question; the
              ring is suppressed — a heading is not an interactive target. */}
          <h2 id="plan-quiz-title" ref={titleRef} tabIndex={-1} className="t-h3 mt-2 text-ink outline-none focus:outline-none focus-visible:outline-none">
            {meta.question}
          </h2>

          <div className="mt-6">
            {step === "path" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["buying", "Buying", SHAPES.buy, "Find the next home"],
                    ["selling", "Selling", SHAPES.sell, "Price and list this one"],
                    ["both", "Both", SHAPES.both, "Sell here, buy there"],
                  ] as [QuizPath, string, React.ReactNode, string][]
                ).map(([v, label, icon, sub]) => (
                  <button key={v} type="button" onClick={() => set("path", v)} className={shapeCls(answers.path === v)}>
                    {icon}
                    <span className="text-sm font-bold">{label}</span>
                    <span className={`text-xs ${answers.path === v ? "text-paper/70" : "text-stone"}`}>{sub}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "timeline" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["now", "Ready now", SHAPES.now],
                    ["soon", "3 to 6 months", SHAPES.soon],
                    ["later", "Next year or later", SHAPES.later],
                  ] as [QuizTimeline, string, React.ReactNode][]
                ).map(([v, label, icon]) => (
                  <button key={v} type="button" onClick={() => set("timeline", v)} className={shapeCls(answers.timeline === v)}>
                    {icon}
                    <span className="text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "monthly" && (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  {MONTHLY_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("monthly", m)}
                      className={`rounded-2xl border py-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
                        answers.monthly === m ? "border-ink bg-ink text-paper" : "border-line-strong bg-white text-ink hover:bg-mist"
                      }`}
                    >
                      <span className="block text-base font-bold tabular-nums">{fmtMoney(m)}</span>
                      <span className={`block text-[11px] uppercase tracking-[0.08em] ${answers.monthly === m ? "text-paper/70" : "text-stone"}`}>per month</span>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-stone">
                  We turn this into a price ceiling at {CEILING_ASSUMPTIONS}. Adjust any of it later on the financing page.
                </p>
              </>
            )}

            {step === "preapproval" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    ["yes", "Pre-approved", SHAPES.approved],
                    ["not-yet", "Not yet", SHAPES.notyet],
                    ["cash", "Paying cash", SHAPES.cash],
                  ] as [QuizPreapproval, string, React.ReactNode][]
                ).map(([v, label, icon]) => (
                  <button key={v} type="button" onClick={() => set("preapproval", v)} className={shapeCls(answers.preapproval === v)}>
                    {icon}
                    <span className="text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "areas" && (
              <AreasStep
                chosen={answers.areas ?? []}
                onToggle={(slug) => onAnswer({ ...answers, areas: toggleIn(answers.areas, slug) as CountySlug[] })}
                onContinue={() => advance(answers)}
              />
            )}

            {step === "homeType" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    ["house", "House", SHAPES.house],
                    ["condo", "Condo", SHAPES.condo],
                    ["coop", "Co-op", SHAPES.coop],
                    ["multi-family", "Multi-family", SHAPES.multi],
                  ] as [QuizHomeType, string, React.ReactNode][]
                ).map(([v, label, icon]) => (
                  <button key={v} type="button" onClick={() => set("homeType", v)} className={shapeCls(answers.homeType === v)}>
                    {icon}
                    <span className="text-sm font-bold">{label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === "mustHaves" && (
              <>
                <div className="flex flex-wrap gap-2">
                  {MUST_HAVES.map((mh) => {
                    const active = answers.mustHaves?.includes(mh.key) ?? false;
                    return (
                      <button
                        key={mh.key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onAnswer({ ...answers, mustHaves: toggleIn(answers.mustHaves, mh.key) as MustHaveKey[] })}
                        className={chipCls(active)}
                      >
                        {mh.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-stone">
                  Everything here is a real filter the search obeys. Nothing is offered that the search cannot find.
                </p>
                <button
                  type="button"
                  onClick={() => advance(answers)}
                  className="mt-6 rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
                >
                  See my plan
                </button>
              </>
            )}
          </div>

          {step !== "mustHaves" && step !== "areas" && (
            <div className="mt-7 flex items-center justify-between">
              <button
                type="button"
                onClick={() => (idx === 0 ? onClose() : setIdx(idx - 1))}
                className={skipCls}
              >
                {idx === 0 ? "Not now" : "Back"}
              </button>
              <button type="button" onClick={skip} className={skipCls}>
                Skip this one
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AreasStep({
  chosen,
  onToggle,
  onContinue,
}: {
  chosen: CountySlug[];
  onToggle: (slug: CountySlug) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {SERVED_AREAS.map((a) => (
          <button
            key={a.slug}
            type="button"
            aria-pressed={chosen.includes(a.slug)}
            onClick={() => onToggle(a.slug)}
            className={chipCls(chosen.includes(a.slug))}
          >
            {a.name}, NY
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-stone">Pick as many as you like. Your plan shows live counts for each.</p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
      >
        Continue
      </button>
    </>
  );
}

// ── The tailored plan, rendered into /plan itself. ──────────────────────────────────────
function TailoredPlan({ answers }: { answers: QuizAnswers }) {
  const plan = planFor(answers);
  const counts = useAreaCounts(answers.areas ?? []);

  return (
    <section aria-labelledby="your-plan-heading" className="border-b border-line">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Your plan so far</p>
        <h2 id="your-plan-heading" className="t-h2 mt-2 text-ink">
          Here is where <strong>you stand</strong>
        </h2>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plan.ceiling && (
            <div className="rounded-2xl border border-line-strong p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Your ceiling</p>
              <p className="mt-3 text-3xl font-bold tabular-nums text-ink">{fmtMoney(plan.ceiling.price)}</p>
              <p className="mt-2 text-sm text-ink-soft">
                {fmtMoney(plan.ceiling.monthly)}/mo buys up to this. {plan.ceiling.assumptions}.
              </p>
              <Link
                href="/financing"
                className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.14em] text-ink underline underline-offset-4 transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                Adjust the assumptions
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-line-strong p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Next step</p>
            <h3 className="t-h3 mt-2 text-ink">{plan.nextStage.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{plan.nextStage.body}</p>
            <Link
              href={plan.nextStage.href}
              className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.14em] text-ink underline underline-offset-4 transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
            >
              {plan.nextStage.label}
            </Link>
          </div>

          <div className="rounded-2xl border border-line-strong p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Your search</p>
            {plan.areaLinks.length > 1 ? (
              <ul className="mt-3 space-y-2">
                {plan.areaLinks.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={l.url}
                      className="text-sm font-medium text-ink underline underline-offset-4 transition-colors hover:text-stone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
                    >
                      {l.name}, NY
                    </Link>
                    {counts[l.slug] !== undefined && (
                      <span className="ml-2 text-xs text-stone">{counts[l.slug].toLocaleString("en-US")} active homes</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                {plan.areaLinks.length === 1 ? (
                  <>
                    {plan.areaLinks[0].name}, NY
                    {counts[plan.areaLinks[0].slug] !== undefined && (
                      <> · {counts[plan.areaLinks[0].slug].toLocaleString("en-US")} active homes</>
                    )}
                  </>
                ) : (
                  "Across the Hudson Valley and NYC."
                )}
              </p>
            )}
            <Link
              href={plan.searchUrl}
              className="mt-4 inline-block rounded-xl bg-ink px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-paper transition-colors hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
            >
              See matching homes
            </Link>
            {plan.showHomeValue && (
              <Link
                href="/home-value"
                className="ml-3 mt-4 inline-block rounded-xl border-2 border-ink px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
              >
                Value my home
              </Link>
            )}
          </div>
        </div>

        <SendPlan answers={answers} plan={plan} />
      </div>
    </section>
  );
}

/** The optional hand-off. Everything above works without it; consent is strict, unchecked,
 * and the exact wording stored is the LEAD-CONSENT-CONTRACT's. */
function SendPlan({ answers, plan }: { answers: QuizAnswers; plan: ReturnType<typeof planFor> }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setState("sending");
    const qualifier: Record<string, string> = { searchUrl: plan.searchUrl };
    if (answers.path) qualifier.path = answers.path;
    if (answers.timeline) qualifier.timeline = answers.timeline;
    if (answers.monthly) qualifier.monthlyBudget = String(answers.monthly);
    if (plan.ceiling) qualifier.priceCeiling = String(plan.ceiling.price);
    if (answers.preapproval) qualifier.preapproval = answers.preapproval;
    if (answers.areas?.length) qualifier.areas = answers.areas.join(", ");
    if (answers.homeType) qualifier.homeType = answers.homeType;
    if (answers.mustHaves?.length) qualifier.mustHaves = answers.mustHaves.join(", ");
    const body = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      source: "/plan#quiz",
      interestReason:
        answers.path === "selling" ? INTEREST_REASONS[1] : answers.path === "both" ? INTEREST_REASONS[2] : INTEREST_REASONS[0],
      qualifier,
      consentToContact: fd.get("consentToContact") ?? undefined,
      rlt_hp: String(fd.get("rlt_hp") ?? ""),
    };
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <p role="status" className="mt-8 max-w-xl rounded-2xl border border-line-strong bg-mist p-5 text-sm text-ink">
        Plan sent. We will follow up with homes that match it, and this page stays yours to
        keep using in the meantime.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone">Optional</p>
      <h3 className="t-h3 mt-2 text-ink">Want this plan and matching homes sent to you?</h3>
      <p className="mt-2 text-sm text-ink-soft">
        Skip this and everything above stays right here — nothing you answered leaves the page.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <input
          name="name"
          autoComplete="name"
          placeholder="Name"
          aria-label="Name"
          required
          className="rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river"
        />
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          aria-label="Email"
          required
          className="rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river"
        />
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="Phone (optional)"
          aria-label="Phone, optional"
          className="rounded-xl border border-line-strong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-stone focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-river"
        />
      </div>
      <input type="text" name="rlt_hp" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="mt-3">
        <ConsentCheckbox />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-xl bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river"
        >
          {state === "sending" ? "Sending…" : "Send my plan"}
        </button>
        {state === "error" && (
          <p role="alert" className="text-sm text-ink">
            That did not go through. Try again, or call {SITE.phone}.
          </p>
        )}
      </div>
    </form>
  );
}
