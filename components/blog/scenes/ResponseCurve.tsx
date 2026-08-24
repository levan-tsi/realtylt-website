import { RESPONSE_CURVE } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE 2b — the response curve. The page's first actual DATA GRAPHIC.
 *
 * Why it exists: the piece had no chart, no diagram and no citation anywhere, and it leaned on
 * "roughly 78%" three times without sourcing it. This scene fixes both at once by visualising
 * REAL third-party data and naming the study, the sample size and the year on screen.
 *
 * It is drawn as inline SVG rather than CSS bars on purpose. A chart is the asset other people
 * embed and credit, so it has to be a real graphic: it scales, it survives a screenshot at any
 * density, and it can be exported as a standalone file for the carousel and the video without
 * being rebuilt.
 *
 * Accessibility: the SVG is role="img" with a title and a description that state the numbers in
 * words, and the same numbers are in the visible DOM as text, so nothing here is locked inside
 * a picture. Bars are static geometry, so the still and the animated view are identical.
 */
export function ResponseCurve() {
  const { caption, bars, sourceText, sourceHref, note } = RESPONSE_CURVE;
  const max = Math.max(...bars.map((b) => b.value));

  // Geometry: a horizontal bar chart, labels above each bar so nothing is cramped at 390px.
  const W = 640;
  const ROW = 74;
  const BAR_H = 20;
  const H = bars.length * ROW;

  return (
    <section className="bg-mist py-24 md:py-32" aria-label="How response speed changes the odds">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone">The evidence</p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] text-ink md:text-[34px]">
            {caption}.
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-12 md:mt-16">
          <div className="max-w-3xl">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full"
              role="img"
              aria-labelledby="rc-title rc-desc"
            >
              <title id="rc-title">{caption}</title>
              <desc id="rc-desc">
                {bars.map((b) => `${b.label}: ${b.display}`).join(". ")}. Indexed to the
                after-24-hours case.
              </desc>
              {bars.map((b, i) => {
                const y = i * ROW;
                const w = (b.value / max) * (W - 90);
                const lit = i === 0;
                return (
                  <g key={b.label}>
                    <text x={0} y={y + 16} className="fill-ink" style={{ fontSize: 15 }}>
                      {b.label}
                    </text>
                    {/* track */}
                    <rect x={0} y={y + 30} width={W - 90} height={BAR_H} rx={10} fill="#e1e6ec" />
                    {/* value */}
                    <rect
                      x={0}
                      y={y + 30}
                      width={Math.max(w, 6)}
                      height={BAR_H}
                      rx={10}
                      fill={lit ? "#28a8e0" : "#9aa7b6"}
                    />
                    <text
                      x={W - 78}
                      y={y + 45}
                      className={lit ? "fill-ink" : "fill-stone"}
                      style={{ fontSize: 17, fontWeight: lit ? 700 : 400 }}
                    >
                      {b.display}
                    </text>
                  </g>
                );
              })}
            </svg>

            <p className="mt-8 t-small leading-relaxed text-stone">
              Odds are indexed to the after-24-hours case. Source:{" "}
              <a
                href={sourceHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep"
              >
                {sourceText}
              </a>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone">{note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
