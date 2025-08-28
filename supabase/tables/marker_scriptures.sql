CREATE TABLE marker_scriptures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    map_marker_id UUID NOT NULL,
    bible_book TEXT NOT NULL,
    bible_chapter INTEGER NOT NULL,
    bible_verses TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);