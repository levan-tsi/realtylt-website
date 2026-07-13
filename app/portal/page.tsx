"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { useSaved } from "@/components/auth/SavedProvider";
import type { PortalActivityRow } from "@/lib/portal/types";

const ACTIVITY_LABEL: Record<string, string> = {
  view_listing: "Viewed a home",
  save_listing: "Saved a home",
  unsave_listing: "Removed a saved home",
  save_search: "Saved a search",
  remove_search: "Removed a saved search",
  view_search: "Ran a saved search",
  open_photos: "Opened photos",
  generate_report: "Ran a report",
  view_report: "Opened a report",
  recalc_report: "Fine-tuned a report",
  raise_hand: "Reached out to their agent",
};

function activityDetail(row: PortalActivityRow): string {
  const addr = typeof row.meta?.address === "string" ? row.meta.address : "";
  const city = typeof row.meta?.city === "string" ? row.meta.city : "";
  if (addr) return city ? `${addr}, ${city}` : addr;
  if (typeof row.meta?.title === "string") return row.meta.title;
  if (typeof row.meta?.label === "string") return row.meta.label;
  return "";
}

function StatTile({ n, label, href }: { n: number; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-[4px] border border-ink/10 bg-white p-6 transition-colors hover:border-ink/30"
    >
      <p className="text-4xl font-light text-ink">{n}</p>
      <p className="mt-1 text-sm font-bold uppercase tracking-wide text-stone">{label}</p>
    </Link>
  );
}

export default function PortalOverview() {
  const { supabase, user } = useAuth();
  const { favorites, searches } = useSaved();
  const [activity, setActivity] = useState<PortalActivityRow[] | null>(null);
  const [reportsCount, setReportsCount] = useState(0);

  useEffect(() => {
    if (!supabase || !user) return;
    let active = true;
    supabase
      .from("portal_reports")
      .select("id", { count: "exact", head: true })
      .eq("client_id", user.id)
      .then(({ count }) => {
        if (active) setReportsCount(count ?? 0);
      });
    supabase
      .from("portal_activity")
      .select("id,type,listing_id,meta,created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => {
        if (!active || !data) return;
        setActivity(
          data.map((r) => ({
            id: r.id,
            type: r.type,
            listingId: r.listing_id,
            meta: (r.meta ?? {}) as Record<string, unknown>,
            createdAt: r.created_at,
          })),
        );
      });
    return () => {
      active = false;
    };
  }, [supabase, user]);

  const views = (activity ?? []).filter((a) => a.type === "view_listing").length;

  return (
    <div className="space-y-10">
      <section aria-label="Your activity at a glance">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile n={favorites.length} label="Saved homes" href="/portal/collections" />
          <StatTile n={searches.length} label="Saved searches" href="/portal/searches" />
          <StatTile n={views} label="Recent views" href="/search" />
          <StatTile n={reportsCount} label="Reports" href="/portal/reports" />
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading" className="font-display text-2xl text-ink">
          Recent activity
        </h2>
        {activity === null ? (
          <p className="mt-4 text-sm text-stone">Loading…</p>
        ) : activity.length === 0 ? (
          <p className="mt-4 text-sm text-stone">
            Nothing yet. Start{" "}
            <Link href="/search" className="font-bold text-river underline underline-offset-2">
              browsing homes
            </Link>{" "}
            — your saves and views show up here.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {activity.map((a) => {
              const detail = activityDetail(a);
              const when = new Date(a.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });
              const label = ACTIVITY_LABEL[a.type] ?? a.type;
              return (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0 text-sm text-ink-soft">
                    <span className="font-semibold">{label}</span>
                    {detail && (
                      <>
                        {" — "}
                        {a.listingId ? (
                          <Link
                            href={`/listing/${a.listingId}`}
                            className="text-river underline underline-offset-2"
                          >
                            {detail}
                          </Link>
                        ) : (
                          <span className="text-stone">{detail}</span>
                        )}
                      </>
                    )}
                  </span>
                  <time className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-stone">
                    {when}
                  </time>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
