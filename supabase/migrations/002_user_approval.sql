-- ============================================================
-- User Approval Gate Migration
-- Adds approved column to yoi_users so admins can control access
-- ============================================================

-- Add approved column (default false for new signups)
ALTER TABLE yoi_users ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Auto-approve existing admins and instructors
UPDATE yoi_users SET approved = TRUE WHERE role IN ('admin', 'instructor');

-- Update the auto-create trigger to keep approved = false for new students
CREATE OR REPLACE FUNCTION public.handle_new_yoi_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.yoi_users (id, email, full_name, avatar_url, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, yoi_users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, yoi_users.avatar_url),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow admins to update any user's approved status
CREATE POLICY "Admins can update any user"
  ON yoi_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM yoi_users WHERE id = auth.uid() AND role = 'admin'
    )
  );
