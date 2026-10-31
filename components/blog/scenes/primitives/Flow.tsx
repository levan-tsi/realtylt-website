import type { FlowGate, SceneSource } from "@/lib/blog/flagship";
import { ACCENT, FigureFrame, tone } from "./Figure";

/** PRIMITIVE: questions in order, each with the answer that leaves the path.
 *
 * One spine down the left with a numbered node per question (the order is the content, so the
 * numbers are earned), the continuing answer written on the spine, and the leaving answer as a
 * box beside the question on a wide screen or under it on a phone. The spine ends in a filled
 * node: the one place every path that stayed on it arrives. When every exit lands in the same
 * place, `tray` names it once instead of on every box. */
export function Flow({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  gates,
  end,
  tray,
  example,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  gates: FlowGate[];
  end: { title: string; detail?: string };
  tray?: string;
  example?: string;
}) {
  const dark = band === "dark";
  const t = tone(dark);
  const spine = dark ? "rgba(255,255,255,0.2)" : "var(--color-line-strong)";
  const box = dark ? "border-white/15 bg-white/[0.04]" : "border-line-strong bg-paper";

  return (
    <FigureFrame {...{ band, eyebrow, heading, lede, alt, sources, note }}>
      <ol className="m-0 max-w-4xl list-none p-0">
        {gates.map((g, i) => (
          <li key={g.ask} className="relative pb-12 pl-14 md:pl-16">
            <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-px" style={{ background: spine }} />
            <span
              aria-hidden
              className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${t.strong}`}
              style={{ boxShadow: `inset 0 0 0 1.5px ${spine}` }}
            >
              {i + 1}
            </span>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-10">
              <div>
                <p className={`pt-0.5 text-xl font-light leading-snug md:text-2xl ${t.strong}`}>{g.ask}</p>
                <p className={`mt-4 text-sm font-bold ${t.muted}`}>
                  {g.pass}
                  <span className="font-normal">, carry on</span>
                </p>
              </div>
              <div className={`rounded-2xl border px-5 py-4 ${box}`}>
                <p className={`text-sm font-bold ${t.muted}`}>
                  <span className="sr-only">If the answer is </span>
                  {g.exit}
                  {tray && <span className={t.strong}>{`, so ${tray.toLowerCase()}`}</span>}
                </p>
                <p className={`mt-2 text-[17px] leading-snug ${t.strong}`}>{g.outcome}</p>
                {g.detail && <p className={`mt-1.5 text-[15px] leading-relaxed ${t.muted}`}>{g.detail}</p>}
              </div>
            </div>
          </li>
        ))}
        <li className="relative pl-14 md:pl-16">
          <span aria-hidden className="absolute left-[7px] top-1 h-[18px] w-[18px] rounded-full" style={{ background: ACCENT }} />
          <p className={`text-xl leading-snug md:text-2xl ${t.strong}`}>{end.title}</p>
          {end.detail && <p className={`mt-2 max-w-xl leading-relaxed ${t.muted}`}>{end.detail}</p>}
        </li>
      </ol>

      {example && (
        <p className={`mt-12 max-w-2xl border-l-2 pl-5 leading-relaxed ${t.muted}`} style={{ borderColor: ACCENT }}>
          <span className={`block text-xs font-bold uppercase tracking-[0.16em] ${t.strong}`}>An invented example, not data</span>
          <span className="mt-2 block">{example}</span>
        </p>
      )}
    </FigureFrame>
  );
}
