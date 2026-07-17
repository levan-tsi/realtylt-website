"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FIRST_STEP,
  STEP_ANSWER_KEY,
  nextStep,
  type WizardAnswers,
  type WizardStepId,
} from "@/lib/selling-wizard";
import { INTEREST_REASONS, SITE } from "@/lib/site";

/** Identity captured by the lead form that opened the wizard — lets the follow-up POST
 * attach the qualifying answers to the same person and prefill /home-value. */
export interface WizardPrefill {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  source?: string;
}

const WizardContext = createContext<{ openWizard: (p: WizardPrefill) => void }>({
  openWizard: () => {},
});

/** Any LeadForm calls this on a successful submit. Off the allow-listed pages it is a
 * no-op, so the form behaves exactly as before everywhere else. */
export function useQualifyingWizard() {
  return useContext(WizardContext);
}

/** Pages where a successful lead submit opens the qualifying wizard. Live realtylt.com
 * attaches this popup to every lead form site-wide; we enable it deliberately, page by
 * page, so the copy stays appropriate. Any page not listed here gets the plain form. */
const WIZARD_PATHS = new Set(["/selling", "/financing"]);

/** Mounted once in the root layout (wraps <main> and <Footer> so both the hero form and
 * the footer form can trigger it). The modal only opens on the allow-listed pages. */
export function QualifyingWizardProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [prefill, setPrefill] = useState<WizardPrefill | null>(null);

  const openWizard = useCallback(
    (p: WizardPrefill) => {
      if (WIZARD_PATHS.has(pathname)) setPrefill(p);
    },
    [pathname],
  );

  return (
    <WizardContext.Provider value={{ openWizard }}>
      {children}
      {prefill && <QualifyingWizard prefill={prefill} onClose={() => setPrefill(null)} />}
    </WizardContext.Provider>
  );
}

// ── Step presentation (the flow itself lives in lib/selling-wizard.ts) ──────────────

