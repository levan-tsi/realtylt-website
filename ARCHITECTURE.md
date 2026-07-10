# ARCHITECTURE — RealtyLT Website

Stack: **Next.js 15 (App Router) · TypeScript · Tailwind CSS v4** · Node 22. Deploy target:
node server (`next build` + `next start`) — Hostinger VPS or Vercel compatible.

## Routes (app/)

| Route | Type | Notes |
|---|---|---|
| `/` | SSG | Hero, home-value split, Featured/New IDX carousels, testimonials, why-us, footer form |
| `/search` | client over API | Filters, county chips, grid + Leaflet map, sort, pagination, save/favorite |
| `/listing/[id]` | SSG (fixture) / dynamic (live) | Gallery, description, features, contact CTA, schema.org |
| `/buying` `/selling` `/financing` `/home-value` `/connect` `/who-we-are` `/reviews` | SSG | Per brief §6 |
| `/top-areas` | SSG | Hub: Valley Line river map + 6 county cards |
| `/top-areas/[county]` | SSG (×6: orange, dutchess, westchester, putnam, rockland, ulster) | Localized copy + pre-filtered results |
| `/blog` `/blog/[slug]` | SSG | MDX from `content/blog` |
| `/saved` | client | localStorage favorites + saved searches |
| `/privacy-policy` `/dmca-terms` | SSG | Legal |
| `/api/lead` | route handler | Lead intake → `lib/leads` |
| `/api/idx/search` `/api/idx/listing/[id]` | route handlers | Thin wrappers over `lib/idx` factory |
| `sitemap.ts` `robots.ts` | generated | |

Redirects (`next.config.ts`): `/index→/`, `/top_areas→/top-areas`, `/homevalue→/home-value`,
`/home_value→/home-value`, `/realestateagent/search→/who-we-are`.

## lib/idx — typed IDX layer (the mock boundary)

```ts
interface IdxClient {
  search(params: SearchParams): Promise<SearchResult>   // filters, sort, pagination
  getListing(id: string): Promise<Listing | null>
  getFeatured(limit?: number): Promise<Listing[]>
  getNew(limit?: number): Promise<Listing[]>
}
```

`Listing` carries compliance fields: `listOfficeName` ("Listed with …"), `originatingSystem`
("OneKey MLS"), `modificationTimestamp` (→ "Data last updated"). `SearchParams`: location/county,
priceMin/Max, beds, baths, sqftMin, propertyType (Residential | Multi-Family), sort, page.

- **`FixtureIdxClient`** (default): ~60 realistic listings across the 6 counties (real town names,
  believable prices per county — see docs/reference county screenshots), deterministic, supports
  all filters/sort/pagination. Photos from `/public/images/listings/`.
- **`MlsGridClient`**: real implementation skeleton reading `MLS_API_ENDPOINT`/`MLS_API_KEY`/
  `MLS_FEED_ID`. MLS Grid constraints (hard rules): OData `$filter` limited to allowed fields
  (ModificationTimestamp, OriginatingSystemName, MlgCanView, StandardStatus…), replication-style
  access, honor rate limits, render required attribution. Feed-dependent e2e marked pending.
- Factory `getIdxClient()`: returns MlsGridClient iff `MLS_API_KEY && MLS_API_ENDPOINT`, else
  fixture. UI shows a subtle "sample data" notice in fixture mode.
- MLS attribution block (search/listing/carousels): "Information provided by One Key MLS, and is
  deemed reliable but not guaranteed accurate." + data-last-updated + © year One Key MLS.

## lib/leads — CRM lead capture

`submitLead(lead: LeadPayload)`: `{ name, email, phone, message, interestReason, source, timestamp }`
(+ optional `address` for home-value). POSTs JSON to `CRM_LEAD_WEBHOOK` with
`Authorization: Bearer ${CRM_API_TOKEN}` when set. **Stub mode** (no webhook env): logs server-side,
appends to `.leads-dev.jsonl` (git-ignored), returns `{ ok: true, stub: true }`. All forms include
a honeypot field; submissions with it filled are dropped silently. Client → `/api/lead` → lib.
interestReason enum = the 6 options from brief §7.

## lib/mortgage — pure calculator

`calcMortgage({ price, annualTax, termYears, downPct, ratePct, monthlyHoa, monthlyInsurance })`
→ `{ monthlyTotal, principalInterest, monthlyTax, hoa, insurance, breakdownPct }`. Standard
amortization: `P&I = L·r/(1−(1+r)^−n)`, L = price·(1−downPct/100), r = rate/1200, n = years·12.
Unit-tested (vitest), zero-rate edge case handled. UI on /financing with Reset button.

## Design system

Tokens in `app/globals.css` via Tailwind v4 `@theme`: colors `ink #101820 · paper #FAFAF8 ·
mist #EDF0EF · stone #6E7681 · river #2B6CB0 · porchlight #E8B04B`; fonts via `next/font/google`:
Fraunces (display), Nunito (body/UI), Spline Sans Mono (prices/labels/eyebrows).
`components/ui/*` primitives (Button, Field, SectionHeading, Reveal, Stars, StatCounter),
`components/site/*` (Header + FairHousingBar, Footer + contact form, MobileMenu),
`components/idx/*` (ListingCard, ListingGrid, ListingCarousel, SearchFilters, MapView,
MlsAttribution, FavoriteButton), `components/valley-line/*` (signature SVG motif).
Motion: IntersectionObserver reveals, SVG stroke draw, hover lift; all gated on
`prefers-reduced-motion`. Accessibility floor: visible focus, landmarks, labeled fields, AA contrast.

## Content

`content/blog/*.mdx` (frontmatter: title, date, excerpt, cover). County copy lives in
`content/counties.ts` (typed). Testimonials in `content/testimonials.ts` (Giorgi Sokhadze,
Grace Nyambura, Mariam Kereselidze + Google reviews link).

## SEO

Per-page `metadata` export; schema.org: `RealEstateAgent` (site-wide, address/phone from brief §1),
`Residence`/`Offer` JSON-LD on listing pages, `BlogPosting` on posts; OG image (branded static);
`sitemap.ts` + `robots.ts`. Canonicals on county pages.

## Secrets / config (brief §4)

ALL keys read from env at runtime — never hardcoded, never client-side. Single `.env.example`
with labeled slots: `MLS_API_KEY`, `MLS_API_ENDPOINT`, `MLS_FEED_ID`, `CRM_LEAD_WEBHOOK`,
`CRM_API_TOKEN`, `NEXT_PUBLIC_SITE_URL`. `.env*` git-ignored (`.env.example` allowed).

## Testing

- vitest: lib/mortgage, lib/idx fixture (filters/sort/pagination), lib/leads payload+stub.
- Playwright (`scripts/` + tests): every page at 1280+390, screenshot evidence to `docs/verify/`,
  compared against `docs/reference/`; form flows, calculator, search interactions, console-error
  sweep. Feed-dependent e2e (live MLS, live webhook) marked `test.fixme` pending owner keys.

## Git

`main` = stable · `develop` = integration · `feat/*` = work branches. Small commits; CHECKPOINT.md
updated every cycle; secrets never committed.
