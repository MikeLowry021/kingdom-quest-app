-- Migration: fix_moderation_reviews_schema
-- Created at: 1756188174

-- Fix moderation_reviews table to match Edge Function requirements

-- Drop existing moderation_reviews table and recreate with correct structure
DROP TABLE IF EXISTS moderation_reviews CASCADE;

CREATE TABLE moderation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID, -- can reference either original quest or remix quest
  remix_id UUID, -- references remix_quests(id) but no FK constraint for flexibility
  content_type VARCHAR(50) NOT NULL DEFAULT 'story',
  content_excerpt TEXT,
  moderator_type VARCHAR(50) NOT NULL, -- 'theology-guard', 'safety-moderator', 'human'
  status VARCHAR(20) NOT NULL, -- 'APPROVED', 'REQUIRES_REVIEW', 'REJECTED'
  confidence_level VARCHAR(10) NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
  concerns TEXT[], -- array of specific concerns identified
  suggestions TEXT[], -- array of improvement suggestions
  detailed_analysis JSONB, -- structured analysis results
  target_age VARCHAR(20), -- target age tier for safety analysis
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on moderation_reviews
ALTER TABLE moderation_reviews ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for moderation_reviews
CREATE POLICY moderation_reviews_all_policy ON moderation_reviews
  FOR ALL
  USING (true);;