"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/components/idx/ListingCard";
import { MlsAttribution } from "@/components/idx/MlsAttribution";
import { LeadForm } from "@/components/leads/LeadForm";
import { getFavorites, getSavedSearches, removeFavorite, removeSearch, SAVED_EVENT, type SavedSearch } from "@/lib/saved";
import type { Listing } from "@/lib/idx/types";

export function SavedClient({ fixtureMode }: { fixtureMode: boolean }) {
  const [favIds, setFavIds] = useState<string[] | null>(null);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [missingIds, setMissingIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setFavIds(getFavorites());
      setSearches(getSavedSearches());
    };
    sync();
    window.addEventListener(SAVED_EVENT, sync);
    return () => window.removeEventListener(SAVED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!favIds || favIds.length === 0) {
      setListings([]);
      setMissingIds([]);
      return;
    }
    let cancelled = false;
    Promise.all(
      favIds.map((id) =>
        fetch(`/api/idx/listing/${encodeURIComponent(id)}`)
          .then(async (r) => {
            if (r.ok) return { id, listing: ((await r.json()) as { listing: Listing }).listing };
            // 404 = the listing left the feed (removable); other errors are transient.
            return { id, gone: r.status === 404 };
          })
          .catch(() => ({ id, gone: false })),
      ),
    ).then((results) => {
      if (cancelled) return;
      setListings(results.filter((r) => "listing" in r && r.listing).map((r) => (r as { listing: Listing }).listing));
      setMissingIds(results.filter((r) => "gone" in r && r.gone).map((r) => r.id));
    });
    return () => {
      cancelled = true;
    };
  }, [favIds]);

  const loading = favIds === null;
  const empty = !loading && favIds.length === 0 && searches.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {loading ? (
        <p className="py-16 text-center text-sm text-stone">Loading your saved items…</p>
      ) : empty ? (
        <div className="rounded-[2px] border border-dashed border-ink/20 p-14 text-center">
          <p className="font-display text-2xl text-ink">Nothing saved yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone">
            Tap the heart on any listing to keep it here, or save a search and come back to it
            anytime.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-block rounded-[2px] bg-porchlight px-6 py-3 font-bold text-ink transition-colors hover:bg-porchlight-deep hover:text-paper"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <>
          {/* Favorites */}
          <section aria-labelledby="fav-heading">
            <h2 id="fav-heading" className="font-display text-2xl text-ink">
              Saved homes <span className="font-mono text-lg text-stone">({listings.length})</span>
            </h2>
            {missingIds.length > 0 && (
              <p className="mt-4 flex flex-wrap items-center gap-3 rounded-[2px] border border-ink/10 bg-mist px-4 py-3 text-sm text-stone">
                {missingIds.length} saved {missingIds.length === 1 ? "home is" : "homes are"} no
                longer available.
                <button
                  type="button"
                  onClick={() => missingIds.forEach(removeFavorite)}
                  className="rounded-[2px] border border-ink/20 px-3 py-1.5 text-sm font-bold text-ink transition-colors hover:border-red-500 hover:text-red-600"
                >
                  Remove them
                </button>
              </p>
            )}
            {favIds.length === 0 ? (
              <p className="mt-4 text-sm text-stone">
                No homes hearted yet —{" "}
                <Link href="/search" className="font-bold text-river underline underline-offset-2">
                  browse listings
                </Link>
                .
              </p>
            ) : (
              <>
                <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {listings.map((l) => (
                    <li key={l.id}>
                      <ListingCard listing={l} />
                    </li>
                  ))}
                </ul>
                {listings.length > 0 && (
                  <MlsAttribution
                    dataLastUpdated={listings.map((l) => l.modificationTimestamp).sort().pop()!}
                    fixtureMode={fixtureMode}
                    className="mt-6"
                  />
                )}
              </>
            )}
          </section>

          {/* Saved searches */}
          <section aria-labelledby="ss-heading" className="mt-14">
            <h2 id="ss-heading" className="font-display text-2xl text-ink">
              Saved searches <span className="font-mono text-lg text-stone">({searches.length})</span>
            </h2>
            {searches.length === 0 ? (
              <p className="mt-4 text-sm text-stone">
                Save a search from the{" "}
                <Link href="/search" className="font-bold text-river underline underline-offset-2">
                  search page
                </Link>{" "}
                to keep your filters handy.
              </p>
            ) : (
              <ul className="mt-6 space-y-3">
                {searches.map((s) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-[2px] border border-ink/10 bg-white px-5 py-4"
                  >
                    <div>
                      <p className="font-semibold text-ink">{s.label}</p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-stone">
                        Saved {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/search${s.query ? `?${s.query}` : ""}`}
                        className="rounded-[2px] border border-ink px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
                      >
                        Run search
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeSearch(s.id)}
                        className="rounded-[2px] border border-ink/20 px-4 py-2 text-sm text-stone transition-colors hover:border-red-500 hover:text-red-600"
                        aria-label={`Remove saved search: ${s.label}`}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Alert opt-in → lead */}
          <section aria-labelledby="alerts-heading" className="mt-14">
            <div className="rounded-[2px] border border-ink/10 bg-mist p-6 md:p-8">
              <h2 id="alerts-heading" className="font-display text-2xl text-ink">
                Want new matches by email?
              </h2>
              <p className="mt-2 max-w-lg text-sm text-stone">
                Leave your details and we&rsquo;ll set up listing alerts for your saved searches —
                you&rsquo;ll hear about new homes before the portals do.
              </p>
              <div className="mt-6 max-w-xl">
                <LeadForm
                  compact
                  defaultReason="I'm interested in buying a home"
                  submitLabel="Turn On Alerts"
                  successTitle="Alerts requested."
                  successBody="We'll confirm your saved-search alerts by email shortly."
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
