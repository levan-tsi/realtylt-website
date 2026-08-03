"use client";

import { useId, useState } from "react";
import type { CalcFactor, CalcFormat, CalcInput, CalcStep } from "@/lib/blog/flagship";

/** PRIMITIVE — the stake, in the reader's own numbers.
 *
 * Generalised out of LeadsCalculator the way StatBars was generalised out of ResponseCurve.
 * Everything a topic can vary is a prop: the controls, the arithmetic, which row is the big
 * number, and whether the answer is money or hours.
 *
 * THE ARITHMETIC IS THE DESIGN. The running total starts at 1 and every step multiplies it, and
 * every step is a row on screen with its multiplier written beside it. That is not decoration:
 * an earlier draft of the chat model multiplied every missed INQUIRY by a full commission, so
 * 192 missed inquiries read as 192 lost closings. A chain you can read top to bottom makes that
 * class of overstatement visible instead of remembered, and it means the ladder can never
 * disagree with the number above it, because they are the same computation.
 *
 * Give-give-give: the whole result is on screen, no email wall, no gated PDF.
 *
 * The unit is the topic's choice. Owner, 2026-08-02: "it should not be always exactly the dollar
 * amount... we can show how much time they would save and they can calculate themselves with
 * hourly $ value." So `format: "hours"` is a first-class answer, not a fallback.
 */

const fmt = (v: number, format: CalcFormat) => {
  if (format === "money") return "$" + Math.round(v).toLocaleString("en-US");
  if (format === "percent") return `${Math.round(v)}%`;
  // One decimal below ten, because a funnel that narrows to 9.6 closings should not round up to
  // a round 10 on the way to the money. Above ten the decimal is noise.
  if (v > 0 && v < 10) return String(Math.round(v * 10) / 10);
  return Math.round(v).toLocaleString("en-US");
};

