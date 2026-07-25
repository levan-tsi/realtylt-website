"use client";

import { useState } from "react";
import { Stars } from "@/components/ui/Stars";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
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
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <GoogleLogo height={18} />
            <Stars />
          </div>
          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-ink md:text-2xl">
            &ldquo;{t.quote}&rdquo;
          </p>
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
