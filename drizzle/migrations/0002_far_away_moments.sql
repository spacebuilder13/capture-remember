CREATE TABLE public.moment_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL CHECK (char_length(session_id) BETWEEN 8 AND 64),
  photo_path text NOT NULL,
  note text NOT NULL CHECK (char_length(note) <= 600),
  rewritten text NOT NULL CHECK (char_length(rewritten) <= 1200),
  grandparent_name text CHECK (char_length(grandparent_name) <= 40),
  delivery text NOT NULL CHECK (delivery IN ('whatsapp','email','imessage')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.moment_shares TO service_role;
ALTER TABLE public.moment_shares ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.moment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL CHECK (char_length(session_id) BETWEEN 8 AND 64),
  event text NOT NULL CHECK (char_length(event) <= 40),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.moment_events TO service_role;
ALTER TABLE public.moment_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX moment_events_session_idx ON public.moment_events (session_id, created_at);