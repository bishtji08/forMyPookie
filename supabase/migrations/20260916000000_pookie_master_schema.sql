-- ============================================================
-- FOR MY POOKIE (❤️) - COMPLETE MASTER DATABASE SCHEMA
-- Run this entire script in Supabase SQL Editor.
-- It is completely idempotent (safe to re-run).
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant schema usage to API roles (fixes "permission denied for schema public")
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, service_role;

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'sender' CHECK (role IN ('admin', 'sender', 'receiver')),
  profile_image text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================================
-- 2. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- Fast, non-recursive admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  );
$$;

-- Permissions for is_admin()
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
GRANT EXECUTE ON FUNCTION public.update_updated_at() TO authenticated;

-- Automatic profile creation on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, profile_image)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'User'), '@', 1)
    ),
    -- Security fix: never allow self-granting 'admin' via raw_user_meta_data
    CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('sender', 'receiver')
        THEN NEW.raw_user_meta_data->>'role'
      ELSE 'sender'
    END,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE public.profiles.name END,
    -- Keep role intact on conflict unless current profile has no role
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    profile_image = COALESCE(EXCLUDED.profile_image, public.profiles.profile_image),
    updated_at = now();

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Trigger to prevent privilege escalation (role/status tampering by non-admin)
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If not an admin, forbid changing role or status
  IF NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.protect_profile_fields() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.protect_profile_fields() FROM anon;
GRANT EXECUTE ON FUNCTION public.protect_profile_fields() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_protect_profile_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- ============================================================
-- 3. PROFILES RLS
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "profiles_select_anon" ON public.profiles;
CREATE POLICY "profiles_select_anon"
ON public.profiles
FOR SELECT
TO anon
USING (status = 'active');

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id OR public.is_admin());

-- ============================================================
-- 4. EXPERIENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secure_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  receiver_name text NOT NULL DEFAULT '',
  receiver_nickname text NOT NULL DEFAULT '',
  sender_name text NOT NULL DEFAULT '',
  relationship text NOT NULL DEFAULT '',
  apology_message text NOT NULL DEFAULT '',
  love_letter text NOT NULL DEFAULT '',
  final_letter text NOT NULL DEFAULT '',
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  music_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'expired')),
  is_opened boolean NOT NULL DEFAULT false,
  opened_at timestamptz,
  last_accessed_at timestamptz,
  response_status text CHECK (response_status IN ('yes', 'maybe', 'no')),
  date_options text[] NOT NULL DEFAULT '{"coffee","dinner","movie","walk","drive","surprise"}',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiences_sender_id ON public.experiences(sender_id);
CREATE INDEX IF NOT EXISTS idx_experiences_secure_token ON public.experiences(secure_token);
CREATE INDEX IF NOT EXISTS idx_experiences_receiver_id ON public.experiences(receiver_id);
CREATE INDEX IF NOT EXISTS idx_experiences_status ON public.experiences(status);

DROP TRIGGER IF EXISTS trg_experiences_updated_at ON public.experiences;
CREATE TRIGGER trg_experiences_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exp_select_authenticated" ON public.experiences;
DROP POLICY IF EXISTS "exp_select_own_or_receiver_or_admin" ON public.experiences;
CREATE POLICY "exp_select_authenticated"
ON public.experiences
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = receiver_id
  OR status = 'active'
  OR public.is_admin()
);

-- Public / Anonymous can read active experiences via secure token
DROP POLICY IF EXISTS "exp_select_anon" ON public.experiences;
DROP POLICY IF EXISTS "exp_select_anon_by_token" ON public.experiences;
CREATE POLICY "exp_select_anon"
ON public.experiences
FOR SELECT
TO anon
USING (status = 'active');

DROP POLICY IF EXISTS "exp_insert_own" ON public.experiences;
CREATE POLICY "exp_insert_own"
ON public.experiences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "exp_update_own" ON public.experiences;
CREATE POLICY "exp_update_own"
ON public.experiences
FOR UPDATE
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = receiver_id
  OR (status = 'active' AND (receiver_id IS NULL OR receiver_id = auth.uid()))
  OR public.is_admin()
)
WITH CHECK (
  auth.uid() = sender_id
  OR auth.uid() = receiver_id
  OR (status = 'active' AND (receiver_id IS NULL OR receiver_id = auth.uid()))
  OR public.is_admin()
);

DROP POLICY IF EXISTS "exp_update_anon" ON public.experiences;
DROP POLICY IF EXISTS "exp_update_anon_open" ON public.experiences;
CREATE POLICY "exp_update_anon"
ON public.experiences
FOR UPDATE
TO anon
USING (status = 'active')
WITH CHECK (status = 'active');

DROP POLICY IF EXISTS "exp_delete_own" ON public.experiences;
CREATE POLICY "exp_delete_own"
ON public.experiences
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id OR public.is_admin());

