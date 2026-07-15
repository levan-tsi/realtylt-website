"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FavoriteListings } from "@/components/portal/FavoriteListings";
import { LeadForm } from "@/components/leads/LeadForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSaved } from "@/components/auth/SavedProvider";

export function SavedClient({ fixtureMode }: { fixtureMode: boolean }) {
  const { favorites, searches, removeSearch, ready, signedIn } = useSaved();
  const { enabled, openSignIn } = useAuth();

  const empty = ready && favorites.length === 0 && searches.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Signed-out nudge: your saves live on this device — make an account to sync + get alerts */}
      {enabled && ready && !signedIn && !empty && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-ink/10 bg-mist px-5 py-4">
          <p className="text-sm text-ink-soft">
            These saves are on <strong>this device</strong>. Create a free account to sync them
            everywhere and get new-listing alerts.
          </p>
          <div className="flex gap-2">
            <Button size="md" onClick={() => openSignIn("signup")}>
              Create account
            </Button>
            <Button variant="ghost" size="md" onClick={() => openSignIn("signin")}>
              Sign in
            </Button>
          </div>
        </div>
      )}

      {!ready ? (
        <p className="py-16 text-center text-sm text-stone">Loading your saved items…</p>
      ) : empty ? (
        <div className="rounded-[2px] border border-dashed border-ink/20 p-14 text-center">
          <p className="font-display text-2xl text-ink">Nothing saved yet.</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-stone">
            Tap the heart on any listing to keep it here, or save a search and come back to it
            anytime.
          </p>
          <Button href="/search" size="lg" className="mt-6">
            Start searching
          </Button>
        </div>
      ) : (
        <>
          {/* Favorites */}
          <section aria-labelledby="fav-heading">
            <h2 id="fav-heading" className="font-display text-2xl text-ink">
              Saved homes <span className="font-mono text-lg text-stone">({favorites.length})</span>
            </h2>
            <FavoriteListings fixtureMode={fixtureMode} />
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
                        Saved{" "}
                        {new Date(s.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
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
                        onClick={() => void removeSearch(s.id)}
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
                Leave your details and we&rsquo;ll set up listing alerts for your saved searches.
                You&rsquo;ll hear about new homes before the portals do.
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
