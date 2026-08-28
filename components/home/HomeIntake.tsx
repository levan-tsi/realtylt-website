"use client";

import { useEffect, useRef, useState } from "react";
import { LeadForm } from "@/components/leads/LeadForm";
import { PRESS } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  answer,
  buildQualifier,
  INTENT_OPTIONS,
  INTENT_QUESTION,
  nextStep,
  prevStep,
  progress,
  QUESTIONS,
  reasonFor,
  trail,
  type IntakeAnswers,
  type IntakeQuestion,
  type IntakeStepId,
} from "@/lib/home-intake";

/** THE HOME-PAGE INTAKE (owner-directed, 2026-08-28).
 *
 * What was here: "Tell Us About Your Home", a six-field form in a panel beside two paragraphs of
 * seller copy, and then the same form again in the footer. His words: the same feeling twice;
 * make the first one like the /plan or wizard pop-up, but on the page, "starting to ask one
 * question, are you looking to buy or sell or both", a few more that matter, then the form.
 *
 * THE SHAPE. Two columns, as before, but the columns now have different jobs. The right is the
 * panel that asks: one question at a time, full-width answer rows, a thin progress rule, Back.
 * The left is what the page already says about itself PLUS a trail of what the visitor has told
 * us, one quiet line per answer with a way to change it. The trail is the point: a pop-up
 * throws the answers away the moment it closes, and a page can keep them in view, so by the
 * last step the form is asking for a name against a visible record of a real conversation.
 *
 * It is not a modal. Nothing traps focus, nothing locks scroll, Escape does nothing, and the
 * section is exactly where it was (id="value", the scroll cue's target). With JavaScript off the
 * three intent tiles are links to /buying and /selling, so the section still leads somewhere.
 *
 * The flow lives in lib/home-intake.ts; this file only renders it. The details step is the
 * site's one LeadForm with the answers attached as `qualifier`, so the CRM's contact card reads
 * them the way it reads the wizard's, and the submit ends on /thank-you like every conversion. */
