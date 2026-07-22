/** Top Areas — the five NYC boroughs (parity round 5, item 2).
 *
 * These reuse the /top-areas/[county] template but stay deliberately SHORT and factual: a
 * one-line factual tagline plus REAL DB numbers and a live listing grid. No invented
 * neighborhood prose — the owner can add editorial later.
 *
 * Slug mapping: the URL slug is the readable form (/top-areas/the-bronx) while `countySlug`
 * is the internal value used everywhere else — the DB `county` column, /search?county=, the
 * feed keep-set. Only the Bronx differs (the-bronx → bronx); the other four are identical. */

import { BOROUGHS, type CountySlug } from "@/lib/site";

export interface BoroughContent {
  /** URL slug for /top-areas/<slug>. */
  slug: string;
  /** Internal area slug (DB `county`, /search?county=…). */
  countySlug: CountySlug;
  /** Display name — derived from BOROUGHS (lib/site) by countySlug, not retyped here. */
  name: string;
  short: string;
  /** One short, verifiable fact — not editorial prose. */
  tagline: string;
}

const BOROUGH_DATA: Omit<BoroughContent, "name">[] = [
  { slug: "manhattan", countySlug: "manhattan", short: "Manhattan", tagline: "New York City's densest borough and the transit hub of the region." },
  { slug: "brooklyn", countySlug: "brooklyn", short: "Brooklyn", tagline: "New York City's most populous borough." },
  { slug: "queens", countySlug: "queens", short: "Queens", tagline: "New York City's largest borough by area." },
  { slug: "the-bronx", countySlug: "bronx", short: "The Bronx", tagline: "New York City's northernmost borough — the only one on the U.S. mainland." },
  { slug: "staten-island", countySlug: "staten-island", short: "Staten Island", tagline: "New York City's most suburban borough." },
];

export const BOROUGH_CONTENT: BoroughContent[] = BOROUGH_DATA.map((b) => ({
  ...b,
  name: BOROUGHS.find((x) => x.slug === b.countySlug)!.name,
}));

/** Resolve a borough by its URL slug (e.g. "the-bronx"). */
export function getBorough(slug: string): BoroughContent | undefined {
  return BOROUGH_CONTENT.find((b) => b.slug === slug);
}

/** The Top Areas URL for an internal county/borough slug (e.g. "bronx" → "/top-areas/the-bronx").
 * Used by the home areas strip so its borough links land on the new pages. */
export function boroughPath(countySlug: string): string | undefined {
  const b = BOROUGH_CONTENT.find((x) => x.countySlug === countySlug);
  return b ? `/top-areas/${b.slug}` : undefined;
}
