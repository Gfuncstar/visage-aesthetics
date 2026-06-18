-- Backstop: never let two active bookings occupy the same time.
--
-- The public online route filters slots before booking, but the staff diary, the
-- AI assistant command path and the client self-reschedule (manage) route write
-- straight to `bookings`. The earlier duplicate guard only catches the SAME client
-- booked twice; two DIFFERENT clients could still land on one slot — which is
-- exactly what happened (an Ovatu-synced Botox and a hand-added anti-wrinkle
-- booking both at 12:00). This trigger rejects any write that would put a booking
-- on top of an existing active one, on every code path.
--
-- Fires on INSERT (new bookings) and on UPDATE *only when the time moves or a
-- cancelled booking is reactivated* — so routine status changes (completed /
-- no_show / cancelled) on an already-clashing row are still allowed, leaving
-- reception free to resolve a pre-existing clash by hand.
--
-- Ovatu-origin rows are exempt: they mirror an external diary that already allowed
-- the clash, and the sync runs in batches that must not fail on a single row.
-- Existing rows are left untouched (a trigger only fires on new writes), so this
-- is safe to add even while a clash already sits in the table.
create or replace function public.reject_overlapping_booking()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from 'cancelled'
     and coalesce(new.source, '') <> 'ovatu'
     and (
       tg_op = 'INSERT'
       or new.starts_at is distinct from old.starts_at
       or new.ends_at is distinct from old.ends_at
       or (old.status = 'cancelled' and new.status <> 'cancelled')
     )
     and exists (
       select 1 from public.bookings b
       where b.id <> new.id
         and b.status <> 'cancelled'
         and b.starts_at < new.ends_at
         and b.ends_at > new.starts_at
     ) then
    raise exception 'This time has just been taken.' using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reject_overlapping_booking on public.bookings;
create trigger trg_reject_overlapping_booking
before insert or update on public.bookings
for each row execute function public.reject_overlapping_booking();
