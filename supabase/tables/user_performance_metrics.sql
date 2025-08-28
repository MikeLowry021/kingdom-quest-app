CREATE TABLE user_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category TEXT NOT NULL,
    accuracy_score DECIMAL(4,3) NOT NULL DEFAULT 0.000,
    total_attempts INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    rolling_accuracy DECIMAL(4,3) DEFAULT 0.000,
    difficulty_level TEXT DEFAULT 'beginner',
    created_at TIMESTAMPTZ DEFAULT NOW()
);