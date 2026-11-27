ALTER TABLE public.remember_stories
  ADD COLUMN IF NOT EXISTS photo_age_days integer;

ALTER TABLE public.journal_waitlist
  ADD COLUMN IF NOT EXISTS source text;