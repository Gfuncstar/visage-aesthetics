-- Consent form submissions — completed consent/intake forms clients fill in
-- online before their appointment, stored against the booking (and, where we
-- can resolve it by email, the client record).
--
-- Security model matches the rest of the clinic's special-category health data:
-- Row Level Security is ENABLED with NO policies, so the public anon/publishable
-- key can read nothing. All access is via the service-role key inside PIN-gated
-- server routes (src/lib/assistant/db.ts) and the token-gated public submit
-- route (src/app/api/book/consent/[token]/route.ts).
--
-- Run this once against the clinic Supabase project to switch on consent
-- storage. Until it is run, the consent feature degrades gracefully:
-- the staff view shows "no consent forms yet" and submissions return a clear
-- "not configured" error rather than crashing.

create table if not exists public.consent_submissions (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid,
  manage_token  uuid,
  client_id     uuid,
  client_name   text not null,
  client_email  text,
  service_name  text,
  service_slug  text,
  form_id       text not null,
  form_name     text not null,
  answers       jsonb not null default '{}'::jsonb,
  declaration   text not null,
  agreed        boolean not null default false,
  submitted_at  timestamptz not null default now()
);

create index if not exists consent_submissions_booking_idx on public.consent_submissions (booking_id);
create index if not exists consent_submissions_client_idx  on public.consent_submissions (client_id);
create index if not exists consent_submissions_time_idx    on public.consent_submissions (submitted_at desc);

-- Lock it down: RLS on, no policies (service-role bypasses RLS).
alter table public.consent_submissions enable row level security;
