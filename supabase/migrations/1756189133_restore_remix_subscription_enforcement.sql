-- Migration: restore_remix_subscription_enforcement
-- Created at: 1756189133

-- Restore subscription enforcement for remix feature
-- This was accidentally removed and must be restored for production

-- First check if user_subscriptions table exists
DROP POLICY IF EXISTS remix_quests_insert_policy ON remix_quests;

-- Recreate the subscription enforcement policy for remix creation
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

-- Also ensure the RLS policy for updates includes subscription check
DROP POLICY IF EXISTS remix_quests_update_policy ON remix_quests;

CREATE POLICY remix_quests_update_policy ON remix_quests
  FOR UPDATE
  USING (
    creator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_subscriptions us 
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = auth.uid() 
      AND us.status = 'active'
      AND sp.id IN ('premium', 'church')
    )
  );

-- Add helpful error message for non-subscribers
COMMENT ON POLICY remix_quests_insert_policy ON remix_quests IS 
'Remix Story feature requires Premium or Church subscription plan';;