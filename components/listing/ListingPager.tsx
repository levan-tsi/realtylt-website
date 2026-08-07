"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { neighbours, readResultSet, type Neighbours } from "@/lib/idx/result-set";

/** PREVIOUS / NEXT HOME, within the results the visitor was actually looking at.
 *
 * Owner's ask: "when you click listing you have to go back to search or map to find other."
 * The set comes from sessionStorage (written by SearchClient — see lib/idx/result-set.ts for why
 * it is not in the URL), and this renders NOTHING unless the listing on screen is a member of it.
 * That is the whole safety property: a cold visitor out of Google is never handed arrows that
 * walk an order they never chose.
 *
 * IT LIVES ON THE BREADCRUMB ROW, opposite "Search / <County>" — the owner offered two homes for
 * it ("next to address … maybe next to search overview") and this is the one that survives a
 * phone. The sticky sub-nav was tried first and MEASURED: its action group (Offer/Share/Save) is
 * 281px of a 320px screen, so the pager pushed the document 88px past the viewport at 320 and
 * 18px at 390. The breadcrumb row is full width at every size, and it is already the line that
 * says where this listing came from — which is the same thought as moving within that set.
 * Losing stickiness costs little: ← / → work anywhere on the page. */
export function ListingPager({ id }: { id: string }) {
  const router = useRouter();
  // Server render and first paint are identical (null) — sessionStorage does not exist on the
  // server, so reading it during render would hydrate-mismatch every listing page.
  const [nav, setNav] = useState<Neighbours | null>(null);

  useEffect(() => {
    setNav(neighbours(readResultSet(), id));
  }, [id]);

  // Prefetch both sides: this is a browsing control, and a visitor flicking through 12 homes
  // should not wait for a cold route on each press.
  useEffect(() => {
    if (nav?.prev) router.prefetch(nav.prev.path);
    if (nav?.next) router.prefetch(nav.next.path);
  }, [nav, router]);

  // ← / → move between homes. Guarded hard, because this listens on the window:
  //  · an open lightbox or modal owns the keyboard (the photo gallery uses the same two keys for
  //    its own pager, and it declares aria-modal — so does every sheet on this page);
  //  · a visitor typing in a field is not navigating;
  //  · a modifier chord is a browser shortcut (⌘←/Alt+← is BACK), never ours.
  useEffect(() => {
    if (!nav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']")) return;
      const to = e.key === "ArrowLeft" ? nav.prev : nav.next;
      if (!to) return;
      e.preventDefault();
      router.push(to.path);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav, router]);

  if (!nav || nav.count < 2) return null;

  // THE ARROWS SAY WHAT THEY DO, IN WORDS. Owner: "what shows is just number and arrows, we
  // should add next listing / previous listing so people could understand what it is." He is
  // right, and the photo-band fix is what made it urgent — the page now carries TWO working arrow
  // pairs, and a bare chevron cannot tell you which one moves homes. The words are the control;
  // the chevron is decoration beside them.
  const btn =
    "inline-flex min-h-7 items-center gap-1 rounded-xl px-1.5 text-[11px] font-bold uppercase " +
    "tracking-[0.08em] text-stone transition-colors hover:bg-ink/5 hover:text-ink " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-river";

  const arrow = (dir: "prev" | "next") => {
    const to = dir === "prev" ? nav.prev : nav.next;
    const word = dir === "prev" ? "Previous" : "Next";
    const label = to
      ? `${word} listing: ${to.address}`
      : dir === "prev"
        ? "Previous listing (this is the first one)"
        : "Next listing (this is the last one)";
    const path = dir === "prev" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6";
    const icon = (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={path} />
      </svg>
    );
    const inner = dir === "prev" ? <>{icon}{word}</> : <>{word}{icon}</>;
    // The ends are DISABLED, not hidden: a control that disappears under your cursor as you
    // reach the last home is worse than one that visibly runs out.
    return to ? (
      <Link href={to.path} aria-label={label} title={label} className={btn}>
        {inner}
      </Link>
    ) : (
      <span aria-hidden title={label} className={`${btn} pointer-events-none text-stone/35`}>
        {inner}
      </span>
    );
  };

  return (
    // Returns null (not an empty box) when there is no set, so the breadcrumb row's flex gap does
    // not reserve dead space on every cold listing page.
    <div className="flex shrink-0 items-center gap-0.5" role="group" aria-label="Browse listings">
      {arrow("prev")}
      {/* The middle says LISTING too, so the group reads as one sentence about homes rather than
          three separate controls. `tabular-nums` keeps the width from twitching as it counts. */}
      <span className="whitespace-nowrap px-1 text-[11px] font-bold uppercase tracking-[0.08em] tabular-nums text-stone">
        <span className="hidden sm:inline">Listing </span>
        {/* A map-walk set holds thousands — "2,999 of 3,000" reads; "2999 of 3000" counts. */}
        <span className="text-ink">{(nav.index + 1).toLocaleString("en-US")}</span> of {nav.count.toLocaleString("en-US")}
      </span>
      {arrow("next")}
    </div>
  );
}
