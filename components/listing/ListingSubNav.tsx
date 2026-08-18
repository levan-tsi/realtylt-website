"use client";

import { useEffect, useState } from "react";
import { PRESS } from "@/components/ui/Button";
import { ShareButton } from "@/components/idx/ShareButton";
import { FavoriteButton } from "@/components/idx/FavoriteButton";

/** Live realtylt.com's slim sticky sub-nav under the header: in-page anchor links on the
 * left [Search · Overview · Payment · Market Insights · Schools] and the primary actions on
 * the right [$ Make an Offer · Share · Save]. Reuses the existing pieces:
 *  - Make an Offer dispatches `listing:make-offer`, which ListingLeadCTAs opens the offer sheet for.
 *  - Share = the same ShareButton used in the facts header.
 *  - Save  = the same FavoriteButton (account/device-synced) used on the gallery.
 * Desktop shows anchors + actions; ≤md hides the anchors and keeps the actions (spec §L1). */

// DOCUMENT ORDER, and it has to stay that way: this is a table of contents, and one that
// disagrees with the page sends the visitor backwards. Measured 2026-07-30 on a real listing —
// Overview y=614, Schools y=2145, Payment y=2478, Market Insights y=3409 — while the nav read
// Overview · Payment · Market Insights · Schools, so working down it jumped 614 → 2478 → 3409 →
// back up to 2145. (If Schools should instead READ last, move the section, not this list.)
const ANCHORS = [
  { id: "overview", label: "Overview" },
  { id: "schools", label: "Schools" },
  { id: "payment", label: "Payment" },
  { id: "market-insights", label: "Market Insights" },
] as const;

export function ListingSubNav({
  countySlug,
  hasSchools,
  hidePayment = false,
  shareTitle,
  favoriteId,
}: {
  countySlug: string;
  hasSchools: boolean;
  /** Rentals hide the Payment + Market Insights sections, so drop their anchors too. */
  hidePayment?: boolean;
  shareTitle: string;
  favoriteId: string;
}) {
  const anchors = ANCHORS.filter(
    (a) =>
      (a.id !== "schools" || hasSchools) &&
      (!hidePayment || (a.id !== "payment" && a.id !== "market-insights")),
  );
  const [searchHref, setSearchHref] = useState(`/search?county=${countySlug}`);
  const [active, setActive] = useState<string>(anchors[0]?.id ?? "overview");

  // "Search" returns to the results the visitor came from when that was our /search page
  // (county-preserving); otherwise it lands on the listing's county search.
  useEffect(() => {
    try {
      const ref = document.referrer;
      if (!ref) return;
      const u = new URL(ref);
      if (u.origin === window.location.origin && u.pathname === "/search") {
        setSearchHref(`/search${u.search}`);
      }
    } catch {
      /* malformed referrer — keep the county default */
    }
  }, []);

  // Scroll-spy: highlight the anchor whose section is centered in the viewport.
  useEffect(() => {
    const els = anchors
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSchools]);

  const jumpTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Keyboard: move focus to the section without triggering a second scroll.
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
    setActive(id);
  };

  const linkCls = (isActive: boolean) =>
    `inline-flex min-h-6 items-center whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river ${
      isActive ? "text-ink" : "text-stone hover:text-ink"
    }`;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 lg:px-8">
        <ul className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto py-2 md:flex">
          <li>
            <a href={searchHref} className={linkCls(false)}>
              Search
            </a>
          </li>
          {anchors.map((a) => (
            <li key={a.id}>
              <a
                href={`#${a.id}`}
                aria-current={active === a.id ? "true" : undefined}
                onClick={(e) => jumpTo(e, a.id)}
                className={`${linkCls(active === a.id)} ${
                  active === a.id ? "underline decoration-ink decoration-2 underline-offset-[6px]" : ""
                }`}
              >
                {a.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex shrink-0 items-center gap-2 py-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("listing:make-offer"))}
            className={`inline-flex min-h-6 items-center gap-1.5 rounded-xl bg-ink px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-paper ${PRESS} hover:bg-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river`}
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="hidden sm:inline">Make an </span>Offer
          </button>
          <ShareButton title={shareTitle} />
          <FavoriteButton id={favoriteId} tone="onLight" showLabel className="border border-ink/15" />
        </div>
      </div>
    </nav>
  );
}
