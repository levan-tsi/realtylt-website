"use client";

import { useState } from "react";
import { PRESS } from "./Button";
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
    <section aria-label="Client reviews" className="bg-mist night:bg-transparent">
      {/* Night (round 53 polish): below md the quote takes the page's own 16px gutters and the
          two arrows move down beside the name, where they no longer squeeze a 26px italic into
          a 278px column (8 lines at 390, 10 at 320). From md they sit at the band's sides again,
          on the page's content edge (lg: 32px, where the text above and below starts) rather
          than 8px outside it. */}
      <div className="relative mx-auto max-w-[1250px] px-14 py-14 text-center md:py-16 night:px-4 night:md:px-20">
        <blockquote>
          <div className="mb-5 flex items-center justify-center gap-2.5">
            <GoogleLogo height={18} />
            <Stars />
          </div>
          {/* Night (round 53): a person's own words are the one thing set in the serif, in its
              italic, so a quotation reads as a voice and not as more of the page. */}
          <p className="mx-auto max-w-3xl text-xl font-medium leading-relaxed text-ink md:text-2xl night:font-[family-name:var(--font-newsreader)] night:text-[clamp(1.625rem,1.2rem+1.5vw,2.375rem)] night:font-light night:italic night:leading-[1.3] night:tracking-[-0.01em]">
            {/* Typographic apostrophes in the large italic, where a straight one reads as a typing
                slip. Here only: the review text is shared with /reviews and /selling, which keep
                it exactly as it is. */}
            &ldquo;{t.quote.replace(/'/g, "’")}&rdquo;
          </p>
        </blockquote>
        <div className="mt-5 night:mt-7 night:flex night:items-center night:justify-between night:gap-4 night:md:block">
          {/* The same round chevron buttons the rails' pager and the carousel use (round 53): bare
              "‹ ›" glyphs at 24x48 read as stray characters beside a quotation. */}
          <button
            type="button"
            aria-label="Previous review"
            onClick={() => step(-1)}
            className={`absolute left-1 top-1/2 grid h-10 w-10 shrink-0 -translate-y-1/2 place-items-center rounded-full border border-line-strong text-stone ${PRESS} hover:border-ink hover:text-ink lg:left-6 night:static night:translate-y-0 night:md:absolute night:md:left-4 night:md:top-1/2 night:md:-translate-y-1/2 night:lg:left-8`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft night:min-w-0 night:text-[15px] night:font-medium night:normal-case night:tracking-normal night:text-stone">{t.name}</p>
          <button
            type="button"
            aria-label="Next review"
            onClick={() => step(1)}
            className={`absolute right-1 top-1/2 grid h-10 w-10 shrink-0 -translate-y-1/2 place-items-center rounded-full border border-line-strong text-stone ${PRESS} hover:border-ink hover:text-ink lg:right-6 night:static night:translate-y-0 night:md:absolute night:md:right-4 night:md:top-1/2 night:md:-translate-y-1/2 night:lg:right-8`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
