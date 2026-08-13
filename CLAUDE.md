# realtylt-website — orientation for any Claude session or agent

RealtyLT marketing website (Next.js, TypeScript). Branch `main`; a push auto-deploys the
PRIVATE, noindex production at realtylt-website.vercel.app. Windows box; in git-bash run
`export NODE_OPTIONS='--use-system-ca'` before any node/npm (AVG MITM).

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
- LAUNCH IS GATED: the site is noindex on purpose. The launch switches
  (NEXT_PUBLIC_SITE_URL, apex DNS, PRELAUNCH=1) are the OWNER'S, in that order. Never
  remove noindex.
