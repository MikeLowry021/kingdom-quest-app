-- Migration: fix_remix_moderation_schema
-- Created at: 1756188164

-- Fix remix stories schema to match Edge Function requirements

-- Drop and recreate moderation_reviews table with correct columns
DROP TABLE IF EXISTS moderation_reviews CASCADE;

CREATE TABLE moderation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID, -- can reference either original quest or remix quest
  remix_id UUID REFERENCES remix_quests(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL DEFAULT 'story', -- 'story', 'theme', 'custom_element'
  content_excerpt TEXT, -- first 500 chars of reviewed content
  moderator_type VARCHAR(50) NOT NULL, -- 'theology-guard', 'safety-moderator', 'human'
  status VARCHAR(20) NOT NULL, -- 'APPROVED', 'REQUIRES_REVIEW', 'REJECTED'
  confidence_level VARCHAR(10) NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
  concerns TEXT[], -- array of specific concerns identified
  suggestions TEXT[], -- array of improvement suggestions
  detailed_analysis JSONB, -- structured analysis results
  target_age VARCHAR(20), -- target age tier for safety analysis
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add missing columns to remix_quests table
ALTER TABLE remix_quests 
  ADD COLUMN IF NOT EXISTS theme TEXT,
  ADD COLUMN IF NOT EXISTS age_tier VARCHAR(20),
  ADD COLUMN IF NOT EXISTS target_length VARCHAR(20),
  ADD COLUMN IF NOT EXISTS remix_type VARCHAR(50) DEFAULT 'user-generated',
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS custom_elements JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS theme_modifications JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS age_adaptations JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS length_adjustments JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS imported_from_questpack BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_creator UUID,
  ADD COLUMN IF NOT EXISTS import_timestamp TIMESTAMPTZ;

-- Fix quest_versions table to match Edge Function expectations
ALTER TABLE quest_versions 
  DROP CONSTRAINT IF EXISTS unique_quest_version,
  ADD COLUMN IF NOT EXISTS changes_description TEXT,
  ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);

-- Add missing columns to questpack_exports table
ALTER TABLE questpack_exports
  ADD COLUMN IF NOT EXISTS exported_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS filename VARCHAR(255),
  ADD COLUMN IF NOT EXISTS file_size INTEGER,
  ADD COLUMN IF NOT EXISTS export_type VARCHAR(50) DEFAULT 'questpack',
  ADD COLUMN IF NOT EXISTS include_media BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS questpack_version VARCHAR(10) DEFAULT '1.0',
  ADD COLUMN IF NOT EXISTS exported_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- Add questpack_imports table with correct structure
CREATE TABLE IF NOT EXISTS questpack_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_id UUID REFERENCES remix_quests(id),
  imported_by UUID NOT NULL REFERENCES auth.users(id),
  questpack_title VARCHAR(255),
  original_creator UUID,
  questpack_version VARCHAR(10),
  import_options JSONB DEFAULT '{}',
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
);

-- Create indices for new tables
CREATE INDEX IF NOT EXISTS moderation_reviews_remix_idx ON moderation_reviews(remix_id);
CREATE INDEX IF NOT EXISTS moderation_reviews_moderator_idx ON moderation_reviews(moderator_type);
CREATE INDEX IF NOT EXISTS moderation_reviews_status_idx ON moderation_reviews(status);
CREATE INDEX IF NOT EXISTS questpack_imports_user_idx ON questpack_imports(imported_by);

-- Enable RLS on new/updated tables
ALTER TABLE moderation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questpack_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moderation_reviews
CREATE POLICY moderation_reviews_select_policy ON moderation_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM remix_quests rq 
      WHERE rq.id = remix_id 
      AND rq.creator_id = auth.uid()
    )
  );

CREATE POLICY moderation_reviews_insert_policy ON moderation_reviews
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'authenticated');

-- RLS Policies for questpack_imports  
CREATE POLICY questpack_imports_select_policy ON questpack_imports
  FOR SELECT
  USING (imported_by = auth.uid());

CREATE POLICY questpack_imports_insert_policy ON questpack_imports
  FOR INSERT
  WITH CHECK (imported_by = auth.uid());;