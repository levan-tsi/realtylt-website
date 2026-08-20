import { SITE, TOP_AREA_GROUPS } from "@/lib/site";

/** Route-level pending state for /search — and the only thing on this route a visitor without
 * JavaScript ever sees.
 *
 * THE PENDING STATE. The owner reported "search listings is not doing anything when I click". It
 * was navigating — just slowly, and silently. Measured on production, clicking SEARCH LISTINGS
 * from /buying: the URL committed after 590ms, 599ms, 1,604ms and 6,890ms across four runs. A
 * twelve-fold spread with nothing on screen acknowledging the click, so on a slow run the link
 * reads as dead.
 *
 * The page already has a Suspense boundary whose comment claims it "covers a client-side
 * navigation INTO /search, where the RSC payload is in flight". It cannot. On a client
 * navigation Next holds the entire RSC response until the route's server component produces
 * output, and `loadFirstPage` fetches the first page of results before it can — so the boundary
 * has nothing to fall back FROM yet and the previous page simply stays put. `loading.tsx` is the
 * one thing Next renders the instant the transition starts.
 *
 * Geometry deliberately mirrors that Suspense fallback (88vh reserve, same max-width and
 * padding) so the two boundaries cannot disagree and the swap stays off-screen — the same CLS
 * lesson round 14 paid for.
 *
 * WHY THE NO-JS BLOCK LIVES HERE, of all places. This file is also what makes /search unusable
 * without scripting, and the two facts are the same fact. A loading.tsx wraps the whole route in
 * a Suspense boundary, so the page — which awaits its first page of results — is STREAMED: React
 * ships the real body inside `<div hidden id="S:0">` and reveals it with an inline `$RC(...)`
 * call. No script, no reveal. Measured on a production build: 50 <article> elements in the DOM,
 * 0 visible, 4 `$RC(` calls and 5 `<template id="B:n">` boundaries in the HTML; deleting this
 * file and rebuilding takes the page from 51 visible links to 78 and doubles its text.
 *
 * So page.tsx's own <noscript> — "The homes below are today's Hudson Valley listings" — sat
 * inside that hidden div and never reached one of the visitors it was written for. It promised
 * homes that were not there to a reader who could not read it.
 *
 * This fallback is in the SHELL, which is exactly the part that does render without scripting.
 * The skeleton is a promise only JavaScript can keep, so `data-js-only` retires it and the block
 * below takes over with somewhere real to go. The county pages are statically generated and were
 * driven with scripting off to confirm it: /top-areas/dutchess and /top-areas/westchester each
 * serve six linked homes, /top-areas lists all eleven areas.
 *
 * Keeping loading.tsx and losing the streamed body is the right side of that trade: the pending
 * state fixes a complaint the owner actually made and that was measured, while no-JS visitors are
 * rare and are now handed working pages rather than a wall of grey boxes. */
export default function Loading() {
  return (
    <>
      <div
        data-js-only
        className="mx-auto min-h-[88vh] max-w-[1400px] px-4 py-16 lg:px-8"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Loading search results</span>
        {/* A quiet stand-in for the filter bar and the first row of cards. Not an animated
            shimmer: this surface can appear for half a second or for six, and a pulsing skeleton
            reads as agitation at the long end. Motion here would also have to be silenced for
            reduced-motion visitors, for no gain. */}
        <div aria-hidden className="rounded-2xl border border-line bg-mist p-6">
          <div className="h-10 w-full max-w-[560px] rounded-xl bg-line/60" />
        </div>
        <div aria-hidden className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[3/2] rounded-2xl border border-line bg-mist" />
          ))}
        </div>
        <p className="mt-8 text-sm text-stone">Loading search…</p>
      </div>

      <noscript>
        {/* A <style> still applies from inside a hidden subtree, but this one is a sibling of the
            skeleton rather than a child of it — hiding its own container would take this message
            down with it. */}
        <style>{`[data-js-only]{display:none!important}`}</style>
        <div className="mx-auto min-h-[60vh] max-w-[1250px] px-4 py-16 lg:px-8">
          <h2 className="t-h2 text-ink">Search needs JavaScript</h2>
          <p className="mt-4 max-w-xl leading-[1.7] text-stone">
            The filters, the map and saved searches all run in the browser. Every area we cover has
            its own page that works without them, with homes listed on it.
          </p>

          <div className="mt-10 space-y-8 border-t border-line pt-10">
            {TOP_AREA_GROUPS.map((group) => (
              <div key={group.id} className="flex flex-col gap-3 md:flex-row md:gap-10">
                <h3 className="t-eyebrow shrink-0 text-ink md:w-36 md:pt-2.5">{group.label}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="inline-flex min-h-[36px] items-center rounded-full border border-line px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-stone hover:border-ink hover:bg-ink hover:text-paper"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-stone">
            Or call{" "}
            <a href={SITE.phoneHref} className="font-bold text-ink underline underline-offset-2">
              {SITE.phone}
            </a>{" "}
            and we&rsquo;ll run a search for you.
          </p>
        </div>
      </noscript>
    </>
  );
}
