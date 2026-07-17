-- Photo mirroring (docs/mls-fix/PHOTO-MIRRORING.md): the public bucket the sync mirrors listing
-- photos into. MLS Grid MediaURLs are signed and expire ~1h after capture, so their bytes are
-- copied here (deterministic path <ListingId>/<idx>.jpg) and the /api/media route serves them
-- from the permanent public object.
--
-- Applied to project wpfmhmnceflfruhssqqb on 2026-07-17. Idempotent — safe to re-run.
--
-- NO extra storage RLS policies are required:
--   * READS are public — a `public` bucket serves /storage/v1/object/public/<bucket>/<path>
--     without any key or SELECT policy, which is exactly what the media route redirects to.
--   * WRITES use the SERVICE-ROLE key (sync cron + backfill), which BYPASSES RLS entirely.
--     No anon/authenticated write policy exists, so the bucket is not publicly writable.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mls-photos',
  'mls-photos',
  true,
  15728640, -- 15 MB per photo (MLS "highest resolution" images are well under this)
  array['image/jpeg','image/png','image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
