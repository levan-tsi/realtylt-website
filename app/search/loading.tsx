/** Route-level pending state for /search.
 *
 * The owner reported "search listings is not doing anything when I click". It was navigating —
 * just slowly, and silently. Measured on production, clicking SEARCH LISTINGS from /buying:
 * the URL committed after 590ms, 599ms, 1,604ms and 6,890ms across four runs. A twelve-fold
 * spread with nothing on screen acknowledging the click, so on a slow run the link reads as dead.
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
 * lesson round 14 paid for. */
export default function Loading() {
  return (
    <div
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
  );
}
