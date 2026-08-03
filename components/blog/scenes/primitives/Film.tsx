import type { ArticleFilm, RichText } from "@/lib/blog/flagship";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — the film.
 *
 * PRODUCTION NOTES for whoever cuts one of these, both of which cost a pass to learn:
 *
 * - The /ai footage MUST be recorded headed against installed Chrome. Headless Chromium has no
 *   real GPU, the page detects no acceleration and drops into reduced mode, and the galaxy and
 *   brain are never drawn at all.
 * - Do NOT record with Playwright's recordVideo. It is a fixed low-bitrate VP8 encoder (~880
 *   kb/s in the first cut) and a moving starfield is the worst case there is for it. Screenshot
 *   a frozen, seekable timeline instead: lossless frames, at the final resolution, with the
 *   frame interval decided by the cut rather than by whatever the page managed to paint.
 *
 * The recipe is per topic in only one segment: the /ai journey is shared and cut once, and only
 * the topic's own demonstration is new. See docs/blog-flagship/FLAGSHIP-HANDOFF.md.
 *
 * `preload="none"` with a poster means zero bytes load for a reader who scrolls past, so a film
 * costs a page nothing until somebody presses play. `autoPlay` is deliberately absent, which is
 * the honest reading of prefers-reduced-motion. The film is NARRATED (owner 2026-07-29), so the
 * element must not be `muted` and must not `loop` — playback is user-initiated, sound is the
 * point, and a looping narration restarts itself forever.
 */
export function Film({
  film,
  eyebrow,
  heading,
  caption,
  ariaLabel,
}: {
  film: ArticleFilm;
  eyebrow: string;
  heading: string;
  caption: RichText;
  ariaLabel: string;
}) {
  return (
    <section className="bg-ink py-24 text-paper md:py-32" aria-label={ariaLabel}>
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">{eyebrow}</p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]">
            {heading}
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-12 md:mt-16">
          <div className="overflow-hidden rounded-2xl bg-[#0a0a0a] shadow-edge">
            <video
              className="block h-auto w-full"
              controls
              playsInline
              preload="none"
              poster={film.poster}
              width={film.width}
              height={film.height}
            >
              <source src={film.src} type="video/mp4" />
              Your browser cannot play this clip. Everything it shows is on this page as text and
              graphics, and the assistant itself is at /ai.
            </video>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-paper/55">
            {caption.map((part, i) =>
              typeof part === "string" ? (
                part
              ) : (
                <a
                  key={i}
                  href={part.href}
                  className="text-paper/80 underline underline-offset-4 transition-colors hover:text-porchlight"
                >
                  {part.label}
                </a>
              ),
            )}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
