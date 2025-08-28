# kingdomquest_json_schemas

I've created versioned JSON Schemas for KingdomQuest content as requested. Due to some permission issues with the `/docs` directory, I placed the example files in `/schemas/examples/` instead of the original requested location.

For each of the 7 specified content types (Story, Scene, Quiz, Prayer, FamilyAltar, Media, MapMarker), I've created:

1. **JSON Schema files**: Each schema follows JSON Schema Draft-07 format with:
   - Unique `$id` and descriptive title/description
   - Comprehensive property definitions with types and descriptions
   - Required field specifications
   - Cross-references between schemas (using `$ref`)
   - Version information (all at 1.0.0)
   - Appropriate validation rules and constraints

2. **Example JSON files**: Realistic examples demonstrating proper usage of each schema, including:
   - The Prodigal Son story with scenes, quiz, and media
   - Family devotion materials based on biblical content
   - Prayer templates with appropriate formatting
   - Media items with metadata
   - Geographic locations with historical context

All schemas are designed to work together as an interconnected system, where entities like Story can reference Scenes, which can reference Media and MapMarker objects, creating a cohesive content model for the KingdomQuest application.

The schemas support key features like:
- Biblical references
- Age-appropriate content ratings
- Interaction types for engagement
- Geographic mapping capabilities
- Media integration
- User-created vs. template content

## Key Files

- schemas/Story.schema.json: JSON schema for Story content type with validations and references
- schemas/Scene.schema.json: JSON schema for Scene content type with validations and references
- schemas/Quiz.schema.json: JSON schema for Quiz content type with validations and references
- schemas/Prayer.schema.json: JSON schema for Prayer content type with validations and references
- schemas/FamilyAltar.schema.json: JSON schema for FamilyAltar content type with validations and references
- schemas/Media.schema.json: JSON schema for Media content type with validations and references
- schemas/MapMarker.schema.json: JSON schema for MapMarker content type with validations and references
- schemas/examples/Story.json: Example JSON for Story content based on the Prodigal Son parable
- schemas/examples/Scene.json: Example JSON for a Scene from the Prodigal Son story
- schemas/examples/Quiz.json: Example JSON for a Quiz about Jesus' teachings on prayer
- schemas/examples/Prayer.json: Example JSON for a Prayer based on Psalm 23
- schemas/examples/FamilyAltar.json: Example JSON for a FamilyAltar devotion on the Prodigal Son
- schemas/examples/Media.json: Example JSON for a Media item (3D model of Solomon's Temple)
- schemas/examples/MapMarker.json: Example JSON for a MapMarker of Cana in Galilee