-- ============================================================
-- 5. MEMORIES TABLE (Polaroid Timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  date text,
  location text,
  media_url text,
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'random',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_memories_experience_id ON public.memories(experience_id);

DROP TRIGGER IF EXISTS trg_memories_updated_at ON public.memories;
CREATE TRIGGER trg_memories_updated_at
  BEFORE UPDATE ON public.memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mem_select_authenticated" ON public.memories;
DROP POLICY IF EXISTS "mem_select_participants" ON public.memories;
CREATE POLICY "mem_select_authenticated"
ON public.memories
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = memories.experience_id
      AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR e.status = 'active')
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "mem_select_anon" ON public.memories;
CREATE POLICY "mem_select_anon"
ON public.memories
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = memories.experience_id AND e.status = 'active'
  )
);

DROP POLICY IF EXISTS "mem_insert_sender" ON public.memories;
CREATE POLICY "mem_insert_sender"
ON public.memories
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = memories.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "mem_update_sender" ON public.memories;
CREATE POLICY "mem_update_sender"
ON public.memories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = memories.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "mem_delete_sender" ON public.memories;
CREATE POLICY "mem_delete_sender"
ON public.memories
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = memories.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

-- ============================================================
-- 6. FUNNY MOMENTS (Inside Jokes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.funny_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  date text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funny_experience_id ON public.funny_moments(experience_id);

ALTER TABLE public.funny_moments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "funny_select_authenticated" ON public.funny_moments;
DROP POLICY IF EXISTS "funny_select_participants" ON public.funny_moments;
CREATE POLICY "funny_select_authenticated"
ON public.funny_moments
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = funny_moments.experience_id
      AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR e.status = 'active')
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "funny_select_anon" ON public.funny_moments;
CREATE POLICY "funny_select_anon"
ON public.funny_moments
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = funny_moments.experience_id AND e.status = 'active'
  )
);

DROP POLICY IF EXISTS "funny_insert_sender" ON public.funny_moments;
CREATE POLICY "funny_insert_sender"
ON public.funny_moments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = funny_moments.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "funny_update_sender" ON public.funny_moments;
CREATE POLICY "funny_update_sender"
ON public.funny_moments
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = funny_moments.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "funny_delete_sender" ON public.funny_moments;
CREATE POLICY "funny_delete_sender"
ON public.funny_moments
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = funny_moments.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

-- ============================================================
-- 7. LOVE REASONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.love_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_love_experience_id ON public.love_reasons(experience_id);

ALTER TABLE public.love_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "love_select_authenticated" ON public.love_reasons;
DROP POLICY IF EXISTS "love_select_participants" ON public.love_reasons;
CREATE POLICY "love_select_authenticated"
ON public.love_reasons
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = love_reasons.experience_id
      AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR e.status = 'active')
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "love_select_anon" ON public.love_reasons;
CREATE POLICY "love_select_anon"
ON public.love_reasons
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = love_reasons.experience_id AND e.status = 'active'
  )
);

DROP POLICY IF EXISTS "love_insert_sender" ON public.love_reasons;
CREATE POLICY "love_insert_sender"
ON public.love_reasons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = love_reasons.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "love_update_sender" ON public.love_reasons;
CREATE POLICY "love_update_sender"
ON public.love_reasons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = love_reasons.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "love_delete_sender" ON public.love_reasons;
CREATE POLICY "love_delete_sender"
ON public.love_reasons
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = love_reasons.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

-- ============================================================
-- 8. GALLERY ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  media_url text NOT NULL DEFAULT '',
  media_type text NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  caption text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'random' CHECK (category IN ('first-photo', 'first-date', 'favorite-selfie', 'funniest', 'random', 'trips', 'food', 'festivals', 'late-night', 'stupid')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gallery_experience_id ON public.gallery_items(experience_id);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gallery_select_authenticated" ON public.gallery_items;
DROP POLICY IF EXISTS "gallery_select_participants" ON public.gallery_items;
CREATE POLICY "gallery_select_authenticated"
ON public.gallery_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = gallery_items.experience_id
      AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR e.status = 'active')
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "gallery_select_anon" ON public.gallery_items;
CREATE POLICY "gallery_select_anon"
ON public.gallery_items
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = gallery_items.experience_id AND e.status = 'active'
  )
);

DROP POLICY IF EXISTS "gallery_insert_sender" ON public.gallery_items;
CREATE POLICY "gallery_insert_sender"
ON public.gallery_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = gallery_items.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "gallery_update_sender" ON public.gallery_items;
CREATE POLICY "gallery_update_sender"
ON public.gallery_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = gallery_items.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

DROP POLICY IF EXISTS "gallery_delete_sender" ON public.gallery_items;
CREATE POLICY "gallery_delete_sender"
ON public.gallery_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = gallery_items.experience_id AND (e.sender_id = auth.uid() OR public.is_admin())
  )
);

-- ============================================================
-- 9. RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  response text NOT NULL CHECK (response IN ('yes', 'maybe', 'no')),
  note text,
  date_activity text,
  date_time timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_responses_experience_id ON public.responses(experience_id);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "resp_select_authenticated" ON public.responses;
