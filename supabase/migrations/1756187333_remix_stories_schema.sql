-- Migration: remix_stories_schema
-- Created at: 1756187333

-- Remix Story System Database Schema
-- Created: 2025-08-26
-- Purpose: Enable safe Biblical story customization with AI moderation

-- Create original_quests table (base stories)
CREATE TABLE IF NOT EXISTS original_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  scripture_reference VARCHAR(100) NOT NULL,
  content JSONB NOT NULL, -- Contains the quest structure
  age_tiers TEXT[] NOT NULL DEFAULT '{}', -- supported age tiers
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  category VARCHAR(100) NOT NULL, -- 'old_testament', 'new_testament', 'parables', etc.
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_by UUID REFERENCES auth.users(id),
  is_official BOOLEAN NOT NULL DEFAULT TRUE, -- official KingdomQuest content
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create remix_quests table (customized stories)
CREATE TABLE IF NOT EXISTS remix_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_quest_id UUID NOT NULL REFERENCES original_quests(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  custom_theme TEXT, -- user-provided theme/customization
  target_age_tier VARCHAR(50) NOT NULL, -- 'early_childhood', 'elementary', 'middle_school', 'high_school'
  target_duration VARCHAR(20) NOT NULL, -- 'short', 'medium', 'long'
  remixed_content JSONB NOT NULL, -- the AI-generated customized content
  moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'flagged'
  moderation_feedback TEXT,
  theology_score INTEGER, -- 1-100 theological accuracy score
  safety_score INTEGER, -- 1-100 child safety score
  is_public BOOLEAN NOT NULL DEFAULT FALSE, -- can be shared via questpack
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Create quest_versions table (version tracking)
CREATE TABLE IF NOT EXISTS quest_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_quest_id UUID NOT NULL REFERENCES remix_quests(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL, -- snapshot of content at this version
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_quest_version UNIQUE (remix_quest_id, version_number)
);

-- Create moderation_reviews table (AI and human review results)
CREATE TABLE IF NOT EXISTS moderation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_quest_id UUID NOT NULL REFERENCES remix_quests(id) ON DELETE CASCADE,
  review_type VARCHAR(20) NOT NULL, -- 'theology_guard', 'safety_moderator', 'human_review'
  reviewer_agent VARCHAR(50), -- name of AI agent or 'human'
  status VARCHAR(20) NOT NULL, -- 'approved', 'rejected', 'needs_revision'
  score INTEGER, -- 1-100 confidence score
  feedback JSONB, -- structured feedback from AI agents
  flagged_issues TEXT[], -- array of identified issues
  recommendations TEXT[], -- array of suggested improvements
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processing_time_ms INTEGER -- time taken for review
);

-- Create questpack_exports table (tracking shared bundles)
CREATE TABLE IF NOT EXISTS questpack_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_quest_id UUID NOT NULL REFERENCES remix_quests(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questpack_name VARCHAR(255) NOT NULL,
  description TEXT,
  file_size_bytes INTEGER,
  file_hash VARCHAR(64), -- SHA256 hash for integrity
  download_url VARCHAR(500),
  expiry_date TIMESTAMPTZ,
  download_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB, -- additional questpack info
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create remix_attributions table (immutable attribution chain)
CREATE TABLE IF NOT EXISTS remix_attributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remix_quest_id UUID NOT NULL REFERENCES remix_quests(id) ON DELETE CASCADE,
  original_quest_id UUID NOT NULL REFERENCES original_quests(id),
  parent_remix_id UUID REFERENCES remix_quests(id), -- for remix-of-remix tracking
  attribution_level INTEGER NOT NULL DEFAULT 1, -- depth in remix chain
  creator_name VARCHAR(255) NOT NULL, -- preserved creator name
  creator_id UUID REFERENCES auth.users(id), -- may be null if user deleted
  scripture_attribution VARCHAR(200) NOT NULL, -- original scripture source
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- immutable timestamp
);

-- Create questpack_imports table (tracking imported bundles)
CREATE TABLE IF NOT EXISTS questpack_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questpack_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255),
  file_size_bytes INTEGER,
  validation_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'valid', 'invalid', 'corrupted'
  validation_errors TEXT[],
  imported_quest_id UUID REFERENCES remix_quests(id),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indices for performance optimization
