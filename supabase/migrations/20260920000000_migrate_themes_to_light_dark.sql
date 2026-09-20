-- Migration: Redesign themes to only 'light' and 'dark'
-- Safely drop old check constraint and normalize existing records to 'light' or 'dark'

DO $$
BEGIN
  -- Drop existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'experiences_theme_check' 
    AND conrelid = 'public.experiences'::regclass
  ) THEN
    ALTER TABLE public.experiences DROP CONSTRAINT experiences_theme_check;
  END IF;

  -- Migrate any legacy theme values to 'light' (or 'dark' if night/starry)
  UPDATE public.experiences 
  SET theme = 'dark' 
  WHERE theme IN ('lavender-night', 'starry-romance');

  UPDATE public.experiences 
  SET theme = 'light' 
  WHERE theme NOT IN ('light', 'dark');

  -- Update default value to 'light'
  ALTER TABLE public.experiences ALTER COLUMN theme SET DEFAULT 'light';

  -- Add updated check constraint allowing only 'light' and 'dark'
  ALTER TABLE public.experiences ADD CONSTRAINT experiences_theme_check CHECK (theme IN ('light', 'dark'));
END $$;
