-- Make in-app cancellations stick, so the external Ovatu sync can't revive them.
--
-- The problem: an external ~15-minute job upserts Ovatu appointments into
-- `bookings`, keyed on `external_ref` (the Ovatu appointment id). It is
-- upsert-only — it has no concept of a cancellation. So when the front desk
-- cancels a booking here (status -> 'cancelled'), the next sync overwrites the
-- status straight back to 'confirmed', and the "cancelled" appointment
-- reappears in the diary. (Seen in the wild: one booking re-cancelled five
-- times over two days, and duplicate live rows for the same client + slot.)
--
-- The fix is a flag the app owns and the sync doesn't know about:
--   * `cancel_locked` is set true whenever a booking is cancelled from inside
--     this app (front desk, manage-link, or the assistant command).
--   * A BEFORE UPDATE trigger re-asserts 'cancelled' on any attempt to move a
--     locked-cancelled booking back to an active status WITHOUT also clearing
--     the lock. The external sync never touches `cancel_locked`, so it can never
--     clear it — its revival is silently undone.
--   * The app's own "Undo" deliberately clears the lock (status set to the
--     restored value with cancel_locked = false), so a real restore still works.
--
-- This does NOT cover the mirror-image case (a booking cancelled *in Ovatu*
-- that never reaches the app, because a cancelled appointment simply drops out
-- of the iCal feed). That requires the external sync to push cancellations /
-- reconcile disappearances, which lives outside this repo.

alter table public.bookings
  add column if not exists cancel_locked boolean not null default false;

-- Protect cancellations that already exist: lock every currently-cancelled
-- booking so the next sync can't revive any of them. A genuine restore from the
-- app clears the lock as it goes.
update public.bookings set cancel_locked = true where status = 'cancelled';

-- Keep a locked cancellation cancelled. The app clears cancel_locked when it
-- deliberately restores a booking; the external sync, ignorant of the column,
-- leaves it set, so its attempt to flip the status back is reverted here.
create or replace function public.keep_cancelled_locked()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'cancelled'
     and old.cancel_locked
     and new.status is distinct from 'cancelled'
     and new.cancel_locked then
    new.status := 'cancelled';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_keep_cancelled_locked on public.bookings;
create trigger trg_keep_cancelled_locked
before update on public.bookings
for each row execute function public.keep_cancelled_locked();

-- Also stop the sync re-inserting a *fresh* active row for a slot the desk has
-- cancelled. The original duplicate guard only skipped an insert while an
-- ACTIVE twin existed — once a booking was cancelled the guard fell away and a
-- new active duplicate could be inserted. Treat a locked-cancelled twin the
-- same as an active one: same client + same start in a single-chair clinic is
-- always the same appointment.
create or replace function public.skip_duplicate_active_booking()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from 'cancelled' and exists (
    select 1 from public.bookings b
    where b.starts_at = new.starts_at
      and lower(btrim(b.client_name)) = lower(btrim(new.client_name))
      and (b.status <> 'cancelled' or b.cancel_locked)
  ) then
    return null; -- duplicate of an existing active or locked-cancelled booking
  end if;
  return new;
end;
$$;
