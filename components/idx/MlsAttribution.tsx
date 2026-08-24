import Image from "next/image";

/** MLS compliance block — ALWAYS rendered near IDX content (ARCHITECTURE.md).
 * In fixture mode adds the "sample data" notice.
 *
 * The One Key MLS mark is part of the attribution, not decoration: an IDX participant
 * displays the source MLS's logo alongside its listing data. Live realtylt.com shows it
 * too, but serves it from the IDX vendor's CDN — ours is self-hosted from the MLS's OWN
 * brand asset (public/images/mls/, fetched by scripts/_scratch-onekey-dl.mjs), so nothing
 * hotlinks a third party. `unoptimized` keeps the SVG out of next/image's optimizer, which
 * refuses SVG sources unless next.config opts in.
 *
 * Widths match live: ~46px beside a results/rail block, ~100px on a listing detail page. */
const LOGO_ASPECT = 261 / 70; // intrinsic viewBox of the One Key mark
const LOGO_WIDTH = { sm: 46, lg: 100 } as const;

export function MlsAttribution({
  dataLastUpdated,
  fixtureMode = false,
  dark = false,
  logoSize = "sm",
  className = "",
}: {
  /** When OUR COPY of the One Key feed was last refreshed — NOT a single listing's
   * modificationTimestamp, which is a different fact (see getDataLastUpdated). */
  dataLastUpdated: string;
  fixtureMode?: boolean;
  dark?: boolean;
  logoSize?: keyof typeof LOGO_WIDTH;
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
  const width = LOGO_WIDTH[logoSize];

  return (
    <div
      className={`flex items-start gap-3 t-fine ${dark ? "text-paper/50" : "text-stone"} ${className}`}
    >
      <Image
        src={dark ? "/images/mls/onekey-mls-on-dark.svg" : "/images/mls/onekey-mls.svg"}
        alt="One Key MLS"
        width={width}
        height={Math.round(width / LOGO_ASPECT)}
        unoptimized
        className="mt-0.5 shrink-0"
      />
      <div className="min-w-0">
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
    </div>
  );
}
