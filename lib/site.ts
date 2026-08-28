/** Site-wide constants — single source for identity, contact, and navigation (brief §1, §3, §7). */

export const SITE = {
  name: "RealtyLT",
  legalName: "Levan Tsiklauri | United Real Estate",
  // Trailing slash stripped — "https://realtylt.com/" in the env var would double-slash canonicals.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://realtylt.com").replace(/\/+$/, ""),
  address: {
    street: "1097 Route 55 Suite 9",
    locality: "Lagrangeville",
    region: "NY",
    postalCode: "12540",
  },
  phone: "(917) 905-7923",
  phoneHref: "tel:+19179057923",
  phoneE164: "+19179057923",
  email: "levan@realtylt.com",
  disclaimer: "Each office is independently owned and operated.",
  /** The STABLE landing path, not a dated file path. The old link
   *  (`/system/files/documents/2025/04/fairhousingnotice.pdf`) 404'd on 2026-08-02: NY DOS moved
   *  the file and renamed it the "Housing and Anti-Discrimination Notice" (02.2025). This path
   *  redirects to whatever the current file is, so a rename cannot break a required disclosure
   *  again. Note dos.ny.gov 403s every scripted request — check this one in a real browser. */
  fairHousingPdf: "https://dos.ny.gov/fair-housing-notice",
} as const;

export const COUNTIES = [
  { slug: "dutchess", name: "Dutchess County" },
  { slug: "westchester", name: "Westchester County" },
  { slug: "putnam", name: "Putnam County" },
  { slug: "rockland", name: "Rockland County" },
  { slug: "ulster", name: "Ulster County" },
  { slug: "orange", name: "Orange County" },
] as const;

/** The five NYC boroughs — also served (owner sells in the city too). The feed labels them
 * by LEGAL county name (Kings/New York/Richmond — see normalizeCounty in lib/idx/mls-grid);
 * these slugs are the friendly URL-safe forms. Kept separate from COUNTIES because the two
 * groups are presented separately (Top Areas flyout, home areas strip) and because the
 * editorial depth differs — both DO have real /top-areas pages (see content/boroughs). */
export const BOROUGHS = [
  { slug: "bronx", name: "The Bronx" },
  { slug: "brooklyn", name: "Brooklyn" },
  { slug: "manhattan", name: "Manhattan" },
  { slug: "queens", name: "Queens" },
  { slug: "staten-island", name: "Staten Island" },
] as const;

/** Every area the IDX layer serves — drives the feed keep-set, search filters, and CountySlug. */
export const SERVED_AREAS = [...COUNTIES, ...BOROUGHS] as const;

export type CountySlug = (typeof SERVED_AREAS)[number]["slug"];

/** Default /search scope when the visitor hasn't picked an area: EVERYTHING we serve — the six
 * Hudson Valley counties AND the five NYC boroughs (owner's call, 2026-08-06: "lets show ny 5
 * boroughs too, set as default to show all active listings on the map"). Until round 23 this
 * was the six counties only, with the boroughs' 13,545 on-market listings (measured 2026-08-06
 * — Queens alone, 9,740, outweighs all six counties' Active inventory) hidden behind the
 * borough expander. The map's label thinning is what makes the full scope renderable. */
export const DEFAULT_COUNTY_SLUGS: readonly CountySlug[] = SERVED_AREAS.map((c) => c.slug);

/** The Bronx is the one area whose readable page slug differs from its internal area slug
 * (/top-areas/the-bronx vs the DB/search value "bronx"). content/boroughs owns that mapping;
 * content/boroughs.test.ts asserts the two never drift apart. */
const BOROUGH_PAGE_SLUG: Record<string, string> = { bronx: "the-bronx" };

/** Top Areas, in the two groups we actually sell in. Both groups have real pages; the
 * boroughs are the secondary group, so the UI keeps them behind their own expander on
 * small screens rather than dumping eleven links into the menu. */
export const TOP_AREA_GROUPS = [
  {
    id: "hudson-valley",
    label: "Hudson Valley",
    items: COUNTIES.map((c) => ({
      label: c.name.replace(" County", "").toUpperCase(),
      href: `/top-areas/${c.slug}`,
    })),
  },
  {
    id: "nyc",
    label: "New York City",
    items: BOROUGHS.map((b) => ({
      label: b.name.toUpperCase(),
      href: `/top-areas/${BOROUGH_PAGE_SLUG[b.slug] ?? b.slug}`,
    })),
  },
] as const;

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Search Listings", href: "/search" },
  { label: "Buying", href: "/buying" },
  { label: "Selling", href: "/selling" },
  {
    label: "Top Areas",
    href: "/top-areas",
    groups: TOP_AREA_GROUPS,
  },
  { label: "Financing", href: "/financing" },
  { label: "Home Value", href: "/home-value" },
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Blog", href: "/blog" },
  // The owner, 2026-08-28: "add AI before connect on top menu bar and give it purple outline or
  // our logo R blue so people notice". The logo-R blue (porchlight), outlined: the anti-slop
  // palette bans purple as a primary and the R-blue is already the brand mark. `external`
  // because /ai is served by a rewrite to the AI page's own deployment, not an RSC route (a
  // <Link> prefetch there 404s); `accent` is what the header reads to draw the outline.
  { label: "AI", href: "/ai", external: true, accent: true },
  { label: "Connect", href: "/connect" },
] as const;

export const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Listings", href: "/search" },
  { label: "Buying", href: "/buying" },
  { label: "Selling", href: "/selling" },
  { label: "Financing", href: "/financing" },
  { label: "Home Value", href: "/home-value" },
  // Same orphan rule as /services below: the 2026-08-27 E2E found /plan linked ONLY from
  // /sitemap — a payment-first buyer tool no visitor could reach.
  { label: "Plan Your Purchase", href: "/plan" },
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Reviews", href: "/reviews" },
  { label: "Connect", href: "/connect" },
  // The indexable per-service surface (app/services). Without a crawlable internal link
  // the twenty service pages are orphans no matter what the sitemap says.
  { label: "AI Services", href: "/services" },
  { label: "RealtyLT AI", href: "/ai", external: true },
] as const;

/** Interest-reason dropdown — exact options from brief §7. */
export const INTEREST_REASONS = [
  "I'm interested in buying a home",
  "I'm interested in selling a home",
  "I'm interested in buying and selling",
  "I'm interested in finding a home to rent",
  "I'm interested in a real estate career",
  "Other reason to contact an agent",
] as const;

export type InterestReason = (typeof INTEREST_REASONS)[number];
