import { Reveal } from "@/components/ui/Reveal";

/** SCENE 2 — the response gap.
 *
 * The argument of the post as one image: two timestamps and the long dead line between them.
 * Both times are facts from the story (asked at 11:40pm, called back at 9am), so the scene
 * invents no performance claim.
 *
 * WHY IT IS A NIGHT SCENE: the signature is a line that starts at full porchlight and cools
 * to nothing. On white that gradient is invisible at hairline weight (tried it), and the
 * subject is literally the middle of the night. On black the light reads, and fading to
 * transparent is the lead going cold.
 *
 * MOTION SAFETY (the pattern every scene here uses): the resting style of every element is
 * its FINAL state, and animation is only attached under `.reveal.is-visible`. So no-JS,
 * reduced-motion, and static screenshots all get the finished frame. Never combine a delay
 * with `animation-fill-mode: both` here — that paints the `from` state during the delay and
 * a screenshot catches an empty frame.
 */
export function ResponseGap() {
  return (
    <section className="response-gap relative isolate overflow-hidden bg-ink py-24 text-paper md:py-36">
      <style>{`
        @keyframes gap-draw   { from { transform: scaleX(0); } }
        @keyframes gap-draw-y { from { transform: scaleY(0); } }
        .reveal.is-visible .gap-line   { animation: gap-draw   1200ms cubic-bezier(0.22,1,0.36,1); }
        .reveal.is-visible .gap-line-y { animation: gap-draw-y 1200ms cubic-bezier(0.22,1,0.36,1); }
      `}</style>

      {/* A faint wash so the black is lit rather than flat, centred on the origin of the line. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(45% 60% at 22% 50%, rgba(40,168,224,0.10), transparent 70%)" }}
      />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">The gap</p>
        </Reveal>

        <Reveal delay={100} className="mt-14 md:mt-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
            {/* The question. On mobile the endpoint dots belong to the line below, so this
                block carries no dot of its own. */}
            <div className="shrink-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-porchlight">
                They asked
              </p>
              <p className="mt-1.5 text-4xl font-light leading-none tracking-[-0.02em] text-paper md:mt-2 md:text-5xl">
                11:40 <span className="text-xl tracking-[0.08em] text-paper/50 md:text-2xl">pm</span>
              </p>
            </div>

            {/* The dead time. Draws away from the question: origin-left on desktop,
                origin-top on mobile. */}
            <div className="relative ml-[4px] flex min-h-[7rem] items-center md:ml-0 md:min-h-0 md:flex-1">
              <span aria-hidden className="absolute -left-[3px] top-0 h-2.5 w-2.5 rounded-full bg-porchlight md:hidden" />
              <div
                aria-hidden
                className="gap-line-y h-28 w-[2px] origin-top rounded-full md:hidden"
                style={{ background: "linear-gradient(to bottom, #28a8e0, rgba(40,168,224,0))" }}
              />
              <span
                aria-hidden
                className="absolute -left-[4px] bottom-0 h-3 w-3 rounded-full border border-white/20 md:hidden"
              />

              <span aria-hidden className="hidden h-2.5 w-2.5 shrink-0 rounded-full bg-porchlight md:block" />
              <div
                aria-hidden
                className="gap-line hidden h-[2px] w-full origin-left rounded-full md:block"
                style={{ background: "linear-gradient(to right, #28a8e0, rgba(40,168,224,0))" }}
              />
              <span
                aria-hidden
                className="hidden h-3 w-3 shrink-0 rounded-full border border-white/20 md:block"
              />

              <p className="absolute left-10 text-lg font-light text-paper/75 md:left-1/2 md:-top-11 md:-translate-x-1/2 md:whitespace-nowrap md:text-2xl">
                9 hours 20 minutes
              </p>
            </div>

            {/* The answer, too late. Dimmed on purpose. */}
            <div className="shrink-0 md:text-right">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-paper/35">
                You called
              </p>
              <p className="mt-1.5 text-4xl font-light leading-none tracking-[-0.02em] text-paper/40 md:mt-2 md:text-5xl">
                9:00 <span className="text-xl tracking-[0.08em] md:text-2xl">am</span>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-16 max-w-xl text-lg leading-relaxed text-paper/70 md:mt-24 md:text-xl">
            Roughly 78% of leads close with whoever responds first.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
