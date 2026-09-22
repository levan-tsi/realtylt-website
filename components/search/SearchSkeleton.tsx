/** The /search pending state, drawn in the page's own frame (round 53 polish).
 *
 * It used to be a 560px bar 64px down and a 3 x 2 grid of big cards in a 1400px column, while the
 * page it stands in for is a full-width filter bar 12px under the header, a row of county chips,
 * a count panel, then a list beside a map. So when the page arrived, everything jumped: at 1440
 * the bar rose 52px and widened by 64, and six cards became a list and a map. Measured in the
 * page itself (scripts/_scratch-r53-polish/heights.mjs) and mirrored here, block for block:
 *
 *            bar      chips (wrap as the real ones do)   count panel   then
 *   < 640    165px    one row, 42px                      160px         cards, the map below them
 *   640      114px    three rows                         139px         two columns of cards
 *   768      114px    two rows                           139px
 *   1024     114px    two rows                           106px         list + map, side by side
 *   1280+     62px    one row                             62px
 *
 * Still no shimmer, for the reason the first skeleton gave: this can stand for half a second or
 * for six, and a pulse reads as agitation at the long end. Used by app/search/loading.tsx (the
 * boundary a client navigation actually shows) and by page.tsx's own Suspense fallback, so the
 * two can never disagree. Decoration only; the caller owns the status text and data-js-only. */

/** The six county chips and "NYC boroughs", at their rendered widths, so the row wraps where the
 * real one does. */
const CHIP_WIDTHS = [157, 171, 193, 160, 170, 149, 144];

export function SearchSkeleton() {
  return (
    <div aria-hidden className="mx-auto min-h-[88vh] max-w-[1600px] px-4 pb-16 lg:px-5">
      <div className="mt-3 flex h-[165px] items-start rounded-2xl border border-line bg-mist px-4 pt-5 sm:h-[114px] xl:h-[62px] xl:items-center xl:pt-0">
        <p className="text-[15px] text-stone">Loading search…</p>
      </div>
      <div className="-mx-4 mt-4 flex gap-2 overflow-hidden px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {CHIP_WIDTHS.map((w) => (
          <div key={w} className="h-[42px] shrink-0 rounded-full border border-line" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-3 h-[160px] rounded-2xl bg-mist sm:h-[139px] lg:h-[106px] xl:h-[62px]" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[0.9fr_1.1fr] 2xl:grid-cols-[0.85fr_1.15fr]">
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
