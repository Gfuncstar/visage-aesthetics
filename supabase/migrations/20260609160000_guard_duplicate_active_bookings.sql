-- Guard against duplicate active bookings during the Ovatu transition.
--
-- While Ovatu runs in parallel, an external ~15-minute sync brings Ovatu
-- appointments into `bookings`. It doesn't check for an existing booking, so it
-- can re-create one the client already made online — doubling the diary.
--
-- This trigger silently skips an INSERT that duplicates an active booking for
-- the same client at the same start time. Same name + same start in a
-- single-practitioner clinic is always the same appointment. Skipping (rather
-- than a hard unique constraint) is batch-safe: it drops only the twin, never
-- the rest of an import batch. Reschedules are UPDATEs, so they're unaffected.
--
-- Once Ovatu is fully phased out this can be dropped, but it's harmless to keep.
create or replace function public.skip_duplicate_active_booking()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from 'cancelled' and exists (
    select 1 from public.bookings b
    where b.status <> 'cancelled'
      and b.starts_at = new.starts_at
      and lower(btrim(b.client_name)) = lower(btrim(new.client_name))
  ) then
    return null; -- duplicate of an existing active booking — skip the insert
  end if;
  return new;
end;
$$;

drop trigger if exists trg_skip_duplicate_active_booking on public.bookings;
create trigger trg_skip_duplicate_active_booking
before insert on public.bookings
for each row execute function public.skip_duplicate_active_booking();
