# CHECKPOINT — RealtyLT Website

## ⚠️ OWNER KEYS STILL NEEDED (the one external blocker — everything else proceeds)

Paste into the secrets store (`.env`, from `.env.example`) when ready:

1. `MLS_API_KEY` — MLS/IDX API key (OneKey MLS via MLS Grid; TEST key first, swap PRODUCTION at launch)
2. `MLS_API_ENDPOINT` — MLS Grid feed base URL
3. `MLS_FEED_ID` — board/feed identifier (live site uses mlsId=280)
4. `CRM_LEAD_WEBHOOK` — app.realtylt.com lead-intake endpoint
5. `CRM_API_TOKEN` — CRM auth token (if required)

Until supplied: IDX runs on the realistic fixture mock (60 listings, 6 counties, "sample data"
notice shown); lead forms run in stub mode (logged to `.leads-dev.jsonl`, not delivered). Also
pending from owner (non-blocking): Who-We-Are final bio + portrait, real blog articles (Drive),
real social URLs, Google reviews URL confirmation (placeholder is a Maps search link in
`content/testimonials.ts`).

## Deployment — LIVE (private pre-launch), 2026-07-10, branch `feat/deploy`

**The rebuild is deployed as its own Vercel project — the old Brivity realtylt.com is untouched.**

- **Live URL (stable alias): https://realtylt-website.vercel.app** — deployment READY,
  project `realtylt-website` (team levans-projects-a543d940, prj_0envsZqHojmxmbjnVCqqeXhUFQIl).
- **NOINDEXED (pre-launch)**: `PRELAUNCH=1` env → robots.txt `Disallow: /` (app/robots.ts) +
  `X-Robots-Tag: noindex, nofollow` on every route (next.config headers()). Verified live.
- **Env vars set** (all of production/preview/development, via CLI):
  `PRELAUNCH=1`, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`,
  `CRM_LEAD_WEBHOOK=https://wpfmhmnceflfruhssqqb.supabase.co/functions/v1/website-lead` (leads LIVE),
  `NEXT_PUBLIC_SITE_URL=https://realtylt-website.vercel.app`.
- **Leads are LIVE**: /api/lead forwards valid submissions to the Supabase edge fn → CRM leads
  table. Verified to the boundary WITHOUT inserting rows: honeypot POST → 200 silent drop
  (before webhook), invalid → 400, malformed → 400; webhook itself answers (OPTIONS 204/GET 405).
  A genuine submit is Levan's test to run.
