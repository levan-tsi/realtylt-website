/** Client-facing CMA + market report types (owner spec §5b).
 *
 * These power BOTH the self-serve reports a client generates from the committed MLS
 * snapshot AND the agent reports the CRM mirrors into `portal_reports`. The shapes are
 * deliberately close to the CRM's `public.cma_reports` (subject / stats / suggested price)
 * so a report reads the same however it was produced. See docs/CLIENT-ACCOUNTS.md. */

import type { PropertyType } from "@/lib/idx";
import type { CountySlug } from "@/lib/site";

export type ReportKind = "cma" | "market";
export type ReportSource = "client" | "agent";
export type ReportStatus = "draft" | "ready" | "shared";

/** The subject home a CMA values. */
export interface CmaSubject {
  address: string;
  city: string;
  county: CountySlug;
  propertyType: PropertyType;
  beds: number;
  baths: number;
  sqft: number;
}

/** A comparable listing snapshot captured into the report (no live photo — text comp). */
export interface Comp {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  /** price / sqft, 0 when sqft is unknown (OneKey multi-family/land rows). */
  pricePerSqft: number;
  propertyType: PropertyType;
  listOfficeName: string;
}

/** Client recalculation inputs — which comps count and a condition nudge. */
export interface CmaAdjustments {
  /** ids of the comps included in the estimate; empty/undefined = all. */
  includedIds?: string[];
  /** condition/upgrade nudge applied to the estimate, percent in [-15, 15]. */
  conditionPct: number;
}

/** The computed valuation. */
export interface CmaEstimate {
  /** true when there aren't enough usable comps to price the home. */
  insufficient: boolean;
  compCount: number;
  /** median $/sqft of the included comps (pre-condition). */
  medianPricePerSqft: number;
  low: number;
  mid: number;
  high: number;
}

export interface CmaResult {
  subject: CmaSubject;
  comps: Comp[];
  adjustments: CmaAdjustments;
  estimate: CmaEstimate;
  dataLastUpdated: string;
}

/** ── Market report ── */

export interface MarketArea {
  county: CountySlug;
  /** optional town/city filter within the county. */
  town?: string;
  propertyType?: PropertyType;
}

export interface Bucket {
  label: string;
  count: number;
}

export interface MarketStats {
  activeCount: number;
  medianPrice: number;
  medianPricePerSqft: number;
  medianSqft: number;
  medianBeds: number;
  /** 10th / 90th percentile list price — the "typical" band, outliers trimmed. */
  typicalLow: number;
  typicalHigh: number;
  priceBands: Bucket[];
  bedsDistribution: Bucket[];
  propertyTypeSplit: Bucket[];
  dataLastUpdated: string;
}

/** A row of `portal_reports` as the client reads it. */
export interface PortalReport {
  id: string;
  kind: ReportKind;
  source: ReportSource;
  status: ReportStatus;
  title: string;
  subject: Record<string, unknown>;
  criteria: Record<string, unknown>;
  stats: Record<string, unknown>;
  suggestedPriceLow: number | null;
  suggestedPriceHigh: number | null;
  agentNote: string | null;
  createdAt: string;
  updatedAt: string;
}
