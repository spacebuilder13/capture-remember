CREATE TABLE public.memory_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_path TEXT NOT NULL UNIQUE,
  happened TEXT,
  remembers TEXT,
  missing TEXT,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'prepared', 'delivered', 'failed')),
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.memory_contributions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.memory_contributions TO service_role;

ALTER TABLE public.memory_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request one private memory"
ON public.memory_contributions
FOR INSERT
TO anon
WITH CHECK (
  char_length(photo_path) BETWEEN 1 AND 240
  AND char_length(email) BETWEEN 3 AND 320
  AND status = 'requested'
);

CREATE POLICY "Anonymous visitors can upload private memory photos"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'memory-contributions'
  AND (storage.foldername(name))[1] = 'incoming'
  AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

CREATE INDEX memory_contributions_created_at_idx
ON public.memory_contributions (created_at DESC);