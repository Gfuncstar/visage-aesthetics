-- Multiple opening windows per weekday (split days, e.g. a daytime clinic plus
-- an evening session). The booking engine and the Opening Hours editor read and
-- write this table; the legacy single-window business_hours row is kept in sync
-- with each day's first window so existing diary views keep working.
CREATE TABLE IF NOT EXISTS public.opening_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  open_min INTEGER NOT NULL,
  close_min INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opening_windows ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS opening_windows_weekday_idx ON public.opening_windows (weekday);

-- Seed from the existing single-window hours (open days only), once.
INSERT INTO public.opening_windows (weekday, open_min, close_min)
SELECT weekday, open_min, close_min
FROM public.business_hours
WHERE is_open = true
  AND NOT EXISTS (SELECT 1 FROM public.opening_windows);
