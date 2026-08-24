import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/idx/types";
import { listingPath } from "@/lib/idx/listing-url";
import { listingStats } from "@/lib/format";
import { CardPhotos } from "./CardPhotos";
import { FavoriteButton } from "./FavoriteButton";
import { MlsImage } from "./MlsImage";

/** Live MLS photos are served via our CDN-cached /api/media/… proxy (the MLS media CDN
 * enforces a hard per-account request budget — see that route). They render `unoptimized`
 * so the image optimizer doesn't multiply upstream fetches per width or burn
 * transformation quota; fixture/local images stay optimized. */
export function isLiveMlsPhoto(src: string | undefined): boolean {
  return !!src && (src.startsWith("/api/media/") || src.startsWith("http"));
}

/** True only for a price we can actually print. */
function hasPrice(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** A feed row can arrive without a usable ListPrice (auction, "call for price", a Coming Soon
 * row that synced before pricing). `undefined.toLocaleString()` threw inside the card, and
 * because every card renders inside one list, ONE such row blanked the entire search grid
 * with a React error. It degrades to a label now. */
export function formatPrice(n: number | null | undefined): string {
  return hasPrice(n) ? `$${n.toLocaleString("en-US")}` : "Price on request";
}

/** Price label that reads correctly for rentals: a lease's feed price is the MONTHLY rent, so
 * rentals render "$X,XXX/mo"; everything for sale stays a plain total. */
export function priceLabel(l: { price: number | null | undefined; propertyType?: string }): string {
  const label = formatPrice(l.price);
  if (!hasPrice(l.price)) return label; // never "Price on request/mo"
  return l.propertyType === "Rental" ? `${label}/mo` : label;
}

/** Branded fallback when a listing's photograph isn't available yet (feed rows without Media, or
 * photos still replicating into Storage). Same asset the /api/media route redirects to on its
 * stable-empty path, so the state reads identically on every surface.
 *
 * IT IS NOT A PICTURE OF A HOUSE, deliberately. It used to be: a moonlit stone manor under fog
 * with COMING SOON in gold script (the owner's own Nano Banana Pro generation, 2026-07-29). He
 * asked for it to be replaced — "quality is low and in general dont like what we have now" — and
 * both halves of that have the same answer. It was soft because a 1200px raster was filling 2x
 * retina cards, and it looked wrong because it was a FABRICATED PROPERTY standing in for a real
 * one, on a site that is otherwise calm and monochrome. A better fake house would have fixed only
 * the first half. This is a typographic panel in the site's own palette and display face: it
 * cannot be mistaken for the actual home, it cannot read as generated, it is resolution
 * independent at any card size, and it is ~1KB instead of 50.
 *
 * `caption=false` is the wordless cut for portrait overlay tiles, which print their own price and
 * address over the image and do not need a second line of type competing with it.
 *
 * `unoptimized` because Next's image optimizer rasterises SVG — which would throw away the entire
 * reason this is an SVG. bg-mist, not bg-ink: the panel is light, and a black backing plate showed
 * as a hard frame around it while the image decoded. */
export function NoPhoto({ caption = true }: { caption?: boolean } = {}) {
  return (
    <div className="absolute inset-0 bg-mist" aria-hidden>
      <Image
        src={caption ? "/images/mls/coming-soon.svg" : "/images/mls/coming-soon-notext.svg"}
        alt=""
        fill
        unoptimized
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
  );
}

/** The listing card — the most repeated object on the site (home page twice, /search, all
 * eleven area pages, beside every listing detail), redesigned in round 36 against MEASURED
 * data instead of the IDX-vendor default it started as.
 *
 * THE ADDRESS IS A TWO-LINE LOCKUP, NOT A COMMA RUN. Street on its own line, "City, NY zip"
 * under it. The old single string ("506 Southview Drive, Poughkeepsie, NY 12601") either
 * ellipsized (plain variant, `truncate`) or wrapped at an arbitrary comma (overlay,
 * line-clamp-2) — and an address is the one thing on a listing card that must never be cut
 * mid-word. Measured across all 27,719 active rows (scripts/_scratch-r36-measure-addresses.mjs):
 * street p99 = 32 chars, "City, NY zip" max = 30 chars — each fits its line at these sizes in
 * the narrowest card this component renders into. No clamp, no reserve games: every row of the
 * block is one line for effectively every listing, so price tops stay level across a rail
 * without reserving blank lines.
 *
 * THE "VIEW" CHIP IS GONE. The whole card is a link (inset-0 overlay anchor) with lift, press
 * and photo-zoom states; a button-shaped chip on top of that promised a second control that
 * did not exist.
 *
 * THE BROKER CREDIT IS OFFICE-ONLY AND ONE LINE. MLS Grid IDX Rules §22 (docs/vendor/mlsgrid/
 * MLS-Grid-IDX-Rules.pdf) requires the listing BROKERAGE name; the agent name is a
 * per-MLS extra (SCKMLS, IRMLS — not OneKey) and lives on the listing page. With the agent
 * included the credit ran to 80 chars and truncated on effectively every search card, which is
 * worse attribution than a complete office name (office max = 32 chars, fits). Fixed position:
 * bottom-anchored in both variants, so cards stop shifting relative to one another.
 *
 * The scrim on the overlay variant is MEASURED, not hoped at — scripts/verify-card-scrim.mjs
 * drives the rendered card with photos blocked (worst case: white text over the light bg-mist
 * fallback) and reads the actual pixels behind every text line. */
export function ListingCard({
  listing,
  priority = false,
  variant = "overlay",
}: {
  listing: Listing;
  priority?: boolean;
  /** "overlay" = home-page tile (text on photo); "plain" = live search-results card (white body). */
  variant?: "overlay" | "plain";
}) {
  const l = listing;
  // Badge priority mirrors live realtylt.com tiles: status first, then Open House,
  // then "New" for listings on market ≤7 days.
  const isNew = Date.now() - Date.parse(l.listedAt) < 7 * 86_400_000;
  const badge =
    l.status !== "Active" ? l.status : l.openHouse ? "Open House" : isNew ? "New" : null;
  // Live search cards can stack up to two status chips side by side (e.g. "Coming Soon" + "New").
  const chips = (
    [l.status !== "Active" ? l.status : null, l.openHouse ? "Open House" : null, isNew ? "New" : null].filter(
      Boolean,
    ) as string[]
  ).slice(0, 2);
  // Feed rows without beds/baths/sqft (multi-family, land) drop those parts — never "0 Bed";
  // Land/lots surface acreage instead so the stat line isn't blank.
  const statsLong = listingStats(l, { bed: "Bed", bath: "Bath", sqft: "Sq. Ft.", acre: "Acres", acreOne: "Acre" }).join(" • ");
  // "·", not "|". The pipe was the only one on any visitor-facing surface of the site; the middot
  // is what every other list of small facts here is joined with (68 uses against 19 bullets).
  const statsShort = listingStats(l, { bed: "bd", bath: "ba", sqft: "sqft", acre: "ac", acreOne: "ac" }).join(" · ");

  if (variant === "plain") {
    return (
      <article className="lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
        <Link
          href={listingPath(l)}
          className="absolute inset-0 z-10"
          aria-label={`${l.address}, ${l.city}, ${priceLabel(l)}`}
        />
        {/* 2:1 on phones; 21:10 from lg. The owner's density target is three FULL rows beside
            the map ("2+2+2") — round 23 tuned the card 282 -> 240 for it; round 36's two-line
            address lockup put a real city line back (243 -> 259 measured at 1440) and the
            search panel pair moved 84vh -> 90vh to keep holding exactly three rows, so the
            photo band did not have to pay for the type (see SearchClient's panel comment). */}
        <div className="photo-zoom relative aspect-[2/1] overflow-hidden bg-mist lg:aspect-[21/10]">
          {l.photos[0] ? (
            isLiveMlsPhoto(l.photos[0]) ? (
              // Owner's ask: flip through the pictures right on the card. The slim card
              // carries ONE cover URL; the pager addresses the rest as /api/media/{id}/{n},
              // bounded by photoCount = idx_listings.photos_servable, the count of photos the
              // proxy can actually serve. The card, the map popup and the listing page all print
              // this same number — before, the card advertised the feed's CLAIM and the pager
              // walked into indices that only ever answered with the coming-soon still.
              <CardPhotos
                id={l.id}
                cover={l.photos[0]}
                count={l.photoCount ?? l.photosMirrored ?? 1}
                alt={`${l.address}, ${l.city}, NY`}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
              />
            ) : (
              <Image
                src={l.photos[0]}
                alt={`${l.address}, ${l.city}, NY`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority}
                className="object-cover"
              />
            )
          ) : (
            <NoPhoto />
          )}
          {/* gap-0.5, not gap-px: 1px was the only gap on the listing and search pages off the
              2px grid the rest of the site is built on, and two stacked chips read identically
              at 2px. */}
          {chips.length > 0 && (
            <div className="absolute left-0 top-3 flex gap-0.5">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-lg bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        {/* flex-1 + mt-auto bottom row: every card in a grid row renders the same height —
            wrapping office names were making neighbours uneven (owner-reported). Address is
            one truncated line for the same reason, and for the 2+2+2 density target. From lg
            the body tightens (round 23, owner: "a lot of unused white... bring those
            closer") — padding, price line and address each give a little so the third row
            lands; phones keep the roomier scale. */}
        <div className="flex flex-1 flex-col p-3 lg:pb-2 lg:pt-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-xl font-bold leading-7 text-ink lg:text-lg lg:leading-6">{priceLabel(l)}</p>
            {statsLong && <p className="text-xs text-stone">{statsLong}</p>}
          </div>
          {/* The two-line address lockup (see the component comment). Street carries the weight;
              the city line drops a step and a shade, so the pair reads as one object with a
              hierarchy instead of a comma run that used to ellipsize mid-word. Not italic:
              italic small print was the vendor look this card is leaving behind. No truncate on
              the street — measured p99 = 32 chars fits this line; the one-in-a-thousand lot
              bundle wraps, and a wrapped word beats a swallowed one. */}
          <p className="mt-1 text-sm font-medium leading-snug text-ink-soft lg:mt-0.5">{l.address}</p>
          <p className="text-xs text-stone">
            {l.city}, {l.state} {l.zip}
          </p>
          {/* Bottom row, bottom-anchored: the broker credit as a quiet one-line caption
              (office-only — the comment up top has the rule and the numbers), heart right. */}
          <div className="mt-auto flex items-end justify-between gap-2 pt-1.5 lg:pt-1">
            {/* min-w-0: a flex item is min-width:auto, so a long office name would push this row
                wider than the card. text-xs (12px), not 10px: sub-legible attribution was a
                measured round-36 finding, and at 12px every office in the data but one all-caps
                outlier fits this line (canvas-measured over 1,977 distinct offices); truncate is
                the belt for that one. */}
            <p className="min-w-0 truncate text-xs text-stone">
              Listed with {l.listOfficeName}
            </p>
            <FavoriteButton id={l.id} tone="onLight" className="group relative z-20 -mb-1 -mr-1 shrink-0" />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="lift group relative overflow-hidden rounded-2xl bg-white">
      <Link
        href={listingPath(l)}
        className="absolute inset-0 z-10"
        aria-label={`${l.address}, ${l.city}, ${formatPrice(l.price)}`}
      />
      {/* Live home-rail tiles are portrait — measured 283×450 (aspect ≈ 63/100) @1280 */}
      <div className="photo-zoom relative aspect-[63/100] overflow-hidden bg-mist">
        {l.photos[0] ? (
          isLiveMlsPhoto(l.photos[0]) ? (
            <MlsImage
              src={l.photos[0]}
              alt={`${l.address}, ${l.city}, NY`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              noPhotoCaption={false}
            />
          ) : (
            <Image
              src={l.photos[0]}
              alt={`${l.address}, ${l.city}, NY`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              priority={priority}
              className="object-cover"
            />
          )
        ) : (
          <NoPhoto caption={false} />
        )}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/90 via-black/45 to-transparent"
        />
        {badge && (
          <span className="absolute left-3 top-3 rounded-lg bg-ink/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper backdrop-blur">
            {badge}
          </span>
        )}
        <FavoriteButton id={l.id} className="absolute right-3 top-3 z-20" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-2xl font-bold leading-tight">{priceLabel(l)}</p>
          {/* The two-line address lockup (component comment): street, then "City, NY zip" a
              step down. Every line of this block is single-line for effectively every listing
              (measured over 27,719 active rows), so nothing here is clamped or reserved and
              the price tops across a rail stay level by construction rather than by blank-line
              reserve. The one-in-a-thousand lot-bundle street wraps and moves only its own
              card's price — a wrapped word beats a swallowed one on the line that identifies
              the product. */}
          <p className="mt-1.5 text-base font-medium leading-normal">{l.address}</p>
          <p className="text-sm leading-normal text-white/90">
            {l.city}, {l.state} {l.zip}
          </p>
          {/* ALWAYS rendered, even when the feed carries no beds/baths/sqft (land, commercial,
              some multi-family). This block is anchored to the bottom of the card, so dropping
              the line pushed the price and address 20px DOWN — measured across a home rail, a
              row of four cards sat on three different baselines. The empty line is invisible
              against the gradient and simply holds the position. */}
          <p className="mt-1 text-xs text-white/90" aria-hidden={!statsShort}>
            {statsShort || " "}
          </p>
          {/* The broker credit as a quiet caption on its own hairline-ruled baseline: a fixed
              caption band rather than a line competing with the listing facts. text-xs, not the
              10px it wore for rounds — ten pixels on a phone for required IDX attribution was
              measured and called out in round 36: quiet has to come from tone and position, not
              from sub-legible size. At 12px the credit fits one line for 1,976 of the 1,977
              distinct offices in the data at the 390 rail width (the one all-caps outlier clips
              by 9px; at the 320 rail ~13% lose their last word) — with the full attribution one
              click away on the listing page, truncate is the belt for those. Not italic: italic
              small print over a photograph was the vendor look. The "View" chip that used to
              share this row is gone — the whole card is the link. */}
          <p className="mt-2.5 truncate border-t border-white/20 pt-2 text-xs text-white/85">
            Listed with {l.listOfficeName}
          </p>
        </div>
      </div>
    </article>
  );
}
