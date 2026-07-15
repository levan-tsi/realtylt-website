import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/idx/types";
import { specParts } from "@/lib/format";
import { FavoriteButton } from "./FavoriteButton";

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

/** Branded fallback when a listing's photo isn't available yet (feed rows without Media,
 * or photos still replicating into the Blob store). Quiet and intentional: the line-drawn
 * house in logo navy with one lit azure "porch light" — the same mark the /api/media
 * placeholder SVG uses, so the state reads consistently everywhere. */
export function NoPhoto() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-mist pb-8" aria-hidden>
      <span className="flex flex-col items-center">
        <svg viewBox="0 0 64 64" className="h-12 w-12 sm:h-14 sm:w-14">
          <g
            fill="none"
            stroke="#102c54"
            strokeOpacity="0.32"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 30 L32 14 L52 30" />
            <path d="M18 28 V50 H46 V28" />
            <path d="M28 50 V38 H36 V50" />
          </g>
          <circle cx="32" cy="33" r="2.4" fill="#28a8e0" />
        </svg>
        <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-river/70">
          RealtyLT
        </span>
        <span className="mt-0.5 block text-[11px] text-stone">Photo coming soon</span>
      </span>
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
  // Feed rows without beds/baths/sqft (multi-family, land) drop those parts — never "0 Bed".
  const statsLong = specParts(l, { bed: "Bed", bath: "Bath", sqft: "Sq. Ft." }).join(" • ");
  const statsShort = specParts(l, { bed: "bd", bath: "ba", sqft: "sqft" }).join(" | ");

  if (variant === "plain") {
    return (
      <article className="lift group relative overflow-hidden border border-[#dddddd] bg-white">
        <Link
          href={`/listing/${l.id}`}
          className="absolute inset-0 z-10"
          aria-label={`${l.address}, ${l.city}, ${formatPrice(l.price)}`}
        />
        <div className="photo-zoom relative aspect-[3/2] overflow-hidden bg-mist">
          {l.photos[0] ? (
            <Image
              src={l.photos[0]}
              alt={`${l.address}, ${l.city}, NY`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              unoptimized={isLiveMlsPhoto(l.photos[0])}
              className="object-cover"
            />
          ) : (
            <NoPhoto />
          )}
          {badge && (
            <span className="absolute left-0 top-3 bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper">
              {badge}
            </span>
          )}
          <FavoriteButton id={l.id} className="absolute right-3 top-3 z-20" />
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-2xl font-bold text-ink">{formatPrice(l.price)}</p>
            {statsLong && <p className="text-xs text-stone">{statsLong}</p>}
          </div>
          <p className="mt-1 truncate text-sm italic text-ink-soft">{l.address}</p>
          <p className="text-sm italic text-ink-soft">
            {l.city}, {l.state} {l.zip}
          </p>
          <p className="mt-2 text-[11px] text-stone">
            Listed with <span className="font-bold">{l.listOfficeName}</span>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="lift group relative overflow-hidden bg-white">
      <Link
        href={`/listing/${l.id}`}
        className="absolute inset-0 z-10"
        aria-label={`${l.address}, ${l.city}, ${formatPrice(l.price)}`}
      />
      {/* Live home-rail tiles are portrait — measured 283×450 (aspect ≈ 63/100) @1280 */}
      <div className="photo-zoom relative aspect-[63/100] overflow-hidden bg-mist">
        {l.photos[0] ? (
          <Image
            src={l.photos[0]}
            alt={`${l.address}, ${l.city}, NY`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            unoptimized={isLiveMlsPhoto(l.photos[0])}
            className="object-cover"
          />
        ) : (
          <NoPhoto />
        )}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/90 via-black/45 to-transparent"
        />
        {badge && (
          <span className="absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-paper backdrop-blur">
            {badge}
          </span>
        )}
        <FavoriteButton id={l.id} className="absolute right-3 top-3 z-20" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="text-2xl font-bold leading-tight">{formatPrice(l.price)}</p>
          <p className="mt-1 text-lg font-medium leading-snug">
            {l.address}, {l.city}, {l.state} {l.zip}
          </p>
          {statsShort && <p className="mt-1 text-xs italic">{statsShort}</p>}
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-[10px] italic leading-tight text-white/85">
              Listed With {l.listOfficeName}
            </p>
            <span className="shrink-0 bg-ink px-4 py-1 text-sm text-paper transition-colors group-hover:bg-ink-soft">
              View
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
