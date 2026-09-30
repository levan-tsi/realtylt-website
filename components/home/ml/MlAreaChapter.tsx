"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PRESS } from "@/components/ui/Button";
import { loadLights } from "@/lib/idx/lights-client";
import { useMlArea } from "./MlGround";
import type { AreaRow } from "../night/AreaChapter";

/** WHERE WE WORK on the MapLibre night map (round 57.12, /lab/ml): ../g3d/G3dAreaChapter.tsx reading
 * this ground's context instead of the Google map's; the same rows, counts and hover / focus / tap. */

export function MlAreaChapter({ rows }: { rows: readonly AreaRow[] }) {
  const { current, point, goTo } = useMlArea();
  const chipRow = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let alive = true;
    void loadLights().then((pts) => {
      if (alive && pts) setCounts(pts.countyCounts);
    });
    return () => {
      alive = false;
    };
  }, []);

  const groups = [
    { id: "valley", label: "Hudson Valley", items: rows.filter((r) => r.group === "valley") },
    { id: "city", label: "New York City", items: rows.filter((r) => r.group === "city") },
  ];

  const active = rows.find((r) => r.shot === current) ?? rows[0];
  const activeCount = active ? counts?.[active.slug] : undefined;

  // The chip under the camera stays in view as the scroll flies from area to area.
  useEffect(() => {
    const row = chipRow.current;
    const chip = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !chip || row.offsetParent === null) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [current]);

  return (
    <>
    {/* ROUND 62, THE PHONE (app/globals.css .rlt-areas): the stage is pinned and the map above it is
        the content, so the eleven rows become the area under the camera, its homes, and a row of
        chips. The scroll is the flight: scrolling moves the camera from area to area, and a chip
        scrolls the page to its area. Shown only on a phone with JavaScript; otherwise the lists. */}
    {active ? (
      <div className="rlt-area-chips mt-5">
        <div className="flex items-end justify-between gap-4">
          <div className="phone-halo min-w-0">
            <p className="truncate text-[26px] font-medium leading-tight tracking-[-0.02em] text-ink">{active.name}</p>
            <p className="mt-1 text-[16px] tabular-nums text-ink-soft">
              {activeCount ? `${activeCount.toLocaleString("en-US")} ${activeCount === 1 ? "home" : "homes"} for sale` : " "}
            </p>
          </div>
          <Link
            href={active.href}
            className={`phone-glass phone-halo inline-flex min-h-[40px] shrink-0 items-center rounded-xl border border-line-strong bg-night/45 px-4 text-[15px] font-semibold tracking-[-0.005em] text-ink backdrop-blur-md hover:border-stone hover:bg-night/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-porchlight ${PRESS}`}
          >
            See homes
          </Link>
        </div>
        <div
          ref={chipRow}
          role="group"
          aria-label="Areas"
          className="-mx-4 mt-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {groups.map((group) => (
            <div key={group.id} className="contents">
              <span className="phone-halo shrink-0 pl-1 pr-1 text-[13px] text-stone first:pl-0">{group.label}</span>
              {group.items.map((row) => {
                const on = row.shot === active.shot;
                return (
                  <button
                    key={row.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => goTo(row.shot)}
                    className={`min-h-[40px] shrink-0 rounded-full border px-4 text-[15px] font-medium tracking-[-0.005em] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-porchlight motion-reduce:transition-none ${
                      on ? "border-ink bg-ink text-paper" : "phone-glass phone-halo border-line-strong bg-night/80 text-ink-soft backdrop-blur-md hover:border-stone hover:text-ink"
                    } ${PRESS}`}
                  >
                    {row.name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    ) : null}
    <div className="rlt-area-lists mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-12">
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="t-eyebrow text-stone">{group.label}</h3>
          <ul className="mt-3 border-t border-line">
            {group.items.map((row) => {
              const on = current === row.shot;
              const n = counts?.[row.slug];
              return (
                <li key={row.slug}>
                  <Link
                    href={row.href}
                    onPointerEnter={() => point(row.shot)}
                    onPointerLeave={(e) => {
                      if (e.pointerType === "mouse") point(null);
                    }}
                    onFocus={() => point(row.shot)}
                    onBlur={() => point(null)}
                    // Round 57.5: a click (or Enter) always opens the county's page; the pointer's
                    // hover and the keyboard's focus are what fly the map there first. Round 57.3's
                    // first click held the map and only the second navigated, so a visitor could
                    // click a link and see the page not move (DESIGN-ROUND57.md §4, round 5 A2).
                    className={`group flex items-baseline gap-3 border-b border-line py-3 transition-colors duration-200 motion-reduce:transition-none ${PRESS}`}
                  >
                    {/* A lamp, not a bullet: it lights when the camera is over this area, the
                        same way the area's own homes do behind it. */}
                    <span
                      aria-hidden
                      className={`relative top-[-4px] h-[6px] w-[6px] shrink-0 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                        on ? "scale-150 bg-ink ring-4 ring-ink/15" : "bg-line-strong ring-0 ring-ink/0"
                      }`}
                    />
                    <span
                      className={`flex-1 text-[20px] font-medium tracking-[-0.018em] transition-colors duration-200 motion-reduce:transition-none lg:text-[22px] ${
                        on ? "text-ink" : "text-ink-soft group-hover:text-ink"
                      }`}
                    >
                      {row.name}
                    </span>
                    {/* The count is the one thing in this list that is a MEASUREMENT, and at night
                        it sat over the constellation in `text-stone` at 13px: measured on the real
                        pixels behind it, 1.5:1 over the boroughs (round 54, builder 3). A muted
                        grey needs a background under 0.034 relative luminance to clear 4.5:1,
                        which is not something a live city can promise; ink-soft has twice the
                        head-room, and 14px is a number somebody actually reads. */}
                    <span
                      className={`shrink-0 text-[14px] tabular-nums transition-colors duration-200 motion-reduce:transition-none ${on ? "text-ink" : "text-ink-soft"}`}
                    >
                      {n ? `${n.toLocaleString("en-US")} ${n === 1 ? "home" : "homes"}` : " "}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
    </>
  );
}
