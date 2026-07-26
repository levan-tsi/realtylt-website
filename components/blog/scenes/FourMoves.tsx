import { FOUR_MOVES } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE 4 — the four moves.
 *
 * This scene REPLACES the numbered list that used to sit in the markdown rather than
 * decorating it, so the four moves appear exactly once on the page. The words are the
 * article's own (content/blog/ai-chat-scenes.ts) and still render as crawlable DOM text.
 *
 * No 01/02/03 markers: the heading already states there are four, so numbering each one adds
 * nothing but the look of a template. Hairline rules carry the structure instead, which is
 * also what makes each cell crop cleanly as its own carousel slide.
 */
export function FourMoves() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-24 text-paper md:py-36" aria-label="The four moves">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: "radial-gradient(60% 50% at 78% 8%, rgba(40,168,224,0.10), transparent 72%)" }}
      />

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">What it actually does</p>
          <h2 className="mt-6 text-3xl font-light leading-[1.15] tracking-[-0.02em] md:text-5xl">
            Four moves.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-x-14 gap-y-12 md:mt-24 md:grid-cols-2 xl:gap-x-24">
          {FOUR_MOVES.map((m, i) => (
            <Reveal key={m.lead} delay={80 * i}>
              <div className="border-t border-white/12 pt-7">
                <p className="text-xl font-light leading-snug tracking-[-0.01em] text-paper md:text-2xl">
                  {m.lead}
                </p>
                <p className="mt-4 leading-[1.75] text-paper/60">{m.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
