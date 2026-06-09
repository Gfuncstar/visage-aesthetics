-- Client appointment confirmations — apply via Supabase dashboard SQL editor or CLI.
--
-- The 24h "please confirm you're coming" email/SMS gives each client a one-click
-- link. When they tap it, we stamp confirmed_at. The staff landing page then
-- surfaces anyone booked in the next ~30h who was asked but hasn't confirmed,
-- so reception can chase them and cut no-shows.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
