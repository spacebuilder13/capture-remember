CREATE TABLE public.family_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grandparent_token text NOT NULL UNIQUE,
  child_token text NOT NULL UNIQUE,
  reply_token text NOT NULL UNIQUE,
  child_name text NOT NULL,
  age_band text NOT NULL,
  theme text NOT NULL,
  detail text,
  grandparent_label text NOT NULL DEFAULT 'Daadi',
  choice text,
  parent_response text,
  steps jsonb NOT NULL DEFAULT '{}'::jsonb,
  devices jsonb NOT NULL DEFAULT '{}'::jsonb,
  own_line_added boolean NOT NULL DEFAULT false,
  own_line_seconds numeric,
  return_sent boolean NOT NULL DEFAULT false,
  second_exchange boolean NOT NULL DEFAULT false,
  second_exchange_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.family_stories TO service_role;
ALTER TABLE public.family_stories ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.story_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES public.family_stories(id) ON DELETE CASCADE,
  kind text NOT NULL,
  path text NOT NULL,
  duration_seconds numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX story_recordings_story_idx ON public.story_recordings(story_id, kind, created_at DESC);
GRANT ALL ON public.story_recordings TO service_role;
ALTER TABLE public.story_recordings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.story_setup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name text NOT NULL,
  parent_whatsapp text NOT NULL,
  child_name text NOT NULL,
  child_age text NOT NULL,
  favourite_thing text NOT NULL,
  grandparent_label text NOT NULL,
  grandparent_whatsapp text NOT NULL,
  consented boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.story_setup_requests TO service_role;
ALTER TABLE public.story_setup_requests ENABLE ROW LEVEL SECURITY;