- **/ai is wired via REWRITE (not redirect)** — the marketing site proxies the separate
  `realtylt-ai-page` project (stable alias https://realtylt-ai-page.vercel.app) at /ai.
  Its assets are RELATIVE and resolve to the root from the /ai document, so the root
  namespaces `styles.css`, `src/*`, `assets/*`, `vendor/*` are proxied too (afterFiles —
  real routes/public files always win; **don't create site routes/files under those names**).
  Verified in a real browser: galaxy hero renders through the proxy, WebGL boots, no errors.
  Footer "RealtyLT AI" link → /ai works (MPA navigation through the rewrite).
- **QA of the DEPLOYED site** (docs/qa-deploy/ + report.json): all 24 routes at 1280+390 —
  zero console errors (only the intentional /404 log), no failed requests, no horizontal
  scroll at 390, one h1/page, valid JSON-LD, unique titles, images load. Flow suites green
  (favorites/save-search/calculator/mobile menu/a11y; lead flows against a LOCAL stub server —
  never the live webhook). CRM preview (read-only check) loads: crm-preview-{1280,390}.png
  (behind Vercel deployment protection; used a temporary share link to verify it renders).
- **Fixes this pass**: stale honeypot field in scripts/qa-flows2.mjs (`website`→`rlt_hp`);
  site-wide self-canonical (`alternates: "./"` in app/layout.tsx); footer link to /ai.
  38/38 tests, build green (100 pages) throughout.
- **To flip PUBLIC at launch**: remove `PRELAUNCH` from Vercel env (all envs), set
  `NEXT_PUBLIC_SITE_URL=https://realtylt.com`, point the realtylt.com domain at the
  `realtylt-website` project, redeploy. Consider adding /ai to sitemap at that point.
  robots.txt + headers flip automatically; canonicals follow NEXT_PUBLIC_SITE_URL.

## Security hardening — branch `feat/security`, 2026-07-10 (DEPLOYED + verified live)

Red-team + hardening of the marketing site, its `/api/lead` route, and the `website-lead`
edge fn logic. CRM + AI page untouched (read-only neighbors). No rows inserted into the prod
`leads` table — only reject paths exercised. 47/47 tests, build green, deployed to prod and
re-verified against https://realtylt-website.vercel.app.

### Fixed (in code, verified)
- **Security headers + CSP (was: none).** `next.config.ts headers()` now emits — on EVERY
  route, always — `Content-Security-Policy`, `Strict-Transport-Security`,
  `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`,
  `X-DNS-Prefetch-Control` (pre-launch still adds `X-Robots-Tag: noindex`). ONE CSP for the
  whole site + the proxied /ai (duplicate CSP headers enforce as an intersection → would break
  /ai). **Important: on Vercel the CSP DOES apply to the external-rewrite `/ai`** (it does NOT
  under local `next start`) — so the policy must stay WebGL-compatible: `script-src` keeps
  `'unsafe-inline'` (Next static hydration) + `'unsafe-eval'`/`'wasm-unsafe-eval'`/`blob:` and
  `worker-src blob:` for the Three.js app. Strict where it counts: `frame-ancestors 'none'`,
  `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `img-src`/`connect-src`
  allowlists (OSM tiles + `*.mlsgrid.com`). **Verified LIVE: 0 CSP violations** on home,
  /search (Leaflet map 16/16 tiles), /financing, /listing, /blog, /who-we-are, /connect, and
  /ai (2 WebGL canvases). Evidence: `docs/security/csp-report.json` + `csp-*.png`.
- **Latent stored-XSS in JSON-LD** (listing/blog/layout): `JSON.stringify` doesn't escape `<`,
  so a live-feed listing field with `</script>` would break out and execute. New
  `lib/jsonld.ts` escapes `<>&`+U+2028/9; 3 tests. Latent today (fixture data trusted) — fixed
  before the MLS feed connects.
- **`/api/lead`**: enforce `application/json` content-type (415) + 16 KB body cap (413) before
  parse; generic errors, no input echo. 6 route tests. Verified LIVE: 405/415/413/400/200-drop.
- **next/image**: pinned `dangerouslyAllowSVG:false` + `contentDispositionType:attachment`.

### Checked CLEAN
- No secrets in the client bundle (`grep .next/static` for webhook/tokens/keys → none); all
  secrets server-only; only `NEXT_PUBLIC_SITE_URL` is public; no client source maps. Git: only
  `.env.example` tracked (`.env*`, `.vercel`, `.env.local` OIDC token all ignored).
- No reflected XSS on /search (`q`/filters go through React text nodes only). MLS Grid
  `$filter` uses server-owned constants + `encodeURIComponent` (no user text in the query).
- `/ai` rewrite is NOT an open proxy — host/scheme are fixed; `/ai/https://x` → 308 to a
  same-origin normalized path, never off-site.

### Staged, NOT deployed (needs Levan's approval)
- `supabase/functions/website-lead/` — version-controlled copy of the live edge fn
  (reconstructed from probed reject-path behavior) + proposed hardening (explicit origin
  allowlist, best-effort per-IP rate limit, optional `WEBSITE_LEAD_SECRET` shared-secret,
  field caps). Redeploy = `supabase functions deploy website-lead` — do NOT run without review
  (see its README). Reject-path probe of the live fn: OPTIONS 204, GET 405, bad-json 400,
  honeypot 200-drop, missing-contact 422.

### Residual recommendations
- **Vercel WAF / Firewall rate rules on `/api/lead`** (serverless in-memory limiting doesn't
  hold across instances) — the real rate-limit answer.
- `npm audit`: 2 moderate via `next`'s NESTED `postcss` (`</style>` stringify XSS, build-time
  only on our own CSS). Left AS-IS — the only `audit fix --force` remedy downgrades Next to v9.
  Resolves when Next bumps its dep.
- Nonce-based strict CSP (drop `unsafe-inline`/`unsafe-eval`) only viable if the site leaves
  static generation AND /ai is excluded from the policy.

## Status — updated 2026-07-10 (ALL PHASES COMPLETE — deploy-ready pending owner keys)

Phases A+B+C merged to `develop` and marked stable on `main` (local; not pushed).
34/34 tests, `next build` green (100 static pages). The site runs fully on fixture/stub mode
today; supplying the keys above flips IDX + lead delivery live with zero code changes.

| Phase | State |
|---|---|
| A — understand/plan/scaffold | ✅ DONE (merged to develop) |
| B — Builder (whole site) | ✅ DONE on `feat/build` — all pages built + verified; tests green; build green |
| C — QA | ✅ DONE on `feat/qa` (2026-07-10) — independent re-verification of everything; 2 real bugs found + fixed; 34/34 tests, build green |

### Phase B — everything built (per PLAN.md)

**B0 foundation** ✅
- `lib/mortgage.ts` (TDD, 6 tests — reproduces live worked example $3,198.20)
- `lib/leads` (TDD, 10 tests — parseLead validation, honeypot `website` field, webhook POST w/
  bearer, stub fallback to `.leads-dev.jsonl`) + `/api/lead` (spam→silent ok, invalid→400)
- `lib/idx` (TDD, 17 tests) — `FixtureIdxClient` (60 OneKey-shaped listings, real towns + per-county
  price bands, filters/sort/pagination, compliance fields), `MlsGridClient` skeleton (replication
  model: allowed-field `$filter`, `@odata.nextLink` paging, local filtering, PENDING keys),
  `getIdxClient()` env factory + `isFixtureMode()`
- UI kit: Button/Input/Select/Textarea (dark+light, error states), SectionHeading, Reveal,
  Stars, StatCounter, TestimonialCard; ValleyLine motif (divider + underline, draw-on-scroll)
- LeadForm (single component, all variants: dark/compact/withAddress/defaultReason; honeypot;
  loading/success/error states) — in footer on EVERY page
- IDX components: ListingCard ("Listed with …", heart), ListingCarousel, MlsAttribution (always
  near IDX content; fixture-mode sample notice), FavoriteButton, MapView (Leaflet/OSM price pins)
- `lib/saved.ts` — localStorage favorites + saved searches + `rlt:saved-change` event → header badge
- Imagery: 29 CC0/CC-BY photos via Openverse (hero ×2, 6 counties, 3 lifestyle, 18 houses) →
  `public/images` + `ATTRIBUTIONS.md`; all visually reviewed via contact sheet (3 rounds of
  replacements for wrong subjects); scripts: fetch-images/fix-images/contact-sheet

**B1 conversion pages** ✅ Home (hero search→/search, home-value split+form, Featured/New
carousels + attribution, county chips, testimonials, why-us + stat counters), Selling (full dual-path
per brief §6 + reference: 60-sec form card, trust row, path 01/02 cards, no-pressure banner,
3 Google reviews, 5/5/5 comp board, listing shine, 92% marketing, stay-in-loop timeline),
Home Value (hero+form, 3-step how-it-works), Connect (contact block, form, 3× 30-min meeting
cards), Financing (pre-approval letter card, LIVE calculator defaulting to $3,198.20 with
% breakdown + Reset, lender-connect form, application/closing cards)

**B2 IDX experience** ✅ /search (location/price/beds/baths/sqft/type filters, 6 county chips
(Orange first, like live), grid + map split view (Leaflet price pins, popups), sort, numbered
pagination, save-search, URL-synced state, loading skeletons/empty/error states, attribution),
/listing/[id] (gallery, facts, features, sticky ask-form, RealEstateListing JSON-LD, breadcrumbs,
63 SSG pages), /saved (favorites via API hydration, saved searches run/remove, email-alert opt-in
→ lead), /top-areas (the VALLEY LINE: interactive Hudson SVG map, 6 counties true geographic
order S→N, hover-lit markers, county cards), 6 county pages (original localized copy in
`content/counties.ts` — market/lifestyle/commute/why-buy/towns, pre-filtered listings + CTA)

**B3 content/trust** ✅ Buying (4-step process per reference), Who We Are (bio layout, copy +
photo CLEARLY marked placeholder), Reviews (NEW page: 5.0 hero, testimonial cards, Google links,
leave-a-review CTA), Blog (10 stubs seeded from live titles in `content/blog/posts.ts`, index
featured+grid, [slug] pages with draft-stub notice + BlogPosting JSON-LD), /privacy-policy +
/dmca-terms (real usable text incl. DMCA agent block + fair housing)

**B4 site-wide** ✅ per-page metadata, RealEstateAgent JSON-LD in layout, branded OG image
(public/og.png via scripts/make-og.mjs), sitemap.ts (listings only in fixture mode) + robots.ts,
skip-link, focus-visible ring, landmarks/labels everywhere, prefers-reduced-motion kills
reveal/draw/zoom, branded 404, legacy redirects already in next.config.ts

### Verification evidence (docs/verify/)
- Every page shot at 1280+390 (`scripts/shot.mjs` — now scrolls first so reveal-on-scroll content
  is visible; MSYS gotcha: prefix `MSYS_NO_PATHCONV=1` when passing /paths on Git Bash)
- Console-error sweep clean on all routes (only the intentional /404 logs a 404)
- Flows driven in real browser: heart→badge→/saved, save-search→/saved, alert opt-in submit
  (`scripts/verify-saved-flow.mjs`), mobile menu + calculator recompute/reset
  (`scripts/verify-calc-menu.mjs`), lead API valid/honeypot/invalid via HTTP
- `npm test` 33/33 green · `npm run build` green (34 static routes + 63 listing SSG)

### Known gaps / for QA (Phase C)
- ~~OSM tiles render grey in headless screenshots~~ — RESOLVED by QA: timing artifact, tiles load 16/16 (see Phase C below)
- MlsGridClient is typed + built but UNTESTED against a live feed (needs owner keys) — feed-dependent
- Email listing alerts: opt-in captured as lead; actual alert sending needs live feed + CRM wiring
- Live-site Brivity footer socials intentionally omitted; mailto fixed vs live's broken one
- lifestyle/buying.jpg is B&W (used with sepia treatment on /buying hero) — swap if owner prefers

## Phase C — QA (branch `feat/qa`, 2026-07-10, independent QA agent)

Re-verified EVERYTHING against docs/BRIEF.txt, docs/reference/ screenshots and
docs/reference/page-inventory.json. Trusted nothing from Phase B; all Builder claims re-tested.

### Bugs found → FIXED (committed on feat/qa)
1. **Home carousels repeated listings** (orchestrator suspect confirmed): Featured and New rails
   both led with H6400001 (24 Verplanck Ave) and also shared H6402523. Red test first
   (`fixture.test.ts` overlap test), then: `FixtureIdxClient.getNew` excludes featured;
   `MlsGridClient.getNew` skips past the freshest actives its `getFeatured` surfaces so rails stay
   distinct in live-feed mode too. Verified in browser: rails now fully disjoint.
2. **WCAG AA contrast**: `stone #6e7681` = 4.40:1 on paper (muted body text/labels site-wide);
   `porchlight-deep #c98f2b` = 2.70:1 on white (sample-data notice, kickers, save-search button,
   primary-button hover). Tokens darkened → `#646c77` / `#8a5f10`; every light surface (white,
   paper, mist) now ≥4.5:1. Dark surfaces unaffected (they use `text-paper/*` / `text-porchlight`).

### Builder claims re-verified TRUE (evidence: docs/qa/ + scripts/qa-*.mjs, all green)
- **"OSM tiles grey in headless" is NOT a real bug** — timing artifact. Tiles return HTTP 200 in
  headless Chromium and paint after ~3–5 s; qa-search-flows asserts 16/16 tiles loaded, 12 price
  pins correctly placed over Hudson Valley towns, OSM attribution shown. No code change needed.
- All 23 pages captured at 1280+390 (docs/qa/), compared side-by-side vs docs/reference/: every
  live-site section/CTA/form present (page-inventory.json crossed off), mobile clean, zero console
  errors (only the intentional /404 resource log).
- Flows (scripts/qa-search-flows.mjs — 26 checks; scripts/qa-flows2.mjs — 32 checks; ALL PASS):
  filters (location/price/beds/baths/sqft/type) filter fixture results correctly (also verified at
  the API layer), county chips ↔ URL sync both directions, sort asc/desc, pagination (page 2 ≠
  page 1, URL sync, aria-current), grid/map toggle, heart → header badge (1)→(2) → /saved →
  persists across reload → unheart removes; save-search label on /saved; alert opt-in → lead in
  `.leads-dev.jsonl`; mobile menu (all links + Top Areas counties) ; calculator $3,198.20 default,
  recompute on price/rate, Reset restores; footer lead POST → stub line with source page +
  interest reason + timestamp; honeypot → 200 silent + NOT written; invalid email → inline error +
  NOT written; direct invalid API POST → 400.
- Redirects all 308: /index→/, /top_areas→/top-areas, /homevalue + /home_value→/home-value,
  /realestateagent/search→/who-we-are.
- SEO: unique title+description on all 22 routes; RealEstateAgent JSON-LD site-wide +
  RealEstateListing + BlogPosting parse as valid JSON; sitemap.xml (92 urls) + robots.txt serve;
  OG tags + real 1200×630 og.png; canonical on all 6 county pages.
- a11y (scripts/qa-a11y-scan.mjs CLEAN on all 22 pages): every img has alt, every control
  labelled, exactly one h1/page, header/nav/main/footer landmarks, skip link first-Tab + visible,
  Top Areas dropdown fully keyboard-operable, focus ring on nav, reduced-motion shows all content
  without scroll, honeypot aria-hidden + off-screen + tabIndex −1; footer interest-reason dropdown
  = the exact 6 options from brief §7.
- MLS compliance: One Key attribution + data-last-updated + © near ALL IDX content (search — also
  after client render, county pages, home carousels, listing detail); "Listed with <office>" on
  every card; sample-data notice everywhere in fixture mode.
- Secrets hygiene: `.env`/`.env.*`/`.leads-dev.jsonl` git-ignored and untracked; `.env.example`
  carries the 5 labelled owner slots (brief §4); Fair Housing bar links to the NYS DOS PDF.
- Crawl (scripts/qa-crawl.mjs, ALL PASS): all 132 internal links resolve <400; zero horizontal
  overflow at 390 on all 22 pages; each county page shows only in-county listings; search empty
  state + "Clear all filters" restores results; listing JSON-LD content matches the listing.
- `npm test` 34/34 green (was 33 — QA added the rails-overlap test) · `npm run build` green.

### QA: could not fill (external constraints — do not fake)
- **Live MLS feed** (MlsGridClient end-to-end) and **CRM webhook delivery** — need owner keys
  (see top of this file). Stub/fixture paths are fully exercised.
- **Analytics** (brief §9 launch line): nothing wired — needs owner's tool choice + property ID;
  privacy policy already written to accommodate ("If we add analytics…"). One-liner to add later.
- **Who-We-Are bio/portrait, real blog articles, social URLs, Google-reviews URL** — owner
  content; placeholders are clearly marked on-page by design.
- **Email listing alerts**: opt-in is captured as a lead; actual sending needs live feed + CRM.

## Hardening pass (code review) — branch `feat/hardening`, 2026-07-10

Applied verified findings from a full code review. 38/38 tests, `npm run build` green
(100 pages), all key pages re-screenshotted at 1280+390 (docs/verify/) — layout unchanged.

### Critical (deploy blockers on Vercel)
- **Stub leads on read-only FS**: `submitLead` stub mode wrote `.leads-dev.jsonl` uncaught —
  EROFS on Vercel broke the "never throws" contract. Now: full lead JSON is ALWAYS
  `console.log`ged server-side (function logs are the record), file append is try/caught,
  still returns `{ ok: true, stub: true }`. New vitest covers the read-only-FS path.
- **/api/lead** wrapped in try/catch — unexpected errors return JSON 502, never a non-JSON 500
  (client always calls `res.json()`).
- **next/image remote host**: `images.remotePatterns` allows `**.mlsgrid.com` — live photos are
  external URLs; CONFIRM the real feed's media host when MLS keys arrive.
- **No-photo fallback**: `ListingCard` + listing detail render a branded `NoPhoto` mist block
  when a live feed row has no Media — `undefined` never reaches next/image.

### High (production correctness)
- `getIdxClient()` = lazy module-level singleton per mode — MlsGridClient's 15-min replication
  cache now actually persists (was: full feed re-replication per request).
- listing/[id]: lookup wrapped in React `cache()` (generateMetadata + page = one fetch);
  `generateStaticParams` returns `[]` outside fixture mode; `revalidate = 3600`.
- mls-grid: `getNew()` = newest excluding `getFeatured()`'s ids (real semantics); `mapProperty`
  DROPS non-Residential/Residential-Income rows (Land/Commercial/Lease no longer mislabeled) —
  filtered locally since PropertyType stays out of the `$filter`.
- MapView excludes lat/lng 0 listings from pins and FitBounds (no Null Island).
- /api/idx/search clamps page + pageSize to ≥1 (pageSize=0 → totalPages Infinity→null);
  paging constants shared from `lib/idx/types`; route-level test added.
- **Honeypot renamed `website` → `rlt_hp`** (client + server): Chrome address autofill fills
  "website" fields for REAL visitors, silently dropping their leads. Regression test added.
- SearchClient re-syncs filters from the URL on searchParams change (header link / Back).
- /saved: fixtureMode passed from the server page; 404'd favorites surfaced with a
  "no longer available — remove them" action (new `removeFavorite()`); loaded count shown.
- lib/saved validates localStorage shape on read (resets on mismatch).
- `revalidate = 3600` on home, county pages, listing pages, sitemap; `SITE.url` strips
  trailing slashes from `NEXT_PUBLIC_SITE_URL`.

### Cleanups
- `SITE.phoneE164` added; all hardcoded phone strings now use SITE constants.
- JSON-LD `areaServed` + mls-grid county lookup + county display names derived from `COUNTIES`.
- Shared `fmtM` (lib/format.ts) + blog `fmtDate` (content/blog/posts); dead
  `saveSearch(alertOptIn)` param + unused lib/idx barrel re-exports removed.
- Home hero submit + /saved empty-state CTA use `components/ui/Button`.
- ValleyMap takes slim `{slug, short, medianPrice, map}` props — county prose out of the bundle.
- Oversized public images re-encoded in place (scripts/compress-images.mjs, sharp installed →
  removed): 8 files >400KB → ~6.5MB saved; ulster.jpg 3.1MB→91KB, visually verified.

### Skipped (noted future cleanups — deliberate)
Unifying the three IntersectionObserver patterns; unifying saved-subscription boilerplate into
`useSyncExternalStore`; batching SavedClient's per-favorite fetches; county chip ordering.

### Vercel deploy notes
- Set `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` in the Vercel env (playwright is a devDependency;
  don't download browsers at install).
- Leave `NEXT_PUBLIC_SITE_URL` unset, or set it to exactly `https://realtylt.com`.
- **Set `CRM_LEAD_WEBHOOK` before real traffic** — stub-mode leads only live in function logs.

## Decisions log (why)

- 6 county pages incl. Orange — live search proves Orange is serviced; static pages + localized copy for SEO (brief §8)
- Sign In → "Saved" (localStorage favorites/saved-searches + alert opt-in lead) — no user backend; honest > fake login
- Leaflet/OSM map — no API key, works in mock mode, removes an owner blocker
- Fixture IDX = OneKey-shaped data incl. compliance fields; attribution block always rendered
- Fonts: Fraunces display + Nunito body (brief) + Spline Sans Mono data; accent `porchlight #E8B04B`
- Manual scaffold (no create-next-app) — non-empty repo
- Blog = typed TS content collection (`content/blog/posts.ts`), not MDX — zero deps, PLAN allowed
  "MDX or simple content collection"; swap-in of owner articles is a copy-paste per post
- Imagery via Openverse API (Unsplash napi is bot-blocked) — CC0/CC-BY only, attribution recorded
- Calculator defaults = live site's exact worked example (500k/20%/6%/30y/6k tax/100 HOA/200 ins → $3,198.20)
- County chip order on /search mirrors live (Orange first); Valley Line map order is geographic
- Sitemap excludes listing URLs when the live feed is connected (rotating inventory)

## Next steps (successor / Phase C QA)
1. Merge `feat/build` → `develop` (main agent reconciles)
2. QA per PLAN.md Phase C: drive every flow (forms incl. footer form on every page, calculator,
   filters, favorites, save-search, mobile menu) at 1280+390; diff vs docs/reference; a11y + SEO audit
3. When owner keys arrive: fill `.env`, exercise MlsGridClient against test feed, confirm leads
   land in CRM, re-enable listing alerts story
