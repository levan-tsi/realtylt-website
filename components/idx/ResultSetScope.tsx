"use client";

import { saveResultSet } from "@/lib/idx/result-set";
import { listingPath } from "@/lib/idx/listing-url";
import type { Listing } from "@/lib/idx/types";

/** Marks a group of listing cards as "the set the visitor is browsing", so opening any card in it
 * gives that listing page working Previous/Next arrows.
 *
 * WHY THIS EXISTS (owner, 2026-08-02: "on some pages it does not show?"). He was right and it was
 * not a caching ghost: only /search recorded a set, so the arrows appeared on a listing opened
 * from search and on nothing else — not from the home rails, not from Saved, not from a county
 * page, not from the similar-homes rail. Arriving with arrows sometimes and without them other
 * times is worse than never having them, because the visitor cannot tell which page is broken.
 *
 * IT CAPTURES ON CLICK, NOT ON RENDER, and that is the whole design. The home page shows TWO
 * rails at once; whichever wrote last on mount would win, so clicking a card in the Featured rail
 * would hand you the New Listings set — wrong neighbours, or no arrows at all when the clicked
 * home is not in the other rail. A click names its own list unambiguously.
 *
 * Capture phase, so the set is written before the <Link> navigates. */
export function ResultSetScope({
  listings,
  backHref,
  className,
  children,
}: {
  listings: readonly Listing[];
  /** Where "these results" live — the page this group is on. */
  backHref: string;
  className?: string;
  children: React.ReactNode;
}) {
  const record = () => {
    if (listings.length < 2) return; // one card is not a set to page through
    saveResultSet({
      items: listings.map((l) => ({ id: l.id, path: listingPath(l), address: l.address })),
      page: 1,
      totalPages: 1,
      searchHref: backHref,
    });
  };
  // Keyboard users activate a card link with Enter, which does not always produce a click first.
  return (
    <div className={className} onClickCapture={record} onKeyDownCapture={(e) => e.key === "Enter" && record()}>
      {children}
    </div>
  );
}