export function Calculator({
  eyebrow,
  heading,
  inputs,
  chain,
  headline,
  resultLabel,
  note,
  action,
  ariaLabel,
}: {
  eyebrow: string;
  heading: string;
  inputs: CalcInput[];
  chain: CalcStep[];
  headline: number;
  resultLabel: string;
  note: string;
  action?: { label: string; href: string };
  ariaLabel: string;
}) {
  const uid = useId();
  const [state, setState] = useState<Record<string, number>>(() =>
    Object.fromEntries(inputs.map((i) => [i.id, i.kind === "range" ? i.initial : i.initial])),
  );

  const byId = Object.fromEntries(inputs.map((i) => [i.id, i]));

  /** A control's current multiplier: the number itself for a slider, the selected option's
   * value for a choice. */
  const multiplier = (id: string) => {
    const input = byId[id];
    if (!input) return 1;
    if (input.kind !== "range") return input.options[state[id]]?.value ?? 1;
    // A share reads as 40% and multiplies as 0.40. Doing that here rather than in the content
    // file means a topic cannot write 40 where it meant 0.4.
    return input.format === "percent" ? state[id] / 100 : state[id];
  };

  /** How a multiplier reads in the ladder. A rate says itself; a control says whose number it
   * is, because "your $6,000" and "5% close rate" are two different kinds of claim and the
   * reader is entitled to see which is which. */
  const factorText = (f: CalcFactor) => {
    if (f.from === "rate") return f.display;
    const input = byId[f.id];
    if (!input) return "";
    return input.kind === "range"
      ? `your ${fmt(state[f.id], input.format)}`
      : input.options[state[f.id]].display;
  };

  let running = 1;
  const rows = chain.map((step) => {
    running *= step.by.from === "rate" ? step.by.value : multiplier(step.by.id);
    return { step, value: running, factor: factorText(step.by) };
  });
  const result = rows[headline] ?? rows[rows.length - 1];

  return (
    <section className="bg-mist py-24 md:py-36" aria-label={ariaLabel} data-calculator>
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">{eyebrow}</p>
        <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.3] tracking-[-0.01em] text-ink md:text-[34px]">
          {heading}
        </h2>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-2 lg:gap-16">
          {/* ── Controls */}
          <div>
            {inputs.map((input, i) => {
              const id = `${uid}-${input.id}`;
              return (
                <div key={input.id} className={i === 0 ? "" : "mt-10"}>
                  {input.kind === "range" ? (
                    <>
                      <label htmlFor={id} className="block text-sm font-bold text-ink-soft">
                        {input.label}
                      </label>
                      {input.hint ? <p className="mt-1 text-sm text-stone">{input.hint}</p> : null}
                      <div className="mt-5 flex items-baseline gap-5">
                        {/* Fixed width so the track never shifts as the number grows, sized for
                            the widest value the range can produce rather than the default. */}
                        <span
                          className={`${input.width} shrink-0 text-3xl font-light tabular-nums tracking-[-0.02em] text-ink md:text-4xl`}
                        >
                          {fmt(state[input.id], input.format)}
                        </span>
                        <input
                          id={id}
                          type="range"
                          min={input.min}
                          max={input.max}
                          step={input.step}
                          value={state[input.id]}
                          onChange={(e) =>
                            setState((s) => ({ ...s, [input.id]: Number(e.target.value) }))
                          }
                          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#dfe4ea] accent-porchlight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-river"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <p id={id} className="text-sm font-bold text-ink-soft">
                        {input.label}
                      </p>
                      {input.hint ? <p className="mt-1 text-sm text-stone">{input.hint}</p> : null}
                      <div role="group" aria-labelledby={id} className="mt-3 flex flex-col gap-2">
                        {input.options.map((o, oi) => {
                          const on = state[input.id] === oi;
                          return (
                            <button
                              key={o.label}
                              type="button"
                              onClick={() => setState((s) => ({ ...s, [input.id]: oi }))}
                              aria-pressed={on}
                              className={`flex items-center justify-between gap-4 rounded-[10px] border px-4 py-3 text-left transition-colors duration-200 ${
                                on
                                  ? "border-porchlight bg-porchlight/[0.07]"
                                  : "border-[#dfe4ea] bg-paper hover:border-ink/25"
                              }`}
                            >
                              <span
                                className={`text-sm font-bold ${on ? "text-ink" : "text-ink-soft"}`}
                              >
                                {o.label}
                              </span>
                              <span className="shrink-0 text-xs text-stone">{o.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Result. Dark panel with the house top-edge light catch. */}
          <div
            className="flex flex-col justify-center rounded-[18px] bg-ink p-8 text-paper sm:p-10"
            style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.07)" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/55">
              {resultLabel}
            </p>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-3 text-5xl font-light leading-none tracking-[-0.03em] tabular-nums md:text-6xl">
              {fmt(result.value, result.step.format)}
              <span className="text-base font-normal tracking-normal text-paper/55">
                {result.step.unit}
              </span>
            </p>
            <span aria-hidden className="mt-7 block h-[2px] w-12 rounded-full bg-porchlight" />

            {/* The ladder. Every multiplier that produced the number above, in order. */}
            <dl className="mt-7">
              {rows.map((r, i) => {
                const lit = i === headline;
                return (
                  <div
                    key={r.step.label}
                    className={`flex items-baseline justify-between gap-4 border-t border-paper/10 py-3 ${
                      i === 0 ? "border-t-0 pt-0" : ""
                    }`}
                  >
                    <dt className="text-sm leading-snug text-paper/70">
                      {r.step.label}
                      <span className="mt-0.5 block text-xs text-paper/40">{r.factor}</span>
                    </dt>
                    <dd
                      className={`shrink-0 text-right tabular-nums ${
                        lit ? "font-bold text-porchlight" : "text-paper/85"
                      }`}
                    >
                      {fmt(r.value, r.step.format)}
                      <span className="ml-1.5 text-xs font-normal text-paper/40">
                        {r.step.unit}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>

            {action ? (
              <a
                href={action.href}
                className="mt-9 inline-flex w-fit items-center rounded-[10px] bg-paper px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors duration-200 hover:bg-mist"
              >
                {action.label}
              </a>
            ) : null}
          </div>
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-stone">{note}</p>
      </div>
    </section>
  );
}
