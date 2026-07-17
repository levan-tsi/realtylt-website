// Idempotent creator for the mls-photos storage bucket (docs/mls-fix/PHOTO-MIRRORING.md).
//
// The bucket already exists on wpfmhmnceflfruhssqqb (created via SQL — see
// supabase/migrations/mls_photos_bucket.sql). This script is the reproducible @supabase/supabase-js
// equivalent for a fresh project / re-provision. Public read; writes are service-role only.
//
// Usage: node scripts/create-photo-bucket.mjs
// Needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local (owner-provided).

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = readFileSync(".env.local", "utf8");
const grab = (k) => (env.match(new RegExp(`^${k}=(.*)$`, "m"))?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const url = grab("SUPABASE_URL");
const serviceKey = grab("SUPABASE_SERVICE_ROLE_KEY");
if (!url || !serviceKey) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = "mls-photos";
const config = {
  public: true,
  fileSizeLimit: 15 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
};

const { data: existing } = await supabase.storage.getBucket(BUCKET);
if (existing) {
  const { error } = await supabase.storage.updateBucket(BUCKET, config);
  if (error) throw error;
  console.log(`bucket "${BUCKET}" already existed — config ensured (public, 15MB, image mime types).`);
} else {
  const { error } = await supabase.storage.createBucket(BUCKET, config);
  if (error) throw error;
  console.log(`bucket "${BUCKET}" created (public read, 15MB limit, image mime types).`);
}
