ALTER TABLE public.remember_stories ADD COLUMN owner_token text UNIQUE;
CREATE TABLE public.remember_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.remember_stories(id) ON DELETE CASCADE,
  name text,
  memory text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.remember_replies TO service_role;
ALTER TABLE public.remember_replies ENABLE ROW LEVEL SECURITY;