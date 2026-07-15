/** MLS compliance block — ALWAYS rendered near IDX content (ARCHITECTURE.md).
 * In fixture mode adds the "sample data" notice. */
export function MlsAttribution({
  dataLastUpdated,
  fixtureMode = false,
  dark = false,
  className = "",
}: {
  dataLastUpdated: string;
  fixtureMode?: boolean;
  dark?: boolean;
  className?: string;
}) {
  const updated = new Date(dataLastUpdated).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
  const year = new Date(dataLastUpdated).getFullYear();

  return (
    <div className={`text-[11px] leading-relaxed ${dark ? "text-paper/50" : "text-stone"} ${className}`}>
      {fixtureMode && (
        <p className={`mb-1 font-mono text-[10px] uppercase tracking-[0.14em] ${dark ? "text-porchlight/80" : "text-porchlight-deep"}`}>
          Sample data shown. Live MLS listings appear when the feed is connected.
        </p>
      )}
      <p>
        Information provided by One Key MLS, and is deemed reliable but not guaranteed accurate.{" "}
        Data last updated: {updated} ET. ©{year} One Key MLS.
      </p>
    </div>
  );
}
