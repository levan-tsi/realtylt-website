-- =====================================================================================
-- website_blog_posts — the marketing-site blog CMS table.
--
-- APPLIED to Supabase project wpfmhmnceflfruhssqqb on 2026-07-13 (migration version
-- 20260713154*, name `website_blog_posts`). This file is the version-controlled copy.
--
-- ADDITIVE ONLY. Creates public.blog_posts + a public 'blog-media' storage bucket for
-- cover images. Touches NO existing CRM table (leads/contacts/etc are untouched).
--
-- Producers: the CRM "Website" section (authenticated org users) writes rows here.
-- Consumers: realtylt.com reads PUBLISHED rows with the anon key (RLS-enforced).
-- Contract:  docs/BLOG-CMS.md
-- =====================================================================================

create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug            text not null,
  title           text not null,
  excerpt         text not null default '',
  body            text not null default '',            -- markdown (safe subset, see docs)
  cover_image_url text,                                -- site-relative "/images/..." or https URL
  author_name     text not null default 'Levan Tsiklauri',
  status          text not null default 'draft',       -- draft | published
  published_at    timestamptz,                         -- stamped automatically on first publish
  seo_title       text,
  seo_description text,
  created_by      uuid references auth.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- The slug IS the public URL (/blog/<slug>) → globally unique + URL-safe.
  constraint blog_posts_slug_key    unique (slug),
  constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) between 3 and 120),
  constraint blog_posts_status_chk  check (status in ('draft', 'published')),
  constraint blog_posts_title_len   check (length(title) between 1 and 200),
  constraint blog_posts_excerpt_len check (length(excerpt) <= 400),
  constraint blog_posts_body_len    check (length(body) <= 100000),
  constraint blog_posts_seo_t_len   check (seo_title is null or length(seo_title) <= 200),
  constraint blog_posts_seo_d_len   check (seo_description is null or length(seo_description) <= 400),
  -- Cover must be a site-relative path or an https URL (never javascript:/data:).
  constraint blog_posts_cover_url   check (
    cover_image_url is null
    or cover_image_url = ''
    or cover_image_url ~ '^/[^\s]*$'
    or cover_image_url ~ '^https://[A-Za-z0-9.-]+/[^\s]*$'
  ),
  -- A published post must actually be renderable.
  constraint blog_posts_publishable check (
    status <> 'published'
    or (length(btrim(title)) > 0 and length(btrim(body)) > 0)
  )
);

create index if not exists blog_posts_org_idx        on public.blog_posts (organization_id);
create index if not exists blog_posts_published_idx  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_created_by_idx on public.blog_posts (created_by);

-- Stamp org / published_at / updated_at server-side so the CRM cannot forget to.
create or replace function public.blog_posts_stamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.organization_id is null then
    new.organization_id := public.current_org_id();
  end if;
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists blog_posts_stamp_trg on public.blog_posts;
create trigger blog_posts_stamp_trg
  before insert or update on public.blog_posts
  for each row execute function public.blog_posts_stamp();

-- ── RLS ────────────────────────────────────────────────────────────────────────────
alter table public.blog_posts enable row level security;

-- The public website (anon key) may read ONLY published posts. Drafts are invisible.
drop policy if exists blog_posts_public_select on public.blog_posts;
create policy blog_posts_public_select on public.blog_posts
  for select to anon
  using (status = 'published');

-- CRM users: full CRUD inside their own organization (drafts included).
drop policy if exists blog_posts_org_all on public.blog_posts;
create policy blog_posts_org_all on public.blog_posts
  for all to authenticated
  using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

grant select                         on public.blog_posts to anon;
grant select, insert, update, delete on public.blog_posts to authenticated;
grant all                            on public.blog_posts to service_role;

-- ── Cover-image storage (public bucket the CRM uploads to) ──────────────────────────
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists blog_media_authenticated_insert on storage.objects;
create policy blog_media_authenticated_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'blog-media');

drop policy if exists blog_media_authenticated_update on storage.objects;
create policy blog_media_authenticated_update on storage.objects
  for update to authenticated using (bucket_id = 'blog-media') with check (bucket_id = 'blog-media');

drop policy if exists blog_media_authenticated_delete on storage.objects;
create policy blog_media_authenticated_delete on storage.objects
  for delete to authenticated using (bucket_id = 'blog-media');

comment on table public.blog_posts is
  'Marketing-site blog (realtylt.com/blog). Written by the CRM "Website" section; read by the website with the anon key (published only). Contract: docs/BLOG-CMS.md in realtylt-website.';
