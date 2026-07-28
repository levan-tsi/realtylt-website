import { SYSTEM_STEPS } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE 7 — the system diagram. The page's second real data-graphic asset.
 *
 * I cut this once, on the grounds that it repeated the teardown's "what happened behind it"
 * column. That was right about the CONTENT and wrong about the ARTEFACT. As a text list the
 * chain is already on the page; as an embeddable graphic it is the thing another site can drop
 * into a post and credit, and a text list can never do that job. So it returns, drawn.
 *
 * It earns its place by being a different view of the chain rather than the same one: the
 * teardown shows a single conversation in time, this shows the SYSTEM, including what each hop
 * connects to. It is deliberately the compact abstraction, not a re-telling.
 *
 * Wide diagram, small screens: the SVG keeps a min width and its container scrolls
 * horizontally, so the graphic stays legible on a phone instead of being crushed to nothing.
 * The page itself never scrolls sideways. The steps are also a real <ol> in the DOM, so the
 * content is not locked inside a picture.
 */
export function SystemDiagram() {
  const W = 1080;
  const H = 208;
  const gap = W / SYSTEM_STEPS.length;
  // ONE string, not `text {expression}`. React treats <title> as document metadata and does not
  // reconcile several text children inside it the way it does anywhere else, so the two-child
  // version hydrated differently from the server render. That threw away and re-rendered the
  // whole page tree on every load of this post, and re-inserted the layout's RealEstateAgent
  // JSON-LD a second time as it went. Keep this a single child.
  const alt = `The chain from question to booked call: ${SYSTEM_STEPS.map((s) => s.label).join(", ")}`;

  return (
    <section className="bg-ink py-24 text-paper md:py-32" aria-label="How the assistant is wired">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">The system</p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]">
            What it is connected to.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-paper/60">
            An assistant is only as good as what it can reach. This is every hop between the
            question and the booked call.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-14 md:mt-20">
          <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-auto w-full min-w-[46rem]"
              role="img"
              aria-labelledby="sd-title"
            >
              <title id="sd-title">{alt}</title>

              {/* The spine BUILDS toward the handoff rather than fading to it. The response-gap
                  scene uses a cooling line because there the meaning is a lead going cold; here
                  the chain gathers toward a booked call, so a fade would say the opposite of
                  what the diagram is for. */}
              <defs>
                <linearGradient id="sd-line" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#28a8e0" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#28a8e0" />
                </linearGradient>
              </defs>
              <rect x={gap / 2} y={70} width={W - gap} height={2} rx={1} fill="url(#sd-line)" />

              {SYSTEM_STEPS.map((s, i) => {
                const cx = gap / 2 + i * gap;
                const endpoint = i === 0 || i === SYSTEM_STEPS.length - 1;
                return (
                  <g key={s.label}>
                    <circle
                      cx={cx}
                      cy={71}
                      r={endpoint ? 7 : 5}
                      fill={endpoint ? "#28a8e0" : "#0a0a0a"}
                      stroke={endpoint ? "none" : "#5c6672"}
                      strokeWidth={1.5}
                    />
                    <text
                      x={cx}
                      y={40}
                      textAnchor="middle"
                      fill="#ffffff"
                      style={{ fontSize: 16, fontWeight: 300 }}
                    >
                      {s.label}
                    </text>
                    <text
                      x={cx}
                      y={106}
                      textAnchor="middle"
                      fill="#9aa7b6"
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

          {/* The same chain as real text, so it is readable without the graphic. */}
          <ol className="sr-only">
            {SYSTEM_STEPS.map((s) => (
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
