import { FILM } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE — the film.
 *
 * Cut from two sources on ONE shared timeline (scripts/_scratch-stage/film.html carries the
 * film clock and leaves a hole at 6s to 12s for the flight to drop into):
 *
 *   1. A staged demonstration at 1920x1080: the question lands at 11:40pm, the reply declines
 *      to invent what nobody knows, and the machinery behind it fires in sequence.
 *   2. The galaxy reshaping into the neural map, live from realtylt.com/ai. Real Three.js,
 *      flown by the page's own scroll-driven journey.
 *
 * PRODUCTION NOTES for whoever re-cuts this, both of which cost a pass to learn:
 *
 * - Segment 2 MUST be recorded headed against installed Chrome. Headless Chromium has no real
 *   GPU, the page detects no acceleration and drops into reduced mode, and the galaxy and brain
 *   are never drawn at all.
 * - Do NOT record with Playwright's recordVideo. It is a fixed low-bitrate VP8 encoder (~880
 *   kb/s in the first cut) and a moving starfield is the worst case there is for it. Every
 *   frame here is a lossless PNG screenshot instead, which is why this cut is SHORTER than the
 *   old one, at a higher bitrate, in a smaller file.
 *
 * `preload="none"` with a poster means zero bytes load for a reader who scrolls past, and
 * `autoPlay` is deliberately not set, which is the honest reading of prefers-reduced-motion.
 */
export function Reel() {
  return (
    <section className="bg-ink py-24 text-paper md:py-32" aria-label="Watch it work">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">Watch it work</p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]">
            A question at 11:40pm, and everything that fires behind the answer.
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-12 md:mt-16">
          <div className="overflow-hidden rounded-[14px] bg-[#0a0a0a] shadow-[inset_0_1px_0_rgb(255_255_255/0.07)]">
            <video
              className="block h-auto w-full"
              controls
              muted
              playsInline
              loop
              preload="none"
              poster={FILM.poster}
              width={FILM.width}
              height={FILM.height}
            >
              <source src={FILM.src} type="video/mp4" />
              Your browser cannot play this clip. Everything it shows is on this page as text and
              graphics, and the assistant itself is at /ai.
            </video>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-paper/55">
            Silent, {FILM.seconds} seconds. The flight through the galaxy into the neural map is
            live footage of the system running at{" "}
            <a
              href="/ai#chat"
              className="text-paper/80 underline underline-offset-4 transition-colors hover:text-porchlight"
            >
              realtylt.com/ai
            </a>
            . The 11:40pm exchange is staged for the film, and every line in it is something this
            page already says the assistant does. For the unstaged version, go and ask it yourself.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
