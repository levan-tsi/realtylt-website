"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSaved } from "@/components/auth/SavedProvider";

export default function SearchesPage() {
  const { searches, removeSearch, setSearchAlerts, ready } = useSaved();

  return (
    <section aria-labelledby="searches-heading">
      <h2 id="searches-heading" className="font-display text-2xl text-ink">
        Saved searches
      </h2>
      <p className="mt-1 text-sm text-stone">
        Your saved filters. Turn on alerts to hear about new matches by email.
      </p>

      {!ready ? (
        <p className="mt-8 text-sm text-stone">Loading…</p>
      ) : searches.length === 0 ? (
        <div className="mt-8 rounded-[4px] border border-dashed border-ink/20 p-10 text-center">
          <p className="font-display text-xl text-ink">No saved searches yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-stone">
            Run a search, tune the filters, and hit <strong>Save search</strong> to keep it here.
          </p>
          <Button href="/search" size="lg" className="mt-6">
            Search homes
          </Button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {searches.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-ink/10 bg-white px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{s.label}</p>
                <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-stone">
                  Saved{" "}
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-stone">
                  <input
                    type="checkbox"
                    checked={s.alerts}
                    onChange={(e) => void setSearchAlerts(s.id, e.target.checked)}
                    className="h-4 w-4 accent-ink"
                  />
                  Email alerts
                </label>
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
  );
}
