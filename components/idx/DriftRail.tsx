import type { Listing } from "@/lib/idx/types";
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
 * NO JAVASCRIPT. The whole thing is one CSS animation on a flex track, which means it costs
 * nothing in the bundle, runs on the compositor, and still moves for a visitor with scripting
 * off — the same visitor /search had to be rescued for this round.
 *
 * THE THINGS THAT MAKE A MARQUEE ACCEPTABLE RATHER THAN ANNOYING, all of which it does:
 *  · It pauses on hover AND on focus-within, so nobody has to read a moving target or chase a
 *    button that is walking away from their cursor.
 *  · Under `prefers-reduced-motion` it does not animate at all, and the container becomes a
 *    normal horizontal SCROLLER so every home is still reachable. A reduced-motion visitor must
 *    not simply lose the listings past the fold, which is what `overflow:hidden` plus a dead
 *    animation would have done.
 *  · The second copy of the track exists only to make the loop seamless. It is `aria-hidden` and
 *    every focusable thing inside it is taken out of the tab order, so a screen reader and a
 *    keyboard each meet the set exactly once.
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
  const track = (duplicate: boolean) => (
    <ul
      className="flex shrink-0 gap-5 pr-5"
      {...(duplicate ? { "aria-hidden": true as const } : {})}
    >
      {shown.map((l, i) => (
        <li key={`${duplicate ? "dup" : "real"}-${l.id}`} className="w-[78vw] shrink-0 sm:w-[340px]">
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
        <div
          className="rlt-drift mt-10"
          style={{ ["--drift-duration" as string]: `${shown.length * SECONDS_PER_CARD}s` }}
        >
          <div className="rlt-drift-track">
            {track(false)}
            {track(true)}
          </div>
        </div>
      </ResultSetScope>
      <p className="sr-only">
        These homes scroll on their own. They stop when you hover or focus them, and you can scroll
        the row by hand.
      </p>
    </div>
  );
}
