-- portal_reports — client-facing CMA + market reports surface (owner spec §5b).
-- Applied to Supabase project wpfmhmnceflfruhssqqb (migration `portal_reports`).
--
-- Website-owned (prefix portal_). Two producers:
--   • website client (source='client') — self-serve CMA / market runs computed from the
--     committed MLS snapshot; editable + recalculated by the client;
--   • CRM agent (source='agent') — when an agent PUBLISHES a CMA (public.cma_reports) or a
--     market report to a client, the CRM mirrors a snapshot row here via the SERVICE ROLE
--     (client_id resolved from portal_clients.contact_id). Portal clients cannot read
--     public.cma_reports directly (its public-read policy targets the anon role only), so
--     portal_reports is the single client-facing surface.
-- RLS: a client touches ONLY their own rows; the CRM service role bypasses RLS for agent writes.
create table if not exists public.portal_reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('cma','market')),
  source text not null default 'client' check (source in ('client','agent')),
  status text not null default 'ready' check (status in ('draft','ready','shared')),
  title text not null,
  subject jsonb not null default '{}'::jsonb,   -- subject property (cma) or area (market)
  criteria jsonb not null default '{}'::jsonb,  -- client inputs / recalculation adjustments
  stats jsonb not null default '{}'::jsonb,     -- computed metrics + comp snapshots
  suggested_price_low numeric,
  suggested_price_high numeric,
  agent_note text,
  cma_report_id uuid,                           -- link back to public.cma_reports when source='agent'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portal_reports enable row level security;

create policy portal_reports_rw on public.portal_reports
  for all using (client_id = auth.uid()) with check (client_id = auth.uid());

create index if not exists portal_reports_client_idx
  on public.portal_reports (client_id, created_at desc);

create trigger portal_reports_set_updated_at
  before update on public.portal_reports
  for each row execute function public.set_updated_at();
