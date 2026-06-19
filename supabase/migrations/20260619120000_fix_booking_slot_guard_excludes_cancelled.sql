-- Fix: new bookings rejected with "This time has just been taken." for a slot
-- the diary shows as free (reported by Bernadette for 2 Jul, 11:00).
--
-- Symptom: reception shows 11:00 as free, but "Add to diary" returns
--   Database error (409): {"code":"23505", ... ,"message":"This time has just been taken."}
--
-- Root cause: a slot-guard trigger on public.bookings raises unique_violation
-- (Postgres 23505, surfaced by PostgREST as HTTP 409) when another booking
-- shares the same starts_at -- but it does NOT exclude cancelled bookings. A
-- lingering *cancelled* booking (an Ovatu "un-cancel" ghost) therefore blocks a
-- brand-new booking at a slot the availability engine correctly reports as free:
-- busyFromBookings() in src/lib/booking-engine/availability.ts ignores rows with
-- status = 'cancelled', so a cancelled row never makes a slot look busy, yet the
-- guard still counted it. The slot looks free and is rejected at the same time.
--
-- This guard was added directly to the database during the Ovatu transition; it
-- is not in any committed migration, which is why the live schema and the repo
-- had diverged. This migration brings it under version control and corrects it.
--
-- Fix: remove any slot-guard trigger that raises that message (whatever its
-- name), and reinstall a corrected guard that ignores cancelled rows -- so it
-- agrees with the app's own definition of a busy slot. Cancelled records are
-- left untouched; once the guard ignores them, they no longer block re-use of
-- the slot.

-- 1. Drop any existing slot-guard trigger(s) that raise the message. Only the
--    trigger is dropped; the underlying function is left in place (harmless if
--    orphaned, and avoids touching anything that might be shared).
do $$
declare
  t record;
begin
  for t in
    select tg.tgname
    from pg_trigger tg
    join pg_proc p on p.oid = tg.tgfoid
    where tg.tgrelid = 'public.bookings'::regclass
      and not tg.tgisinternal
      and pg_get_functiondef(p.oid) ilike '%this time has just been taken%'
  loop
    execute format('drop trigger if exists %I on public.bookings', t.tgname);
  end loop;
end$$;

-- 2. Corrected guard: reject a new booking only when an existing NON-cancelled
--    booking already holds the exact same start time. A cancelled existing row
--    never blocks; a cancelled new row is never blocked. This mirrors the
--    status logic of skip_duplicate_active_booking (migration 20260609160000),
--    but raises -- so reception sees a clear clash -- rather than silently
--    skipping the insert.
create or replace function public.guard_booking_slot_taken()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from 'cancelled' and exists (
    select 1 from public.bookings b
    where b.id <> new.id
      and b.status <> 'cancelled'
      and b.starts_at = new.starts_at
  ) then
    raise exception 'This time has just been taken.'
      using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_booking_slot_taken on public.bookings;
create trigger trg_guard_booking_slot_taken
before insert on public.bookings
for each row execute function public.guard_booking_slot_taken();
