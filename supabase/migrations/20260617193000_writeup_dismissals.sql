-- Durable record of write-up reminders the clinician has dismissed
-- ("written up another way"), so they stay gone across app launches and
-- devices instead of being re-derived every time the Assistant loads.
CREATE TABLE IF NOT EXISTS public.writeup_dismissals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_key TEXT NOT NULL UNIQUE, -- "{visit_date}|{lowercased trimmed name}"
  client_name TEXT,
  visit_date DATE,
  dismissed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.writeup_dismissals ENABLE ROW LEVEL SECURITY;
