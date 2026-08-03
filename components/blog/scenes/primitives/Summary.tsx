import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — the skimmable answer.
 *
 * Most readers do not read top to bottom, and a growing share never arrive at all because an
 * assistant answered on their behalf. A few lines carrying the actual answers make a piece
 * quotable by both.
 *
 * A band, but NOT full-bleed inside: a summary belongs to the article, so it stays on the
 * reading measure. Restraint is what keeps this from reading as a templated "key takeaways"
 * box: hairlines, one accent tick per line, no card, no shadow, no icon.
 *
 * It belongs AFTER the lead story. The cold open is already the hook, and putting a summary in
 * front of the narrative spends the hook twice.
 */
export function Summary({
  eyebrow,
  claims,
  ariaLabel,
}: {
  eyebrow: string;
  claims: string[];
  ariaLabel: string;
}) {
  return (
    <section className="bg-paper pb-4 pt-2" aria-label={ariaLabel}>
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-[44rem]">
          <div className="border-y border-line py-8 md:py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone">{eyebrow}</p>
            <ul className="mt-6 space-y-4">
              {claims.map((line) => (
                <li key={line} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-[0.7em] h-[2px] w-4 shrink-0 rounded-full bg-porchlight"
                  />
                  <span className="leading-[1.7] text-ink-soft">{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
