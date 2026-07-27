import { Reveal } from "@/components/ui/Reveal";

/** SCENE — the film.
 *
 * Replaces the first attempt, which was honestly just a screen recording of this page
 * scrolling. This one is cut from three takes and actually demonstrates the product:
 *
 *   1. The galaxy flight into the neural brain, captured live from realtylt.com/ai. That is a
 *      real Three.js scene being flown by its own scroll-driven journey, not a mock-up.
 *   2. The brain with the "AI chat assistant" node lit, beside the real assistant answering a
 *      real question typed on camera. Nothing staged: it is the assistant that runs on the page.
 *   3. The 11:40pm demonstration, purpose-built for the film: the message arrives, the reply
 *      declines to invent an answer, and the machinery behind it fires in sequence.
 *
 * PRODUCTION NOTE for whoever re-cuts this: segment 1 and 2 MUST be recorded headed against
 * installed Chrome. Headless Chromium has no real GPU, so the AI page detects no acceleration
 * and drops into "reduced mode" where the galaxy and brain are never drawn at all.
 *
 * mp4 only: the VP9 encode came out LARGER than the H.264 at matched quality, so a second
 * <source> would have been weight for nothing. H.264 is universally supported.
 *
 * `preload="none"` with a poster means the 5MB never loads for a reader who scrolls past, and
 * `autoPlay` is deliberately not set, which is the honest reading of prefers-reduced-motion.
 */
export function Reel() {
  return (
    <section className="bg-ink py-24 text-paper md:py-32" aria-label="Watch it work">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">Watch it work</p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]">
            The galaxy, the brain, and a real answer at 11:40pm.
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
              poster="/video/flagship-film-poster.jpg"
              width={1280}
              height={720}
            >
              <source src="/video/flagship-film.mp4" type="video/mp4" />
              Your browser cannot play this clip. Everything it shows is on this page as text and
              graphics, and the assistant itself is at /ai.
            </video>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-paper/55">
            Silent, 50 seconds. The flight and the chat are captured live from the assistant
            running at{" "}
            <a
              href="/ai#chat"
              className="text-paper/80 underline underline-offset-4 transition-colors hover:text-porchlight"
            >
              realtylt.com/ai
            </a>
            , with a real question typed on camera. Nothing in it is a claim this page does not
            already make.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
