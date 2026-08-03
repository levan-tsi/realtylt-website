import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — the one ask in the middle of the article, and the reason it is allowed to be there.
 *
 * MEASURED 2026-08-03, on production: a flagship is ~23,000px tall and every single one of them
 * had a stretch of 7,000 to 13,400px with no way to reach anybody at all. On the chat post that
 * gap ran from the calculator at 6,663 to the closing band at 20,034 — 58% of the page, eleven
 * bands, nothing. The two asks that did exist both sat past 87% scroll depth and both pointed at
 * another page of ours rather than at a person.
 *
 * So this scene exists to put ONE moment in that gap. Everything about its shape is an argument
 * against it reading as an ad break:
 *
 *  - It is placed after the section that GIVES the most (the test script, the audit hour, the
 *    consent checks). The reader has just been handed something they can do without us; the offer
 *    is to do that same thing with them. Nothing new is being sold, and nothing is being gated.
 *  - `reassure` is REQUIRED, and it says what will NOT happen. An offer with no stated limit is a
 *    hook. This is the same discipline as StatBars' `note` and the calculator's: the honest part
 *    is structural, not remembered.
 *  - The eyebrow sits out in the left margin at wide widths, which is a footnote's typography
 *    rather than a banner's. No card, no shadow, no icon, no second colour.
 *  - One quiet outline pill. Not a filled button: the filled buttons on this page belong to the
 *    close, and a second one mid-article is what makes a reader feel handled.
 *
 * The mist field is doing all the separation work. Between two white prose bands a soft grey
 * strip reads instantly as a different kind of object, and it costs nothing to draw.
 */
export function Offer({
  eyebrow,
  text,
  reassure,
  action,
  ariaLabel,
}: {
  eyebrow: string;
  text: string;
  reassure: string;
  action: { label: string; href: string };
  ariaLabel: string;
}) {
  return (
    <section className="bg-mist py-14 md:py-20" aria-label={ariaLabel}>
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          {/* Three columns at lg so the middle one is the SAME 44rem reading measure the prose
              above and below it uses, and the eyebrow can sit in the real margin beside it. */}
          <div className="mx-auto grid max-w-[44rem] gap-y-4 lg:mx-0 lg:max-w-none lg:grid-cols-[minmax(0,1fr)_44rem_minmax(0,1fr)] lg:gap-x-10">
            <p className="text-[11px] font-bold uppercase leading-[1.7] tracking-[0.18em] text-stone lg:pt-2 lg:text-right">
              {eyebrow}
            </p>
            <div>
              <p className="text-lg leading-[1.65] text-ink-soft md:text-xl md:leading-[1.6]">
                {text}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={action.href}
                  className="inline-flex h-11 items-center rounded-full border border-line-strong bg-paper px-6 text-xs font-bold uppercase tracking-[0.1em] text-ink transition-colors duration-200 hover:border-ink/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-river"
                >
                  {action.label}
                </a>
                <p className="max-w-sm text-sm leading-relaxed text-stone">{reassure}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
