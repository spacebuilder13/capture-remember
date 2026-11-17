DROP POLICY IF EXISTS "Anonymous visitors can upload private memory photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can request one private memory" ON public.memory_contributions;
REVOKE INSERT ON public.memory_contributions FROM anon, authenticated;
GRANT ALL ON public.memory_contributions TO service_role;