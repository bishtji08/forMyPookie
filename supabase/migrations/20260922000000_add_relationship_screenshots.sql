-- One webpage snapshot per relationship.
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS screenshot_taken boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS screenshot_path text,
  ADD COLUMN IF NOT EXISTS screenshot_url text,
  ADD COLUMN IF NOT EXISTS captured_at timestamptz,
  ADD COLUMN IF NOT EXISTS screenshot_width integer,
  ADD COLUMN IF NOT EXISTS screenshot_height integer;

CREATE UNIQUE INDEX IF NOT EXISTS experiences_screenshot_path_unique
  ON public.experiences (screenshot_path)
  WHERE screenshot_path IS NOT NULL;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('relationship-screenshots', 'relationship-screenshots', false, 10485760, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;