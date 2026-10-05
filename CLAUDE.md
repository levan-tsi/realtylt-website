# realtylt-website — orientation for any Claude session or agent

RealtyLT marketing website (Next.js, TypeScript). Branch `main`; **a push to `main` is a PUBLIC
deploy of realtylt.com** (live and indexable since September 2026; the old "private noindex
preview" wording is stale). Look changes go to a preview branch first (`git push origin
HEAD:refs/heads/<name>-preview`, served behind the owner's Vercel sign-in) and reach `main` on
his word. Windows box; in git-bash run `export NODE_OPTIONS='--use-system-ca'` before any
node/npm (AVG MITM).

## Where things are
- `POLISH_CHECKPOINT.md` — round state; the TOP block is always the current brief. Read first.
- `docs/parity/` — PRELAUNCH-AUDIT.md (what is verified/open), DESIGN-ROUND*.md (design
  reasoning), PHOTO-BACKFILL-STATUS.md (the photo mirror's full history + ledgers).
- `docs/vendor/mlsgrid/` — the OFFICIAL MLS Grid docs, mirrored (39 pages + 4 PDFs).
  README.md there is the citation table. Any claim about MLS Grid cites a file there or a
  measured experiment — otherwise it is a hypothesis and must be labelled as one.
- `app/` routes · `components/` UI · `lib/idx/` the MLS data layer (db, media, sync,
  photo-mirror) · `scripts/` gates + runners (`inventory-health.mjs` = the photo gate;
  `backfill-photos.mjs` = the paced photo runner; `_scratch-*` are one-off probes).
- `public/images/` static art; `ATTRIBUTIONS.md` records photo licences.

## Standing rules (every one was earned the hard way)
- ONE dev server per repo: check `netstat -ano | grep -E ':300[0-9]|:3100'`; reuse :3100
  (:3000 is squatted by wslrelay). Never `next build` while one runs. Corrupt-cache errors
  (`clientReferenceManifest`, "Cannot find module './xxxx.js'"): kill next, `rm -rf .next
  node_modules/.cache`, start exactly one.
- SHARED repo: commit with explicit pathspecs (`git commit -- <files>`), NEVER `git add -A`
  or `add .`; check `git status` first — another session may have staged work.
- MLS Grid is rate-limit sensitive (suspension history): NEVER add a DATA-API or
  media.mlsgrid.com call to a page/request path. In Playwright probes BLOCK `**/api/media/**`
  unless a screenshot genuinely needs photos, and keep those runs small. Account caps
  (cited in docs/vendor/mlsgrid/): 2 RPS, 7,200 req/hr, 4 GB/hr, 40,000 req/rolling-24h —
  shared by the hourly sync and any backfill runner. ONE media runner ever; long runs at
  `--rps 1.7` in NIGHT windows with `--max-downloads` budgets.
- `**/api/lead` posts to the LIVE CRM — intercept it in any test that touches forms.
- Do not touch without a measured reason: next.config.ts CSP, security controls, RLS.
- Gates before "done": `npx tsc --noEmit` and `npm test` in the FOREGROUND (background
  runs lie). Test baseline only goes UP. Screenshot and LOOK at rendered results — "it
  compiles" is not verification. Drive 1440, 390, and 320 (overflow).
- Design rules: no gradient text/buttons, no purple primary, no neon cyan, no em dashes in
  visitor copy, no arrow-glyph CTAs. Radii scale: 8px badges/chips · 12px buttons/inputs ·
  16px cards/media · 24px large panels · rounded-full pills. Body ≥16px on mobile,
  controls floored at 16px (iOS zoom), tap targets ≥24px, focus-visible ≥3:1,
  reduced-motion clean, works with JS disabled.
- GOOGLE MAPS KEYS (split 2026-09-26, Google Cloud project `realtylt-crm`, console as
  levan@realtylt.com with `?authuser=levan@realtylt.com`): `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is
  the BROWSER key "RealtyLT browser key (websites only)" (ends `ZTwU`), locked to realtylt.com,
  www, app.realtylt.com, realtylt-website.vercel.app and local http://localhost / 127.0.0.1 on
  ports 3000, 3001, 3021, 3100, 3101, 3102, 3777; APIs: Maps JavaScript, Geocoding, Places (New).
  On Vercel it must be type **Config** (a Secret can never become Config: delete and re-add). A
  new local port needs adding to the key (Google rejects `localhost:*`). The website has NO
  server-side Google call. The CRM's server key is separate (`GOOGLE_MAPS_API_KEY`, see the CRM).
  Never paste a key into a doc, commit or chat; `.env.local` holds it locally (gitignored).
- THE SITE IS LIVE: realtylt.com, www and the vercel.app hosts alias the production deploy;
  no noindex, no PRELAUNCH gate. Before any push to `main`: tsc, vitest in the foreground, the
  crawler against the :3102 production build, the frames looked at; after it, verify on
  https://realtylt.com through a browser (plain fetches get Vercel's 429 challenge).
