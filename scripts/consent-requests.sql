-- Manually-sent consent forms — when staff send a consent form to a client
-- outside the booking system (for example because it was not completed at
-- booking). Each request is a tracked, unguessable link the client completes;
-- when they do, a row lands in consent_submissions and the request is marked
-- completed so it drops off the "outstanding" list.
--
-- Security model matches the rest of the clinic's special-category health data:
-- RLS ENABLED with NO policies (service-role only).
--
-- Run once against the visage-aesthetics-clinic Supabase project. Until it is
-- run, the "Send a form" card returns a clear error and the outstanding list is
-- empty (nothing crashes).

create table if not exists public.consent_requests (
  id            uuid primary key default gen_random_uuid(),
  token         uuid not null unique default gen_random_uuid(),
  form_id       text not null,
  form_name     text not null,
  client_name   text not null,
  client_email  text,
  booking_id    uuid,
  status        text not null default 'sent',   -- 'sent' | 'completed'
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

create index if not exists consent_requests_token_idx  on public.consent_requests (token);
create index if not exists consent_requests_status_idx on public.consent_requests (status);

alter table public.consent_requests enable row level security;

-- Link a submission back to the manually-sent request it came from.
alter table public.consent_submissions
  add column if not exists request_id uuid;

create index if not exists consent_submissions_request_idx on public.consent_submissions (request_id);
