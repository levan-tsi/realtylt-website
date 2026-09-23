import type { Listing } from "@/lib/idx/types";
import { DriftScroller } from "./DriftScroller";
import { ListingCard } from "./ListingCard";
import { ResultSetScope } from "./ResultSetScope";

/** A listing rail that MOVES on its own, instead of waiting to be clicked.
 *
 * The owner's ask: the homes should drift rather than sit until someone presses Next. The
 * reference he sent was a 3D cylinder carousel, and this is deliberately not that — a listing
 * card is not a photograph. It carries a price, an address, a beds/baths line and a View button,
 * and rotating that in 3D skews the type, softens it, and leaves the tap target on an angle. The
 * movement is what he was after; the perspective was the part that would have cost readability.
 * So the cards stay flat and the RAIL moves.
 *
 * A SCROLL POSITION, NOT A TRANSFORM (round 55). Until this round the rail was one CSS animation
 * translating a doubled, 5,760px `will-change: transform` track: no script, and it moved with
 * scripting off. Measured in the owner's Chrome on the real GPU, entering it cost 62 to 132 ms
 * frames, the compositor rastering the whole track's card chrome at once for the run of the
 * animation (docs/parity/DESIGN-ROUND55.md §2.3). Now ./DriftScroller.tsx advances the rail's
 * scrollLeft at the same speed and the browser rasters only what is near the scrollport; with
 * scripting off the rail is a plain scroller holding every home.
 *
 * THE THINGS THAT MAKE A MARQUEE ACCEPTABLE RATHER THAN ANNOYING, all of which it does:
 *  · It pauses on hover AND on focus-within, so nobody has to read a moving target or chase a
 *    button that is walking away from their cursor; and it stands aside for a finger on it and
 *    for a moment after any scroll of its own, so a flick is never fought.
 *  · Under `prefers-reduced-motion` it does not move at all, and the container is a normal
 *    horizontal SCROLLER so every home is still reachable. A reduced-motion visitor must not
 *    simply lose the listings past the fold, which is what `overflow:hidden` plus a dead drift
 *    would have done.
 *  · The second copy of the track exists only to make the wrap seamless. It is `aria-hidden` and
 *    every focusable thing inside it is taken out of the tab order, so a screen reader and a
 *    keyboard each meet the set exactly once. Cards out of view paint nothing
 *    (`content-visibility: auto`, globals.css), so the copy costs nothing until it is seen.
 *
 * CAPPED AT 8, deliberately. MLS media is rate-limit sensitive and this site has already been
 * measured bursting the media host into 429s. Eight unique cards is exactly what RailPager
 * already renders per page, so the request volume is unchanged; the duplicate track re-uses the
 * same image URLs, which the browser serves from cache rather than re-fetching.
 */
const MAX = 8;
/** Seconds per card, so the speed reads the same whether the rail holds four homes or eight. */
const SECONDS_PER_CARD = 7;

export function DriftRail({ listings, ariaLabel }: { listings: Listing[]; ariaLabel: string }) {
  if (listings.length === 0) {
    return (
      <p className="mt-10 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-stone">
        No listings to show right now.{" "}
        <a href="/search" className="text-river underline underline-offset-2">
          Browse all homes
        </a>
        .
      </p>
    );
  }

  const shown = listings.slice(0, MAX);
  // The li wears 8px of padding (box-content, so the card keeps its width) because
  // `content-visibility: auto` brings paint containment, which clips at the li's edge, and a
  // card's 4px hover lift and 4px focus ring have to stay in frame. The gap and the trailing pad
  // are 8px smaller to match, so every card sits exactly where it did.
  const track = (duplicate: boolean) => (
    <ul
      className="flex shrink-0 gap-1 pr-3"
      {...(duplicate ? { "aria-hidden": true as const } : {})}
    >
      {shown.map((l, i) => (
        <li key={`${duplicate ? "dup" : "real"}-${l.id}`} className="box-content w-[78vw] shrink-0 p-2 sm:w-[340px]">
          {/* inert: the duplicate is scenery. Without it `aria-hidden` would be wrapping focusable
              links, which is the one thing aria-hidden must never do — a keyboard would tab into
              cards a screen reader has been told do not exist.
              `inert` is a REAL boolean here (React 19 renders it natively). The first attempt
              passed `"" as unknown as boolean` to satisfy the types, React dropped it as falsy,
              and the probe measured the consequence exactly: 0 inert blocks and 16 tabbable links
              where there should be 8. */}
          <div inert={duplicate}>
            <ListingCard listing={l} priority={!duplicate && i < 2} />
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div role="group" aria-roledescription="carousel" aria-label={ariaLabel}>
      <ResultSetScope listings={shown} backHref="/">
        {/* Room inside, the same room taken back outside: the rail is a scroll container, so it
            clipped a card's 4px hover lift (flat top, square corners) and three sides of its 4px
            focus ring (the first card's ring lost its left edge at the rail's start). The li's
            own 8px padding now holds both; -mx-2 puts the scrollport's edge that far out so the
            first and last card's ring is inside it, and mt-7 + py-1 + the li's 8px = the old 40px
            above the cards, -mb-3 nets the rest out. The cards and everything around them sit
            exactly where they did. */}
        <DriftScroller className="rlt-drift -mx-2 -mb-3 mt-7 py-1" secondsPerCard={SECONDS_PER_CARD}>
          <div className="rlt-drift-track">
            {track(false)}
            {track(true)}
          </div>
        </DriftScroller>
      </ResultSetScope>
      <p className="sr-only">
        These homes scroll on their own. They stop when you hover or focus them, and you can scroll
        the row by hand.
      </p>
    </div>
  );
}
