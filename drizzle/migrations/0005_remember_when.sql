CREATE TABLE public.remember_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  spark text NOT NULL,
  story text NOT NULL,
  mode text NOT NULL,
  length_chars int NOT NULL DEFAULT 0,
  email text,
  source text,
  nominated_by text,
  link_opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.remember_stories TO service_role;
ALTER TABLE public.remember_stories ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.remember_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.remember_stories(id) ON DELETE CASCADE,
  answer text NOT NULL,
  who text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.remember_followups TO service_role;
ALTER TABLE public.remember_followups ENABLE ROW LEVEL SECURITY;