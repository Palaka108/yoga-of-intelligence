-- ============================================================
-- Yoga of Intelligence — Full Schema Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_yoi_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.yoi_users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, yoi_users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, yoi_users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_yoi ON auth.users;
CREATE TRIGGER on_auth_user_created_yoi
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_yoi_user();

-- ============================================================
-- 2. MODULES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  cover_image_url TEXT,
  intro_video_url TEXT,
  module_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  total_sequences INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. MODULE SEQUENCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_module_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID NOT NULL REFERENCES yoi_modules(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  -- Type: intro_video | gift_song | canva_reflection | video_upload |
  --       instructor_response | movement_integration | love_integration
  sequence_type TEXT NOT NULL,
  content_url TEXT,            -- Video/audio URL
  content_text TEXT,           -- Textual instructions or framing
  content_image_url TEXT,      -- Canva slide / meme image
  instructions TEXT,           -- Detailed step instructions
  requires_upload BOOLEAN NOT NULL DEFAULT FALSE,
  requires_instructor_response BOOLEAN NOT NULL DEFAULT FALSE,
  min_video_seconds INTEGER DEFAULT 60,
  max_video_seconds INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (module_id, sequence_number)
);

-- ============================================================
-- 4. USER PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES yoi_users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES yoi_modules(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES yoi_module_sequences(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed', 'awaiting_response')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, module_id, sequence_id)
);

-- ============================================================
-- 5. VIDEO SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_video_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES yoi_users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES yoi_modules(id) ON DELETE CASCADE,
  sequence_id UUID NOT NULL REFERENCES yoi_module_sequences(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- 6. INSTRUCTOR RESPONSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS yoi_instructor_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID NOT NULL REFERENCES yoi_video_submissions(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES yoi_users(id),
  user_id UUID NOT NULL REFERENCES yoi_users(id),
  module_id UUID NOT NULL REFERENCES yoi_modules(id),
  sequence_id UUID NOT NULL REFERENCES yoi_module_sequences(id),
  response_video_url TEXT NOT NULL,
  message TEXT,
  next_meditation_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_yoi_progress_user ON yoi_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_yoi_progress_module ON yoi_user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_yoi_progress_composite ON yoi_user_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_yoi_sequences_module ON yoi_module_sequences(module_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_yoi_submissions_user ON yoi_video_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_yoi_submissions_status ON yoi_video_submissions(status);
CREATE INDEX IF NOT EXISTS idx_yoi_responses_user ON yoi_instructor_responses(user_id);

-- ============================================================
-- 8. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE yoi_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoi_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoi_module_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoi_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoi_video_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE yoi_instructor_responses ENABLE ROW LEVEL SECURITY;

-- -- USERS --
CREATE POLICY "Users can view own profile"
  ON yoi_users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON yoi_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON yoi_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- -- MODULES (read-only for students) --
CREATE POLICY "Anyone authenticated can view published modules"
  ON yoi_modules FOR SELECT
  USING (status = 'published' AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage modules"
  ON yoi_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -- MODULE SEQUENCES --
CREATE POLICY "Authenticated users can view sequences"
  ON yoi_module_sequences FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage sequences"
  ON yoi_module_sequences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -- USER PROGRESS --
CREATE POLICY "Users can view own progress"
  ON yoi_user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON yoi_user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON yoi_user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON yoi_user_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Admins can update any progress"
  ON yoi_user_progress FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- -- VIDEO SUBMISSIONS --
CREATE POLICY "Users can view own submissions"
  ON yoi_video_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions"
  ON yoi_video_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions"
  ON yoi_video_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Admins can update submissions"
  ON yoi_video_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- -- INSTRUCTOR RESPONSES --
CREATE POLICY "Users can view responses for them"
  ON yoi_instructor_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Instructors can insert responses"
  ON yoi_instructor_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Admins can view all responses"
  ON yoi_instructor_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')
    )
  );

-- ============================================================
-- 9. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('yoi-videos', 'yoi-videos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('yoi-avatars', 'yoi-avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('yoi-content', 'yoi-content', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for video uploads
CREATE POLICY "Users can upload own videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'yoi-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own videos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'yoi-videos' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR
     EXISTS (SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role IN ('admin', 'instructor')))
  );

-- Avatars — public read, authenticated upload
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'yoi-avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'yoi-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Content — public read (for module media)
CREATE POLICY "Anyone can view content"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'yoi-content');

-- ============================================================
-- 10. SEED DATA — Module 1 Template
-- ============================================================
INSERT INTO yoi_modules (id, title, subtitle, description, module_order, status, total_sequences)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Pranayama & The Witness',
  'Awakening the Observer Within',
  'Begin your journey through pranayama, reflection, and guided integration. This module introduces the 24 Sankhya elements, the six opulences, and the tripartite framework of Ideal, Possible, and Impossible.',
  1,
  'published',
  7
) ON CONFLICT DO NOTHING;

-- Sequence 1: Intro Video
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 1,
  'Pranayama Introduction',
  'Watch the guided pranayama explanation video',
  'intro_video',
  'Watch the complete introductory video on pranayama practice. When you have fully absorbed the teaching, click "Complete Step" to proceed.'
) ON CONFLICT DO NOTHING;

