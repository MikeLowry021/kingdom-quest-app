CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    type TEXT NOT NULL CHECK (type IN ('image',
    'audio',
    'video',
    'document')),
    url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    filename TEXT,
    file_size INTEGER,
    duration NUMERIC,
    alt_text TEXT,
    caption TEXT,
    attribution TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);