export function HomeIntake() {
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [step, setStep] = useState<IntakeStepId>("intent");
  // Which step the visitor arrived FROM, so the panel can announce the change to a screen
  // reader by moving focus to the new question, and skip that on first paint.
  const arrived = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!arrived.current) {
      arrived.current = true;
      return;
    }
    // Focus the question, not the panel: the question is what changed. preventScroll because
    // the panel is already in view (the visitor just clicked inside it) and a scroll jump on
    // every answer would read as the page lurching.
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  const choose = (key: keyof IntakeAnswers, value: string) => {
    const next = answer(answers, key, value);
    setAnswers(next);
    setStep(nextStep(step, next) ?? "details");
  };

  const back = prevStep(step, answers);
  const { index, total, fraction } = progress(step, answers);
  const lines = trail(answers);
  const question = step !== "intent" && step !== "details" ? QUESTIONS[step as IntakeQuestion["id"]] : null;

  return (
    <div className="mx-auto grid max-w-[1250px] gap-12 px-4 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:items-start lg:gap-16 lg:px-8">
      <Reveal>
        <SectionHeading as="h2" eyebrow="Start here">
          <span id="value-heading">Tell us what you&rsquo;re planning.</span>
        </SectionHeading>
        {/* The same setting decisions as the copy this replaced (round 11: lead-in a shade
            darker, ~62ch measure, spaced paragraphs) and the same writing rules (round 36:
            plain verbs, claims the site makes elsewhere, no superlatives, no em dashes). */}
        <p className="mt-7 max-w-md leading-[1.7] text-ink-soft">
          A few quick questions, then how to reach you. A person reads every answer and comes
          back with something specific, not a newsletter.
        </p>
        <p className="mt-5 max-w-md leading-[1.7] text-stone">
          Selling gets real comps and a number. Buying gets homes that fit and a plan for the
          money. Either way, someone answers seven days a week.
        </p>
      </Reveal>

      {/* THE TRAIL. A grid child of its own so it can sit in two different places: under the
          copy in the left column from lg (col 1, row 2), and BELOW the panel on a phone. Stacked
          above the panel it grew by a row on every answer and pushed the question down under the
          visitor's thumb; below it, the panel's top stays put and the record accrues underneath.
          Rendered only once there is something to show; an empty labelled list would be a
          promise the section has not earned yet. aria-live polite so a screen reader hears each
          answer land without the focus leaving the panel. */}
      <div aria-live="polite" className="order-last empty:hidden lg:order-none lg:col-start-1 lg:row-start-2">
        {lines.length > 0 && (
            <div className="rlt-pop-in -mt-4 max-w-md border-t border-line pt-6 lg:mt-0">
              <p className="t-eyebrow text-stone">What you&rsquo;ve told us</p>
              <dl className="mt-4">
                {lines.map((l) => (
                  <div
                    key={l.step}
                    className="grid grid-cols-[6.5rem_1fr_auto] items-baseline gap-x-4 border-b border-line py-2.5 text-sm"
                  >
                    <dt className="text-stone">{l.label}</dt>
                    <dd className="font-medium text-ink">{l.value}</dd>
                    <dd>
                      <button
                        type="button"
                        onClick={() => setStep(l.step)}
                        aria-label={`Change: ${l.label}, ${l.value}`}
                        className={`inline-flex min-h-6 items-center text-xs font-bold uppercase tracking-[0.14em] text-stone underline-offset-4 hover:text-ink hover:underline ${PRESS}`}
                      >
                        Change
                      </button>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
      </div>

      <Reveal delay={140} className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
        {/* The panel keeps the 24px large-feature step and the mist ground the form had; only
            what is inside it changed. overflow-hidden so the progress rule's ends follow the
            corners. */}
        <div className="overflow-hidden rounded-3xl border border-line bg-mist">
          {/* Progress rule: the wizard's own device, here in the panel's top edge. It says
              "this is a short sequence and you are here" without a numbered ladder. */}
          <div className="h-1 w-full bg-line/70" aria-hidden>
            <div
              className="h-full bg-porchlight transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${Math.round(fraction * 100)}%` }}
            />
          </div>

          {/* keyed on the step so the pop-in runs once per change, not on every render. */}
          <div key={step} className="rlt-pop-in p-6 md:p-8 lg:p-10">
            <p className="t-eyebrow text-stone">
              {step === "details" ? "Last step" : `Question ${index + 1}${answers.intent ? ` of ${total}` : ""}`}
            </p>
            <h3 ref={titleRef} tabIndex={-1} className="t-h3 mt-3 text-ink outline-none">
              {step === "intent" ? INTENT_QUESTION : step === "details" ? "Where should we send it?" : question!.question}
            </h3>

            {step === "intent" && (
              <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
                {INTENT_OPTIONS.map((o) => {
                  const selected = answers.intent === o.value;
                  return (
                    /* Anchors, not buttons: with JavaScript off they are the three most useful
                       links on the page. With it on, the click is the answer. */
                    <a
                      key={o.value}
                      href={o.href}
                      aria-pressed={selected}
                      onClick={(e) => {
                        e.preventDefault();
                        choose("intent", o.value);
                      }}
                      className={`${OPTION} ${selected ? OPTION_ON : OPTION_OFF} justify-center sm:min-h-14`}
                    >
                      {o.label}
                    </a>
                  );
                })}
                {/* One line of small print, on the first question only: what this costs and
                    what does not happen yet. sm:col-span-3 so it runs under all three tiles. */}
                <p className="t-fine mt-2 text-stone sm:col-span-3">
                  About a minute. Nothing is sent until the last step.
                </p>
              </div>
            )}

            {question && (
              <div className="mt-7 grid gap-2.5">
                {question.options.map((opt) => {
                  const selected = answers[question.key] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => choose(question.key, opt)}
                      className={`${OPTION} ${selected ? OPTION_ON : OPTION_OFF} justify-between`}
                    >
                      <span>{opt}</span>
                      {/* A check, drawn, only on the answer already given: the visitor came
                          back to change something and should see what they said. */}
                      {selected && (
                        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m5 12.5 4.5 4.5L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {step === "details" && answers.intent && (
              <>
                <p className="mb-7 mt-3 max-w-md leading-[1.7] text-stone">
                  {answers.intent === "buy"
                    ? "Your name and how to reach you. You’ll hear back with homes that fit, usually within the day."
                    : answers.intent === "sell"
                      ? "Your name, the property address and how to reach you. You’ll hear back with real comps and a number, usually within the day."
                      : "Your name, the property address and how to reach you. We’ll come back with a number for your home and homes that fit, usually within the day."}
                </p>
                {/* Remounted per intent so a seller's address field does not linger for a
                    buyer who changed their mind. The answers ride as `qualifier`; the reason is
                    the hidden interestReason the CRM files the lead under. */}
                <LeadForm
                  key={answers.intent}
                  splitName
                  withAddress={answers.intent !== "buy"}
                  stackAddressRow
                  hideReason
                  defaultReason={reasonFor(answers.intent)}
                  qualifier={buildQualifier(answers)}
                  submitLabel="Send my details"
                  successTitle="Got it. Thanks."
                  successBody="We have what we need and will be in touch shortly."
                />
              </>
            )}

            {back && (
              <button
                type="button"
                onClick={() => setStep(back)}
                className={`mt-6 inline-flex min-h-6 items-center gap-1.5 text-sm font-medium text-stone hover:text-ink ${PRESS}`}
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 6-6 6 6 6" />
                </svg>
                Back
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* The answer rows are the wizard's rows, on the panel's mist ground: bordered paper that fills
   with ink under the cursor, and stays ink once chosen. 12px corners, the control step. The
   hover is gated behind (hover:hover) by Tailwind v4, so a tap cannot leave it stuck on. */
const OPTION =
  `flex min-h-12 w-full items-center rounded-xl border px-4 py-3 text-left text-[15px] font-medium ${PRESS} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`;
const OPTION_OFF = "border-line-strong bg-white text-ink hover:border-ink hover:bg-ink hover:text-paper";
const OPTION_ON = "border-ink bg-ink text-paper";
