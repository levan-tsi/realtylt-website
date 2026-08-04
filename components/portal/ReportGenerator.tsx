"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Select } from "@/components/ui/Field";
import { useAuth } from "@/components/auth/AuthProvider";
import { SERVED_AREAS, type CountySlug } from "@/lib/site";
import { estimateCma } from "@/lib/reports/cma";
import type { CmaAdjustments, Comp } from "@/lib/reports/types";
import type { PropertyType } from "@/lib/idx";

type Mode = "cma" | "market";

const countyName = (slug: string) => SERVED_AREAS.find((c) => c.slug === slug)?.name ?? slug;

export function ReportGenerator() {
  const { supabase, user, track } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("cma");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // CMA fields. `?address=` arrives from the /home-value fork: somebody has already typed
  // their address once, and asking for it a second time on the other side of a sign-in is how
  // people give up. The town is split out of it when the string carries one.
  const params = useSearchParams();
  const handedOver = (params.get("address") ?? "").trim();
  const handedParts = handedOver.split(",").map((s) => s.trim()).filter(Boolean);
  const [address, setAddress] = useState(handedParts[0] ?? "");
  const [city, setCity] = useState(handedParts.length > 1 ? handedParts[1] : "");
  const [county, setCounty] = useState<CountySlug>("dutchess");
  const [propertyType, setPropertyType] = useState<PropertyType>("Residential");
  const [beds, setBeds] = useState("3");
  const [baths, setBaths] = useState("2");
  const [sqft, setSqft] = useState("");

  // Market fields
  const [mCounty, setMCounty] = useState<CountySlug>("dutchess");
  const [town, setTown] = useState("");
  const [towns, setTowns] = useState<string[]>([]);

  /** THE TOWN DECIDES THE COUNTY.
   *
   * This defaulted to Dutchess and never looked at the address it had been handed, which is a
   * silently wrong VALUATION rather than a wrong label: measured on our own data, a Yonkers
   * home under county=dutchess draws 24 comps in Beacon/Fishkill/Hyde Park at a median
   * $312/sq ft, against $426 for actual Yonkers comps. On an 1,800 sq ft home that is about
   * $562,000 instead of $767,000, under a heading naming the seller's own street.
   *
   * Re-resolved whenever the TOWN changes, so a county picked by hand survives until the town
   * moves under it — which is the point at which it stopped being the right answer anyway.
   */
  const [sqftSeeded, setSqftSeeded] = useState(false);
  useEffect(() => {
    const t = city.trim();
    if (t.length < 2) return;
    let active = true;
    fetch(`/api/reports/county?town=${encodeURIComponent(t)}`)
      .then((r) => r.json())
      .then((j: { county?: CountySlug | null; medianSqft?: number | null }) => {
        if (!active) return;
        if (j.county) setCounty(j.county);
        // Seed the square footage from the homes we are about to compare against.
        //
        // The field was empty and the generator refused to run without it, so somebody arriving
        // from the /home-value fork ("See what it's worth") hit a hard stop asking for a number
        // most people do not carry in their head. A blank stop is the worst of both worlds: it
        // neither answers them nor shows them what a reasonable answer looks like.
        //
        // Nothing is assumed silently — the number lands in the box, visible and editable, and
        // the line under it says where it came from. Only ever fills an EMPTY field, so it can
        // never overwrite what somebody typed.
        setSqft((cur) => {
          if (cur !== "" || !j.medianSqft) return cur;
          setSqftSeeded(true);
          return String(j.medianSqft);
        });
      })
      .catch(() => {
        /* leave whatever is selected — a failed lookup must not silently change the market */
      });
    return () => {
      active = false;
    };
  }, [city]);

  // Load the town list for the market county.
  useEffect(() => {
    let active = true;
    setTowns([]);
    setTown("");
    fetch(`/api/reports/market?county=${mCounty}`)
      .then((r) => r.json())
      .then((j: { towns?: string[] }) => {
        if (active && j.towns) setTowns(j.towns);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [mCounty]);

  const generateCma = useCallback(async () => {
    if (!supabase || !user) return;
    const sqftNum = Number(sqft) || 0;
    if (!address.trim() || !city.trim()) {
      setError("Add your street address and town so we can find the right comps.");
      return;
    }
    if (sqftNum <= 0) {
      setError("Enter your home's approximate square footage. The estimate is built on $/sq ft.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const url = `/api/reports/comps?county=${county}&beds=${Number(beds) || 0}&sqft=${sqftNum}&town=${encodeURIComponent(
        city.trim(),
      )}&propertyType=${propertyType}`;
      const res = await fetch(url);
      const { comps = [], dataLastUpdated = "" } = (await res.json()) as {
        comps: Comp[];
        dataLastUpdated: string;
      };
      const includedIds = comps.filter((c) => c.pricePerSqft > 0).map((c) => c.id);
      const adjustments: CmaAdjustments = { conditionPct: 0, includedIds };
      const estimate = estimateCma(sqftNum, comps, adjustments);
      const subject = {
        address: address.trim(),
        city: city.trim(),
        county,
        propertyType,
        beds: Number(beds) || 0,
        baths: Number(baths) || 0,
        sqft: sqftNum,
      };
      const title = `Home value: ${subject.address}, ${subject.city}`;
      const { data, error: dbErr } = await supabase
        .from("portal_reports")
        .insert({
          client_id: user.id,
          kind: "cma",
          source: "client",
          status: "ready",
          title,
          subject,
          criteria: adjustments as unknown as Record<string, unknown>,
          stats: { comps, estimate, dataLastUpdated } as unknown as Record<string, unknown>,
          suggested_price_low: estimate.insufficient ? null : estimate.low,
          suggested_price_high: estimate.insufficient ? null : estimate.high,
        })
        .select("id")
        .single();
      if (dbErr || !data) throw new Error(dbErr?.message || "Could not save the report.");
      track("generate_report", undefined, { kind: "cma", title });
      router.push(`/portal/reports/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the report.");
      setBusy(false);
    }
  }, [supabase, user, address, city, county, propertyType, beds, baths, sqft, track, router]);

  const generateMarket = useCallback(async () => {
    if (!supabase || !user) return;
    setBusy(true);
    setError("");
    try {
      const url = `/api/reports/market?county=${mCounty}${town ? `&town=${encodeURIComponent(town)}` : ""}`;
      const res = await fetch(url);
      const { stats } = (await res.json()) as { stats: Record<string, unknown> };
      if (!stats) throw new Error("Market data is unavailable right now.");
      const title = town
        ? `Market report: ${town}, ${countyName(mCounty).replace(" County", "")}`
        : `Market report: ${countyName(mCounty)}`;
      const { data, error: dbErr } = await supabase
        .from("portal_reports")
        .insert({
          client_id: user.id,
          kind: "market",
          source: "client",
          status: "ready",
          title,
          subject: { county: mCounty, town: town || null },
          criteria: {},
          stats,
        })
        .select("id")
        .single();
      if (dbErr || !data) throw new Error(dbErr?.message || "Could not save the report.");
      track("generate_report", undefined, { kind: "market", title });
      router.push(`/portal/reports/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate the report.");
      setBusy(false);
    }
  }, [supabase, user, mCounty, town, track, router]);

  return (
    <div className="rounded-2xl border border-ink/10 bg-mist p-6 md:p-8">
      <h3 className="font-display text-xl text-ink">Run a new report</h3>
      <p className="mt-1 text-sm text-stone">
        Instant, from live Hudson Valley listings. Then fine-tune it or hand it to your agent.
      </p>

      {/* Mode toggle */}
      <div
        role="tablist"
        aria-label="Report type"
        className="mt-5 inline-flex rounded-xl border border-ink/15 bg-white p-1"
      >
        {(
          [
            ["cma", "My home value (CMA)"],
            ["market", "Market report"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            type="button"
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              mode === m ? "bg-ink text-paper" : "text-stone hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "cma" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Street address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 Maple Street" autoComplete="off" />
          </div>
          <Input label="Town / city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Beacon" autoComplete="off" />
          <Select label="County" value={county} onChange={(e) => setCounty(e.target.value as CountySlug)}>
            {SERVED_AREAS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </Select>
          <Select label="Property type" value={propertyType} onChange={(e) => setPropertyType(e.target.value as PropertyType)}>
            <option value="Residential">Residential</option>
            <option value="Multi-Family">Multi-Family</option>
          </Select>
          <div>
            <Input
              label="Approx. sq ft"
              value={sqft}
              onChange={(e) => {
                setSqft(e.target.value.replace(/[^0-9]/g, ""));
                setSqftSeeded(false);
              }}
              inputMode="numeric"
              placeholder="2,000"
            />
            {/* Say where the number came from. A prefilled field that does not explain itself
                is a guess wearing the visitor's clothes. */}
            {sqftSeeded && (
              <p className="mt-1.5 text-xs leading-[1.5] text-stone">
                Typical for homes near you. Change it to yours for a closer estimate.
              </p>
            )}
          </div>
          <Input label="Beds" value={beds} onChange={(e) => setBeds(e.target.value.replace(/[^0-9]/g, ""))} inputMode="numeric" />
          <Input label="Baths" value={baths} onChange={(e) => setBaths(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Select label="County" value={mCounty} onChange={(e) => setMCounty(e.target.value as CountySlug)}>
            {SERVED_AREAS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </Select>
          <Select label="Town (optional)" value={town} onChange={(e) => setTown(e.target.value)} disabled={!towns.length}>
            <option value="">All of {countyName(mCounty).replace(" County", "")}</option>
            {towns.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={mode === "cma" ? generateCma : generateMarket}
          disabled={busy}
          className="rounded-xl bg-ink px-8 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          {busy ? "Running…" : mode === "cma" ? "Generate my estimate" : "Run market report"}
        </button>
      </div>
    </div>
  );
}
