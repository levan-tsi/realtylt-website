"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { TalkToAgent } from "@/components/portal/TalkToAgent";
import { clampCondition, estimateCma } from "@/lib/reports/cma";
import { SERVED_AREAS } from "@/lib/site";
import type {
  CmaAdjustments,
  CmaSubject,
  Comp,
  MarketStats,
  PortalReport,
} from "@/lib/reports/types";

const usd = (n: number) => (n > 0 ? `$${Math.round(n).toLocaleString("en-US")}` : "—");
const countyLabel = (slug: string) => SERVED_AREAS.find((c) => c.slug === slug)?.name ?? slug;
const asOf = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

export function ReportDetail({ report }: { report: PortalReport }) {
  const { user, supabase, track } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  // Record the open once.
  const viewed = useRef(false);
  useEffect(() => {
    if (user && !viewed.current) {
      viewed.current = true;
      track("view_report", undefined, { title: report.title, kind: report.kind });
    }
  }, [user, track, report.title, report.kind]);

  async function remove() {
    if (!supabase || !user) return;
    if (!window.confirm("Delete this report? This can't be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("portal_reports").delete().eq("id", report.id);
    if (error) {
      setDeleting(false);
      return;
    }
    router.push("/portal/reports");
  }

  return (
    <div className="space-y-10">
      <header>
        <div className="flex items-center justify-between gap-4">
          <Link href="/portal/reports" className="text-sm font-bold text-river hover:underline">
            &larr; All reports
          </Link>
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="text-sm text-stone underline-offset-4 transition-colors hover:text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete report"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
              report.source === "agent"
                ? "bg-porchlight/15 text-porchlight-deep"
                : "bg-ink/8 text-stone"
            }`}
          >
            {report.source === "agent" ? "Prepared by your agent" : report.kind === "cma" ? "Home value" : "Market report"}
          </span>
          <h1 className="font-display text-2xl text-ink md:text-3xl">{report.title}</h1>
        </div>
        {report.agentNote && (
          <p className="mt-3 max-w-2xl rounded-[4px] border-l-2 border-porchlight bg-mist px-4 py-3 text-sm italic text-ink-soft">
            &ldquo;{report.agentNote}&rdquo; — your agent
          </p>
        )}
      </header>

      {report.kind === "cma" ? <CmaBody report={report} /> : <MarketBody report={report} />}
    </div>
  );
}

/* ─────────────────────────  CMA  ───────────────────────── */

function CmaBody({ report }: { report: PortalReport }) {
  const { supabase, user, track } = useAuth();
  const subject = report.subject as unknown as CmaSubject;
  const stats = report.stats as unknown as { comps: Comp[]; dataLastUpdated: string };
  const comps = useMemo(() => stats.comps ?? [], [stats.comps]);
  const savedCriteria = report.criteria as unknown as CmaAdjustments;

  const initialIncluded = useMemo(
    () =>
      savedCriteria.includedIds && savedCriteria.includedIds.length
        ? savedCriteria.includedIds
        : comps.filter((c) => c.pricePerSqft > 0).map((c) => c.id),
    [savedCriteria.includedIds, comps],
  );
  const [conditionPct, setConditionPct] = useState<number>(savedCriteria.conditionPct ?? 0);
  const [included, setIncluded] = useState<Set<string>>(() => new Set(initialIncluded));
  // Baseline = what's persisted; updated on save so the "dirty" flag clears afterward.
  const [baseline, setBaseline] = useState<{ conditionPct: number; includedIds: string[] }>(() => ({
    conditionPct: savedCriteria.conditionPct ?? 0,
    includedIds: initialIncluded,
  }));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const estimate = useMemo(
    () => estimateCma(subject.sqft, comps, { conditionPct, includedIds: [...included] }),
    [subject.sqft, comps, conditionPct, included],
  );

  const dirty =
    conditionPct !== baseline.conditionPct || !sameSet(included, new Set(baseline.includedIds));

  function toggle(id: string) {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaveState("idle");
  }

  async function save() {
    if (!supabase || !user) return;
    setSaveState("saving");
    const criteria: CmaAdjustments = { conditionPct, includedIds: [...included] };
    const { error } = await supabase
      .from("portal_reports")
      .update({
        criteria: criteria as unknown as Record<string, unknown>,
        stats: { comps, estimate, dataLastUpdated: stats.dataLastUpdated } as unknown as Record<string, unknown>,
        suggested_price_low: estimate.insufficient ? null : estimate.low,
        suggested_price_high: estimate.insufficient ? null : estimate.high,
      })
      .eq("id", report.id);
    if (error) {
      setSaveState("idle");
    } else {
      setBaseline({ conditionPct, includedIds: [...included] });
      setSaveState("saved");
      track("recalc_report", undefined, { title: report.title, conditionPct });
    }
  }

  return (
    <>
      {/* Subject + estimate hero */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[6px] border border-ink/10 bg-white p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Your home</p>
          <p className="mt-2 text-xl font-bold text-ink">{subject.address}</p>
          <p className="text-sm text-stone">
            {subject.city}, {countyLabel(subject.county).replace(" County", "")} County
          </p>
          <dl className="mt-5 grid grid-cols-3 gap-4 border-t border-ink/10 pt-5 text-center">
            <Spec label="Beds" value={subject.beds || "—"} />
            <Spec label="Baths" value={subject.baths || "—"} />
            <Spec label="Sq Ft" value={subject.sqft ? subject.sqft.toLocaleString("en-US") : "—"} />
          </dl>
        </div>

        <div className="flex flex-col justify-center rounded-[6px] bg-ink p-6 text-paper md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-porchlight">Estimated market value</p>
          {estimate.insufficient ? (
            <p className="mt-3 text-lg font-light text-paper/80">
              Not enough comparable listings to price this home automatically. Raise your hand below
              and your agent will prepare a full CMA.
            </p>
          ) : (
            <>
              <p data-testid="cma-mid" className="mt-2 text-5xl font-light tracking-tight md:text-6xl">
                {usd(estimate.mid)}
              </p>
              <p className="mt-2 text-sm text-paper/70">
                Range {usd(estimate.low)} – {usd(estimate.high)}
              </p>
              <p className="mt-4 border-t border-paper/15 pt-4 text-xs text-paper/60">
                Based on {estimate.compCount} comparable active {estimate.compCount === 1 ? "listing" : "listings"} at a
                median of ${estimate.medianPricePerSqft}/sq ft
                {conditionPct !== 0 && `, condition ${conditionPct > 0 ? "+" : ""}${conditionPct}%`}.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Recalculate */}
      <section aria-labelledby="recalc-heading" className="rounded-[6px] border border-ink/10 bg-mist p-6 md:p-8">
        <h2 id="recalc-heading" className="font-display text-xl text-ink">Fine-tune your estimate</h2>
        <p className="mt-1 text-sm text-stone">
          Include the comps that best match your home and nudge for condition — the value updates live.
        </p>

        <div className="mt-5 max-w-md">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="cond" className="font-bold text-ink">Condition vs comps</label>
            <span className="font-mono text-ink-soft">
              {conditionPct > 0 ? "+" : ""}
              {conditionPct}%
            </span>
          </div>
          <input
            id="cond"
            type="range"
            min={-15}
            max={15}
            step={1}
            value={conditionPct}
            onChange={(e) => {
              setConditionPct(clampCondition(Number(e.target.value)));
              setSaveState("idle");
            }}
            className="mt-2 w-full accent-ink"
          />
          <div className="flex justify-between text-[11px] uppercase tracking-wide text-stone">
            <span>Needs work</span>
            <span>Turn-key</span>
          </div>
        </div>

        {comps.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-ink/15 text-[11px] uppercase tracking-wide text-stone">
                  <th className="py-2 pr-3 font-bold">Use</th>
                  <th className="py-2 pr-3 font-bold">Comparable listing</th>
                  <th className="py-2 pr-3 text-right font-bold">Beds/Baths</th>
                  <th className="py-2 pr-3 text-right font-bold">Sq Ft</th>
                  <th className="py-2 pr-3 text-right font-bold">Price</th>
                  <th className="py-2 text-right font-bold">$/Sq Ft</th>
                </tr>
              </thead>
              <tbody>
                {comps.map((c) => {
                  const usable = c.pricePerSqft > 0;
                  const on = included.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-ink/10 ${usable ? "" : "opacity-45"}`}
                    >
                      <td className="py-2.5 pr-3">
                        <input
                          type="checkbox"
                          checked={on && usable}
                          disabled={!usable}
                          onChange={() => toggle(c.id)}
                          aria-label={`Include ${c.address}`}
                          className="h-4 w-4 accent-ink disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <Link href={`/listing/${c.id}`} className="font-semibold text-ink hover:text-river hover:underline">
                          {c.address}
                        </Link>
                        <span className="block text-xs text-stone">{c.city}</span>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-ink-soft">
                        {(c.beds || "—")}/{(c.baths || "—")}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-ink-soft">
                        {c.sqft ? c.sqft.toLocaleString("en-US") : "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-ink">{usd(c.price)}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">
                        {usable ? `$${c.pricePerSqft}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saveState === "saving"}
            className="rounded-[4px] bg-ink px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-40"
          >
            {saveState === "saving" ? "Saving…" : "Save adjustments"}
          </button>
          {saveState === "saved" && !dirty && (
            <span role="status" className="text-sm text-stone">Saved to your report.</span>
          )}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-stone">
          This is an automated estimate from comparable homes <strong>currently for sale</strong> — not a
          formal appraisal. For a precise analysis using recently <strong>sold</strong> comps, raise your
          hand and Levan will prepare a full CMA.
          {stats.dataLastUpdated && ` Listing data as of ${asOf(stats.dataLastUpdated)}.`}
        </p>
      </section>

      <TalkToAgent
        reportTitle={report.title}
        interestReason="I'm interested in selling a home"
        address={`${subject.address}, ${subject.city}, NY`}
      />
    </>
  );
}

/* ─────────────────────────  MARKET  ───────────────────────── */

function MarketBody({ report }: { report: PortalReport }) {
  const { supabase, user } = useAuth();
  const subject = report.subject as unknown as { county: string; town: string | null };
  const [stats, setStats] = useState<MarketStats>(report.stats as unknown as MarketStats);
  const [refreshing, setRefreshing] = useState(false);

  const areaLabel = subject.town
    ? `${subject.town}, ${countyLabel(subject.county).replace(" County", "")} County`
    : countyLabel(subject.county);

  async function refresh() {
    setRefreshing(true);
    try {
      const url = `/api/reports/market?county=${subject.county}${subject.town ? `&town=${encodeURIComponent(subject.town)}` : ""}`;
      const res = await fetch(url);
      const { stats: fresh } = (await res.json()) as { stats: MarketStats };
      if (fresh) {
        setStats(fresh);
        if (supabase && user) {
          await supabase
            .from("portal_reports")
            .update({ stats: fresh as unknown as Record<string, unknown> })
            .eq("id", report.id);
        }
      }
    } catch {
      /* leave the existing stats in place */
    }
    setRefreshing(false);
  }

  const maxBand = Math.max(1, ...stats.priceBands.map((b) => b.count));
  const maxBeds = Math.max(1, ...stats.bedsDistribution.map((b) => b.count));

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone">Active market · {areaLabel}</p>
          <p className="mt-1 text-sm text-stone">
            Homes for sale right now{stats.dataLastUpdated && ` · as of ${asOf(stats.dataLastUpdated)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="rounded-[4px] border border-ink px-5 py-2.5 text-sm font-bold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </section>

      <section aria-label="Key market metrics" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Metric label="Active listings" value={stats.activeCount.toLocaleString("en-US")} />
        <Metric label="Median list price" value={usd(stats.medianPrice)} />
        <Metric label="Median $/sq ft" value={stats.medianPricePerSqft ? `$${stats.medianPricePerSqft}` : "—"} />
        <Metric label="Median size" value={stats.medianSqft ? `${stats.medianSqft.toLocaleString("en-US")} sf` : "—"} />
        <Metric label="Typical beds" value={stats.medianBeds ? `${stats.medianBeds} bd` : "—"} />
        <Metric label="Typical range" value={`${usdShort(stats.typicalLow)}–${usdShort(stats.typicalHigh)}`} />
      </section>

      <section aria-labelledby="bands-heading" className="rounded-[6px] border border-ink/10 bg-white p-6 md:p-8">
        <h2 id="bands-heading" className="font-display text-xl text-ink">Where prices land</h2>
        <ul className="mt-5 space-y-3">
          {stats.priceBands.map((b) => (
            <li key={b.label} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3 text-sm">
              <span className="text-stone">{b.label}</span>
              <span className="h-3 rounded-full bg-mist">
                <span
                  className="block h-3 rounded-full bg-river"
                  style={{ width: `${(b.count / maxBand) * 100}%` }}
                />
              </span>
              <span className="text-right tabular-nums font-bold text-ink">{b.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[6px] border border-ink/10 bg-white p-6">
          <h2 className="font-display text-lg text-ink">By bedrooms</h2>
          <ul className="mt-4 space-y-2.5">
            {stats.bedsDistribution.map((b) => (
              <li key={b.label} className="grid grid-cols-[3.5rem_1fr_2.5rem] items-center gap-3 text-sm">
                <span className="text-stone">{b.label}</span>
                <span className="h-2.5 rounded-full bg-mist">
                  <span className="block h-2.5 rounded-full bg-porchlight" style={{ width: `${(b.count / maxBeds) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums text-ink-soft">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-[6px] border border-ink/10 bg-white p-6">
          <h2 className="font-display text-lg text-ink">Property type</h2>
          <ul className="mt-4 space-y-2.5">
            {stats.propertyTypeSplit.map((b) => (
              <li key={b.label} className="flex items-center justify-between text-sm">
                <span className="text-stone">{b.label}</span>
                <span className="tabular-nums font-bold text-ink">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TalkToAgent reportTitle={report.title} interestReason="Other reason to contact an agent" />
    </>
  );
}

/* ─────────────────────────  bits  ───────────────────────── */

function Spec({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dd className="text-xl font-bold text-ink">{value}</dd>
      <dt className="mt-0.5 text-[11px] uppercase tracking-wide text-stone">{label}</dt>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[6px] border border-ink/10 bg-white p-5">
      <p className="text-2xl font-light text-ink md:text-3xl">{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-stone">{label}</p>
    </div>
  );
}

const usdShort = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n > 0 ? `$${Math.round(n / 1000)}K` : "—";

function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}
