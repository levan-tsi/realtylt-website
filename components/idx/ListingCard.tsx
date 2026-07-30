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

/** Branded fallback when a listing's photo isn't available yet (feed rows without Media, or photos
 * still replicating into Storage). The artwork is the OWNER'S OWN generation (2026-07-29, Google
 * Nano Banana Pro via ElevenLabs — see ATTRIBUTIONS.md): a moonlit stone manor, azure door, and
 * COMING SOON in luminous script across the sky. Same image the /api/media route redirects to on
 * its stable-empty path, so the state reads identically on every surface. The caption sits in the
 * SKY, so landscape crops keep it; caption=false is the wordless cut (the sky text edit-removed
 * with the local Mage-Flow edit model) for portrait overlay tiles, which would slice the words
 * mid-letter and then print their own price over the photo anyway. */
export function NoPhoto({ caption = true }: { caption?: boolean } = {}) {
  return (
    <div className="absolute inset-0 bg-ink" aria-hidden>
      <Image
        src={caption ? "/images/mls/coming-soon.webp" : "/images/mls/coming-soon-notext.webp"}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        // Caption cut: bias the crop toward the sky so landscape cards never shave the
        // lettering's ascenders; the wordless cut centers on the house.
        className={caption ? "object-cover object-[center_35%]" : "object-cover"}
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
        {/* 16:9, tighter than live's 79:50 — the owner wants more listings visible beside
            the map ("4 full and another 2 half if possible"), and the density comes out of
            the photo band + body padding, not the type. */}
        <div className="photo-zoom relative aspect-[16/9] overflow-hidden bg-mist">
          {l.photos[0] ? (
            isLiveMlsPhoto(l.photos[0]) ? (
              // Owner's ask: flip through the pictures right on the card. The slim card
              // carries ONE cover URL; the pager addresses the rest as /api/media/{id}/{n},
              // bounded by the listing's REAL total (photoCount, set at slimming time —
              // the mirror marker under-counted and left some cards arrowless).
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
        <div className="p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-xl font-bold text-ink">{priceLabel(l)}</p>
            {statsLong && <p className="text-xs text-stone">{statsLong}</p>}
          </div>
          <p className="mt-1 truncate text-sm italic text-ink-soft">{l.address}</p>
          <p className="text-sm italic text-ink-soft">
            {l.city}, {l.state} {l.zip}
          </p>
          {/* Live's bottom row: "Listed with <agent> of <office>" left, outline heart right. */}
          <div className="mt-1.5 flex items-end justify-between gap-2">
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
