import type { GridItem } from "@/lib/blog/flagship";
import { Reveal } from "@/components/ui/Reveal";

/** PRIMITIVE — n claims on a grid.
 *
 * Replaces FourMoves (2 columns on ink, with the glow) and FailureModes (3 columns on mist),
 * which were the same scene twice with different strings. Every value below is a function of
 * `band` and `columns`, not a separate knob, so a topic cannot invent a fourteenth variant of
 * this layout by accident:
 *
 *  - TWO columns is the STUDIED treatment: larger lead, more air, slower stagger. It is for a
 *    small set of claims a reader is meant to take in one at a time.
 *  - THREE columns is the SCANNED treatment: compact lead, smaller body, tighter stagger. It
 *    is for a checklist.
 *  - A dark band breathes more than a light one (py-36 against py-32). Full-bleed black needs
 *    the extra air or it reads as a slab.
 *
 * No 01/02/03 markers: the heading already says how many there are, so numbering each one adds
 * nothing but the look of a template. Hairline rules carry the structure instead, which is
 * also what makes each cell crop cleanly as its own carousel slide.
 *
 * A scene REPLACES the markdown it stages rather than decorating it, so these words appear
 * exactly once on the page. The scene probe asserts that.
 */
export function Grid({
  band,
  eyebrow,
  heading,
  columns,
  glow,
  items,
  ariaLabel,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  columns: 2 | 3;
  glow?: boolean;
  items: GridItem[];
  ariaLabel: string;
}) {
  const dark = band === "dark";
  const two = columns === 2;

  return (
    <section
      className={
        dark
          ? "relative isolate overflow-hidden bg-ink py-24 text-paper md:py-36"
          : "bg-mist py-24 md:py-32"
      }
      aria-label={ariaLabel}
    >
      {dark && glow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: "radial-gradient(60% 50% at 78% 8%, rgba(40,168,224,0.10), transparent 72%)",
          }}
        />
      )}

      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p
            className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-paper/45" : "text-stone"}`}
          >
            {eyebrow}
          </p>
          {/* 34px, the scene SECTION-heading role. The held STATEMENT scenes (the pull quote
              and the close) are the louder 38px role. Written as two whole class strings, not
              one string plus overrides: two `leading-` utilities in the same class list are
              decided by stylesheet order, not by which one is written last. */}
          <h2
            className={
              dark
                ? "mt-6 text-2xl font-light leading-[1.2] tracking-[-0.015em] md:text-[34px]"
                : "mt-6 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] text-ink md:text-[34px]"
            }
          >
            {heading}
          </h2>
        </Reveal>

        {/* Colour follows the BAND, size and rhythm follow the COLUMNS. The two coincide in
            both of today's instances, which is exactly why they are kept apart: a three-column
            grid on a dark band would otherwise inherit light-band text colours. */}
        <div
          className={
            two
              ? "mt-16 grid gap-x-14 gap-y-12 md:mt-24 md:grid-cols-2 xl:gap-x-24"
              : "mt-14 grid gap-x-12 gap-y-10 md:mt-20 md:grid-cols-3"
          }
        >
          {items.map((m, i) => (
            <Reveal key={m.lead} delay={(two ? 80 : 90) * i}>
              <div
                className={`border-t ${dark ? "border-white/12" : "border-line-strong"} ${two ? "pt-7" : "pt-6"}`}
              >
                <p
                  className={`font-light leading-snug tracking-[-0.01em] ${
                    dark ? "text-paper" : "text-ink"
                  } ${two ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}
                >
                  {m.lead}
                </p>
                <p
                  className={`leading-[1.75] ${dark ? "text-paper/60" : "text-stone"} ${
                    two ? "mt-4" : "mt-3.5 text-sm"
                  }`}
                >
                  {m.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
