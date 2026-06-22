-- Close the Ovatu overbooking hole.
--
-- The previous reject_overlapping_booking() exempted every source = 'ovatu'
-- write from the overlap check, so the external Ovatu sync could silently drop a
-- booking on top of a website/staff booking — the cause of the daily
-- booking-check clashes (different clients in one single-practitioner slot).
--
-- This replaces the blanket exemption with two rules:
--
--   * Native (online/staff) bookings may NOT overlap anything active. As before,
--     this RAISES so the booker sees "this time has just been taken".
--   * Ovatu-imported bookings may NOT overlap a NON-Ovatu (website/staff)
--     booking. To stay batch-safe (the importer inserts many rows at once and a
--     raised exception would abort the whole batch), the clashing Ovatu row is
--     SKIPPED rather than erroring. The skipped appointment still surfaces in the
--     daily integrity check's "uncovered" list for a human to place by hand.
--   * Two Ovatu rows may still co-exist, so importing a pre-existing Ovatu diary
--     (which may legitimately carry its own overlaps) is never broken.
--
-- Note: a BEFORE trigger only evaluates rows as they are written; it cannot
-- reach back and clear clashes that already exist. Pre-existing overlaps must be
-- resolved by hand in the diary.
create or replace function public.reject_overlapping_booking()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from 'cancelled'
     and (
       tg_op = 'INSERT'
       or new.starts_at is distinct from old.starts_at
       or new.ends_at is distinct from old.ends_at
       or (old.status = 'cancelled' and new.status <> 'cancelled')
     ) then

    if coalesce(new.source, '') = 'ovatu' then
      -- Ovatu import: never sit on top of a website/staff booking. Skip (not
      -- raise) so a bulk import batch is not aborted by one clashing row.
      if exists (
        select 1 from public.bookings b
        where b.id <> new.id
          and b.status <> 'cancelled'
          and b.starts_at < new.ends_at
          and b.ends_at > new.starts_at
          and coalesce(b.source, '') <> 'ovatu'
      ) then
        return null;
      end if;
    else
      -- Native booking: hard-reject any overlap so the booker sees the error.
      if exists (
        select 1 from public.bookings b
        where b.id <> new.id
          and b.status <> 'cancelled'
          and b.starts_at < new.ends_at
          and b.ends_at > new.starts_at
      ) then
        raise exception 'This time has just been taken.' using errcode = 'unique_violation';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reject_overlapping_booking on public.bookings;
create trigger trg_reject_overlapping_booking
before insert or update on public.bookings
for each row execute function public.reject_overlapping_booking();
