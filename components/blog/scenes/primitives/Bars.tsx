import type { BarPanel, SceneSource } from "@/lib/blog/flagship";
import { Bar, FigureFrame, tone } from "./Figure";

/** PRIMITIVE: shares on tracks, in one or more panels.
 *
 * The cousin of StatBars with its words in HTML, so a label wraps on a phone instead of being
 * scaled down with the drawing. Panels exist for the counts that must not be read against each
 * other: two surveys with different reference periods, or a task answer and a headcount answer
 * that one firm can give both of. Each panel is its own reading, and the frame says so. */
export function Bars({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  panels,
  max = 100,
  callout,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  panels: BarPanel[];
  max?: number;
  callout?: { figure: string; text: string };
}) {
  const dark = band === "dark";
  const t = tone(dark);
  const several = panels.length > 1;
  return (
    <FigureFrame {...{ band, eyebrow, heading, lede, alt, sources, note }}>
      <div className={callout ? "grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16" : ""}>
        {/* ROUND 15: panels STACK at every width. Side by side they were two readings sharing one
            row, and at laptop widths (1024 to 1440) the pair was reported pushing past the page with a
            sideways scrollbar. One column keeps each panel its own reading and its words at full
            size; min-w-0 lets a long label wrap instead of widening its grid track. */}
        <div className={several ? "grid min-w-0 max-w-3xl gap-12" : "min-w-0 max-w-3xl"}>
          {panels.map((p, i) => (
            <div key={p.title ?? i} className={several ? `min-w-0 border-t pt-6 ${t.rule}` : "min-w-0"}>
              {p.title && (
                <p className={`mb-7 text-sm font-bold leading-snug ${t.strong}`}>{p.title}</p>
              )}
              <div className="space-y-8">
                {p.bars.map((b) => (
                  <Bar key={b.label} bar={b} max={max} dark={dark} />
                ))}
              </div>
            </div>
          ))}
        </div>
        {callout && (
          <div className={`border-t pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 ${t.rule}`}>
            <p className={`whitespace-nowrap text-5xl font-light leading-none tracking-[-0.02em] md:text-6xl ${t.strong}`}>
              {callout.figure}
            </p>
            <span aria-hidden className="mt-5 block h-[2px] w-10 rounded-full bg-porchlight" />
            <p className={`mt-5 leading-relaxed ${t.muted}`}>{callout.text}</p>
          </div>
        )}
      </div>
    </FigureFrame>
  );
}
