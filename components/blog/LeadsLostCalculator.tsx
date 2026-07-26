"use client";

import { useState } from "react";

/** An in-article interactive: makes the "78% close with whoever responds first" stat personal.
 *
 * Give-give-give by design — it shows the full result freely (no email wall), then offers the
 * next step. It is also the first "scene" built to be screenshot for a carousel or screen-recorded
 * for a video: one clean, self-contained frame with a single big number.
 *
 * The model is deliberately simple and stated in plain words on screen, so it reads as honest
 * arithmetic rather than a black box: of the inquiries that come in, the share you can still win
 * depends on how fast you answer, because most go to whoever replied first. */

type Speed = "minutes" | "hours" | "nextday";

// Share of inquiries you can still convert at each response speed. Anchored to the well-worn
// "78% close with whoever responds first": reply instantly and you are almost always first;
// reply the next day and most have already been answered elsewhere.
const WINRATE: Record<Speed, number> = { minutes: 0.9, hours: 0.5, nextday: 0.22 };
const INSTANT_WINRATE = 0.9; // an 8-second reply ≈ always first

// A conservative, transparent NY placeholder: expected commission per closed lead. Shown on
// screen and easy to reason about; the point is the gap, not a precise dollar.
const VALUE_PER_LEAD = 3000;

const SPEEDS: { key: Speed; label: string; sub: string }[] = [
  { key: "minutes", label: "Within minutes", sub: "You're usually first" },
  { key: "hours", label: "A few hours", sub: "Often second or third" },
  { key: "nextday", label: "The next day", sub: "Usually too late" },
];

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function LeadsLostCalculator() {
  const [inquiries, setInquiries] = useState(40);
  const [speed, setSpeed] = useState<Speed>("hours");

  const winNow = Math.round(inquiries * WINRATE[speed]);
  const winInstant = Math.round(inquiries * INSTANT_WINRATE);
  const lostPerMonth = Math.max(0, winInstant - winNow);
  const lostPerYear = lostPerMonth * 12;
  const dollarsPerYear = lostPerYear * VALUE_PER_LEAD;

  return (
    <div className="not-prose my-14 overflow-hidden rounded-3xl border border-[#e3e6ea] bg-white">
      {/* header */}
      <div className="border-b border-[#eef0f3] px-6 py-5 sm:px-9 sm:py-6">
        <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-stone">
          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-porchlight" />
          The gap, in your numbers
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug text-ink md:text-2xl">
          What is answering late costing you?
        </h3>
      </div>

      {/* controls */}
      <div className="grid gap-8 px-6 py-7 sm:px-9 sm:py-9 lg:grid-cols-2 lg:gap-14">
        <div>
          <label htmlFor="calc-inq" className="block text-sm font-bold text-ink-soft">
            Inquiries through your site each month
          </label>
          <p className="mt-1 text-sm text-stone">Form fills, chat starts, "is this still available?" texts.</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="w-16 text-4xl font-semibold tabular-nums tracking-tight text-ink md:text-5xl">
              {inquiries}
            </span>
            <input
              id="calc-inq"
              type="range"
              min={5}
              max={200}
              step={5}
              value={inquiries}
              onChange={(e) => setInquiries(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#e3e6ea] accent-porchlight"
              aria-valuetext={`${inquiries} inquiries a month`}
            />
          </div>

          <p className="mt-8 block text-sm font-bold text-ink-soft">How fast do you reply, honestly?</p>
          <div className="mt-3 flex flex-col gap-2">
            {SPEEDS.map((s) => {
              const on = speed === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSpeed(s.key)}
                  aria-pressed={on}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                    on
                      ? "border-porchlight bg-porchlight/[0.06] shadow-[0_10px_26px_-16px_rgb(40_168_224/0.6)]"
                      : "border-[#e3e6ea] hover:border-ink/25"
                  }`}
                >
                  <span className={`text-sm font-bold ${on ? "text-ink" : "text-ink-soft"}`}>{s.label}</span>
                  <span className="text-xs text-stone">{s.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* result */}
        <div className="flex flex-col justify-center rounded-2xl bg-ink p-7 text-paper sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/55">
            Leads you're likely losing
          </p>
          <p className="mt-3 text-6xl font-semibold leading-none tracking-tight text-paper md:text-7xl">
            {fmt(lostPerMonth)}
            <span className="ml-2 align-baseline text-lg font-normal text-paper/55">/ month</span>
          </p>
          <span aria-hidden className="mt-5 block h-[3px] w-12 rounded-full bg-porchlight" />
          <p className="mt-5 leading-relaxed text-paper/75">
            That's about <span className="font-bold text-paper">{fmt(lostPerYear)} inquiries a year</span> going
            to whoever answered first. At a conservative {"$"}
            {fmt(VALUE_PER_LEAD)} per closed lead, roughly{" "}
            <span className="font-bold text-porchlight">${fmt(dollarsPerYear)}</span> walking out the door.
          </p>
          <a
            href="/services/ai-chat-assistant"
            className="mt-7 inline-flex w-fit items-center justify-center rounded-xl bg-paper px-6 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-mist"
          >
            Close the gap in 8 seconds
          </a>
        </div>
      </div>

      <p className="border-t border-[#eef0f3] px-6 py-4 text-xs leading-relaxed text-stone sm:px-9">
        Simple math, shown on purpose: of your monthly inquiries, an instant reply keeps ~90%, while a
        next-day reply keeps ~22%, because most close with whoever responded first. Move the numbers to
        your own.
      </p>
    </div>
  );
}
