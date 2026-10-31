import type { ReactNode } from "react";
import type { BarRow, SceneSource } from "@/lib/blog/flagship";
import { Reveal } from "@/components/ui/Reveal";

/** The frame every round-14 figure sits in: eyebrow, heading, lede, the figure, then the source
 * line and the caveat. One frame so the six figure kinds cannot drift apart in spacing or in how
 * they cite, and so a source line is never optional by accident.
 *
 * The figure itself is a `<figure>` named by `alt`, the one-sentence description the post's data
 * points give. Everything inside it stays real HTML text, so a screen reader can also walk the
 * labels and numbers one by one. */

export const ACCENT = "#28a8e0";

export function tone(dark: boolean) {
  return {
    muted: dark ? "text-paper/65" : "text-stone",
    strong: dark ? "text-paper" : "text-ink",
    rule: dark ? "border-white/12" : "border-line-strong",
    /* A dark band is scoped `.daylight` by the page, so its colours are fixed. A light band sits
       inside the site's night scope, where the tokens re-point: its marks use the tokens so they
       follow the ground they are drawn on. */
    track: dark ? "#232a33" : "var(--color-line)",
    quiet: dark ? "#6b7785" : "var(--color-line-strong)",
    ink: dark ? "#ffffff" : "var(--color-ink)",
    ground: dark ? "#000000" : "var(--color-mist)",
    outline: dark ? "rgba(255,255,255,0.7)" : "var(--color-stone)",
    link: dark
      ? "text-paper/85 underline underline-offset-4 transition-colors hover:text-porchlight"
      : "text-river underline underline-offset-4 transition-colors hover:text-porchlight-deep",
  };
}

export function FigureFrame({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  children,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  children: ReactNode;
}) {
  const dark = band === "dark";
  const t = tone(dark);
  return (
    <section
      className={dark ? "bg-ink py-20 text-paper md:py-28" : "bg-mist py-20 md:py-28"}
      aria-label={heading}
    >
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <Reveal>
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-paper/60" : "text-stone"}`}>
            {eyebrow}
          </p>
          <h2
            className={`mt-5 max-w-2xl text-2xl font-light leading-[1.25] tracking-[-0.015em] md:text-[34px] ${t.strong}`}
          >
            {heading}
          </h2>
          {lede && <p className={`mt-4 max-w-xl leading-relaxed ${t.muted}`}>{lede}</p>}
        </Reveal>

        <Reveal delay={120} className="mt-10 md:mt-14">
          <figure aria-label={alt} className="m-0">
            {children}
            <figcaption className={`mt-10 max-w-3xl text-sm leading-relaxed ${t.muted}`}>
              <span className={`font-bold ${t.strong}`}>Source: </span>
              {sources.map((s, i) => (
                <span key={s.text}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={t.link}>
                      {s.text}
                    </a>
                  ) : (
                    s.text
                  )}
                  {i < sources.length - 1 ? "; " : ""}
                </span>
              ))}
              {note && <span className="mt-3 block">{note}</span>}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/** One labelled share on a track. The words are HTML (they wrap at 390 and stay at reading
 * size); only the track and the bar are drawn. A hollow bar is an outline: a bound or an
 * expectation, never something measured. */
export function Bar({ bar, max, dark }: { bar: BarRow; max: number; dark: boolean }) {
  const t = tone(dark);
  const pct = Math.max(1.2, Math.min(100, (bar.value / max) * 100));
  return (
    <div>
      <div className="flex items-end justify-between gap-5">
        <p className={`text-[15px] leading-snug md:text-base ${t.strong}`}>
          {bar.label}
          {bar.tag && <span className={`mt-1 block text-[13px] ${t.muted}`}>{bar.tag}</span>}
        </p>
        <p
          className={`shrink-0 text-lg leading-none md:text-xl ${
            bar.lit ? `font-bold ${t.strong}` : t.muted
          }`}
        >
          {bar.display}
        </p>
      </div>
      <div aria-hidden className="mt-3 h-3 w-full rounded-full" style={{ background: t.track }}>
        <div
          className="h-full rounded-full"
          style={
            bar.hollow
              ? { width: `${pct}%`, border: `2px solid ${bar.lit ? ACCENT : t.outline}` }
              : { width: `${pct}%`, background: bar.lit ? ACCENT : t.quiet }
          }
        />
      </div>
    </div>
  );
}
