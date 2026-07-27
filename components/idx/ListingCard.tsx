import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/idx/types";
import { listingPath } from "@/lib/idx/listing-url";
import { listingStats } from "@/lib/format";
import { PLACEHOLDER_INNER } from "@/lib/idx/placeholder";
import { FavoriteButton } from "./FavoriteButton";
import { MlsImage } from "./MlsImage";

/** Live MLS photos are served via our CDN-cached /api/media/… proxy (the MLS media CDN
 * enforces a hard per-account request budget — see that route). They render `unoptimized`
 * so the image optimizer doesn't multiply upstream fetches per width or burn
 * transformation quota; fixture/local images stay optimized. */
export function isLiveMlsPhoto(src: string | undefined): boolean {
  return !!src && (src.startsWith("/api/media/") || src.startsWith("http"));
}

export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

/** Price label that reads correctly for rentals: a lease's feed price is the MONTHLY rent, so
 * rentals render "$X,XXX/mo"; everything for sale stays a plain total. */
export function priceLabel(l: { price: number; propertyType?: string }): string {
  return l.propertyType === "Rental" ? `${formatPrice(l.price)}/mo` : formatPrice(l.price);
}

/** Branded fallback when a listing's photo isn't available yet (feed rows without Media, or photos
 * still replicating into Storage). A quiet, intentional Hudson Valley dusk illustration — soft
 * hills, a gabled house, one lit azure "porch-light" window — the SAME artwork the /api/media route
 * serves (lib/idx/placeholder.ts), so the state reads identically whether the tile falls back here
 * or to the route's SVG. `slice` fills the tile like object-cover at any card/gallery size. */
export function NoPhoto() {
  return (
    <div className="absolute inset-0 bg-mist" aria-hidden>
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        // Static, self-authored artwork string (no user input) shared with the media route.
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: PLACEHOLDER_INNER }}
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
                  className="bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper"
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
            <p className="text-[11px] leading-snug text-stone">
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
          <NoPhoto />
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
            <p className="text-[10px] italic leading-tight text-white/85">
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
