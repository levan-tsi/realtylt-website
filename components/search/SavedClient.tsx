"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FavoriteListings } from "@/components/portal/FavoriteListings";
import { LeadForm } from "@/components/leads/LeadForm";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSaved } from "@/components/auth/SavedProvider";
import { searchCriteria } from "@/lib/idx/criteria";
import { SITE } from "@/lib/site";

export function SavedClient({
  fixtureMode,
  dataLastUpdated,
}: {
  fixtureMode: boolean;
  dataLastUpdated: string;
}) {
  const { favorites, searches, removeSearch, ready, signedIn } = useSaved();
  const { enabled, signupOpen, openSignIn } = useAuth();

  const empty = ready && favorites.length === 0 && searches.length === 0;

  // Without an account these searches live only in this browser, so the CRM has no way to see
  // what to watch. Attaching them to the alert request is what makes the ask honest: the
  // person gets alerts for THESE searches, not for a wish we never passed on.
  const alertPayload = searches.map((s) => ({
    label: s.label,
    query: s.query,
    criteria: searchCriteria(s.query),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
      {/* Signed-out nudge: your saves live on this device. What we offer next depends on whether
          the project is taking new accounts — offering a "Create account" button that the auth
          server refuses is the one thing this strip must not do. */}
      {enabled && ready && !signedIn && !empty && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-mist px-5 py-4">
          <p className="text-sm text-ink-soft">
            These saves are on <strong>this device</strong>.{" "}
            {signupOpen ? (
              <>Create a free account to sync them everywhere and get new-listing alerts.</>
            ) : (
              <>
                New accounts aren&rsquo;t open yet. Call or text{" "}
                <a
                  href={SITE.phoneHref}
                  className="whitespace-nowrap font-bold text-ink underline underline-offset-2"
                >
                  {SITE.phone}
                </a>{" "}
                and we&rsquo;ll set one up so they follow you everywhere.
              </>
            )}
          </p>
          <div className="flex gap-2">
            {signupOpen && (
              <Button size="md" onClick={() => openSignIn("signup")}>
                Create account
              </Button>
            )}
            <Button variant={signupOpen ? "ghost" : "primary"} size="md" onClick={() => openSignIn("signin")}>
              Sign in
            </Button>
          </div>
        </div>
      )}

      {!ready ? (
        <p data-js-only className="py-16 text-center text-sm text-stone">Loading your saved items…</p>
      ) : empty ? (
        <div className="rounded-2xl border border-dashed border-ink/20 p-14 text-center">
          <p className="font-display text-2xl text-ink">Nothing saved yet.</p>
          <p className="mx-auto mt-2 max-w-md t-small text-stone">
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
            <FavoriteListings fixtureMode={fixtureMode} dataLastUpdated={dataLastUpdated} />
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
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4"
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
                        className="rounded-xl border border-ink px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-ink hover:text-paper"
                      >
                        Run search
                      </Link>
                      <button
                        type="button"
                        onClick={() => void removeSearch(s.id)}
                        className="rounded-xl border border-ink/20 px-4 py-2 text-sm text-stone transition-colors hover:border-red-500 hover:text-red-600"
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

          {/* Alert opt-in. Only shown when there is actually something to alert on: offering
              to watch "the 0 searches above" is worse than not offering. SIGNED IN, the lead
              form would re-ask for a name, email and phone the account already holds (the
              2026-08-27 E2E's sharpest finding) — and the real control already exists as the
              per-search toggle in the portal. Point there instead; the form is for visitors
              whose searches live only in this browser and can reach the CRM no other way. */}
          {searches.length > 0 && signedIn && (
          <section aria-labelledby="alerts-heading" className="mt-14">
            <div className="rounded-2xl border border-ink/10 bg-mist p-6 md:p-8">
              <h2 id="alerts-heading" className="t-h3 text-ink">
                Want new matches by email?
              </h2>
              <p className="mt-2 max-w-lg t-small text-stone">
                Email alerts live on each saved search in your portal. Flip one on and
                we&rsquo;ll email you when new homes match it.
              </p>
              <Button href="/portal/searches" size="md" className="mt-6">
                Manage alerts
              </Button>
            </div>
          </section>
          )}
          {searches.length > 0 && !signedIn && (
          <section aria-labelledby="alerts-heading" className="mt-14">
            <div className="rounded-2xl border border-ink/10 bg-mist p-6 md:p-8">
              <h2 id="alerts-heading" className="t-h3 text-ink">
                Want new matches by email?
              </h2>
              <p className="mt-2 max-w-lg t-small text-stone">
                Leave your details and we&rsquo;ll set up listing alerts for the{" "}
                {searches.length === 1 ? "search" : `${searches.length} searches`} above, and email
                you when new homes match.
              </p>
              <div className="mt-6 max-w-xl">
                <LeadForm
                  compact
                  defaultReason="I'm interested in buying a home"
                  submitLabel="Turn On Alerts"
                  successTitle="Alerts requested."
                  successBody="We have your searches. We'll confirm your alerts by email shortly."
                  savedSearches={alertPayload}
                />
              </div>
            </div>
          </section>
          )}
        </>
      )}
    </div>
  );
}
