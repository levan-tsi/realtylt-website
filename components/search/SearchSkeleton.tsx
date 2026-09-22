/** The /search pending state, drawn in the page's own frame.
 *
 * It used to be a 560px bar 64px down and a 3 x 2 grid of big cards in a 1400px column, while the
 * page it stands in for is a full-width filter bar 12px under the header, a row of county chips,
 * a count panel, then a list beside a map. So when the page arrived, everything jumped: at 1440
 * the bar rose 52px and widened by 64, and six cards became a list and a map. So it is measured
 * in the page itself and mirrored here, block for block. Round 54's numbers (the bar now carries
 * the shared search instrument, the results row lost its fill and became a hairline band, and the
 * chips scroll in one row below 768):
 *
 *            bar      chips (as the real ones sit)     results row   then
 *   < 768    132px    one scrolling row, 46px          153px         cards, the map below them
 *   768      132px    one wrapped row, 38px            130px         two columns of cards
 *   1024     132px    38px                             130px         list + map, side by side
 *   1280      82px    38px                              97px
 *   1310+     82px    38px                              55px         the row stops wrapping
 *
 * 1310 is not a Tailwind step, it is a MEASUREMENT: the results row's two halves stop wrapping
 * between 1300 and 1310 (bisected on the page, 2026-09-22), and reserving the taller box past
 * that point would pull the arriving page up by 42px — a shift is a shift in either direction.
 *
 * Still no shimmer, for the reason the first skeleton gave: this can stand for half a second or
 * for six, and a pulse reads as agitation at the long end. Used by app/search/loading.tsx (the
 * boundary a client navigation actually shows) and by page.tsx's own Suspense fallback, so the
 * two can never disagree. Decoration only; the caller owns the status text and data-js-only. */

/** The six county chips and "NYC boroughs", at their rendered widths (measured 2026-09-22 at
 * 1440), so the row breaks where the real one does. */
const CHIP_WIDTHS = [78, 92, 113, 81, 91, 69, 140];

export function SearchSkeleton() {
  return (
    <div aria-hidden className="mx-auto min-h-[88vh] max-w-[1600px] px-4 pb-16 lg:px-5">
      <div className="mt-3 flex h-[132px] items-start rounded-2xl border border-line bg-mist px-4 pt-5 xl:h-[82px] xl:items-center xl:pt-0">
        <p className="text-[15px] text-stone">Loading search…</p>
      </div>
      <div className="-mx-4 mt-4 flex gap-2 overflow-hidden px-4 md:mx-0 md:flex-wrap md:px-0">
        {CHIP_WIDTHS.map((w) => (
          <div key={w} className="h-[38px] shrink-0 rounded-full border border-line" style={{ width: w }} />
        ))}
      </div>
      {/* The results row is a hairline band now, not a filled tray: the stand-in is the rule and
          the height, so the arriving page does not have to dissolve a grey box. */}
      <div className="mt-3 h-[153px] border-b border-line md:h-[130px] xl:h-[97px] min-[1310px]:h-[55px]" />
      <div className="mt-5 grid gap-5 sm:mt-8 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[0.9fr_1.1fr] 2xl:grid-cols-[0.85fr_1.15fr]">
        <div className="grid content-start gap-5 sm:grid-cols-2 lg:gap-x-2.5 lg:gap-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-line">
              <div className="aspect-[2/1] bg-mist lg:aspect-[21/10]" />
              <div className="space-y-2.5 p-3">
                <div className="h-4 w-28 rounded-full bg-mist" />
                <div className="h-3 w-40 rounded-full bg-mist" />
                <div className="h-3 w-24 rounded-full bg-mist" />
              </div>
            </div>
          ))}
        </div>
        <div className="hidden rounded-2xl border border-line bg-mist lg:block lg:h-[90vh]" />
      </div>
    </div>
  );
}
