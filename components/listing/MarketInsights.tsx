import { MIN_CITY_ACTIVES, type AreaInsights } from "@/lib/reports/insights";

/** Market Insights (live parity, but BEATING live's three N/A cards): real OneKey MLS
 * aggregates for the listing's city — Current Listings (new last 30 days), Average Price,
 * Average Days on Market. Falls back to the county set when the city has too few actives
 * (labeled). Renders a soft note when the DB is unavailable so the #market-insights anchor
 * always resolves. */

const monthStamp = (iso: string) => {
  const t = Date.parse(iso);
  const d = Number.isFinite(t) ? new Date(t) : new Date();
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export function MarketInsights({
  insights,
  city,
  countyName,
  fixtureMode,
}: {
  insights: AreaInsights | null;
  city: string;
  countyName: string;
  fixtureMode: boolean;
}) {
  const stamp = insights ? monthStamp(insights.dataLastUpdated) : "";

  const cards = insights
    ? [
        { title: "Current Listings", sub: "New in the last 30 days", value: insights.newLast30.toLocaleString("en-US") },
        { title: "Average Price", sub: "Active listings", value: `$${insights.avgPrice.toLocaleString("en-US")}` },
        {
          title: "Average Days on Market",
          sub: "Active listings",
          value: `${insights.avgDom.toLocaleString("en-US")} ${insights.avgDom === 1 ? "day" : "days"}`,
        },
      ]
    : [];

  return (
    <section
      id="market-insights"
      aria-labelledby="market-insights-heading"
      className="scroll-mt-16 border-t border-ink/10 bg-paper py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone">Market Insights</p>
        <h2 id="market-insights-heading" className="mt-2 font-display text-2xl text-ink md:text-3xl">
          The market around {insights?.scope === "county" ? countyName : `${city}, NY`}
        </h2>

        {insights ? (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {cards.map((c) => (
                <div key={c.title} className="flex flex-col items-center border border-ink/12 bg-white px-5 py-8 text-center">
                  <p className="text-sm font-bold text-ink">{c.title}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone">{c.sub}</p>
                  <p className="mt-5 font-mono text-3xl font-semibold tracking-tight text-ink md:text-4xl">{c.value}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-stone">{stamp}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-stone">
              {insights.scope === "city" ? (
                <>
                  Computed from {insights.activeCount.toLocaleString("en-US")} active OneKey MLS
                  listing{insights.activeCount === 1 ? "" : "s"} in {city}, NY.
                </>
              ) : (
                <>
                  Fewer than {MIN_CITY_ACTIVES} active listings in {city}, NY right now — showing{" "}
                  {countyName} ({insights.activeCount.toLocaleString("en-US")} active) instead.
                </>
              )}
            </p>
          </>
        ) : (
          <p className="mt-6 border border-dashed border-ink/15 bg-white px-5 py-8 text-center text-sm text-stone">
            {fixtureMode
              ? "Market insights use live OneKey MLS data, which isn't loaded in this preview."
              : "Market insight data is unavailable right now — please check back shortly."}
          </p>
        )}
      </div>
    </section>
  );
}
