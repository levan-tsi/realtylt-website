import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/idx/types";
import { FavoriteButton } from "./FavoriteButton";

export function formatPrice(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

/** Branded fallback when a listing arrives without photos (live feed rows without Media). */
export function NoPhoto() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-mist" aria-hidden>
      <span className="text-center">
        <span className="block font-display text-4xl text-stone/50">⌂</span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-stone/70">
          RealtyLT · Photo coming soon
        </span>
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
  const badge =
    l.status !== "Active" ? l.status : l.openHouse ? "Open House" : null;

  if (variant === "plain") {
    return (
      <article className="lift group relative overflow-hidden border border-[#dddddd] bg-white">
        <Link
          href={`/listing/${l.id}`}
          className="absolute inset-0 z-10"
          aria-label={`${l.address}, ${l.city} — ${formatPrice(l.price)}`}
        />
        <div className="photo-zoom relative aspect-[3/2] overflow-hidden bg-mist">
          {l.photos[0] ? (
            <Image
              src={l.photos[0]}
              alt={`${l.address}, ${l.city}, NY`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
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
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-2xl font-bold text-ink">{formatPrice(l.price)}</p>
            <p className="shrink-0 text-xs text-stone">
              {l.beds} Bed • {l.baths} Bath • {l.sqft.toLocaleString("en-US")} Sq. Ft.
            </p>
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
        aria-label={`${l.address}, ${l.city} — ${formatPrice(l.price)}`}
      />
      <div className="photo-zoom relative aspect-[20/19] overflow-hidden bg-mist">
        {l.photos[0] ? (
          <Image
            src={l.photos[0]}
            alt={`${l.address}, ${l.city}, NY`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
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
          <p className="mt-1 text-sm font-medium leading-snug">
            {l.address}, {l.city}, {l.state} {l.zip}
          </p>
          <p className="mt-1 text-xs italic">
            {l.beds} bd | {l.baths} ba | {l.sqft.toLocaleString("en-US")} sqft
          </p>
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
