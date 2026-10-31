import type { BarRow, CellGroup, CellMark, SceneSource } from "@/lib/blog/flagship";
import { ACCENT, Bar, FigureFrame, tone } from "./Figure";

/** PRIMITIVE: a numbered form drawn as one cell per question.
 *
 * The form is the subject, so the figure is the form: its groups in order, every question a
 * cell, and the questions the post talks about picked out. A cell carries a printed number only
 * when a mark asks for it, because a numeral on the page is a claim and the post states only
 * some of them. Twelve cells to a row in every group, so a cell is the same size everywhere and
 * the groups read as one sheet.
 *
 * @design-artwork: this file DRAWS a paper form (its question cells, a miniature strip of them and
 * a tick box), so the 2 to 5px corners are the object's, not UI chrome on the five-step scale.
 * The other figure primitives import their bits of form from here for that reason. */

const COLS = 12;

export function Cells({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  groups,
  marks,
  strip,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  groups: CellGroup[];
  marks: CellMark[];
  strip?: BarRow[];
}) {
  const dark = band === "dark";
  const t = tone(dark);
  const markOf = (n: number) => marks.find((m) => m.cells.includes(n));
  const ink = dark ? "#ffffff" : "#12161c";
  const stripMax = strip ? Math.max(...strip.map((s) => s.value)) : 1;

  return (
    <FigureFrame {...{ band, eyebrow, heading, lede, alt, sources, note }}>
      <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((g) => (
          <div key={g.label} className={`border-t pt-5 ${t.rule}`}>
            <p className={`text-[15px] font-bold leading-snug ${t.strong}`}>{g.label}</p>
            <p className={`mt-1 text-[13px] ${t.muted}`}>{g.range}</p>
            <div
              aria-hidden
              className="mt-5 grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: g.to - g.from + 1 }, (_, i) => {
                const n = g.from + i;
                const m = markOf(n);
                const fill = m?.tone === "fill";
                const ring = m?.tone === "ring";
                return (
                  <span
                    key={n}
                    className="flex aspect-square items-center justify-center rounded-[3px] text-[10px] font-bold leading-none md:text-[9px]"
                    style={{
                      background: fill ? ACCENT : t.track,
                      boxShadow: ring ? `inset 0 0 0 2px ${ink}` : undefined,
                      color: fill ? "#06131b" : ink,
                    }}
                  >
                    {m?.numbered ? n : null}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-9 flex flex-wrap gap-x-8 gap-y-3">
        {marks.map((m) => (
          <li key={m.label} className={`flex items-center gap-3 text-[15px] ${t.strong}`}>
            <span
              aria-hidden
              className="h-4 w-4 shrink-0 rounded-[3px]"
              style={{
                background: m.tone === "fill" ? ACCENT : t.track,
                boxShadow: m.tone === "ring" ? `inset 0 0 0 2px ${ink}` : undefined,
              }}
            />
            {m.label}
          </li>
        ))}
      </ul>

      {strip && (
        <div className={`mt-12 max-w-2xl space-y-7 border-t pt-8 ${t.rule}`}>
          {strip.map((b) => (
            <Bar key={b.label} bar={b} max={stripMax} dark={dark} />
          ))}
        </div>
      )}
    </FigureFrame>
  );
}

/** The form in miniature: every question a tick on one strip, a gap at each group break, the
 * named questions lit. */
export function MiniForm({
  total,
  breaks,
  lit,
  dark,
}: {
  total: number;
  breaks: number[];
  lit: number[];
  dark: boolean;
}) {
  const t = tone(dark);
  return (
    <div aria-hidden className="mt-5 flex items-end gap-[2px]">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const on = lit.includes(n);
        return (
          <span
            key={n}
            className="block flex-1 rounded-[2px]"
            style={{
              height: on ? 22 : 12,
              background: on ? ACCENT : t.track,
              marginRight: breaks.includes(n) ? 5 : 0,
            }}
          />
        );
      })}
    </div>
  );
}

/** One answer box of a paper form, ticked or empty. */
export function TickBox({ on, dark }: { on: boolean; dark: boolean }) {
  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px]"
      style={{ boxShadow: `inset 0 0 0 2px ${on ? ACCENT : dark ? "rgba(255,255,255,0.4)" : "#9aa7b6"}` }}
    >
      {on && (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
          <path d="M3 8.5l3.2 3.2L13 4.8" stroke={ACCENT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}
