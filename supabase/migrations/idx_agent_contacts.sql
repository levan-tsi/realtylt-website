-- APPLIED 2026-10-30 by the orchestrator through the Supabase connector (version-controlled copy).
create table if not exists public.idx_agent_contacts (
  listing_id text primary key, -- = idx_listings.id
  agent_mls_id text,
  agent_name text,
  agent_email text,
  agent_phone text,
  agent_phones jsonb not null default '{}',
  office_mls_id text,
  office_name text,
  office_phone text,
  source text not null default 'mls_grid_property',
  seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.idx_agent_contacts enable row level security;
revoke all on public.idx_agent_contacts from anon;
grant select on public.idx_agent_contacts to authenticated;
create policy idx_agent_contacts_select_authenticated on public.idx_agent_contacts
  for select to authenticated using (true);
-- the service role (sync + backfill) bypasses RLS and writes.
comment on table public.idx_agent_contacts is 'Listing agent and office contacts per mirrored listing (MLS Grid Property record). Internal: for RealtyLT''s own offers and contact work (the LOI chain); never rendered on the website. Added 2026-10-30.';
