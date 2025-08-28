CREATE TABLE age_mode_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    age_tier TEXT NOT NULL,
    ui_preferences JSONB DEFAULT '{}',
    content_restrictions JSONB DEFAULT '{}',
    accessibility_settings JSONB DEFAULT '{}',
    parental_controls JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);