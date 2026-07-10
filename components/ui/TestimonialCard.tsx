import { Stars } from "@/components/ui/Stars";
import type { Testimonial } from "@/content/testimonials";

export function TestimonialCard({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  return (
    <figure
      className={`lift flex h-full flex-col rounded-[2px] border p-6 ${
        dark ? "border-paper/10 bg-ink-soft" : "border-ink/10 bg-white"
      }`}
    >
      <Stars />
      <blockquote className="mt-4 grow">
        <p className={`font-display text-xl leading-snug ${dark ? "text-paper" : "text-ink"}`}>
          &ldquo;{t.quote}&rdquo;
        </p>
        <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-paper/70" : "text-stone"}`}>
          {t.detail}
        </p>
      </blockquote>
      <figcaption className="mt-5">
        <p className={`font-bold ${dark ? "text-paper" : "text-ink"}`}>{t.name}</p>
        <p className={`font-mono text-[11px] uppercase tracking-[0.14em] ${dark ? "text-paper/50" : "text-stone"}`}>
          {t.context} · Google review
        </p>
      </figcaption>
    </figure>
  );
}
