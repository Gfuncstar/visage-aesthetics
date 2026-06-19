-- Add a staff-only 15-minute "Review" appointment type.
--
-- Reviews are short follow-ups the clinic books for an existing client (e.g. a
-- two-week check after a treatment). They must NOT be self-bookable on the
-- public site, so online_bookable is false: listBookableServices() (the public
-- /api/book/services list) filters on online_bookable = true and omits it,
-- while the staff diary/reception pickers read the full active list from
-- /api/staff/assistant/services and so include it.
--
-- 15 minutes, no buffer, free — it slots into the gaps between treatments that
-- a full-length appointment can't fit. The overlap guard
-- (trg_reject_overlapping_booking) allows a 15-min booking that ends exactly
-- when the next appointment starts, so e.g. an 11:00–11:15 review fits cleanly
-- before an 11:15 booking.
--
-- Idempotent: only inserts when the slug isn't already present, so re-running
-- is safe and it never disturbs the existing catalogue.
insert into public.services
  (slug, name, category, duration_min, buffer_min, price_from, deposit, online_bookable, active, display_order)
select 'review', 'Review', 'Review', 15, 0, 0, 0, false, true, 1
where not exists (select 1 from public.services where slug = 'review');
