import type { DiagramStep } from "@/lib/blog/flagship";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — n labelled nodes on a spine.
 *
 * Generalised out of SystemDiagram. It earns a band by being a different VIEW of a chain
 * rather than a re-telling of one: a conversation scene shows a single exchange in time,
 * this shows the system, including what each hop connects to. As a text list the chain is
 * already on the page; as an embeddable graphic it is the thing another site can credit,
 * and a list can never do that job.
 *
 * THE <title> TRAP, which cost a whole pass on the first flagship: this must be ONE text
 * child, never `text {expression}`. React treats <title> as document metadata and does not
 * reconcile several children inside it the way it does everywhere else, so a two-child
 * version hydrates differently from the server render, throws away the whole page tree, and
 * re-inserts the layout's JSON-LD a second time on the way back. Build the string first.
 *
 * Wide diagram, small screens: the SVG keeps a min width and its own container scrolls
 * horizontally, so the graphic stays legible on a phone and the PAGE never scrolls sideways.
 * The steps are also a real <ol> in the DOM, so the content is not locked inside a picture.
 */
export function Diagram({
  band,
  eyebrow,
  heading,
  lede,
  steps,
  altPrefix,
  idBase,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede: string;
  steps: DiagramStep[];
  altPrefix: string;
  /** Unique per instance: two diagrams on one page must not share an aria-labelledby id. */
  idBase: string;
}) {
  const dark = band === "dark";
  const W = 1080;
  const H = 208;
  const gap = W / steps.length;
  const alt = `${altPrefix}: ${steps.map((s) => s.label).join(", ")}`;

  return (
    <section
      className={dark ? "bg-ink py-24 text-paper md:py-32" : "bg-mist py-24 md:py-32"}
      aria-label={heading}
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
            {heading}
          </h2>
          <p
            className={`mt-5 max-w-xl leading-relaxed ${dark ? "text-paper/60" : "text-stone"}`}
          >
            {lede}
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-14 md:mt-20">
          {/* The graphic is wider than a phone by design: shrinking six labelled nodes to fit
              390px makes it unreadable, and the whole argument for drawing it is that it can
              be lifted out and credited. So it scrolls inside its own container, and the two
              things below say so. Without them a phone reader sees a diagram cut off at the
              edge and has no reason to think there is more of it. */}
          <div className="relative -mx-4 lg:mx-0">
            <div className="overflow-x-auto px-4 lg:px-0">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full min-w-[46rem]"
              role="img"
              aria-labelledby={`${idBase}-title`}
            >
              <title id={`${idBase}-title`}>{alt}</title>

              {/* The spine BUILDS toward the last node rather than fading away from the
                  first. These chains gather toward an outcome, so a fade would say the
                  opposite of what the diagram is for. */}
              <defs>
                <linearGradient id={`${idBase}-line`} x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#28a8e0" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#28a8e0" />
                </linearGradient>
              </defs>
              <rect
                x={gap / 2}
                y={70}
                width={W - gap}
                height={2}
                rx={1}
                fill={`url(#${idBase}-line)`}
              />

              {steps.map((s, i) => {
                const cx = gap / 2 + i * gap;
                const endpoint = i === 0 || i === steps.length - 1;
                return (
                  <g key={s.label}>
                    <circle
                      cx={cx}
                      cy={71}
                      r={endpoint ? 7 : 5}
                      fill={endpoint ? "#28a8e0" : dark ? "#0a0a0a" : "#eef1f5"}
                      stroke={endpoint ? "none" : "#5c6672"}
                      strokeWidth={1.5}
                    />
                    <text
                      x={cx}
                      y={40}
                      textAnchor="middle"
                      fill={dark ? "#ffffff" : "#12161c"}
                      style={{ fontSize: 16, fontWeight: 300 }}
                    >
                      {s.label}
                    </text>
                    <text
                      x={cx}
                      y={106}
                      textAnchor="middle"
                      fill={dark ? "#9aa7b6" : "#5c6672"}
                      style={{ fontSize: 12.5 }}
                    >
                      {s.connects}
                    </text>
                    {s.at && (
                      <text
                        x={cx}
                        y={130}
                        textAnchor="middle"
                        fill="#28a8e0"
                        style={{ fontSize: 11, letterSpacing: "0.12em" }}
                      >
                        {s.at.toUpperCase()}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-16 lg:hidden"
              style={{
                background: `linear-gradient(to left, ${dark ? "#000000" : "#f3f5f8"}, transparent)`,
              }}
            />
          </div>
          <p
            className={`mt-5 text-[11px] font-bold uppercase tracking-[0.16em] lg:hidden ${
              dark ? "text-paper/40" : "text-stone/80"
            }`}
          >
            Scroll to follow the chain
          </p>

          {/* The same chain as real text, so it reads without the graphic. */}
          <ol className="sr-only">
            {steps.map((s) => (
              <li key={s.label}>
                {s.label}: {s.connects}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
