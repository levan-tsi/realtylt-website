"use client";

import Link from "next/link";
import { useSaved } from "@/components/auth/SavedProvider";

/** The /search side rail (round 23 — research in docs/parity/DESIGN-ROUND23.md §7): three
 * items that can all answer TODAY. Zillow's five-tab rail inspired it; Updates and Inbox are
 * deliberately absent because nothing sends and nothing receives — a tab that cannot answer
 * is worse than no tab. Desktop only (lg+): phones keep the header nav, and the rail's whole
 * point is one-click side navigation while the map is open. */

const icon = {
  search: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  saved: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  plan: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* A route between two points — planning as a path, not a clipboard. */}
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h1" />
    </svg>
  ),
};

export function SearchRail() {
  const { favorites } = useSaved();

  const item =
    "relative flex w-14 flex-col items-center gap-1 rounded-xl py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river";

  return (
    <nav aria-label="Search tools" className="sticky top-20 hidden self-start pl-3 pt-4 lg:block">
      <ul className="flex flex-col gap-1.5">
        <li>
          {/* The page we are on — marked current, not a dead control. */}
          <Link href="/search" aria-current="page" className={`${item} bg-ink text-paper`}>
            {icon.search}
            Search
          </Link>
        </li>
        <li>
          <Link href="/saved" className={`${item} text-stone hover:bg-mist hover:text-ink`}>
            {icon.saved}
            Saved
            {favorites.length > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-bold leading-none text-paper">
                {favorites.length > 99 ? "99+" : favorites.length}
              </span>
            )}
          </Link>
        </li>
        <li>
          {/* ?quiz=1 opens the plan quiz on arrival (round 24) — the rail's Plan item IS
              "click on things, popup quiz", his words. /plan without it stays quiet. */}
          <Link href="/plan?quiz=1" className={`${item} text-stone hover:bg-mist hover:text-ink`}>
            {icon.plan}
            Plan
          </Link>
        </li>
      </ul>
    </nav>
  );
}
