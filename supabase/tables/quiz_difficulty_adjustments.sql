CREATE TABLE quiz_difficulty_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    original_difficulty TEXT NOT NULL,
    adjusted_difficulty TEXT NOT NULL,
    adjustment_reason TEXT,
    performance_score DECIMAL(4,3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);