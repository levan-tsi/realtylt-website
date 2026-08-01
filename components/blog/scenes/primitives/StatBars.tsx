import type { StatBar } from "@/lib/blog/flagship";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — a cited data graphic.
 *
 * Generalised out of ResponseCurve, which was this exact chart with one topic's numbers
 * compiled into it. Everything a topic can vary is now a prop: the bars, which one carries
 * the accent, the source, and the caveat.
 *
 * THE CAVEAT IS NOT OPTIONAL, and that is deliberate. A chart with a source but no statement
 * of what the data does not cover is an advert with axes. Making `note` a required field
 * means a topic cannot ship a graphic without saying where it stops being evidence.
 *
 * Drawn as real inline SVG rather than CSS bars: a chart is the asset another site embeds and
 * credits, so it has to survive being lifted out of the page, screenshotted at any density,
 * and exported for a carousel without being rebuilt.
 *
 * Accessibility: role="img" with a title and a description that state the numbers in words,
 * and the same numbers sit in the visible DOM as text, so nothing is locked inside a picture.
 * Bars are static geometry, so the still and the animated view are identical frames.
 */
export function StatBars({
  band,
  eyebrow,
  caption,
  bars,
  max,
  lit = 0,
  sourceText,
  sourceHref,
  note,
  basis,
  idBase,
}: {
  band: "dark" | "light";
  eyebrow: string;
  caption: string;
  bars: StatBar[];
  max?: number;
  lit?: number;
  sourceText: string;
  sourceHref: string;
  note: string;
  basis: string;
  /** Unique per instance, so two charts on one page cannot share aria-labelledby ids. */
  idBase: string;
}) {
  const dark = band === "dark";
  // Default: scale to the largest bar, which is what a ratio chart wants. A topic charting
  // SHARES passes max={100} so the track reads as the whole and a 37% bar is drawn at 37%.
  const axis = max ?? Math.max(...bars.map((b) => b.value));

  // Geometry: horizontal bars, label ABOVE each one so nothing is cramped at 390px.
  const W = 640;
  const ROW = 74;
  const BAR_H = 20;
  const H = bars.length * ROW;

  // The value column has to FIT ITS LONGEST VALUE. This was a fixed 78px, which is right for the
  // percentages and ratios the first four topics charted ("15%", "60x") and silently clips
  // anything longer: the workflow topic charts durations, and "25 min 26 sec" lost its last three
  // characters off the right edge of the viewBox. Nothing in the DOM was wrong and no probe could
  // see it, because an SVG does not overflow, it crops.
  //
  // Derived from the string rather than hand-tuned per topic, and floored at the original 90 so
  // every chart already shipped keeps exactly the geometry it shipped with. 8.6 is a deliberate
  // over-estimate of Lato's average advance at 17px; a value column that is slightly too wide
  // only makes a bar shorter, and a bar that is slightly short still tells the truth because the
  // number beside it is the thing being read.
  const longest = Math.max(...bars.map((b) => b.display.length));
  const reserve = Math.max(90, Math.round(longest * 8.6) + 22);
  const track = W - reserve;

  return (
    <section
      className={dark ? "bg-ink py-24 text-paper md:py-32" : "bg-mist py-24 md:py-32"}
      aria-label={caption}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-paper/45" : "text-stone"}`}
          >
            {eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]"
                : "mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] text-ink md:text-[34px]"
            }
          >
            {caption}
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-12 md:mt-16">
          <div className="max-w-3xl">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-labelledby={`${idBase}-title ${idBase}-desc`}
            >
              <title id={`${idBase}-title`}>{caption}</title>
              <desc id={`${idBase}-desc`}>{`${bars
                .map((b) => `${b.label}: ${b.display}`)
                .join(". ")}. ${basis}`}</desc>
              {bars.map((b, i) => {
                const y = i * ROW;
                const w = (b.value / axis) * track;
                const on = i === lit;
                return (
                  <g key={b.label}>
                    <text
                      x={0}
                      y={y + 16}
                      fill={dark ? "#ffffff" : "#12161c"}
                      style={{ fontSize: 15 }}
                    >
                      {b.label}
                    </text>
                    {/* track */}
                    <rect
                      x={0}
                      y={y + 30}
                      width={track}
                      height={BAR_H}
                      rx={10}
                      fill={dark ? "#1c222b" : "#e1e6ec"}
                    />
                    {/* value */}
                    <rect
                      x={0}
                      y={y + 30}
                      width={Math.max(w, 6)}
                      height={BAR_H}
                      rx={10}
                      fill={on ? "#28a8e0" : dark ? "#55616f" : "#9aa7b6"}
                    />
                    <text
                      x={track + 12}
                      y={y + 45}
                      fill={on ? (dark ? "#ffffff" : "#12161c") : dark ? "#9aa7b6" : "#5c6672"}
                      style={{ fontSize: 17, fontWeight: on ? 700 : 400 }}
                    >
                      {b.display}
                    </text>
                  </g>
                );
              })}
            </svg>

            <p
              className={`mt-8 text-sm leading-relaxed ${dark ? "text-paper/60" : "text-stone"}`}
            >
              {basis} Source:{" "}
              <a
                href={sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  dark
                    ? "text-paper/85 underline underline-offset-4 transition-colors hover:text-porchlight"
                    : "text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep"
                }
              >
                {sourceText}
              </a>
            </p>
            <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-paper/60" : "text-stone"}`}>
              {note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