CREATE INDEX IF NOT EXISTS original_quests_category_idx ON original_quests(category);
CREATE INDEX IF NOT EXISTS original_quests_active_idx ON original_quests(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS remix_quests_creator_idx ON remix_quests(creator_id);
CREATE INDEX IF NOT EXISTS remix_quests_original_idx ON remix_quests(original_quest_id);
CREATE INDEX IF NOT EXISTS remix_quests_moderation_idx ON remix_quests(moderation_status);
CREATE INDEX IF NOT EXISTS remix_quests_public_idx ON remix_quests(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS quest_versions_remix_idx ON quest_versions(remix_quest_id);
CREATE INDEX IF NOT EXISTS moderation_reviews_quest_idx ON moderation_reviews(remix_quest_id);
CREATE INDEX IF NOT EXISTS moderation_reviews_type_idx ON moderation_reviews(review_type);
CREATE INDEX IF NOT EXISTS questpack_exports_creator_idx ON questpack_exports(creator_id);
CREATE INDEX IF NOT EXISTS questpack_exports_active_idx ON questpack_exports(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS remix_attributions_remix_idx ON remix_attributions(remix_quest_id);
CREATE INDEX IF NOT EXISTS remix_attributions_original_idx ON remix_attributions(original_quest_id);

-- Enable Row Level Security (RLS)
ALTER TABLE original_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questpack_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE remix_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questpack_imports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for original_quests (readable by all authenticated users)
CREATE POLICY original_quests_select_policy ON original_quests
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- RLS Policies for remix_quests
CREATE POLICY remix_quests_select_policy ON remix_quests
  FOR SELECT
  USING (
    creator_id = auth.uid() OR 
    (is_public = true AND moderation_status = 'approved')
  );

CREATE POLICY remix_quests_insert_policy ON remix_quests
  FOR INSERT
  WITH CHECK (
    creator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_subscriptions us 
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = auth.uid() 
      AND us.status = 'active'
      AND sp.id IN ('premium', 'church')
    )
  );

CREATE POLICY remix_quests_update_policy ON remix_quests
  FOR UPDATE
  USING (creator_id = auth.uid());

CREATE POLICY remix_quests_delete_policy ON remix_quests
  FOR DELETE
  USING (creator_id = auth.uid());

-- RLS Policies for quest_versions
CREATE POLICY quest_versions_select_policy ON quest_versions
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM remix_quests rq 
      WHERE rq.id = remix_quest_id 
      AND (rq.creator_id = auth.uid() OR (rq.is_public = true AND rq.moderation_status = 'approved'))
    )
  );

CREATE POLICY quest_versions_insert_policy ON quest_versions
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- RLS Policies for moderation_reviews (admin and creator access)
CREATE POLICY moderation_reviews_select_policy ON moderation_reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM remix_quests rq 
      WHERE rq.id = remix_quest_id 
      AND rq.creator_id = auth.uid()
    )
  );

-- RLS Policies for questpack_exports
CREATE POLICY questpack_exports_select_policy ON questpack_exports
  FOR SELECT
  USING (
    creator_id = auth.uid() OR
    (is_active = true AND EXISTS (
      SELECT 1 FROM remix_quests rq 
      WHERE rq.id = remix_quest_id 
      AND rq.is_public = true 
      AND rq.moderation_status = 'approved'
    ))
  );

CREATE POLICY questpack_exports_insert_policy ON questpack_exports
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY questpack_exports_update_policy ON questpack_exports
  FOR UPDATE
  USING (creator_id = auth.uid());

-- RLS Policies for remix_attributions (readable by all authenticated users)
CREATE POLICY remix_attributions_select_policy ON remix_attributions
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY remix_attributions_insert_policy ON remix_attributions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for questpack_imports
CREATE POLICY questpack_imports_select_policy ON questpack_imports
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY questpack_imports_insert_policy ON questpack_imports
  FOR INSERT
  WITH CHECK (user_id = auth.uid());;