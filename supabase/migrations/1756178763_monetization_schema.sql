-- Migration: monetization_schema
-- Created at: 1756178763

-- Monetization and Subscription System Schema
-- Created: 2025-08-26
-- Author: MiniMax Agent

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents (ZAR)
  price_annual INTEGER NOT NULL DEFAULT 0, -- in cents (ZAR) 
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly' or 'annual'
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  yoco_payment_method_id VARCHAR(255),
  yoco_customer_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Create church profiles table
CREATE TABLE IF NOT EXISTS church_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_name VARCHAR(255) NOT NULL,
  church_address TEXT,
  church_phone VARCHAR(50),
  church_email VARCHAR(255),
  denomination VARCHAR(100),
  pastor_name VARCHAR(255),
  church_size VARCHAR(50), -- 'small', 'medium', 'large', 'mega'
  -- Branding settings
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  secondary_color VARCHAR(7) DEFAULT '#1E40AF', -- Hex color
  custom_message TEXT,
  -- Privacy and compliance settings
  privacy_sla_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_sla_accepted_date TIMESTAMPTZ,
  data_retention_days INTEGER NOT NULL DEFAULT 365,
  allow_analytics BOOLEAN NOT NULL DEFAULT TRUE,
  allow_external_sharing BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_church_profile UNIQUE (user_id)
);

-- Create church members table (for church admin management)
CREATE TABLE IF NOT EXISTS church_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES church_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin', 'leader', 'member'
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_church_member UNIQUE (church_id, user_id)
);

-- Create payments table for Yoco integration
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  yoco_payment_id VARCHAR(255) NOT NULL,
  yoco_checkout_id VARCHAR(255),
  amount INTEGER NOT NULL, -- in cents (ZAR)
  currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
  status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_type VARCHAR(20) NOT NULL, -- 'subscription', 'donation', 'one_time'
  description TEXT,
  receipt_url VARCHAR(500),
  receipt_number VARCHAR(100),
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES church_profiles(id),
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount INTEGER NOT NULL, -- in cents (ZAR)
  currency VARCHAR(3) NOT NULL DEFAULT 'ZAR',
  donation_type VARCHAR(50) NOT NULL, -- 'general', 'tithe', 'offering', 'missions', 'building_fund'
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  dedication_message TEXT,
  tax_deductible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user analytics tracking table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id UUID REFERENCES church_profiles(id),
  event_type VARCHAR(100) NOT NULL, -- 'story_completed', 'quiz_taken', 'prayer_submitted', 'login', etc.
  event_data JSONB NOT NULL DEFAULT '{}',
  session_id VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, display_name, description, price_monthly, price_annual, features, sort_order) VALUES 
('free', 'Free', 'Free Plan', 'Access to core biblical stories, quizzes, and family altar features', 0, 0, '["Core Stories", "Basic Quizzes", "Family Altar", "Community Support"]', 1),
('premium', 'Premium', 'Premium Plan', 'All free features plus Deluxe Quest Packs, extra media content, and offline access', 4900, 4900*10, '["Everything in Free", "Deluxe Quest Packs", "Extra Media Content", "Offline Access", "Priority Support", "Advanced Analytics"]', 2),
('church', 'Church', 'Church Plan', 'All premium features plus admin dashboard, branding controls, and privacy SLA', 14900, 14900*10, '["Everything in Premium", "Admin Dashboard", "Custom Branding", "User Analytics", "Privacy SLA", "User Management", "Bulk Enrollment", "Dedicated Support"]', 3)
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_annual = EXCLUDED.price_annual,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Add plan_type to existing profiles table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'plan_type') THEN
        ALTER TABLE profiles ADD COLUMN plan_type VARCHAR(50) DEFAULT 'free';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_church_profiles_user_id ON church_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_church_members_church_id ON church_members(church_id);
CREATE INDEX IF NOT EXISTS idx_church_members_user_id ON church_members(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_church_id ON donations(church_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_church_id ON user_analytics(church_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- Create RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Subscription plans are viewable by everyone" ON subscription_plans
FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for church_profiles
CREATE POLICY "Users can view their own church profile" ON church_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own church profile" ON church_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own church profile" ON church_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all church profiles" ON church_profiles
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for church_members
CREATE POLICY "Church members can view members of their church" ON church_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM church_profiles cp 
    WHERE cp.id = church_id AND cp.user_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Church admins can manage members" ON church_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM church_profiles cp 
    WHERE cp.id = church_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all church members" ON church_members
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all payments" ON payments
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for donations
CREATE POLICY "Users can view their own donations" ON donations
FOR SELECT USING (
  auth.uid() = user_id OR 
  (
    church_id IS NOT NULL AND 
    EXISTS (
      SELECT 1 FROM church_profiles cp 
      WHERE cp.id = church_id AND cp.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Service role can manage all donations" ON donations
FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_analytics
CREATE POLICY "Users can view their own analytics" ON user_analytics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Church admins can view their members' analytics" ON user_analytics
FOR SELECT USING (
  church_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM church_profiles cp 
    WHERE cp.id = church_id AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all analytics" ON user_analytics
FOR ALL USING (auth.role() = 'service_role');

-- Create function to update subscription status
CREATE OR REPLACE FUNCTION update_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the plan_type in profiles table when subscription changes
  UPDATE profiles 
  SET plan_type = NEW.plan_id,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for subscription updates
DROP TRIGGER IF EXISTS trigger_update_subscription_status ON user_subscriptions;
CREATE TRIGGER trigger_update_subscription_status
  AFTER INSERT OR UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_status();

-- Create function to log user analytics
CREATE OR REPLACE FUNCTION log_user_analytics(
  p_user_id UUID,
  p_church_id UUID DEFAULT NULL,
  p_event_type VARCHAR(100),
  p_event_data JSONB DEFAULT '{}',
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO user_analytics (
    user_id, church_id, event_type, event_data, 
    session_id, user_agent, ip_address
  )
  VALUES (
    p_user_id, p_church_id, p_event_type, p_event_data,
    p_session_id, p_user_agent, p_ip_address
  )
  RETURNING id INTO analytics_id;
  
  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check feature access
CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_feature_name VARCHAR(100)
)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan VARCHAR(50);
  plan_features JSONB;
  has_access BOOLEAN := FALSE;
BEGIN
  -- Get user's current plan
  SELECT COALESCE(us.plan_id, p.plan_type, 'free')
  INTO user_plan
  FROM profiles p
  LEFT JOIN user_subscriptions us ON us.user_id = p.id AND us.status = 'active'
  WHERE p.id = p_user_id;
  
  -- Get plan features
  SELECT features INTO plan_features
  FROM subscription_plans
  WHERE id = user_plan AND is_active = true;
  
  -- Check if feature is included in plan
  IF plan_features IS NOT NULL THEN
    SELECT jsonb_array_length(jsonb_path_query_array(plan_features, '$[*] ? (@ like_regex "' || p_feature_name || '" flag "i")')) > 0
    INTO has_access;
  END IF;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;