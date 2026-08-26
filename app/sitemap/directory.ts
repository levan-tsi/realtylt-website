/** The human site map's inventory (docs/parity/DESIGN-ROUND41.md).
 *
 * Same sources as app/sitemap.ts (the XML one), so the page a visitor reads and the file a
 * crawler reads can never disagree — directory.test.ts holds the two together. Listings are
 * deliberately absent: the live feed rotates, and a map that lists what may be gone tomorrow
 * is a map that lies. /search is the honest door to inventory.
 */

import { COUNTY_CONTENT } from "@/content/counties";
import { BOROUGH_CONTENT } from "@/content/boroughs";
import { getArticles } from "@/lib/blog";
import { getServices } from "@/lib/services";
import { SITE } from "@/lib/site";

export interface DirectoryLink {
  label: string;
  href: string;
  /** One plain-words line under the label. Pages + legal only; names carry the rest. */
  note?: string;
  /** Rendered with <a>, not <Link>: an off-app or off-router destination. */
  external?: boolean;
}

export interface DirectoryGroup {
  /** Subgroup label (e.g. "Hudson Valley"). Absent = the section's single unlabeled group. */
  label?: string;
  links: DirectoryLink[];
}

export interface DirectorySection {
  id: string;
  title: string;
  groups: DirectoryGroup[];
}

const shortDate = (iso: string) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export async function getDirectory(): Promise<DirectorySection[]> {
  const pages: DirectoryLink[] = [
    { label: "Home", href: "/", note: "Where the search starts." },
    { label: "Search Listings", href: "/search", note: "Every home on the market in the areas we serve, on a map." },
    { label: "Buying", href: "/buying", note: "How we work with buyers, from first search to keys." },
    { label: "Selling", href: "/selling", note: "What it takes to price, list, and sell your home." },
    { label: "Home Value", href: "/home-value", note: "What your home is worth right now." },
    { label: "Financing", href: "/financing", note: "Loan types, monthly payment math, and lender introductions." },
    { label: "Plan Your Purchase", href: "/plan", note: "The four stages of a purchase, from budget to keys." },
    { label: "Top Areas", href: "/top-areas", note: "The six Hudson Valley counties and five NYC boroughs we serve." },
    { label: "Who We Are", href: "/who-we-are", note: "Levan Tsiklauri and the team behind RealtyLT." },
    { label: "Reviews", href: "/reviews", note: "What clients say about working with us." },
    { label: "AI Services", href: "/services", note: "Twenty AI services we build and run for real estate work." },
    // /ai is served by a rewrite to a separate project (see lib/services aiJourneyHref):
    // <Link> would prefetch an RSC payload that does not exist, so it renders as <a>.
    { label: "RealtyLT AI", href: "/ai", note: "The interactive tour of the AI platform itself.", external: true },
    { label: "Blog", href: "/blog", note: "Guides and market notes, written for New York." },
    { label: "Connect", href: "/connect", note: "Reach Levan by phone, text, or the form." },
  ];

  const areas: DirectoryGroup[] = [
    {
      label: "Hudson Valley",
      links: COUNTY_CONTENT.map((c) => ({ label: c.name, href: `/top-areas/${c.slug}` })),
    },
    {
      label: "New York City",
      links: BOROUGH_CONTENT.map((b) => ({ label: b.name, href: `/top-areas/${b.slug}` })),
    },
  ];

  const services: DirectoryLink[] = getServices().map((s) => ({
    label: s.name,
    href: `/services/${s.slug}`,
  }));

  // Same exclusion as app/sitemap.ts: a seeded stub is noindex on its own page, so it
  // appears on neither map.
  const posts: DirectoryLink[] = (await getArticles())
    .filter((p) => !p.placeholder)
    .map((p) => ({ label: p.title, href: `/blog/${p.slug}`, note: shortDate(p.date) }));

  const legal: DirectoryLink[] = [
    { label: "Privacy Policy", href: "/privacy-policy", note: "What we collect and why." },
    { label: "DMCA & Terms of Service", href: "/dmca-terms", note: "Terms of use and the copyright takedown process." },
    { label: "Fair Housing Notice", href: SITE.fairHousingPdf, note: "The New York State housing discrimination notice.", external: true },
    { label: "XML sitemap", href: "/sitemap.xml", note: "The machine-readable version of this page, for search engines.", external: true },
  ];

  return [
    { id: "pages", title: "Pages", groups: [{ links: pages }] },
    { id: "areas", title: "Top Areas", groups: areas },
    { id: "services", title: "AI Services", groups: [{ links: services }] },
    { id: "blog", title: "From the Blog", groups: [{ links: posts }] },
    { id: "legal", title: "Legal & Fair Housing", groups: [{ links: legal }] },
  ];
}

export const sectionCount = (s: DirectorySection) =>
  s.groups.reduce((n, g) => n + g.links.length, 0);
