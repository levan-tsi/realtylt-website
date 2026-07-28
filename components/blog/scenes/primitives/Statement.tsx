import type { SceneAction } from "@/lib/blog/flagship";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — one line, held.
 *
 * Replaces PullQuote and Funnel, which were the same scene with different furniture: a single
 * sentence at the loud 38px STATEMENT size, on a field, with nothing else on it. This is the
 * easiest asset in the set to reuse as a still or a video beat, which is why it earns a whole
 * band and no ornament at all.
 *
 * `tone` picks a whole preset instead of exposing six knobs:
 *
 *  - QUOTE is the quote card: a porchlight rule, a real <blockquote>, the tighter 5xl measure.
 *  - CLOSE is the ending: a plain statement on the 6xl measure with the real next steps under
 *    it, and no rule, because a close is not a citation.
 *
 * `field` is river or ink rather than dark/light: the quote sits between two near-black scenes
 * and navy is what makes it read as its own chapter instead of more of the same.
 */
export function Statement({
  field,
  tone,
  text,
  glow,
  actions,
  footnote,
  ariaLabel,
}: {
  field: "ink" | "river";
  tone: "quote" | "close";
  text: string;
  glow?: boolean;
  actions?: SceneAction[];
  footnote?: string;
  ariaLabel?: string;
}) {
  const quote = tone === "quote";

  const line = quote ? (
    <blockquote className="mt-10 text-2xl font-light leading-[1.35] tracking-[-0.015em] md:text-[38px] md:leading-[1.28]">
      {text}
    </blockquote>
  ) : (
    <p className="max-w-3xl text-2xl font-light leading-[1.3] tracking-[-0.015em] md:text-[38px] md:leading-[1.24]">
      {text}
    </p>
  );

  return (
    <section
      className={`relative isolate overflow-hidden py-28 text-paper md:py-40 ${
        field === "river" ? "bg-river" : "bg-ink"
      }`}
      aria-label={ariaLabel}
    >
      {glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(60% 60% at 28% 46%, rgba(40,168,224,0.15), transparent 70%)",
          }}
        />
      )}

      <div className={`mx-auto px-4 lg:px-8 ${quote ? "max-w-5xl" : "max-w-6xl"}`}>
        <Reveal>
          {quote ? (
            <figure>
              <span aria-hidden className="block h-[2px] w-12 rounded-full bg-porchlight" />
              {line}
            </figure>
          ) : (
            line
          )}
        </Reveal>

        {(actions?.length || footnote) && (
          <Reveal delay={120}>
            {actions?.length ? (
              <div className="mt-12 flex flex-wrap gap-3 md:mt-14">
                {actions.map((a) => (
                  <Button key={a.href} href={a.href} variant={a.variant}>
                    {a.label}
                  </Button>
                ))}
              </div>
            ) : null}
            {footnote && <p className="mt-6 text-sm text-paper/55">{footnote}</p>}
          </Reveal>
        )}
      </div>
    </section>
  );
}
