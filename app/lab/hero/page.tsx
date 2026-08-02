import Link from "next/link";
import { getIdxClient } from "@/lib/idx";
import { HeroDepth } from "@/components/lab/HeroDepth";
import { HeroValley, type ValleyPoint } from "@/components/lab/HeroValley";
import { HeroTraverse, type TraverseHome } from "@/components/lab/HeroTraverse";

/** LOCAL DESIGN LAB — three candidate home-page heroes, side by side with the real thing.
 *
 * NOT PART OF THE SITE. Owner's instruction: "make it as a test locally to show me, dont deploy
 * or anything. if it will be good enough we will add, or keep working until it is, or just keep
 * vimeo video." So this route exists to be LOOKED AT and argued with, and the live hero is
 * untouched — app/page.tsx still plays the Vimeo clip exactly as before.
 *
 * noindex regardless of the PRELAUNCH flag, so it can never be found even if it does reach a
 * deploy. It is not linked from anywhere and it is not in the sitemap.
 *
 * Read docs/parity/HERO-LAB.md for what each variant is arguing and what it would cost. */
export const metadata = { robots: { index: false, follow: false } };
export const revalidate = 0;

const VALLEY = { north: 42.35, south: 40.9, east: -73.35, west: -74.75 };

/** Lat/lng for the light field. PostgREST returns at most 1000 rows a request, so this pages;
 * 6,000 dots draw comfortably at 60fps and are far past the point where the valley reads. */
async function valleyPoints(): Promise<ValleyPoint[]> {
  const base = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_ANON_KEY?.trim();
  if (!base || !key) return [];
  const out: ValleyPoint[] = [];
  for (let page = 0; page < 6; page++) {
    const url =
      `${base}/rest/v1/idx_listings?is_active=eq.true&property_type=neq.Rental&price=gt.0` +
      `&lat=gt.${VALLEY.south}&lat=lt.${VALLEY.north}&lng=gt.${VALLEY.west}&lng=lt.${VALLEY.east}` +
      `&select=lat,lng,price,city&order=id.asc&limit=1000&offset=${page * 1000}`;
    const r = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12_000),
    }).catch(() => null);
    if (!r?.ok) break;
    const rows = (await r.json()) as ValleyPoint[];
    out.push(...rows);
    if (rows.length < 1000) break;
  }
  return out;
}

export default async function HeroLab() {
  const idx = getIdxClient();

  // The valley field: real coordinates for real active listings. Capped — the point is made
  // long before ten thousand dots, and the canvas stays cheap.
  // Read the coordinates DIRECTLY rather than through searchPins. Two reasons, both learned
  // the hard way here: the bounded path caps at PIN_CAP = 800, which renders as a faint
  // scatter (the valley's SHAPE is the whole argument for this variant and it only emerges
  // with density), and the unbounded path returned nothing at this size. A lab page reading
  // four columns straight out of PostgREST is honest; this is not a production path and it
  // must not become one without going back through the real client.
  const points = await valleyPoints();

  // The traverse set: only homes whose photos are ALREADY mirrored into our own Storage, so
  // hovering never touches the MLS media host.
  let homes: TraverseHome[] = [];
  try {
    const r = await idx.search({ pageSize: 24, sort: "featured" });
    homes = r.listings
      .filter((l) => (l.photoCount ?? 0) > 0 && l.photos[0])
      .slice(0, 8)
      .map((l) => ({ id: l.id, photo: l.photos[0], address: l.address, city: l.city, price: l.price }));
  } catch {
    homes = [];
  }

  const Copy = ({ tone = "light" }: { tone?: "light" | "dark" }) => (
    <div className="flex h-full flex-col justify-end px-8 pb-10 lg:px-14">
      <p className={`t-eyebrow ${tone === "dark" ? "text-paper/60" : "text-paper/70"}`}>
        Hudson Valley &amp; New York City
      </p>
      <h2 className="t-display mt-4 text-paper">
        Let&rsquo;s Find <strong>Home</strong>
      </h2>
      <div className="mt-7 flex w-full max-w-[520px] items-center rounded-xl border border-paper/30 bg-black/45 p-1 backdrop-blur-[2px]">
        <span className="w-full px-4 py-2.5 text-sm text-paper/60">Search for Homes</span>
        <span className="shrink-0 rounded-lg bg-paper px-6 py-3 text-sm font-bold uppercase tracking-[0.1em] text-ink">
          Search
        </span>
      </div>
    </div>
  );

  const Frame = ({
    letter, name, thesis, cost, children,
  }: { letter: string; name: string; thesis: string; cost: string; children: React.ReactNode }) => (
    <section className="mb-16">
      <div className="mx-auto max-w-[1250px] px-4 lg:px-8">
        <p className="t-eyebrow text-stone">Variant {letter}</p>
        <h3 className="t-h3 mt-1 text-ink">{name}</h3>
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-ink-soft">{thesis}</p>
        <p className="mt-1 max-w-[70ch] text-xs text-stone">{cost}</p>
      </div>
      <div className="mt-5 h-[620px] w-full">{children}</div>
    </section>
  );

  return (
    <main className="bg-paper pb-24 pt-10">
      <div className="mx-auto mb-12 max-w-[1250px] px-4 lg:px-8">
        <h1 className="t-h1 text-ink">Home hero — three candidates</h1>
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-ink-soft">
          Nothing here is live. The site still plays the Vimeo clip. Move the mouse across each
          one — they all behave differently, and two of them are only interesting in motion.
          Each is monochrome and dark on purpose: the point is to add depth without adding noise.
        </p>
        <p className="mt-2 text-sm text-stone">
          Full argument, costs and recommendation: <code className="text-ink">docs/parity/HERO-LAB.md</code>
          {" · "}
          <Link href="/" className="underline">the live hero for comparison</Link>
        </p>
      </div>

      <Frame
        letter="A"
        name="Depth"
        thesis="The photograph we already own, stopped being flat. The picture, the valley haze and the type sit on three planes that answer the pointer at different rates. Nothing else changes."
        cost="Cheapest and safest: no new data, no canvas, no dependency, and the LCP image is only ever transformed — never faded, never re-decoded."
      >
        <HeroDepth src="/images/hero/valley-aerial.jpg">
          <Copy />
        </HeroDepth>
      </Frame>

      <Frame
        letter="B"
        name="The Valley"
        thesis={`Every active listing we hold, at its real coordinates — ${points.length.toLocaleString("en-US")} points of light over the Hudson Valley. The field parallaxes with the pointer and the nearest home names itself. It does not claim coverage, it shows it, and no competitor can copy it because it is our data.`}
        cost="Canvas 2D, no Three.js, no dependency. One extra query at build/revalidate time. The riskiest to get right and the only one that is unmistakably RealtyLT."
      >
        <HeroValley points={points}>
          <Copy tone="dark" />
        </HeroValley>
      </Frame>

      <Frame
        letter="C"
        name="Traverse"
        thesis="Your idea: one house, and the mouse changes it. Moving across the frame travels through real homes we are selling, each cross-fading into the next with its address and price."
        cost="Only uses homes whose photos are already in our own Storage, and preloads a fixed set of 8 once — so hovering never touches the MLS media host. That constraint is not optional given the rate limiting."
      >
        <HeroTraverse homes={homes}>
          <Copy />
        </HeroTraverse>
      </Frame>
    </main>
  );
}
