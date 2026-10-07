CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('voice','text','notebook')),
  transcript text NOT NULL CHECK (char_length(transcript) BETWEEN 1 AND 8000),
  media_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own entries select" ON public.journal_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own entries insert" ON public.journal_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own entries delete" ON public.journal_entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.journal_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_path text NOT NULL,
  ai_caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_photos TO authenticated;
GRANT ALL ON public.journal_photos TO service_role;
ALTER TABLE public.journal_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own photos select" ON public.journal_photos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own photos insert" ON public.journal_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own photos update" ON public.journal_photos FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own photos delete" ON public.journal_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.memory_surfacings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  themes jsonb NOT NULL DEFAULT '[]'::jsonb,
  photo_id uuid REFERENCES public.journal_photos(id) ON DELETE SET NULL,
  reason text,
  feedback text CHECK (feedback IN ('feels_right','not_quite')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.memory_surfacings TO authenticated;
GRANT ALL ON public.memory_surfacings TO service_role;
ALTER TABLE public.memory_surfacings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own surfacings select" ON public.memory_surfacings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own surfacings insert" ON public.memory_surfacings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own surfacings update" ON public.memory_surfacings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "journal media own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'journal-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "journal media own insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'journal-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "journal media own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'journal-media' AND (storage.foldername(name))[1] = auth.uid()::text);