DROP POLICY IF EXISTS "resp_select_participants" ON public.responses;
CREATE POLICY "resp_select_authenticated"
ON public.responses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = responses.experience_id
      AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR e.status = 'active')
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "resp_insert_all" ON public.responses;
DROP POLICY IF EXISTS "resp_insert_receiver" ON public.responses;
DROP POLICY IF EXISTS "resp_insert_anon" ON public.responses;
CREATE POLICY "resp_insert_all"
ON public.responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================================
-- 10. DATE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.date_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  activity text NOT NULL DEFAULT '',
  date_time timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_date_req_experience_id ON public.date_requests(experience_id);

ALTER TABLE public.date_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "date_req_select_authenticated" ON public.date_requests;
DROP POLICY IF EXISTS "date_req_select_participants" ON public.date_requests;
CREATE POLICY "date_req_select_authenticated"
ON public.date_requests
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.experiences e
    WHERE e.id = date_requests.experience_id
      AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR e.status = 'active')
  )
  OR public.is_admin()
);

DROP POLICY IF EXISTS "date_req_insert_all" ON public.date_requests;
DROP POLICY IF EXISTS "date_req_insert_receiver" ON public.date_requests;
DROP POLICY IF EXISTS "date_req_insert_anon" ON public.date_requests;
CREATE POLICY "date_req_insert_all"
ON public.date_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================================
-- 11. MESSAGES TABLE (Real-Time 1-on-1 Chat)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_experience_id ON public.messages(experience_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "msg_select_participants" ON public.messages;
CREATE POLICY "msg_select_participants"
ON public.messages
FOR SELECT
TO authenticated
USING (
  auth.uid() = sender_id
  OR auth.uid() = receiver_id
  OR public.is_admin()
);

DROP POLICY IF EXISTS "msg_insert_participant" ON public.messages;
CREATE POLICY "msg_insert_participant"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (
    EXISTS (
      SELECT 1 FROM public.experiences e
      WHERE e.id = messages.experience_id
        AND (e.sender_id = auth.uid() OR e.receiver_id = auth.uid() OR public.is_admin())
    )
  )
);

DROP POLICY IF EXISTS "msg_update_participant" ON public.messages;
CREATE POLICY "msg_update_participant"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id OR public.is_admin())
WITH CHECK (auth.uid() = receiver_id OR public.is_admin());

-- ============================================================
-- 12. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('opened', 'response', 'message', 'system')),
  title text NOT NULL DEFAULT '',
  body text,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
CREATE POLICY "notif_select_own"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notif_insert_all" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert_own_or_system" ON public.notifications;
DROP POLICY IF EXISTS "notif_insert_anon" ON public.notifications;
CREATE POLICY "notif_insert_all"
ON public.notifications
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
CREATE POLICY "notif_update_own"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notif_delete_own" ON public.notifications;
CREATE POLICY "notif_delete_own"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================
-- 13. REPORTS & MODERATION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  experience_id uuid REFERENCES public.experiences(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_select_own_or_admin" ON public.reports;
CREATE POLICY "reports_select_own_or_admin"
ON public.reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS "reports_insert_own" ON public.reports;
CREATE POLICY "reports_insert_own"
ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_update_admin" ON public.reports;
CREATE POLICY "reports_update_admin"
ON public.reports
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reports_delete_admin" ON public.reports;
CREATE POLICY "reports_delete_admin"
ON public.reports
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 14. BLOCKED USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  blocked_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocked_select_admin" ON public.blocked_users;
CREATE POLICY "blocked_select_admin"
ON public.blocked_users
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "blocked_insert_admin" ON public.blocked_users;
CREATE POLICY "blocked_insert_admin"
ON public.blocked_users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "blocked_delete_admin" ON public.blocked_users;
CREATE POLICY "blocked_delete_admin"
ON public.blocked_users
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- 15. STORAGE BUCKET & POLICIES (media)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'
  ]
)
ON CONFLICT (id) DO UPDATE
SET public = true, file_size_limit = 52428800;

-- Public can read all media in media bucket
DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "media_read_participants" ON storage.objects;
CREATE POLICY "media_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media');

-- Authenticated users can upload to media
DROP POLICY IF EXISTS "media_upload_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "media_upload_sender" ON storage.objects;
CREATE POLICY "media_upload_authenticated"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Authenticated users can update/delete only their own uploaded media (or admin)
DROP POLICY IF EXISTS "media_update_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "media_update_sender" ON storage.objects;
CREATE POLICY "media_update_authenticated"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND (owner = auth.uid() OR public.is_admin()));

DROP POLICY IF EXISTS "media_delete_authenticated" ON storage.objects;
DROP POLICY IF EXISTS "media_delete_sender" ON storage.objects;
CREATE POLICY "media_delete_authenticated"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (owner = auth.uid() OR public.is_admin()));

-- ============================================================
-- 16. GRANT SCHEMA & TABLE PRIVILEGES (Fixes permission denied)
-- ============================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
