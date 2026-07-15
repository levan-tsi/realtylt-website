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
  fairHousingPdf:
    "https://dos.ny.gov/system/files/documents/2025/04/fairhousingnotice.pdf",
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
 * these slugs are the friendly URL-safe forms. Kept separate from COUNTIES because the
 * editorial Top Areas pages (content/counties, NAV) cover the six Hudson Valley counties
 * only — boroughs are searchable areas, not (yet) Top Areas pages. */
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

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Search Listings", href: "/search" },
  { label: "Buying", href: "/buying" },
  { label: "Selling", href: "/selling" },
  {
    label: "Top Areas",
    href: "/top-areas",
    children: COUNTIES.map((c) => ({
      label: c.name.replace(" County", "").toUpperCase(),
      href: `/top-areas/${c.slug}`,
    })),
  },
  { label: "Financing", href: "/financing" },
  { label: "Home Value", href: "/home-value" },
  { label: "Who We Are", href: "/who-we-are" },
  { label: "Blog", href: "/blog" },
  { label: "Connect", href: "/connect" },
] as const;

export const FOOTER_NAV = [
  { label: "Home", href: "/" },
  { label: "Listings", href: "/search" },
  { label: "Buying", href: "/buying" },
  { label: "Selling", href: "/selling" },
  { label: "Financing", href: "/financing" },
  { label: "Home Value", href: "/home-value" },
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
