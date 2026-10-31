import type { SceneSource, TimelineEvent } from "@/lib/blog/flagship";
import { ACCENT, FigureFrame, tone } from "./Figure";

/** PRIMITIVE: dated events on a vertical axis spaced by the real calendar.
 *
 * Vertical because a phone is tall: a horizontal timeline either shrinks its dates past reading
 * size or scrolls sideways. The spacing is the true distance between dates, so a long quiet
 * stretch looks long. The height is derived, not chosen: the closest pair of events gets at
 * least MIN_GAP pixels, and everything else keeps its true proportion to that pair. A pending
 * event (a bill, not a law) is a hollow ring. Year marks sit on the axis at 1 January. */

const MIN_GAP = 128;
const DAY = 86_400_000;

export function Timeline({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  events,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  events: TimelineEvent[];
}) {
  const dark = band === "dark";
  const t = tone(dark);
  const times = events.map((e) => Date.parse(e.date));
  const t0 = times[0];
  const span = times[times.length - 1] - t0 || DAY;
  const minDelta = Math.min(...times.slice(1).map((v, i) => v - times[i]));
  const height = Math.ceil((MIN_GAP * span) / Math.max(minDelta, DAY));
  const y = (v: number) => ((v - t0) / span) * height;

  const years: number[] = [];
  for (let yr = new Date(t0).getUTCFullYear() + 1; Date.UTC(yr, 0, 1) < t0 + span; yr++) years.push(yr);

  return (
    <FigureFrame {...{ band, eyebrow, heading, lede, alt, sources, note }}>
      <div className="relative max-w-2xl" style={{ height: height + 96 }}>
        <span
          aria-hidden
          className="absolute bottom-24 top-0 w-px"
          style={{ left: "2.75rem", background: dark ? "rgba(255,255,255,0.18)" : "var(--color-line-strong)" }}
        />
        {years.map((yr) => (
          <span
            key={yr}
            aria-hidden
            className={`absolute left-0 -translate-y-1/2 text-[12px] font-bold tracking-[0.08em] ${t.muted}`}
            style={{ top: y(Date.UTC(yr, 0, 1)) }}
          >
            {yr}
          </span>
        ))}
        <ol className="m-0 list-none p-0">
          {events.map((e, i) => (
            <li key={e.display} className="absolute right-0" style={{ top: y(times[i]), left: "4rem" }}>
              <span
                aria-hidden
                className="absolute top-[0.35rem] h-3.5 w-3.5 rounded-full"
                style={{
                  left: "calc(-1.25rem - 7px)",
                  background: e.pending ? t.ground : ACCENT,
                  boxShadow: e.pending ? `inset 0 0 0 2px ${ACCENT}` : undefined,
                }}
              />
              <p className={`text-sm font-bold ${e.pending ? t.muted : dark ? "text-porchlight" : "text-porchlight-deep"}`}>
                {e.display}
              </p>
              <p className={`mt-1.5 text-[17px] leading-snug md:text-lg ${t.strong}`}>{e.title}</p>
              {e.detail && <p className={`mt-1 text-[15px] leading-snug ${t.muted}`}>{e.detail}</p>}
            </li>
          ))}
        </ol>
      </div>
    </FigureFrame>
  );
}
