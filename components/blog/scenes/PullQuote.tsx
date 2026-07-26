import { Reveal } from "@/components/ui/Reveal";

/** SCENE 8 — the line the piece turns on.
 *
 * Replaces the markdown blockquote so the sentence appears exactly once, at full size. This
 * is the quote card: one line, held on a dark field, nothing else competing with it. It is
 * the easiest asset in the set to reuse as a still or a video beat, which is why it earns a
 * whole band and no ornament at all.
 *
 * River navy rather than black, so it reads as its own chapter next to the near-black scenes
 * either side of it.
 */
export function PullQuote() {
  return (
    <section className="bg-river py-28 text-paper md:py-40">
      <div className="mx-auto max-w-5xl px-4 lg:px-8">
        <Reveal>
          <figure>
            <span aria-hidden className="block h-[2px] w-12 rounded-full bg-porchlight" />
            <blockquote className="mt-10 text-2xl font-light leading-[1.35] tracking-[-0.015em] md:text-[40px] md:leading-[1.28]">
              The measure of an AI assistant is not how human it sounds. It is whether the answer was
              correct, whether it was immediate, and whether a real person showed up when it mattered.
            </blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
