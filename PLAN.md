# PLAN — RealtyLT Website Build

Backlog + build order. Spec: `docs/superpowers/specs/2026-07-10-realtylt-website-design.md`.
Reference: `docs/BRIEF.txt` + `docs/reference/` (live-site screenshots 1280/390 + inventories).
Status lives in `CHECKPOINT.md`. Every page is verified with Playwright at 1280 AND 390 against
its `docs/reference/<slug>-{1280,390}.png` counterpart: match the structure, improve the design —
never a pixel clone.

## Phase A — Plan + scaffold (main agent) — DONE when committed

- [x] Capture live site → docs/reference (15 pages × 2 widths + sitemap-live.json + page-inventory.json)
- [x] Reconcile brief vs live; flag gaps (Reviews missing live, Orange County 6th area, footer bugs)
- [x] Design spec (IA / design direction / tech architecture)
- [ ] Scaffold: Next.js 15 + TS + Tailwind v4, design tokens, fonts, Header/Footer/FairHousing shell,
      `.env.example`, lib interfaces (idx/leads/mortgage types), redirects, placeholder home
- [ ] Verify `next build` passes + dev renders shell; commit on `feat/scaffold`, merge → `develop`

## Phase B — Build (ONE Builder sub-agent, TDD, branch `feat/build`)

Order groups foundation → conversion pages → IDX → content. Within a group, pages are independent.

### B0. Foundation (blocks everything)
- [ ] Design-system components: Button, Input/Select/Textarea (+error/focus states), SectionHeading
      (eyebrow + Valley Line flourish), Reveal (scroll animation), Stars, StatCounter, Card
- [ ] ValleyLine SVG motif (divider + draw-on-scroll) — signature element
- [ ] Imagery: download license-safe photo set → /public/images + ATTRIBUTIONS.md
- [ ] lib/mortgage.ts (TDD: brief 5C math incl. $3,198.20-style worked example)
- [ ] lib/leads.ts (TDD: payload shape, webhook POST, stub fallback, honeypot) + /api/lead
- [ ] lib/idx FixtureIdxClient (TDD: ~60 OneKey-style listings, 6 counties, filters/sort/pagination,
      compliance fields) + MlsGridClient skeleton + factory
- [ ] Shared blocks: LeadForm (6-option interest dropdown), FooterContactForm, ListingCard
      ("Listed with …" + heart), ListingCarousel, MlsAttribution block, TestimonialCard

### B1. Conversion pages (highest value first)
- [ ] Selling — dual-path cash/list per brief §6 (strongest page; reference selling-1280.png)
- [ ] Home — hero "Let's Find Home" + search bar + 3 CTAs, home-value split section, Featured +
      New Listings carousels (IDX), testimonials, Why Work With Us, footer form
- [ ] Home Value — valuation lead form flow
- [ ] Connect — contact page + REACH OUT
- [ ] Financing — loan process sections + mortgage calculator UI (uses lib/mortgage)

### B2. IDX experience
- [ ] /search — filter bar (location, price, beds, baths, sqft, type), county chips (6), results
      grid + Leaflet map view w/ price pins, sort, pagination, save-search + favorites, attribution
- [ ] /listing/[id] — photos, description, features, agent contact CTA, schema.org
- [ ] /saved — favorites + saved searches (localStorage) + alert opt-in → lead webhook
- [ ] /top-areas hub — Valley Line river map, 6 county cards
- [ ] 6 county pages — hero + original localized copy + pre-filtered results + CTA

### B3. Content + trust pages
- [ ] Buying — per brief §6 (consultation CTA, process, alerts, favorites, offer/closing)
- [ ] Who We Are — bio layout w/ marked placeholder copy
- [ ] Reviews — NEW page: testimonial aggregation + Google reviews link
- [ ] Blog — MDX engine, index + [slug], seed 10 stubs from live titles (page-inventory.json)
- [ ] Legal: /privacy-policy, /dmca-terms; Fair Housing bar → NYS PDF

### B4. Site-wide
- [ ] SEO: metadata per page, schema.org RealEstateAgent, OG images, sitemap.ts, robots.ts
- [ ] Redirects from legacy slugs (/index, /top_areas, /homevalue, /home_value, /realestateagent/search)
- [ ] a11y pass (focus, landmarks, contrast, alt text) + reduced-motion
- [ ] Playwright verification: EVERY page at 1280+390 vs docs/reference counterpart; evidence saved
      to docs/verify/

## Phase C — QA (ONE QA sub-agent, branch `feat/qa`)

- [ ] Independent Playwright drive of every page + every flow (forms, calculator, search filters,
      favorites, save-search, mobile menu) at 1280 + 390; re-capture and diff vs docs/reference
- [ ] next build + full test suite green; console-error sweep on every route
- [ ] a11y + SEO audit (landmarks, labels, meta, schema validity)
- [ ] Fix everything found (red-before-fix where testable); list what couldn't be filled
- [ ] Main reconciles report, integrates → develop, updates CHECKPOINT.md

## Parallelization notes
B0 blocks B1–B3. Within B1/B2/B3 pages are independent (Builder may fan out per page if needed,
but one Builder owns Phase B). C starts only after B merges to develop.
