import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/idx/types";
import { listingPath } from "@/lib/idx/listing-url";
import { listingStats } from "@/lib/format";
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

/** Branded fallback when a listing's photo isn't available yet (feed rows without Media, or photos
 * still replicating into Storage). OWNER TRIAL 2026-07-29: the "manor in the mist" artwork
 * generated with the local Mage-Flow setup (see ATTRIBUTIONS.md), picked by the owner over the
 * hand-drawn SVG — a moonlit stone manor with the azure-door accent and PHOTO COMING SOON in
 * letterspaced serif. 29KB webp. object-[center_60%] biases the crop toward the wordmark band so
 * landscape cards keep both the moon and the text; portrait cards slice width and lose neither.
 * The /api/media route still serves the SVG (lib/idx/placeholder.ts) — if the owner keeps this
 * direction, regenerate that too and retire the SVG in one move. */
export function NoPhoto({ caption = true }: { caption?: boolean } = {}) {
  return (
    <div className="absolute inset-0 bg-ink" aria-hidden>
      <Image
        // caption=false is the same artwork with the wording edit-removed: portrait overlay
        // tiles write their own price/address over the photo bottom, exactly where the baked
        // caption sits, so those tiles show the wordless cut.
        src={caption ? "/images/mls/coming-soon-manor.webp" : "/images/mls/coming-soon-manor-notext.webp"}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover object-[center_60%]"
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
      <article className="lift group relative overflow-hidden rounded-2xl border border-[#dddddd] bg-white">
        <Link
          href={listingPath(l)}
          className="absolute inset-0 z-10"
          aria-label={`${l.address}, ${l.city}, ${priceLabel(l)}`}
        />
        {/* Live search tiles measure 395x250 — a touch wider than 3:2. */}
        <div className="photo-zoom relative aspect-[79/50] overflow-hidden bg-mist">
          {l.photos[0] ? (
            isLiveMlsPhoto(l.photos[0]) ? (
              <MlsImage
                src={l.photos[0]}
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
          {chips.length > 0 && (
            <div className="absolute left-0 top-3 flex gap-px">
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
        <div className="p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-2xl font-bold text-ink">{priceLabel(l)}</p>
            {statsLong && <p className="text-xs text-stone">{statsLong}</p>}
          </div>
          <p className="mt-1 truncate text-sm italic text-ink-soft">{l.address}</p>
          <p className="text-sm italic text-ink-soft">
            {l.city}, {l.state} {l.zip}
          </p>
          {/* Live's bottom row: "Listed with <agent> of <office>" left, outline heart right. */}
          <div className="mt-2 flex items-end justify-between gap-2">
            {/* min-w-0 + break-words: a flex item is min-width:auto, so a long office name
                would push this row wider than the card instead of wrapping inside it. */}
            <p className="min-w-0 break-words text-[11px] leading-snug text-stone">
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
          <p className="mt-1 text-lg font-medium leading-snug">
            {l.address}, {l.city}, {l.state} {l.zip}
          </p>
          {statsShort && <p className="mt-1 text-xs italic">{statsShort}</p>}
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="min-w-0 break-words text-[10px] italic leading-tight text-white/85">
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
