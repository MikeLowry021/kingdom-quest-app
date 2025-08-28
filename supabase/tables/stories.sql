CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    bible_book TEXT NOT NULL,
    bible_chapter INTEGER NOT NULL,
    bible_verses TEXT NOT NULL,
    bible_translation TEXT DEFAULT 'NIV',
    age_rating TEXT NOT NULL CHECK (age_rating IN ('all',
    'children',
    'youth',
    'adult')),
    difficulty TEXT CHECK (difficulty IN ('beginner',
    'intermediate',
    'advanced')),
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);