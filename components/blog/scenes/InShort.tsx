import { IN_SHORT } from "@/content/blog/ai-chat-scenes";
import { Reveal } from "@/components/ui/Reveal";

/** SCENE — "In short".
 *
 * The one addition from researching how the best long-form pages are built: skimmable depth.
 * Most readers do not read top to bottom, and a growing share never arrive at all because an
 * AI assistant answered on their behalf. Three lines carrying the actual answers make the
 * piece quotable by both.
 *
 * It sits after the lead story rather than above it. The cold open is already the hook, and
 * putting a summary in front of the narrative would spend the hook twice.
 *
 * A band, but NOT full-bleed inside: a summary belongs to the article, so it stays on the
 * reading measure. Restraint is what keeps this from reading as a templated "key takeaways"
 * box: hairlines, one accent tick per line, no card, no shadow, no icon.
 */
export function InShort() {
  return (
    <section className="bg-paper pb-4 pt-2" aria-label="In short">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-[44rem]">
          <div className="border-y border-[#e3e6ea] py-8 md:py-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone">In short</p>
            <ul className="mt-6 space-y-4">
              {IN_SHORT.map((line) => (
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
