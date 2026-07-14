import type { Figure } from "@/lib/services";

/** The service page's picture.
 *
 * A stock photo of a headset says nothing about what an AI voice agent does, and a page
 * that is only prose reads as a doorway page. So the "image" here is a DIAGRAM built in
 * HTML, and each service picks the shape that matches its work:
 *
 *   transcript — the product IS a conversation (chat, reactivation, reviews)
 *   timeline   — the product is SPEED (voice, booking, invoicing)
 *   records    — the product is DATA (skip-trace, enrichment, documents, qualification)
 *   flow       — the product is a CHAIN of steps (workflow, custom, CRM sync, SEO)
 *
 * Zero client JS. Renders on the ink hero, so every colour here is tuned for #222.
 */

function Shell({
  caption,
  footnote,
  children,
}: {
  caption: string;
  footnote: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="border border-paper/15 bg-ink-soft p-6 md:p-7">
      <figcaption className="flex items-baseline justify-between gap-4 border-b border-paper/10 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-paper/55">
          {caption}
        </span>
        <span aria-hidden className="hidden shrink-0 text-[11px] tracking-[0.2em] text-porchlight sm:block">
          ///
        </span>
      </figcaption>

      <div className="pt-5">{children}</div>

      <p className="mt-6 border-t border-paper/10 pt-4 text-xs leading-relaxed text-paper/55">
        {footnote}
      </p>
    </figure>
  );
}

const CHIP =
  "border border-paper/20 px-2 py-1 text-[11px] leading-none text-paper/85";

export function ServiceFigure({ figure }: { figure: Figure }) {
  if (figure.kind === "transcript") {
    return (
      <Shell caption={figure.caption} footnote={figure.footnote}>
        <ol className="space-y-3">
          {figure.turns.map((t, i) => (
            <li
              key={i}
              className={
                t.who === "ai"
                  ? "mr-auto max-w-[92%] border-l-2 border-porchlight bg-white/[0.06] px-4 py-3"
                  : "ml-auto max-w-[88%] border border-paper/15 px-4 py-3"
              }
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-paper/45">
                {t.who === "ai" ? "Assistant" : "Visitor"}
              </p>
              <p
                className={`mt-1.5 text-sm leading-relaxed ${
                  t.who === "ai" ? "text-paper" : "text-paper/80"
                }`}
              >
                {t.text}
              </p>
            </li>
          ))}
        </ol>
      </Shell>
    );
  }

  if (figure.kind === "timeline") {
    return (
      <Shell caption={figure.caption} footnote={figure.footnote}>
        <ol className="relative space-y-5 border-l border-paper/15 pl-6">
          {figure.events.map((e, i) => (
            <li key={i} className="relative">
              <span
                aria-hidden
                className={`absolute -left-[27px] top-[7px] h-2 w-2 rounded-full ${
                  i === 0 ? "bg-porchlight" : "bg-paper/30"
                }`}
              />
              {/* NOT uppercased: the values are already written as they should read
                  ("0.4s", "1:26", "Day 3"), and `uppercase` turns 0.4s into 0.4S. */}
              <p className="text-[11px] font-bold tracking-[0.16em] text-porchlight">{e.at}</p>
              <p className="mt-1 font-bold leading-snug text-paper">{e.label}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-paper/60">{e.note}</p>
            </li>
          ))}
        </ol>
      </Shell>
    );
  }

  if (figure.kind === "records") {
    return (
      <Shell caption={figure.caption} footnote={figure.footnote}>
        <div className="flex items-baseline justify-between gap-4 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-paper/40">
          <span>{figure.headers.before}</span>
          <span className="text-right">{figure.headers.after}</span>
        </div>
        <ol>
          {figure.rows.map((r, i) => (
            <li key={i} className="border-t border-paper/10 py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-sm leading-snug text-paper/60">{r.before}</p>
                <span className="shrink-0 border border-porchlight/45 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.1em] text-porchlight">
                  {r.tag}
                </span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {r.after.map((a) => (
                  <li key={a} className={CHIP}>
                    {a}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Shell>
    );
  }

  return (
    <Shell caption={figure.caption} footnote={figure.footnote}>
      <p className="inline-block border border-paper/25 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-paper">
        {figure.trigger}
      </p>
      <ol className="mt-5 space-y-4">
        {figure.nodes.map((n, i) => (
          <li key={i} className="relative flex gap-4 pb-4 last:pb-0">
            {/* hairline connector, stopped short of the last node */}
            {i < figure.nodes.length - 1 && (
              <span
                aria-hidden
                className="absolute left-[13px] top-8 h-[calc(100%-1rem)] w-px bg-paper/15"
              />
            )}
            <span
              aria-hidden
              className="relative z-10 grid h-[27px] w-[27px] shrink-0 place-items-center border border-paper/25 bg-ink-soft text-[11px] font-bold text-paper/70"
            >
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-bold leading-snug text-paper">{n.label}</p>
              <p className="mt-0.5 text-sm leading-relaxed text-paper/60">{n.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </Shell>
  );
}
