import type { PathStep, SceneSource, Tile } from "@/lib/blog/flagship";
import { MiniForm } from "./Cells";
import { ACCENT, FigureFrame, tone } from "./Figure";

/** PRIMITIVE: a numbered path of steps.
 *
 * The infographic of a whole post, when the post ends in something to do. Numbered because the
 * order is the content. A step can carry chips (a document and the question number that asks
 * for it), a miniature of the form with those questions lit, or an example line that says it is
 * an example. `facts` is a short row of the things the path rests on, above it. */
export function Steps({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  facts,
  steps,
  close,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  facts?: Tile[];
  steps: PathStep[];
  close?: string;
}) {
  const dark = band === "dark";
  const t = tone(dark);
  const spine = dark ? "rgba(255,255,255,0.2)" : "var(--color-line-strong)";

  return (
    <FigureFrame {...{ band, eyebrow, heading, lede, alt, sources, note }}>
      {facts && (
        <ul className="m-0 mb-14 grid max-w-4xl list-none gap-x-10 gap-y-6 p-0 sm:grid-cols-3">
          {facts.map((f) => (
            <li key={f.title} className={`border-t pt-4 ${t.rule}`}>
              {f.figure ? (
                <>
                  <p className={`text-3xl font-light leading-none ${t.strong}`}>{f.figure}</p>
                  <p className={`mt-2 text-[15px] leading-snug ${t.muted}`}>{f.title}</p>
                </>
              ) : (
                <p className={`text-xl font-light leading-snug ${t.strong}`}>{f.title}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <ol className="m-0 max-w-3xl list-none p-0">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.title} className={`relative pl-14 md:pl-16 ${last ? "" : "pb-11"}`}>
              {!last && (
                <span aria-hidden className="absolute bottom-0 left-[17px] top-10 w-px" style={{ background: spine }} />
              )}
              <span
                aria-hidden
                className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold"
                style={{ background: ACCENT, color: "#06131b" }}
              >
                {i + 1}
              </span>
              <p className={`pt-1 text-xl leading-snug md:text-2xl md:font-light ${t.strong}`}>{s.title}</p>
              {s.body && <p className={`mt-2 leading-relaxed ${t.muted}`}>{s.body}</p>}
              {s.example && (
                <p className={`mt-3 text-[15px] leading-relaxed ${t.muted}`}>
                  <span className={`mr-2 rounded-lg px-2 py-0.5 text-xs font-bold ${dark ? "bg-white/10 text-paper" : "bg-paper text-ink"}`}>
                    An example, not data
                  </span>
                  {s.example}
                </p>
              )}
              {s.chips && (
                <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
                  {s.chips.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-baseline justify-between gap-4 border-b pb-2 text-[15px] ${t.rule}`}
                    >
                      <span className={t.strong}>{c.label}</span>
                      <span className={`shrink-0 font-bold ${dark ? "text-porchlight" : "text-porchlight-deep"}`}>
                        {c.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {s.mini && <MiniForm {...s.mini} dark={dark} />}
            </li>
          );
        })}
      </ol>

      {close && (
        <p className={`mt-12 max-w-2xl text-xl font-light leading-snug md:text-2xl ${t.strong}`}>{close}</p>
      )}
    </FigureFrame>
  );
}
