CREATE TABLE discussion_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_altar_id UUID NOT NULL,
    question TEXT NOT NULL,
    age_group TEXT CHECK (age_group IN ('all',
    'children',
    'youth',
    'adult')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);