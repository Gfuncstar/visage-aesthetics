-- A readable copy of each Patient Notes form submission — apply via the
-- Supabase dashboard SQL editor or CLI.
--
-- The Patient Notes form pushes to the Google notes sheet one-way, so the app
-- could never show a saved note back. This table keeps a copy the app can read,
-- so tapping a done "Notes" tick on a landing-page card can show what was
-- written (and let staff add more). Special-category health data: RLS is on
-- with NO policies, so only the service-role key (server-side) can touch it.
CREATE TABLE IF NOT EXISTS patient_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL DEFAULT '',
  name_normalised text NOT NULL DEFAULT '',
  date date,
  treatment text,
  specific_area text,
  product_used text,
  lot_no_exp text,
  dosage text,
  before_photos_taken text,
  problems_noted text,
  aftercare_provided text,
  additional_notes text,
  emergency_contact_provided text,
  date_signed date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS patient_notes_lookup_idx ON patient_notes (name_normalised, date);
