"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { ReportGenerator } from "@/components/portal/ReportGenerator";
import { mapReportRow, PORTAL_REPORT_COLS, type PortalReportRow } from "@/lib/reports/map";
import type { PortalReport } from "@/lib/reports/types";

const usdShort = (n: number | null) =>
  n && n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n ? `$${Math.round(n / 1000)}K` : null;

function figure(r: PortalReport): string {
  if (r.kind === "cma") {
    const lo = usdShort(r.suggestedPriceLow);
    const hi = usdShort(r.suggestedPriceHigh);
    return lo && hi ? `${lo} – ${hi}` : "Estimate pending";
  }
  const median = Number((r.stats as { medianPrice?: number }).medianPrice) || 0;
  return median ? `${usdShort(median)} median` : "Market snapshot";
}

function ReportCard({ r }: { r: PortalReport }) {
  const date = new Date(r.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <Link
      href={`/portal/reports/${r.id}`}
      className="group flex flex-col justify-between rounded-[6px] border border-ink/10 bg-white p-5 transition-colors hover:border-ink/30"
    >
      <div>
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone">
          {r.kind === "cma" ? "Home value" : "Market report"}
        </span>
        <p className="mt-1.5 font-semibold text-ink group-hover:text-river">{r.title}</p>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-lg font-light text-ink">{figure(r)}</p>
        <time className="font-mono text-[11px] uppercase tracking-wide text-stone">{date}</time>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  const { supabase, user } = useAuth();
  const [reports, setReports] = useState<PortalReport[] | null>(null);

  useEffect(() => {
    if (!supabase || !user) return;
    let active = true;
    supabase
      .from("portal_reports")
      .select(PORTAL_REPORT_COLS)
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!active) return;
        setReports((data ?? []).map((r) => mapReportRow(r as unknown as PortalReportRow)));
      });
    return () => {
      active = false;
    };
  }, [supabase, user]);

  const agentReports = (reports ?? []).filter((r) => r.source === "agent");
  const myReports = (reports ?? []).filter((r) => r.source === "client");

  return (
    <section aria-labelledby="reports-heading" className="space-y-10">
      <div>
        <h2 id="reports-heading" className="font-display text-2xl text-ink">
          My reports
        </h2>
        <p className="mt-1 text-sm text-stone">
          Home-value estimates and Hudson Valley market reports. Run your own in seconds, or open
          the ones your agent prepared for you.
        </p>
      </div>

      {agentReports.length > 0 && (
        <section aria-labelledby="agent-reports">
          <h3 id="agent-reports" className="text-sm font-bold uppercase tracking-[0.12em] text-stone">
            Prepared by your agent
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agentReports.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="my-reports">
        <h3 id="my-reports" className="text-sm font-bold uppercase tracking-[0.12em] text-stone">
          Your reports
        </h3>
        {reports === null ? (
          <p className="mt-4 text-sm text-stone">Loading…</p>
        ) : myReports.length === 0 ? (
          <p className="mt-4 text-sm text-stone">
            You haven&rsquo;t run a report yet. Start one below.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myReports.map((r) => (
              <ReportCard key={r.id} r={r} />
            ))}
          </div>
        )}
      </section>

      <ReportGenerator />
    </section>
  );
}
