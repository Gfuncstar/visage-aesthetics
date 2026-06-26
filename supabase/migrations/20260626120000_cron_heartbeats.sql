-- Cron heartbeat ledger: one row per scheduled Vercel cron agent.
-- Written by each cron via src/lib/assistant/heartbeat.ts (withHeartbeat), read
-- by the fleet overseer (.github/workflows/overseer-daily.yml) to alert when an
-- agent stops reporting. This is what lets the 15 Vercel crons be monitored the
-- same way the GitHub Actions already are.

create table if not exists public.cron_heartbeats (
  agent_name text primary key,
  last_run   timestamptz,
  last_ok    timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

comment on table public.cron_heartbeats is
  'Liveness heartbeat per scheduled Vercel cron agent. Written by each cron, read by the fleet overseer.';

-- Server-side only: the service-role key bypasses RLS, so enabling RLS with no
-- policies keeps these rows unreadable/unwritable from the public (anon) key.
alter table public.cron_heartbeats enable row level security;
