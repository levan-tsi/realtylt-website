"use client";

import { useEffect, useRef } from "react";

/** VARIANT D — "THE OPENING". A title sequence, then light that follows you.
 *
 * WHY THIS EXISTS. The owner's verdict on A/B/C was "really bad, I need something to make me
 * say wow — some crazy transition or mouse movement". Reading the three back, they share one
 * fault: they are all AMBIENT. Nothing ever HAPPENS. A parallax plane, a drifting point field
 * and a cross-fade are all textures — they reward study, and a hero gets about one second.
 *
 * So this one does two things the others never did:
 *
 *   1. IT ARRIVES. The page opens like a title card resolving: the photograph settles out of an
 *      over-scale, a warm light blooms up out of the valley floor, a hairline draws across the
 *      frame, and the three lines of copy un-mask upward in sequence. It is over in 1.8s and it
 *      happens once. That is the "crazy transition" — done as film grammar, not as a slide
 *      effect, because a luxury page cannot afford to look like a template.
 *
 *   2. IT ANSWERS THE POINTER WITH LIGHT, NOT MOTION. A large, very soft warm pool follows the
 *      cursor and the valley WARMS where you look — the same photograph, graded up underneath a
 *      radial mask. Moving the mouse feels like carrying a lantern across the hills at dusk.
 *      It is one hue, no colour is invented, and it cannot read as a particle screensaver.
 *
 * WHY LIGHT RATHER THAN MORE MOVEMENT: this is a photograph of a real place. Pushing it around
 * harder makes it feel like a slideshow; changing how it is LIT makes it feel like a time of
 * day. Restraint is the luxury signal, so the effect is large and slow and the brightness delta
 * is small — you should notice the valley breathing, not a torch beam.
 *
 * CONSTRAINTS HONOURED. Everything animated is `transform`, `opacity` on layers ABOVE the
 * photograph, or a mask — the LCP element (the photograph) is painted immediately and is never
 * faded or re-decoded. Reduced motion and a coarse pointer both land the finished hero with no
 * animation at all, and with JavaScript off it is simply a photograph with the copy on it. */
