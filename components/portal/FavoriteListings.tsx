"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/idx/ListingCard";
import { ResultSetScope } from "@/components/idx/ResultSetScope";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { useSaved } from "@/components/auth/SavedProvider";
import type { Listing } from "@/lib/idx/types";

/** Resolves the client's favorited listing ids into full listings and renders the grid.
 * Account-aware via useSaved (DB when signed in, device when out). Shared by /saved and
 * /portal/collections. */
export function FavoriteListings({
  fixtureMode,
  dataLastUpdated,
}: {
  fixtureMode: boolean;
  /** Feed refresh time, resolved on the server (getDataLastUpdated). */
  dataLastUpdated: string;
}) {
  const { favorites, toggleFavorite, ready } = useSaved();
  const [listings, setListings] = useState<Listing[]>([]);
  const [missingIds, setMissingIds] = useState<string[]>([]);

  useEffect(() => {
    if (favorites.length === 0) {
      setListings([]);
      setMissingIds([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      favorites.map((id) =>
        fetch(`/api/idx/listing/${encodeURIComponent(id)}`)
          .then(async (r) => {
            if (r.ok) return { id, listing: ((await r.json()) as { listing: Listing }).listing };
            return { id, gone: r.status === 404 };
          })
          .catch(() => ({ id, gone: false })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setListings(
        results.filter((r) => "listing" in r && r.listing).map((r) => (r as { listing: Listing }).listing),
      );
      setMissingIds(results.filter((r) => "gone" in r && r.gone).map((r) => r.id));
    });
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  if (!ready) {
    return <p className="py-10 text-center text-sm text-stone">Loading your saved homes…</p>;
  }

  if (favorites.length === 0) {
    return (
      <p className="mt-4 text-sm text-stone">
        No homes saved yet.{" "}
        <Link href="/search" className="font-bold text-river underline underline-offset-2">
          Browse listings
        </Link>{" "}
        and tap the heart.
      </p>
    );
  }

  return (
    <>
      {missingIds.length > 0 && (
        <p className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-mist px-4 py-3 text-sm text-stone">
          {missingIds.length} saved {missingIds.length === 1 ? "home is" : "homes are"} no longer
          available.
          <button
            type="button"
            onClick={() => missingIds.forEach((id) => void toggleFavorite(id))}
            className="rounded-xl border border-ink/20 px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:border-red-500 hover:text-red-600"
          >
            Remove them
          </button>
        </p>
      )}
      {/* Round 50: the import had been here since the round-18 fix but the grid was never
          wrapped, so a saved home opened from this page arrived with no Previous / Next. Now
          a click names this list. `changes` turns on the price-cut / status-change chips
          (funnel item 6c): saved homes are the one place a visitor is watching a specific
          home over time, which is what those chips are about. */}
      <ResultSetScope listings={listings} backHref="/saved">
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((l) => (
            <li key={l.id}>
              <ListingCard listing={l} changes />
            </li>
          ))}
        </ul>
      </ResultSetScope>
      {listings.length > 0 && (
        <MlsAttribution
          dataLastUpdated={dataLastUpdated}
          fixtureMode={fixtureMode}
          className="mt-6"
        />
      )}
    </>
  );
}
