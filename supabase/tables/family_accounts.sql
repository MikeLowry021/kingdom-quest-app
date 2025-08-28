CREATE TABLE family_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL,
    child_id UUID NOT NULL,
    relationship_type TEXT DEFAULT 'parent-child',
    permissions JSONB DEFAULT '{}',
    oversight_level TEXT DEFAULT 'full',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);