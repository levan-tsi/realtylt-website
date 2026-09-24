"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PRESS } from "@/components/ui/Button";
import { loadLights } from "@/lib/idx/lights-client";
import { useG3dArea } from "./G3dGround";
import type { AreaRow } from "../night/AreaChapter";

/** WHERE WE WORK on the real map (round 56 lab): the night flight's chapter (../night/AreaChapter.tsx,
 * unchanged and still the home page's), reading the real map's ground instead of the night
 * flight's. Same rows, same counts from the one /api/lights fetch, same hover / focus / tap
 * contract: a row flies the camera to its county and gives the scroll its job back on the way out.
 * A copy only because the night chapter reads its ground's context by import; phase 2 lifts that
 * context into one module both grounds provide, and this file goes. */

export function G3dAreaChapter({ rows }: { rows: readonly AreaRow[] }) {
  const { current, point } = useG3dArea();
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

  return (
    <div className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-12">
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
  );
}
