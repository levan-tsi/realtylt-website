import { Stars } from "@/components/ui/Stars";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import type { Testimonial } from "@/content/testimonials";

/** One Google-review card — header = Google logo + gold stars, then the verbatim review
 * text, then the reviewer's name (matches the live selling-page cards). */
export function TestimonialCard({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  return (
    <figure
      className={`lift flex h-full flex-col rounded-2xl border p-6 ${
        dark ? "border-paper/10 bg-ink-soft" : "border-ink/10 bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <GoogleLogo height={18} />
        <Stars />
      </div>
      <blockquote className="mt-4 grow">
        {/* text-base, not text-[15px] (round 36, move 8): a testimonial quote is running copy
            a reader gets through — body — and 15px was both a one-off size and under the 16px
            mobile body floor. */}
        <p className={`text-base leading-relaxed ${dark ? "text-paper/85" : "text-ink-soft"}`}>
          &ldquo;{t.quote}&rdquo;
        </p>
      </blockquote>
      <figcaption className="mt-5">
        <p className={`font-bold ${dark ? "text-paper" : "text-ink"}`}>{t.name}</p>
        <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${dark ? "text-paper/50" : "text-stone"}`}>
          Google review
        </p>
      </figcaption>
    </figure>
  );
}
