import { Reveal } from "@/components/ui/Reveal";

/** SCENE — the motion reel.
 *
 * The cheap proof from the brief: the finished scenes recorded as a silent 30-60s reel, no
 * credits and no avatar. Research is blunt that pages carrying video perform very differently
 * in search, and the page had none.
 *
 * It is a real <video>, not a YouTube embed, on purpose: no third-party script, no cookie, no
 * layout shift, and the file ships from our own origin so it cannot be pulled or re-branded.
 *
 * Autoplay rules: muted + playsInline + loop is the only combination browsers will start
 * without a gesture, and `controls` stays on so a reader can stop it. `preload="none"` with a
 * poster means the 4MB never loads for someone who scrolls past, which matters far more than
 * the autoplay does.
 *
 * Reduced motion: `autoPlay` is NOT set. The video starts only if the reader asks, which is
 * the honest reading of prefers-reduced-motion for a decorative loop, and it keeps the page
 * from spending bandwidth on someone who never watches.
 */
export function Reel() {
  return (
    <section className="bg-ink py-24 text-paper md:py-32" aria-label="Watch the piece">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/45">In motion</p>
          <h2 className="mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px]">
            The same story, in half a minute.
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
              poster="/video/flagship-reel-poster.jpg"
              width={1440}
              height={810}
            >
              <source src="/video/flagship-reel.webm" type="video/webm" />
              Your browser cannot play this clip. Everything in it is on this page as text and
              graphics.
            </video>
          </div>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-paper/55">
            Silent, 36 seconds. Every frame is this page, so nothing in the clip is a claim the
            article does not already make.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
