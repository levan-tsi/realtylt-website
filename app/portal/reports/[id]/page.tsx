"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { ReportDetail } from "@/components/portal/ReportDetail";
import { mapReportRow, PORTAL_REPORT_COLS, type PortalReportRow } from "@/lib/reports/map";
import type { PortalReport } from "@/lib/reports/types";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { supabase, user } = useAuth();
  const [report, setReport] = useState<PortalReport | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    if (!supabase || !user || !id) return;
    let active = true;
    supabase
      .from("portal_reports")
      .select(PORTAL_REPORT_COLS)
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          setReport(mapReportRow(data as unknown as PortalReportRow));
          setState("ready");
        } else {
          setState("missing");
        }
      });
    return () => {
      active = false;
    };
  }, [supabase, user, id]);

  if (state === "loading") {
    return <p className="py-16 text-center text-sm text-stone">Loading your report…</p>;
  }
  if (state === "missing" || !report) {
    return (
      <div className="rounded-[6px] border border-dashed border-ink/20 p-10 text-center">
        <p className="font-display text-xl text-ink">Report not found.</p>
        <p className="mt-2 text-sm text-stone">
          It may have been removed, or belongs to another account.
        </p>
        <Link
          href="/portal/reports"
          className="mt-6 inline-block rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper hover:bg-ink-soft"
        >
          Back to reports
        </Link>
      </div>
    );
  }

  return <ReportDetail report={report} />;
}
