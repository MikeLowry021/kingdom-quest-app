CREATE TABLE media_associations (
    table_name TEXT NOT NULL,
    entity_id UUID NOT NULL,
    media_id UUID NOT NULL,
    PRIMARY KEY (table_name,
    entity_id,
    media_id)
);