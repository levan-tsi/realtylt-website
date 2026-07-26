"use client";

import { useId, useState } from "react";

/** SCENE 3 — the gap, in the reader's own numbers.
 *
 * Give-give-give: the full result is shown freely, no email wall, and every assumption is on
 * screen so it reads as arithmetic rather than a black box.
 *
 * HONESTY NOTES (deliberate departures from the draft this replaces):
 *  - The draft multiplied every lost INQUIRY by a full commission, so 192 missed inquiries a
 *    year read as 192 lost closings. Inquiries are not closings. The chain here is explicit:
 *    inquiries -> conversations you win at your reply speed -> closings at a stated close
 *    rate -> commission. The numbers get smaller and far more defensible.
 *  - Commission is the reader's own input, not a figure we assert on their behalf.
 *  - The draft's "reply in 8 seconds" claim is gone. The post never makes it, and the house
 *    rule is to claim nothing we have not already said elsewhere.
 */

type Speed = "minutes" | "hours" | "nextday";

// Share of inquiries whose conversation you still win at each reply speed, anchored to the
// well-worn "78% close with whoever responds first": answer immediately and you are nearly
// always first; answer the next day and most have been answered elsewhere already.
const WON: Record<Speed, number> = { minutes: 0.9, hours: 0.5, nextday: 0.22 };
const WON_IF_INSTANT = 0.9;

// Of the extra conversations you would have won, the share that becomes a closing. Stated on
// screen. Kept deliberately low: an inquiry is a conversation, not a signed deal.
const CLOSE_RATE = 0.05;

const SPEEDS: { key: Speed; label: string; sub: string }[] = [
  { key: "minutes", label: "Within minutes", sub: "Usually first" },
  { key: "hours", label: "A few hours", sub: "Often second or third" },
  { key: "nextday", label: "The next day", sub: "Usually too late" },
];

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");

export function LeadsCalculator() {
  const [inquiries, setInquiries] = useState(40);
  const [commission, setCommission] = useState(6000);
  const [speed, setSpeed] = useState<Speed>("hours");
  const inqId = useId();
  const comId = useId();

  const missedPerMonth = Math.max(0, Math.round(inquiries * (WON_IF_INSTANT - WON[speed])));
  const missedPerYear = missedPerMonth * 12;
  const closingsPerYear = missedPerYear * CLOSE_RATE;
  const dollarsPerYear = closingsPerYear * commission;

  return (
    <section className="bg-mist py-24 md:py-36" aria-label="What answering late costs">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">In your numbers</p>
        <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.3] tracking-[-0.01em] text-ink md:text-[34px]">
          What is answering late costing you?
        </h2>

        <div className="mt-14 grid gap-10 md:mt-20 lg:grid-cols-2 lg:gap-16">
          {/* ── Controls */}
          <div>
            <label htmlFor={inqId} className="block text-sm font-bold text-ink-soft">
              Inquiries through your site each month
            </label>
            <p className="mt-1 text-sm text-stone">
              Form fills, chat starts, is-this-still-available texts.
            </p>
            <div className="mt-5 flex items-baseline gap-5">
              <span className="w-[4.5rem] shrink-0 text-4xl font-light tabular-nums tracking-[-0.02em] text-ink md:text-5xl">
                {inquiries}
              </span>
              <input
                id={inqId}
                type="range"
                min={5}
                max={200}
                step={5}
                value={inquiries}
                onChange={(e) => setInquiries(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#dfe4ea] accent-porchlight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-river"
              />
            </div>

            <p id={`${inqId}-speed`} className="mt-10 text-sm font-bold text-ink-soft">
              How fast do you reply, honestly?
            </p>
            <div role="group" aria-labelledby={`${inqId}-speed`} className="mt-3 flex flex-col gap-2">
              {SPEEDS.map((s) => {
                const on = speed === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSpeed(s.key)}
                    aria-pressed={on}
                    className={`flex items-center justify-between rounded-[10px] border px-4 py-3 text-left transition-colors duration-200 ${
                      on
                        ? "border-porchlight bg-porchlight/[0.07]"
                        : "border-[#dfe4ea] bg-paper hover:border-ink/25"
                    }`}
                  >
                    <span className={`text-sm font-bold ${on ? "text-ink" : "text-ink-soft"}`}>
                      {s.label}
                    </span>
                    <span className="text-xs text-stone">{s.sub}</span>
                  </button>
                );
              })}
            </div>

            <label htmlFor={comId} className="mt-10 block text-sm font-bold text-ink-soft">
              Your average commission per closed deal
            </label>
            <div className="mt-5 flex items-baseline gap-5">
              <span className="w-[4.5rem] shrink-0 text-2xl font-light tabular-nums tracking-[-0.02em] text-ink md:text-3xl">
                {money(commission)}
              </span>
              <input
                id={comId}
                type="range"
                min={1000}
                max={30000}
                step={500}
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#dfe4ea] accent-porchlight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-river"
              />
            </div>
          </div>

          {/* ── Result. Dark panel with the house top-edge light catch. */}
          <div
            className="flex flex-col justify-center rounded-[18px] bg-ink p-8 text-paper sm:p-10"
            style={{ boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.07)" }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/55">
              Conversations you are handing over
            </p>
            <p className="mt-4 flex items-baseline gap-3 text-6xl font-light leading-none tracking-[-0.03em] tabular-nums md:text-7xl">
              {missedPerMonth}
              <span className="text-base font-normal tracking-normal text-paper/55">a month</span>
            </p>
            <span aria-hidden className="mt-7 block h-[2px] w-12 rounded-full bg-porchlight" />
            <p className="mt-7 leading-[1.75] text-paper/75">
              That is{" "}
              <span className="font-bold text-paper tabular-nums">{missedPerYear} a year</span> going to
              whoever answered first. At a {Math.round(CLOSE_RATE * 100)}% close rate and your{" "}
              {money(commission)} commission, about{" "}
              <span className="font-bold text-porchlight tabular-nums">{money(dollarsPerYear)}</span> a
              year.
            </p>
            <a
              href="/services/ai-chat-assistant"
              className="mt-9 inline-flex w-fit items-center rounded-[10px] bg-paper px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors duration-200 hover:bg-mist"
            >
              See how it is built
            </a>
          </div>
        </div>

        <p className="mt-12 max-w-3xl text-xs leading-relaxed text-stone">
          The arithmetic, shown on purpose: an immediate reply wins roughly 90% of the
          conversations, a few hours wins about half, the next day wins about a fifth, because most
          leads close with whoever responded first. Of the conversations you would have won,{" "}
          {Math.round(CLOSE_RATE * 100)}% is treated as a closing. Move all three to your own numbers.
        </p>
      </div>
    </section>
  );
}
