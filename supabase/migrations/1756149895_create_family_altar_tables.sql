-- Migration: create_family_altar_tables
-- Created at: 1756149895

-- Create user_prayers table
CREATE TABLE IF NOT EXISTS user_prayers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prayer_type TEXT NOT NULL CHECK (prayer_type IN ('praise', 'thanksgiving', 'confession', 'supplication', 'intercession')),
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  answered_notes TEXT,
  tags TEXT[] DEFAULT array[]::TEXT[],
  bible_reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_intentions table
CREATE TABLE IF NOT EXISTS user_intentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('health', 'family', 'ministry', 'personal_growth', 'other')),
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'paused')) DEFAULT 'active',
  completion_target TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT array[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create altar_streaks table
CREATE TABLE IF NOT EXISTS altar_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_prayer_at TIMESTAMP WITH TIME ZONE,
  streak_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create altar_streak_history table
CREATE TABLE IF NOT EXISTS altar_streak_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  prayers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, streak_date)
);

-- Create altar_badges table
CREATE TABLE IF NOT EXISTS altar_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  scripture_reference TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prayer', 'streak', 'community', 'study', 'service')),
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('prayer_count', 'streak_length', 'challenge_completed', 'answered_prayers', 'intention_completed')),
  requirement_value INTEGER NOT NULL,
  icon_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, tier)
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES altar_badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create family_challenges table
CREATE TABLE IF NOT EXISTS family_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prayer', 'service', 'learning', 'worship')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_days INTEGER DEFAULT 7,
  scripture_reference TEXT,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_family_challenges table
CREATE TABLE IF NOT EXISTS user_family_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES family_challenges(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
  reflection TEXT,
  family_member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, challenge_id, start_date)
);

-- Create blessing_card_templates table
CREATE TABLE IF NOT EXISTS blessing_card_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('encouragement', 'celebration', 'sympathy', 'gratitude', 'general')),
  background_image TEXT,
  default_font TEXT DEFAULT 'serif',
  default_color TEXT DEFAULT '#000000',
  layout_type TEXT NOT NULL CHECK (layout_type IN ('centered', 'top', 'bottom', 'split')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_blessing_cards table
CREATE TABLE IF NOT EXISTS user_blessing_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES blessing_card_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scripture_verse TEXT NOT NULL,
  personal_message TEXT,
  font TEXT,
  font_color TEXT,
  background_image TEXT,
  layout_type TEXT NOT NULL CHECK (layout_type IN ('centered', 'top', 'bottom', 'split')),
  export_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for user_prayers
ALTER TABLE user_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prayers"
  ON user_prayers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prayers"
  ON user_prayers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prayers"
  ON user_prayers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prayers"
  ON user_prayers FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for user_intentions
ALTER TABLE user_intentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own intentions"
  ON user_intentions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intentions"
  ON user_intentions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intentions"
  ON user_intentions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own intentions"
  ON user_intentions FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for altar_streaks
ALTER TABLE altar_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
  ON altar_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON altar_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON altar_streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

-- Create RLS policies for user_blessing_cards
ALTER TABLE user_blessing_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blessing cards"
  ON user_blessing_cards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blessing cards"
  ON user_blessing_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blessing cards"
  ON user_blessing_cards FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blessing cards"
  ON user_blessing_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for altar_streak_history
ALTER TABLE altar_streak_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streak history"
  ON altar_streak_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak history"
  ON altar_streak_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_family_challenges
ALTER TABLE user_family_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own family challenges"
  ON user_family_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own family challenges"
  ON user_family_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family challenges"
  ON user_family_challenges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create public read-only policies for shared resources
ALTER TABLE altar_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view badges" ON altar_badges FOR SELECT USING (true);

ALTER TABLE family_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view family challenges" ON family_challenges FOR SELECT USING (true);

ALTER TABLE blessing_card_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view blessing card templates" ON blessing_card_templates FOR SELECT USING (true);;