# Photo mirroring — permanent listing photos in Supabase Storage

## The problem (why the old proxy is dead)

MLS Grid MediaURLs are **signed and expire ~1h after they are fetched.** A stored URL looks like:

```
https://media.mlsgrid.com/token=<sig>&expires=1784146828&id=<...>/images/<KEY>/<uuid>.jpeg
```

Proven 2026-07-15: an expired URL returns **400**, and stripping the signature returns **403**. There
is **no permanent URL form.** So the previous design — store the MediaURL in `idx_listings` and have
`/api/media` proxy it per view — cannot work: within an hour of every hourly sync, every stored URL
is dead and every listing shows the "Photo coming soon" placeholder.

> This overturns `docs/mls-fix/RESEARCH.md`, which asserted MediaURLs are "permanent" and quoted an
> MLS Grid doc line to that effect. The live data disagrees (the `expires=` param is right there in
> every URL), so this design treats the URLs as ephemeral and mirrors the **bytes**, which is robust
> either way.

## The fix

Copy each photo's **bytes** into our own Supabase Storage bucket **at sync time, while the signed URL
is still valid**, and serve the permanent bucket object thereafter.

```
MLS feed (signed URLs, ~1h TTL)
      │  hourly sync / backfill (download WHILE FRESH, User-Agent: <OAuth token>)
      ▼
Supabase Storage  bucket "mls-photos"  object  <ListingId>/<idx>.jpg   (public, never expires)
      ▲
      │  /api/media/<id>/<idx>  redirects here (302) for the first `photosMirrored` photos
      ▼
browser  (loads the permanent bucket object, zero MLS contact)
```

### Components

| Piece | File | Role |
|---|---|---|
| Storage helpers | `lib/idx/storage.ts` | bucket name, deterministic path, public URL, service-role upload (raw Storage REST) |
| Mirroring engine | `lib/idx/photo-mirror.ts` | covers-first + contiguous-prefix + 429 backoff + budgets; all I/O injected (unit-tested) |
| DB read/write | `lib/idx/db.ts` | `getDbListingMedia` (photos + mirrored count), `getMirrorState` (resume state) |
| Media resolver | `lib/idx/media.ts` | `getListingMedia(id) → { photos, mirrored }` (DB first, snapshot fallback) |
| Media route | `app/api/media/[id]/[idx]/route.ts` | **storage-first**: redirect mirrored photos to the bucket, else legacy proxy |
| Sync cron | `app/api/cron/idx-sync/route.ts` | mirrors each changed listing's photos inline during the hourly delta |
| Backfill | `scripts/backfill-photos.mjs` | one-time bulk pass, resumable, bounded, `--dry-run` |
| Bucket | `supabase/migrations/mls_photos_bucket.sql`, `scripts/create-photo-bucket.mjs` | public bucket provisioning |

### Object path & idempotency

`mls-photos/<ListingId>/<idx>.jpg` — deterministic, so a re-mirror **overwrites in place** (upsert).
`idx` is the display order (0 = cover). Cap is 50 photos/listing (matches `MAX_PHOTOS`).

### DB shape — no schema change

The mirror state lives **inside the existing `listing` jsonb** (flows through the unchanged
`idx_sync_apply` RPC — no `ALTER`, no RPC change):

- `listing.photosMirrored` — count of **leading** photos confirmed in storage. The media route serves
  index `n` from storage **iff `n < photosMirrored`**, so the count is kept **contiguous** by
  construction.
- `listing.photosMirroredTs` — the `modificationTimestamp` that mirror was built for. A newer value
  means the photo set may have changed, so the listing is re-mirrored from index 0.

### Media route (storage-first, no regression)

1. Read `{ photos, mirrored }` from the DB (zero MLS DATA-API calls, same guard as before).
2. If `n < mirrored` → **302 to the public bucket object**, `X-Media-Status: storage`, long SWR cache.
   Works in prod **and** local dev (public read needs no key), and outlives the source URL.
3. Else fall back to the existing behavior: local-dev bounce to the deployed proxy, or (prod) proxy the
   just-synced source URL behind the CDN cache, or the branded self-healing placeholder.

`MlsImage`'s retry/self-heal and the local-dev 302-to-deployed-CDN trick are untouched.

## Pacing & per-invocation bounds

**MLS safety is paramount** (the account has been suspended before, and hits intermittent 429 windows).

- **DATA API**: this feature adds **zero** new DATA-API call sites. The sync still fetches the feed the
  same way (`≤ MAX_PAGES` paced pages, `> watermark`); the backfill drives the existing deployed
  `/api/cron/sync-mls` endpoint (which owns all `< 2 req/sec` pacing). Media downloads hit
  `media.mlsgrid.com` (a **separate budget** from the DATA API) and never go through the DATA guard.
- **Media downloads**: small worker pool (`MIRROR_CONCURRENCY`, default **4**), exponential backoff on
  429 (`500ms·2^n`, capped 8s, 3 retries), permanent skip on 403/404. Each photo is downloaded **at
  most once** (already-mirrored prefixes are skipped) unless its listing changed.
- **Per-invocation bound (serverless)**: the hourly cron mirrors at most `MIRROR_PHOTO_BUDGET`
  (default **600**) photos and stops at a **270s wall clock** (under the 300s `maxDuration`, leaving
  room for the DB writes). A burst bigger than the budget does **not** advance the watermark, so the
  next tick re-fetches the same window (fresh URLs) and continues from each listing's mirrored prefix.
  This is the "skip-and-catch-up" queue: the watermark itself is the queue cursor.

### Env config (all optional, sane defaults)

