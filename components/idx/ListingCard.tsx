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

/** IDX listing card matched to live realtylt.com (Brivity) tiles: near-square photo,
 * dark bottom gradient with white price / address / beds|baths|sqft, "Listed With
 * <office>" (compliance) and a black View chip. Heart save + status badge on top.
 * Whole card links to the listing. */
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
  const statsShort = listingStats(l, { bed: "bd", bath: "ba", sqft: "sqft", acre: "ac", acreOne: "ac" }).join(" | ");

  if (variant === "plain") {
    return (
      <article className="lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
        <Link
          href={listingPath(l)}
          className="absolute inset-0 z-10"
          aria-label={`${l.address}, ${l.city}, ${priceLabel(l)}`}
        />
        {/* 2:1 on phones; 21:10 from lg, where the owner's density target is three FULL rows
            beside the map ("2+2+2") — the height comes out of the photo band + body padding,
            not the type: measured at 1440, card 282 -> 240 while the photo's share of it
            holds at 59% (the body gives up as much as the band does). */}
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
          {/* `lg:text-[13px]` is gone. It was a one-off size sitting between the two real steps
              (12 and 14), and with two more one-offs elsewhere it made SIX distinct body sizes on
              the home page — 12/13/14/16/17/18 — which is drift, not a scale. It also costs
              nothing to remove: `text-sm` carries the line-height, so the line BOX is unchanged
              and only the glyphs go from 13px to 14px. */}
          <p className="mt-1 truncate text-sm italic text-ink-soft lg:mt-0.5">
            {l.address}, {l.city}, {l.state} {l.zip}
          </p>
          {/* Live's bottom row: "Listed with <agent> of <office>" left, outline heart right. */}
          <div className="mt-auto flex items-end justify-between gap-2 pt-1.5 lg:pt-1">
            {/* min-w-0 + break-words: a flex item is min-width:auto, so a long office name
                would push this row wider than the card instead of wrapping inside it. */}
            <p className="min-w-0 truncate text-[11px] leading-snug text-stone">
              Listed with{" "}
              {l.listAgentName ? (
                <>
                  <span className="font-bold text-ink-soft">{l.listAgentName}</span> of {l.listOfficeName}
                </>
              ) : (
                <span className="font-bold text-ink-soft">{l.listOfficeName}</span>
              )}
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
          {/* Clamped AND reserved at two lines, for the same reason the stats line below is
              always rendered: this block is anchored to the card's bottom, so anything that
              changes its height moves the price. A three-line address (measured on production:
              "144 Cream Street, Poughkeepsie (Town), NY 12601") pushed one card's price up
              exactly one line — price tops across that row read -1199/-1223/-1199/-1199, so
              three of four aligned and one did not, which reads as a bug rather than a rhythm. */}
          {/* leading-normal, not leading-snug. This one class was SIXTEEN of the home page's
              remaining sub-1.45 blocks: an 18px two-line address at 1.375, set over a photograph
              where it needs more air, not less. `min-h-[2lh]` still reserves exactly two lines,
              so every card in a rail grows by the same 4.5px and the price tops stay level —
              which is the whole reason this block is reserved in the first place. */}
          <p className="mt-1 line-clamp-2 min-h-[2lh] text-lg font-medium leading-normal">
            {l.address}, {l.city}, {l.state} {l.zip}
          </p>
          {/* ALWAYS rendered, even when the feed carries no beds/baths/sqft (land, commercial,
              some multi-family). This block is anchored to the bottom of the card, so dropping
              the line pushed the price and address 20px DOWN — measured across a home rail, a
              row of four cards sat on three different baselines. The empty line is invisible
              against the gradient and simply holds the position. */}
          <p className="mt-1 text-xs italic" aria-hidden={!statsShort}>
            {statsShort || " "}
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            {/* Second source of the same drift, and the collision the eye actually catches: a
                long office name wrapped to two lines and ran under the View button, while a
                short one stayed on one — so the row's height, and therefore the price above it,
                depended on the brokerage. Reserved at two lines like the address. Not truncated:
                at 10px in ~180px of usable width, one line clips "United RE Hudson Valley Edge"
                mid-word, and this is attribution. */}
            <p className="min-w-0 line-clamp-2 min-h-[2lh] break-words text-[10px] italic leading-tight text-white/85">
              Listed With {l.listOfficeName}
            </p>
            <span className="shrink-0 rounded-lg bg-ink px-4 py-1 text-sm text-paper transition-colors group-hover:bg-ink-soft">
              View
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