export function HeroOpening({ src, children }: { src: string; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const photo = useRef<HTMLDivElement>(null);
  const warm = useRef<HTMLDivElement>(null);
  const type = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // JS OWNS THE LANTERN ONLY. The entrance is pure CSS and runs from the first paint — it was
    // briefly gated on a data attribute set here, and that is wrong twice over: the animation
    // could not start until hydration (so the finished frame flashed first and then re-animated),
    // and with JS slow or broken the hero would sit in its opening state for ever.
    if (still || coarse) return;

    let raf = 0;
    // Start the pool centred and let it drift to wherever the pointer first appears, so the
    // bloom of the entrance and the lantern are the same light rather than two effects.
    let tx = 0.5, ty = 0.56, cx = 0.5, cy = 0.56, px = 0, py = 0, mx = 0, my = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = (e.clientY - r.top) / r.height;
      mx = (tx - 0.5) * 2;
      my = (ty - 0.5) * 2;
    };

    const tick = () => {
      // Slow lerp. Instant tracking reads as twitchy and cheap; the lag is what gives it weight
      // and what makes a big soft pool feel like light rather than a cursor decoration.
      cx += (tx - cx) * 0.055;
      cy += (ty - cy) * 0.055;
      px += (mx - px) * 0.045;
      py += (my - py) * 0.045;
      el.style.setProperty("--lx", `${(cx * 100).toFixed(2)}%`);
      el.style.setProperty("--ly", `${(cy * 100).toFixed(2)}%`);
      // The photograph moves AGAINST the pointer and least of all — that is what the eye reads
      // as distance. The type moves with it, and barely.
      if (photo.current) photo.current.style.transform = `scale(1.06) translate3d(${-px * 12}px, ${-py * 9}px, 0)`;
      if (warm.current) warm.current.style.transform = `scale(1.06) translate3d(${-px * 12}px, ${-py * 9}px, 0)`;
      if (type.current) type.current.style.transform = `translate3d(${px * 6}px, ${py * 3}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // A soft-edged pool, not a spotlight: the stops are spread so there is no visible rim anywhere.
  const POOL =
    "radial-gradient(38% 46% at var(--lx) var(--ly), rgba(0,0,0,1) 0%, rgba(0,0,0,.92) 26%," +
    "rgba(0,0,0,.62) 48%, rgba(0,0,0,.28) 68%, rgba(0,0,0,0) 84%)";

  return (
    <div
      ref={wrap}
      className="rlt-open relative isolate h-full w-full overflow-hidden bg-ink"
      style={{ ["--lx" as string]: "50%", ["--ly" as string]: "56%" }}
    >
      <style>{`
        /* The entrance. Long, single-direction easing — nothing bounces, nothing overshoots;
           expensive motion decelerates and stops. */
        @keyframes rlt-settle { from { transform: scale(1.14) } to { transform: scale(1.06) } }
        @keyframes rlt-bloom  { 0% { opacity: 0 } 55% { opacity: 1 } 100% { opacity: 1 } }
        @keyframes rlt-rule   { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes rlt-line   { from { clip-path: inset(105% 0 0 0); transform: translate3d(0,26px,0) }
                                to   { clip-path: inset(-20% 0 0 0); transform: translate3d(0,0,0) } }
        .rlt-open .rlt-photo { animation: rlt-settle 1900ms cubic-bezier(.16,1,.3,1) both }
        .rlt-open .rlt-warm  { animation: rlt-settle 1900ms cubic-bezier(.16,1,.3,1) both,
                                          rlt-bloom 1700ms ease-out both }
        .rlt-open .rlt-core  { animation: rlt-bloom 1700ms ease-out both }
        .rlt-open .rlt-rule  { animation: rlt-rule 1100ms cubic-bezier(.16,1,.3,1) 300ms both }
        .rlt-open .rlt-copy > * > * { animation: rlt-line 1000ms cubic-bezier(.16,1,.3,1) both }
        .rlt-open .rlt-copy > * > *:nth-child(1) { animation-delay: 380ms }
        .rlt-open .rlt-copy > * > *:nth-child(2) { animation-delay: 520ms }
        .rlt-open .rlt-copy > * > *:nth-child(3) { animation-delay: 720ms }
        /* Reduced motion: the finished frame, immediately, with no animation of any kind. */
        @media (prefers-reduced-motion: reduce) {
          .rlt-open .rlt-photo, .rlt-open .rlt-warm, .rlt-open .rlt-core, .rlt-open .rlt-rule,
          .rlt-open .rlt-copy > * > * { animation: none !important; clip-path: none !important;
                                        transform: none !important; opacity: 1 }
          .rlt-open .rlt-photo, .rlt-open .rlt-warm { transform: scale(1.06) !important }
        }
      `}</style>

      {/* THE PHOTOGRAPH — the LCP element. Painted at once, only ever transformed. */}
      <div
        ref={photo}
        className="rlt-photo absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(1) brightness(.62) contrast(1.06)",
          transform: "scale(1.06)",
        }}
      />

      {/* THE SAME PHOTOGRAPH, WARM — revealed only through the pool. No second asset and no
          invented colour: it is this picture at a different hour, and you carry the hour with
          the pointer. */}
      <div
        ref={warm}
        aria-hidden
        className="rlt-warm absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(.25) brightness(1.06) contrast(1.02) sepia(.22) saturate(1.15)",
          transform: "scale(1.06)",
          maskImage: POOL,
          WebkitMaskImage: POOL,
        }}
      />

      {/* THE LIGHT ITSELF, not just its effect. Grading the photograph up works beautifully over
          the hillside and barely reads over sky, which is already bright and has little colour to
          recover — so the pool would die exactly where a visitor's pointer spends half its time.
          A faint additive warm core fixes that and is physically what a sun break looks like.
          Screen blend, amber, low alpha: it must never read as a torch. */}
      <div
        aria-hidden
        className="rlt-core pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(30% 36% at var(--lx) var(--ly), rgba(255,212,150,.20) 0%," +
            "rgba(255,190,120,.09) 42%, rgba(255,180,110,.03) 66%, transparent 80%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Ground the type. Bottom weight only — the top of the frame stays open sky. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.86) 0%, rgba(0,0,0,.42) 34%, transparent 72%)" }}
      />

      {/* The hairline that draws across as the copy arrives is rendered BY THE COPY, as the first
          item in its bottom-anchored stack — this component only animates it (`.rlt-rule`). It
          used to live here at `bottom-[210px]`, which was fine in a 620px demo frame and drew
          straight through the headline the moment the hero became full-height. A magic offset
          against a viewport it was never tested at is a bug waiting for a bigger screen. */}
      <div ref={type} className="rlt-copy relative z-10 h-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
