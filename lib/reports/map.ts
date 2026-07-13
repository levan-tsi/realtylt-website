import type { PortalReport, ReportKind, ReportSource, ReportStatus } from "./types";

/** A raw `portal_reports` row as returned by the anon client. */
export interface PortalReportRow {
  id: string;
  kind: string;
  source: string;
  status: string;
  title: string;
  subject: Record<string, unknown> | null;
  criteria: Record<string, unknown> | null;
  stats: Record<string, unknown> | null;
  suggested_price_low: number | null;
  suggested_price_high: number | null;
  agent_note: string | null;
  created_at: string;
  updated_at: string;
}

export const PORTAL_REPORT_COLS =
  "id,kind,source,status,title,subject,criteria,stats,suggested_price_low,suggested_price_high,agent_note,created_at,updated_at";

export function mapReportRow(r: PortalReportRow): PortalReport {
  return {
    id: r.id,
    kind: (r.kind as ReportKind) ?? "cma",
    source: (r.source as ReportSource) ?? "client",
    status: (r.status as ReportStatus) ?? "ready",
    title: r.title,
    subject: r.subject ?? {},
    criteria: r.criteria ?? {},
    stats: r.stats ?? {},
    suggestedPriceLow: r.suggested_price_low,
    suggestedPriceHigh: r.suggested_price_high,
    agentNote: r.agent_note,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
