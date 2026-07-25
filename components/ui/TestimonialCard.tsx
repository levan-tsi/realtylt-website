import { Stars } from "@/components/ui/Stars";
import { GoogleLogo } from "@/components/ui/GoogleLogo";
import type { Testimonial } from "@/content/testimonials";

/** One Google-review card — header = Google logo + gold stars, then the verbatim review
 * text, then the reviewer's name (matches the live selling-page cards). */
export function TestimonialCard({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  return (
    <figure
      className={`lift flex h-full flex-col rounded-[2px] border p-6 ${
        dark ? "border-paper/10 bg-ink-soft" : "border-ink/10 bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <GoogleLogo height={18} />
        <Stars />
      </div>
      <blockquote className="mt-4 grow">
        <p className={`text-[15px] leading-relaxed ${dark ? "text-paper/85" : "text-ink-soft"}`}>
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
