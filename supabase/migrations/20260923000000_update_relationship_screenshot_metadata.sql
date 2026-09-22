-- Keep the latest screenshot for each relationship and record its full-page dimensions.
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS screenshot_width integer,
  ADD COLUMN IF NOT EXISTS screenshot_height integer;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('relationship-screenshots', 'relationship-screenshots', false, 10485760, ARRAY['image/jpeg', 'image/png'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 10485760;