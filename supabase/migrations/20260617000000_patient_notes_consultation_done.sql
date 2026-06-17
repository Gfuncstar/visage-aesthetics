-- Add the "Consultation has been done" checkbox to the Patient Notes form copy.
-- Stored as text ('Yes'/'No') to match the other checkbox columns
-- (before_photos_taken, aftercare_provided). Optional — left null when unticked.
-- Apply via the Supabase dashboard SQL editor or CLI.
ALTER TABLE patient_notes ADD COLUMN IF NOT EXISTS consultation_done text;