| Var | Default | Meaning |
|---|---|---|
| `MIRROR_PHOTO_CAP` | 50 | max photos mirrored per listing (set to 1 for covers-only) |
| `MIRROR_PHOTO_BUDGET` | 600 | max photos mirrored per cron invocation |
| `MIRROR_CONCURRENCY` | 4 | concurrent media downloads |

## Hardening / edge cases

- **429 / timeout mid-listing** → partial mirror; `fully:false` holds the watermark; next sync
  re-fetches fresh URLs and finishes the contiguous prefix. Nothing is lost.
- **Upload failure** → that index is not counted; the contiguous prefix stops there and self-heals next run.
- **Photo set changes** → detected via `photosMirroredTs != modificationTimestamp` → re-mirror from 0
  (overwrites the deterministic paths). A shortened set leaves higher-index orphans that the route never
  serves (`n < photosMirrored`).
- **Storage disabled (no service-role key)** → mirroring is a **safe no-op**: the cron logs nothing new,
  `fully` stays true, the watermark advances normally, and the media route keeps proxying. Data sync is
  entirely unaffected. The feature activates the moment the key is configured.
- **Memory** → the pool holds only `concurrency` photos in flight (~4 × ~300KB); bytes are discarded
  after upload. A 50-photo listing never materializes fully in memory.
- **Request path** → the media route makes **zero** MLS calls and (for mirrored photos) zero DB byte
  transfer — it 302s to the CDN-backed bucket. Asserted by the route unit tests + the "never calls the
  DATA API" test.
- **Orphan cleanup (sold/removed listings)** → **not enabled.** Deactivated listings keep their storage
  objects (harmless; RLS hides the rows so the route never serves them). A future sweep could delete
  `mls-photos/<id>/*` for ids absent from the active set. Storage is cheap relative to the risk of
  deleting a re-listed property's photos, so this is left manual/documented.

## Write path & the service-role key

Storage byte-writes require elevated auth. The app stack deliberately holds **no service-role key**
(data writes go through the secret-gated `idx_sync_apply` RPC). Storage has no SQL-only equivalent, so
the mirroring write path uses **`SUPABASE_SERVICE_ROLE_KEY`** (server-only: the cron + the backfill).
Reads never need it (public bucket).

**This key is currently absent** from `.env.local` and Vercel. It must be provisioned (owner):

- **Vercel** (Production, server-side) — enables sync-time mirroring in the hourly cron.
- **`.env.local`** (local) — enables the backfill script.

Until then, mirroring is dormant (safe no-op, above).

## Storage sizing (gated on the Supabase Pro upgrade)

12,392 active listings, 12,381 with photos, avg 23.4 / max 50, **289,424 photos total** (measured
2026-07-17). At ~150KB/photo:

| Scope | Photos | Approx size |
|---|---|---|
| Covers only (1/listing) | ~12.4k | **~1.8 GB** |
| First 12 / listing | ~150k | **~22 GB** |
| All (≤50/listing) | ~289k | **~40 GB** |

The Supabase **free tier is 1 GB** — even covers-only exceeds it. The backfill is therefore **gated on
the Pro upgrade** (Pro includes 100 GB). Do **not** run the full backfill before the upgrade.

## Backfill runbook

Prerequisites: `SUPABASE_SERVICE_ROLE_KEY` + `MLS_API_KEY` in `.env.local` (refresh with
`npx vercel env pull .env.local`), Supabase **Pro** active, bucket created.

```bash
export NODE_OPTIONS='--use-system-ca'   # AVG MITM breaks TLS otherwise (Windows)

# 0) Ensure the bucket exists (idempotent).
node scripts/create-photo-bucket.mjs

# 1) DRY-RUN a bounded slice — fetches fresh feed pages, plans, no downloads/uploads/DB writes.
node scripts/backfill-photos.mjs --dry-run --max-pages 2 --max-listings 50

# 2) COVERS-FIRST pass (every card gets a cover cheaply — ~1.8GB).  Resumable: re-run to continue.
node scripts/backfill-photos.mjs --covers-only --max-pages 999 --max-listings 999999

# 3) FULL galleries (all photos, ~40GB). Resumable.
node scripts/backfill-photos.mjs --max-pages 999 --max-listings 999999

# Resume is automatic (scripts/.photo-backfill-watermark.local). Start over with --fresh.
```

Bounds default to the **safe verify slice** (2 pages / 50 listings); the full run passes large bounds
explicitly. The script paces media downloads (concurrency 4, 429 backoff) and drives the deployed
sync-mls endpoint for `< 2 req/sec` DATA pacing.

## Verification (this branch)

- `lib/idx/photo-mirror.test.ts` — 24 tests: covers-first, contiguous prefix, resume/skip, change
  detection, 429 backoff, budget bound, upload failure, no-op.
- `app/api/media/[id]/[idx]/route.test.ts` — storage-first 302, `X-Media-Status: storage`, persistence
  past source-URL expiry, beyond-prefix fallback.
- Live (`scripts/_scratch-verify-mirror.mjs`, not committed) — against the running dev server: the media
  route 302s a mirrored index to the exact public bucket object with the storage header + SWR cache, and
  a beyond-prefix index falls back. The **byte upload + serve** leg is skipped without the service-role
  key (it is that key's whole purpose); run it with the key set to go fully green.
- `scripts/backfill-photos.mjs --dry-run` — proven against 2 real feed pages, including watermark resume.

## What remains gated on the owner / Pro

1. Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (prod) + `.env.local` (backfill).
2. Upgrade Supabase to Pro (storage quota).
3. Run the backfill (covers-first, then full) per the runbook.
4. (Optional) enable an orphan-cleanup sweep for sold/removed listings.
