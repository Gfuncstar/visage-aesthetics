-- Ovatu CSV exports carry the client's email and phone, but the appointments
-- import had nowhere to put them, so they were silently dropped on import.
-- Give the reporting table somewhere to keep them so a future import never
-- throws the contact details away again.
alter table appointments add column if not exists email text;
alter table appointments add column if not exists phone text;
