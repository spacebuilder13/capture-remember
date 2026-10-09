CREATE TABLE public.journal_waitlist (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT INSERT ON public.journal_waitlist TO anon, authenticated;
GRANT ALL ON public.journal_waitlist TO service_role;
ALTER TABLE public.journal_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can join the journal waitlist" ON public.journal_waitlist FOR INSERT TO anon, authenticated WITH CHECK (char_length(email) BETWEEN 3 AND 320 AND email LIKE '%@%');