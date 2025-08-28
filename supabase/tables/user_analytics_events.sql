CREATE TABLE user_analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    age_tier TEXT,
    difficulty_level TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);