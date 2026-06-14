-- "Notes done" flag per booking — apply via Supabase dashboard SQL editor or CLI.
--
-- On the staff landing page, an appointment card turns charcoal once the client
-- has been. Bernadette writes up patient notes between clients and catches up at
-- the end of the day, so she needs to see at a glance who is already done. This
-- flag is set automatically when the Patient Notes form is submitted for a
-- client (matched by name and date), and the card then shows a tick.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes_done BOOLEAN NOT NULL DEFAULT false;