const ICON = {
  home: (
    <path d="M3 11.5 12 4l9 7.5M5 10v9h5v-5h4v5h5v-9" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  doc: (
    <>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M9.5 12h6M9.5 15.5h6" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="1.5" />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
} as const;

type StepUI = {
  icon: keyof typeof ICON;
  eyebrow: string;
  question: string;
  kind: "options" | "textarea" | "message";
  options?: string[];
};

const STEP_UI: Record<WizardStepId, StepUI> = {
  intent: {
    icon: "home",
    eyebrow: "One quick thing",
    question: "Are you buying or selling a home?",
    kind: "options",
    options: ["Buying", "Selling", "Both"],
  },
  buyTimeline: {
    icon: "search",
    eyebrow: "Timing",
    question: "When are you planning to buy a new home?",
    kind: "options",
    options: ["1-3 months", "3-6 months", "6+ months"],
  },
  mortgage: {
    icon: "doc",
    eyebrow: "Financing",
    question: "Are you pre-approved for a mortgage?",
    kind: "options",
    options: ["Yes", "No", "Using cash"],
  },
  consult: {
    icon: "home",
    eyebrow: "Next step",
    question: "Would you like to schedule a consultation now?",
    kind: "options",
    options: ["Yes", "No"],
  },
  sellTimeline: {
    icon: "search",
    eyebrow: "Timing",
    question: "When are you planning to sell your home?",
    kind: "options",
    options: ["1-3 months", "3-6 months", "6+ months"],
  },
  consultOrValue: {
    icon: "home",
    eyebrow: "Your choice",
    question: "Schedule a consultation, or see your home value?",
    kind: "options",
    options: ["Schedule Consultation", "My Home Value"],
  },
  scheduleConsult: {
    icon: "calendar",
    eyebrow: "Almost there",
    question: "When would you like us to call?",
    kind: "textarea",
  },
  confirm: { icon: "check", eyebrow: "", question: "", kind: "message" },
};

const PROGRESS: Record<WizardStepId, number> = {
  intent: 0.16,
  buyTimeline: 0.42,
  sellTimeline: 0.42,
  mortgage: 0.62,
  consultOrValue: 0.62,
  consult: 0.82,
  scheduleConsult: 0.9,
  confirm: 1,
};

function reasonFor(intent?: WizardAnswers["intent"]): string {
  if (intent === "Buying") return INTEREST_REASONS[0];
  if (intent === "Selling") return INTEREST_REASONS[1];
  if (intent === "Both") return INTEREST_REASONS[2];
  return INTEREST_REASONS[1];
}

/** Map the typed answers to the flat string record the API stores. */
function buildQualifier(a: WizardAnswers): Record<string, string> {
  const q: Record<string, string> = {};
  if (a.intent) q.intent = a.intent;
  if (a.buyTimeline) q.buyTimeline = a.buyTimeline;
  if (a.mortgage) q.mortgage = a.mortgage;
  if (a.sellTimeline) q.sellTimeline = a.sellTimeline;
  if (a.consult) q.consult = a.consult;
  if (a.consultOrValue) q.choice = a.consultOrValue;
  if (a.callTimes) q.callTimes = a.callTimes;
  return q;
}

function QualifyingWizard({
  prefill,
  onClose,
}: {
  prefill: WizardPrefill;
  onClose: () => void;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<WizardStepId>(FIRST_STEP);
  const [history, setHistory] = useState<WizardStepId[]>([]);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [callTimes, setCallTimes] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const submittedRef = useRef(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Fire the qualifier follow-up POST once, when the flow reaches a terminal point.
  const submitQualifier = useCallback(
    (a: WizardAnswers) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const body = {
        name: prefill.name,
        email: prefill.email,
        phone: prefill.phone,
        address: prefill.address,
        source: prefill.source ?? "/selling",
        interestReason: reasonFor(a.intent),
        qualifier: buildQualifier(a),
        rlt_hp: "",
      };
      // Best-effort — the primary lead is already saved; never block the UI on this.
      void fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch(() => {});
    },
    [prefill],
  );

  const advance = useCallback(
    (stepId: WizardStepId, value: string) => {
      const key = STEP_ANSWER_KEY[stepId];
      const newAnswers = key ? { ...answers, [key]: value } : answers;
      setAnswers(newAnswers);

      const res = nextStep(stepId, newAnswers);
      if (res.type === "navigate") {
        submitQualifier(newAnswers);
        const q = prefill.address ? `?address=${encodeURIComponent(prefill.address)}` : "";
        router.push(`/home-value${q}`);
        onClose();
        return;
      }
      if (res.type === "done") {
        onClose();
        return;
      }
      if (res.step === "confirm") submitQualifier(newAnswers);
      setHistory((h) => [...h, stepId]);
      setCurrent(res.step);
    },
    [answers, onClose, prefill.address, router, submitQualifier],
  );

  const goBack = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const copy = [...h];
      const prev = copy.pop()!;
      setCurrent(prev);
      return copy;
    });
  }, []);

  // Open: remember focus + lock body scroll. Close: restore both.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      // The trigger (a submit button) is usually replaced by the form's success message by
      // the time we close, so it's detached. Fall back to that live region so the outcome
      // is announced, then the body.
      const trigger = restoreFocusRef.current;
      if (trigger?.isConnected) {
        trigger.focus();
      } else {
        const status = document.querySelector<HTMLElement>('[role="status"]');
        (status ?? document.body).focus?.();
      }
    };
  }, []);

  // Move focus to the step heading whenever the step changes (screen-reader announces it).
  useEffect(() => {
    titleRef.current?.focus();
  }, [current]);

  // Esc closes; Tab is trapped inside the panel.
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
        'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  const ui = STEP_UI[current];
  const canGoBack = history.length > 0 && current !== "confirm";
  const scheduled = Boolean(answers.callTimes);
  // Sellers (and both-track) get the comps/cash-offer promise; a pure buyer — the common
  // case on /financing — gets lender-focused wording instead of seller jargon.
  const isSeller = answers.intent === "Selling" || answers.intent === "Both";
  const confirmBody = scheduled
    ? isSeller
      ? "We'll call you at the times you shared. In the meantime, expect your comps and cash-offer numbers within the day."
      : "We'll call you at the times you shared. In the meantime, we'll line up the right lender and your next steps."
    : isSeller
      ? "We've got your details and we'll be in touch shortly with your comps and cash-offer numbers, usually within the day."
      : "We've got your details and we'll be in touch shortly to connect you with the right lender, usually within the day.";

  return (
    <div
      className="rlt-fade-in fixed inset-0 z-[1000000] flex items-end justify-center bg-ink/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rlt-wizard-title"
        onKeyDown={onKeyDown}
        className="rlt-pop-in relative w-full max-w-md overflow-hidden rounded-[6px] bg-paper text-ink shadow-2xl"
      >
        {/* progress rail */}
        <div className="h-1 w-full bg-mist" aria-hidden>
          <div
            className="h-full bg-porchlight transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(PROGRESS[current] * 100)}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-3 grid h-11 w-11 place-items-center text-stone transition-colors hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="px-6 pb-7 pt-6 sm:px-8">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-porchlight/10 text-porchlight-deep">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              {ICON[ui.icon]}
            </svg>
          </span>

          {ui.eyebrow && (
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-stone">
              {ui.eyebrow}
            </p>
          )}

          {ui.kind === "message" ? (
            <>
              <h2
                id="rlt-wizard-title"
                ref={titleRef}
                tabIndex={-1}
                className="mt-2 text-2xl font-light leading-snug text-ink outline-none"
              >
                Thank you{prefill.name ? `, ${prefill.name.split(" ")[0]}` : ""}.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone">{confirmBody}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft"
                >
                  Done
                </button>
                <a
                  href={SITE.phoneHref}
                  className="text-sm font-bold text-porchlight-deep underline-offset-4 hover:underline"
                >
                  Or call {SITE.phone}
                </a>
              </div>
            </>
          ) : (
            <h2
              id="rlt-wizard-title"
              ref={titleRef}
              tabIndex={-1}
              className="mt-2 text-2xl font-light leading-snug text-ink outline-none"
            >
              {ui.question}
            </h2>
          )}

          {ui.kind === "options" && (
            <div className="mt-6 grid gap-2.5">
              {ui.options!.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => advance(current, opt)}
                  className="group flex min-h-12 w-full items-center justify-between rounded-[4px] border border-[#d7dbe0] px-4 py-3 text-left text-[15px] font-medium text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper focus-visible:border-ink"
                >
                  <span>{opt}</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-stone transition-colors group-hover:text-paper"
                    aria-hidden
                  >
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {ui.kind === "textarea" && (
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                advance("scheduleConsult", callTimes.trim() || "No preference given");
              }}
            >
              <label htmlFor="rlt-call-times" className="sr-only">
                What times work for you?
              </label>
              <textarea
                id="rlt-call-times"
                value={callTimes}
                onChange={(e) => setCallTimes(e.target.value)}
                rows={3}
                placeholder="e.g. weekday evenings, or Saturday morning"
                className="min-h-24 w-full resize-y rounded-[4px] border border-[#cccccc] bg-white px-3.5 py-3 text-sm text-ink-soft transition-colors placeholder:text-stone focus:border-ink/50 focus:outline-none focus:ring-1 focus:ring-ink/40"
              />
              <button
                type="submit"
                className="mt-4 rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft"
              >
                Request My Call
              </button>
            </form>
          )}

          {canGoBack && (
            <button
              type="button"
              onClick={goBack}
              className="mt-6 inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-stone transition-colors hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 6-6 6 6 6" />
              </svg>
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
