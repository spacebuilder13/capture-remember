ALTER TABLE public.remember_stories ADD COLUMN IF NOT EXISTS preview_path text;
CREATE TABLE public.remember_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.remember_stories(id) ON DELETE CASCADE,
  path text NOT NULL,
  added_by text,
  role text NOT NULL CHECK (role IN ('family','owner')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.remember_photos TO service_role;
ALTER TABLE public.remember_photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX remember_photos_story_idx ON public.remember_photos(story_id);