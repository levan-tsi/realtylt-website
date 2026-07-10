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

/** IDX listing card — price (mono), address, beds|baths|sqft, "Listed with <office>" (compliance),
 * heart save, status badge. Whole card links to the listing. */
export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  const l = listing;
  const badge =
    l.status !== "Active" ? l.status : l.openHouse ? "Open House" : null;

  return (
    <article className="lift group relative overflow-hidden rounded-[2px] border border-ink/10 bg-white">
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
          <span className="absolute left-3 top-3 rounded-[2px] bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-porchlight backdrop-blur">
            {badge}
          </span>
        )}
        <FavoriteButton id={l.id} className="absolute right-3 top-3 z-20" />
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-xl font-semibold tracking-tight text-ink">{formatPrice(l.price)}</p>
          <p className="font-mono text-[11px] uppercase tracking-wide text-stone">
            {l.propertyType === "Multi-Family" ? "Multi-family" : "Residential"}
          </p>
        </div>
        <p className="mt-1 truncate font-semibold text-ink">{l.address}</p>
        <p className="text-sm text-stone">
          {l.city}, {l.state} {l.zip}
        </p>
        <p className="mt-2 flex gap-3 font-mono text-xs text-stone">
          <span>{l.beds} bd</span>
          <span aria-hidden>·</span>
          <span>{l.baths} ba</span>
          <span aria-hidden>·</span>
          <span>{l.sqft.toLocaleString("en-US")} sqft</span>
        </p>
        <p className="mt-3 border-t border-ink/8 pt-2 text-[11px] text-stone">
          Listed with {l.listOfficeName}
        </p>
      </div>
    </article>
  );
}
