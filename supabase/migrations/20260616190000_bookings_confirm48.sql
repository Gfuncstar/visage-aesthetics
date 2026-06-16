-- 48h "confirm or rearrange" reminder marker.
--
-- The reminder cron now sends two confirmations: a 48h one offering Confirm or
-- Rearrange, and a 24h one offering Confirm only (per the 24h change policy).
-- reminded_at already tracks the 24h send; this column tracks the 48h send so
-- each fires exactly once.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirm48_at timestamptz;
