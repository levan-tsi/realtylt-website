import type { SceneSource, Tile } from "@/lib/blog/flagship";
import { TickBox } from "./Cells";
import { FigureFrame, tone } from "./Figure";

/** PRIMITIVE: a card of facts.
 *
 * Tiles under hairlines, a figure large where the fact has one. `specimen` draws one line of a
 * form above them, with its answer boxes and one box ticked, and says in words that the tick is
 * an example: a filled-in form on a page reads as somebody's real answer otherwise. */
export function Tiles({
  band,
  eyebrow,
  heading,
  lede,
  alt,
  sources,
  note,
  columns,
  tiles,
  specimen,
}: {
  band: "dark" | "light";
  eyebrow: string;
  heading: string;
  lede?: string;
  alt: string;
  sources: SceneSource[];
  note?: string;
  columns: 2 | 3;
  tiles: Tile[];
  specimen?: { line: string; options: string[]; ticked: number; tag: string };
}) {
  const dark = band === "dark";
  const t = tone(dark);
  const ink = dark ? "#ffffff" : "#12161c";

  return (
    <FigureFrame {...{ band, eyebrow, heading, lede, alt, sources, note }}>
      {specimen && (
        <div
          className={`mb-12 max-w-3xl rounded-2xl border px-5 py-5 md:px-7 ${
            dark ? "border-white/15 bg-white/[0.04]" : "border-line-strong bg-paper"
          }`}
        >
          <p className={`text-[15px] leading-snug ${t.muted}`}>{specimen.line}</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            {specimen.options.map((o, i) => {
              const on = i === specimen.ticked;
              return (
                <span key={o} className={`flex items-center gap-2.5 text-lg ${on ? `font-bold ${t.strong}` : t.strong}`}>
                  <TickBox on={on} dark={dark} />
                  {o}
                  {on && <span className="sr-only"> (ticked as an example)</span>}
                </span>
              );
            })}
          </div>
          <p className={`mt-4 text-[13px] ${t.muted}`}>{specimen.tag}</p>
        </div>
      )}

      <ul
        className={`m-0 grid list-none gap-x-10 gap-y-9 p-0 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}
      >
        {tiles.map((tile) => (
          <li key={tile.title} className={`border-t pt-5 ${t.rule}`}>
            {tile.figure && (
              <p className="mb-3 text-4xl font-light leading-none tracking-[-0.02em] md:text-5xl" style={{ color: ink }}>
                {tile.figure}
              </p>
            )}
            <p className={`text-lg leading-snug md:text-xl ${t.strong}`}>{tile.title}</p>
            {tile.body && <p className={`mt-2 text-[15px] leading-relaxed ${t.muted}`}>{tile.body}</p>}
          </li>
        ))}
      </ul>
    </FigureFrame>
  );
}