-- Sequence 2: Gift Song
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 2,
  'Gift Song — Gita 3.27',
  'Listen with the framing of witness consciousness',
  'gift_song',
  'Listen to the base song with the following conceptual framing: The soul is not the doer. The three modes of material nature perform all actions, but the soul bewildered by false ego thinks "I am the doer." Reflect on how this applies to your breath, your thoughts, and your sense of identity.'
) ON CONFLICT DO NOTHING;

-- Sequence 3: Canva Reflection
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 3,
  'Sankhya Element Reflection',
  'Reflect on the Purusha-Prakriti distinction',
  'canva_reflection',
  'Study this visual representation of the 24 Sankhya elements. Identify which element resonates most deeply with your current state. Where do you see yourself in the hierarchy of consciousness?'
) ON CONFLICT DO NOTHING;

-- Sequence 4: Video Upload
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions, requires_upload, requires_instructor_response, min_video_seconds, max_video_seconds)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 4,
  'Video Reflection',
  'Record your 60-120 second reflection',
  'video_upload',
  'Record a video reflection (60-120 seconds) sharing: What did the pranayama practice reveal about your relationship with breath? How does the concept of witness consciousness shift your self-perception?',
  true, true, 60, 120
) ON CONFLICT DO NOTHING;

-- Sequence 5: Instructor Response
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions, requires_instructor_response)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 5,
  'Guided Response & Meditation',
  'Receive your personalized guidance',
  'instructor_response',
  'Your instructor has prepared a personalized response video and guided meditation based on your reflection. Watch both completely before proceeding.',
  true
) ON CONFLICT DO NOTHING;

-- Sequence 6: Movement Integration
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 6,
  'Movement Integration',
  'Embody the teaching through movement',
  'movement_integration',
  'Choose one form of embodied integration: sacred dance, kirtan (devotional singing), or walking meditation. Spend at least 15 minutes in this practice, maintaining awareness of the witness consciousness discussed throughout this module.'
) ON CONFLICT DO NOTHING;

-- Sequence 7: Love Integration
INSERT INTO yoi_module_sequences (module_id, sequence_number, title, description, sequence_type, instructions)
VALUES (
  'a0000000-0000-0000-0000-000000000001', 7,
  'Love Integration',
  'Final conceptual integration',
  'love_integration',
  'Bring together all elements of this module: The 24 Sankhya elements as instruments of consciousness. The six opulences (wealth, strength, fame, beauty, knowledge, renunciation) as expressions of the divine. The tripartite reality of sattva, rajas, and tamas. The framework of Ideal, Possible, and Impossible. How does love serve as the integrating force across all these dimensions? Click "Complete" when you have fully absorbed this reflection.'
) ON CONFLICT DO NOTHING;

-- ============================================================
-- 11. ADMIN UNLOCK FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION yoi_admin_unlock_sequence(
  p_user_id UUID,
  p_module_id UUID,
  p_sequence_id UUID,
  p_submission_id UUID,
  p_response_video_url TEXT,
  p_message TEXT DEFAULT NULL,
  p_next_meditation_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_instructor_id UUID;
  v_next_sequence_id UUID;
BEGIN
  -- Get current user (instructor)
  v_instructor_id := auth.uid();

  -- Verify instructor role
  IF NOT EXISTS (
    SELECT 1 FROM yoi_users WHERE id = v_instructor_id AND role IN ('admin', 'instructor')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only instructors can unlock sequences';
  END IF;

  -- Insert instructor response
  INSERT INTO yoi_instructor_responses (
    submission_id, instructor_id, user_id, module_id, sequence_id,
    response_video_url, message, next_meditation_url
  ) VALUES (
    p_submission_id, v_instructor_id, p_user_id, p_module_id, p_sequence_id,
    p_response_video_url, p_message, p_next_meditation_url
  );

  -- Mark submission as reviewed
  UPDATE yoi_video_submissions
  SET status = 'reviewed', reviewed_at = NOW()
  WHERE id = p_submission_id;

  -- Mark current sequence as completed
  UPDATE yoi_user_progress
  SET status = 'completed', completed_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id AND module_id = p_module_id AND sequence_id = p_sequence_id;

  -- Find and unlock next sequence
  SELECT ms.id INTO v_next_sequence_id
  FROM yoi_module_sequences ms
  JOIN yoi_module_sequences current_ms ON current_ms.id = p_sequence_id
  WHERE ms.module_id = p_module_id
    AND ms.sequence_number = current_ms.sequence_number + 1;

  IF v_next_sequence_id IS NOT NULL THEN
    INSERT INTO yoi_user_progress (user_id, module_id, sequence_id, status)
    VALUES (p_user_id, p_module_id, v_next_sequence_id, 'unlocked')
    ON CONFLICT (user_id, module_id, sequence_id)
    DO UPDATE SET status = 'unlocked', updated_at = NOW();
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'next_sequence_id', v_next_sequence_id
  );
END;
$$;
