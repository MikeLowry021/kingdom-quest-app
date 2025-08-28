-- Migration: family_altar_schema
-- Created at: 1756154674

-- Migrations for the Family Altar feature

-- Create prayers table
CREATE TABLE IF NOT EXISTS prayers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered BOOLEAN NOT NULL DEFAULT FALSE,
  answered_date TIMESTAMPTZ,
  answer_content TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  scripture_reference VARCHAR(100),
  is_private BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_prayer_date TIMESTAMPTZ,
  streak_starts TIMESTAMPTZ,
  missed_days INTEGER DEFAULT 0,
  CONSTRAINT unique_user_streak UNIQUE (user_id)
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  scripture_ref VARCHAR(100) NOT NULL,
  image VARCHAR(255) NOT NULL,
  requirement JSONB NOT NULL
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Create family_challenges table
CREATE TABLE IF NOT EXISTS family_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  scripture_ref VARCHAR(100) NOT NULL,
  week_start TIMESTAMPTZ NOT NULL,
  week_end TIMESTAMPTZ NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_date TIMESTAMPTZ,
  family_id UUID NOT NULL
);

-- Create intentions table
CREATE TABLE IF NOT EXISTS intentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_frequency VARCHAR(20) CHECK (reminder_frequency IN ('daily', 'weekly', 'monthly')),
  last_reminder_date TIMESTAMPTZ
);

-- Create blessing_cards table
CREATE TABLE IF NOT EXISTS blessing_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id VARCHAR(100) NOT NULL,
  template VARCHAR(50) NOT NULL,
  message TEXT,
  recipient VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  shared BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create indices for better performance
CREATE INDEX IF NOT EXISTS prayers_user_id_idx ON prayers(user_id);
CREATE INDEX IF NOT EXISTS prayers_category_idx ON prayers(category);
CREATE INDEX IF NOT EXISTS prayers_created_at_idx ON prayers(created_at);
CREATE INDEX IF NOT EXISTS prayers_answered_idx ON prayers(answered);
CREATE INDEX IF NOT EXISTS user_badges_user_id_idx ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS intentions_user_id_idx ON intentions(user_id);
CREATE INDEX IF NOT EXISTS intentions_active_idx ON intentions(active);
CREATE INDEX IF NOT EXISTS blessing_cards_user_id_idx ON blessing_cards(user_id);

-- Create RLS policies
-- This section would typically define Row-Level Security policies
-- to control access to the tables based on user authentication.

-- Example RLS policy for prayers table:
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

-- Users can see their own prayers or non-private prayers from family members
CREATE POLICY prayers_select_policy ON prayers
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    (NOT is_private AND user_id IN (
      SELECT member_id FROM family_members WHERE family_id = (
        SELECT family_id FROM family_members WHERE member_id = auth.uid() LIMIT 1
      )
    ))
  );

-- Users can only insert their own prayers
CREATE POLICY prayers_insert_policy ON prayers
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own prayers
CREATE POLICY prayers_update_policy ON prayers
  FOR UPDATE
  USING (user_id = auth.uid());

-- Users can only delete their own prayers
CREATE POLICY prayers_delete_policy ON prayers
  FOR DELETE
  USING (user_id = auth.uid());

-- Similar policies would be created for the other tables

-- Seed the badges table with predefined badges
INSERT INTO badges (id, name, description, scripture_ref, image, requirement)
VALUES
  ('prayer-warrior', 'Prayer Warrior', 'Logged prayers for 7 consecutive days', '1 Thessalonians 5:17', '/images/badges/prayer-warrior.png', '{"type": "streak", "days": 7}'),
  ('intercessor', 'Intercessor', 'Prayed for others 10 times', 'James 5:16', '/images/badges/intercessor.png', '{"type": "count", "category": "intercession", "count": 10}'),
  ('scripture-devotion', 'Scripture Devotion', 'Included scripture in prayers 15 times', 'Joshua 1:8', '/images/badges/scripture-devotion.png', '{"type": "count", "category": "scripture", "count": 15}'),
  ('family-leadership', 'Family Leadership', 'Led family prayer time 5 times', 'Joshua 24:15', '/images/badges/family-leadership.png', '{"type": "count", "category": "family", "count": 5}'),
  ('challenge-champion', 'Challenge Champion', 'Completed 3 family challenges', 'Philippians 3:14', '/images/badges/challenge-champion.png', '{"type": "challenges", "count": 3}'),
  ('consistency-crown', 'Consistency Crown', 'Maintained a 30-day prayer streak', 'Colossians 4:2', '/images/badges/consistency-crown.png', '{"type": "streak", "days": 30}'),
  ('blessing-bearer', 'Blessing Bearer', 'Created and shared 5 blessing cards', 'Numbers 6:24-26', '/images/badges/blessing-bearer.png', '{"type": "cards", "count": 5}'),
  ('gratitude-heart', 'Gratitude Heart', 'Logged 20 thanksgiving prayers', 'Psalm 136:1', '/images/badges/gratitude-heart.png', '{"type": "count", "category": "thanksgiving", "count": 20}')
ON CONFLICT (id) DO NOTHING;;