"use client";

import { useState } from "react";
import type { Testimonial } from "@/content/testimonials";

/** Live-home-page style testimonial band: light gray strip between the listing rails with
 * ONE centered quote and prev/next chevrons (realtylt.com shows a single rotating review). */
export function TestimonialBand({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const t = items[i];
  const step = (d: number) => setI((i + d + items.length) % items.length);

  return (
    <section aria-label="Client reviews" className="bg-mist">
      <div className="relative mx-auto max-w-[1250px] px-14 py-14 text-center md:py-16">
        <button
          type="button"
          aria-label="Previous review"
          onClick={() => step(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-2xl text-stone transition-colors hover:text-ink lg:left-6"
        >
          ‹
        </button>
        <blockquote>
          <p className="text-2xl font-bold text-ink md:text-[36px] md:leading-tight">&ldquo;{t.quote}&rdquo;</p>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-stone">{t.detail}</p>
        </blockquote>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-ink-soft">{t.name}</p>
        <button
          type="button"
          aria-label="Next review"
          onClick={() => step(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-2xl text-stone transition-colors hover:text-ink lg:right-6"
        >
          ›
        </button>
      </div>
    </section>
  );
}
