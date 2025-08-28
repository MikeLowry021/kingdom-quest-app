CREATE TABLE family_altars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT,
    bible_book TEXT NOT NULL,
    bible_chapter INTEGER NOT NULL,
    bible_verses TEXT NOT NULL,
    bible_translation TEXT DEFAULT 'NIV',
    scripture TEXT NOT NULL,
    activity_instructions TEXT,
    duration INTEGER,
    age_rating TEXT CHECK (age_rating IN ('all',
    'children',
    'youth',
    'adult')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);