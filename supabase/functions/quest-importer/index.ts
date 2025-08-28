Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        // Get user from authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header provided');
        }

        // Extract request data
        const requestData = await req.json();
        const { questpackData, importOptions = {}, validateOnly = false } = requestData;

        if (!questpackData) {
            throw new Error('Questpack data is required for import');
        }

        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Get user information
        const token = authHeader.replace('Bearer ', '');
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid authorization token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // Parse and validate questpack
        let questpack;
        try {
            questpack = typeof questpackData === 'string' ? JSON.parse(questpackData) : questpackData;
        } catch (parseError) {
            throw new Error('Invalid questpack format: Unable to parse JSON');
        }

        // Comprehensive validation
        const validationResult = await validateQuestpack(questpack);
        
        if (!validationResult.isValid) {
            return new Response(JSON.stringify({
                error: {
                    code: 'QUESTPACK_VALIDATION_FAILED',
                    message: 'Questpack validation failed',
                    validation_errors: validationResult.errors
                }
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Return validation result if validateOnly is true
        if (validateOnly) {
            return new Response(JSON.stringify({
                data: {
                    valid: true,
                    questpack_info: {
                        title: questpack.metadata?.title,
                        description: questpack.metadata?.description,
                        original_quest: questpack.original_quest?.title,
                        created_at: questpack.metadata?.created_at,
                        version_count: questpack.version_history?.length || 0,
                        has_media: (questpack.media_assets?.length || 0) > 0,
                        moderation_status: questpack.moderation_status?.approved || false
                    },
                    validation_warnings: validationResult.warnings
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Import questpack to database
        const importResult = await importQuestpack({
            questpack,
            userId,
            importOptions,
            supabaseUrl,
            serviceRoleKey
        });

        // Return import result
        const result = {
            importId: importResult.importId,
            remixId: importResult.remixId,
            status: 'imported',
            imported_quest: {
                title: questpack.metadata.title,
                description: questpack.metadata.description,
                theme: questpack.metadata.theme,
                age_tier: questpack.metadata.age_tier
            },
            attribution: {
                original_quest: questpack.original_quest.title,
                imported_by: userId,
                import_timestamp: new Date().toISOString()
            },
            next_steps: {
                requires_moderation: !questpack.moderation_status?.approved,
                can_edit: true,
                can_share: questpack.moderation_status?.approved
            },
            validation_summary: {
                errors_fixed: validationResult.errors.length,
                warnings: validationResult.warnings
            }
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Quest import error:', error);

        const errorResponse = {
            error: {
                code: 'QUEST_IMPORT_ERROR',
                message: error.message,
                details: 'Failed to import questpack'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Validate questpack structure and content
async function validateQuestpack(questpack) {
    const errors = [];
    const warnings = [];
    
    try {
        // Check required fields
        const requiredFields = {
            'format_version': questpack.format_version,
            'package_type': questpack.package_type,
            'metadata': questpack.metadata,
            'original_quest': questpack.original_quest,
            'remix_content': questpack.remix_content
        };
        
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) {
                errors.push(`Missing required field: ${field}`);
            }
        }
        
        // Validate format version
        if (questpack.format_version && questpack.format_version !== '1.0') {
            warnings.push(`Questpack format version ${questpack.format_version} may not be fully compatible`);
        }
        
        // Validate package type
        if (questpack.package_type !== 'kingdomquest-remix') {
            errors.push(`Invalid package type: ${questpack.package_type}`);
        }
        
        // Validate metadata
        if (questpack.metadata) {
            const requiredMetadata = ['title', 'description', 'age_tier'];
            for (const field of requiredMetadata) {
                if (!questpack.metadata[field]) {
                    errors.push(`Missing required metadata field: ${field}`);
                }
            }
            
            // Validate age tier
            const validAgeTiers = ['early-childhood', 'elementary', 'middle-school', 'high-school'];
            if (questpack.metadata.age_tier && !validAgeTiers.includes(questpack.metadata.age_tier)) {
                errors.push(`Invalid age tier: ${questpack.metadata.age_tier}`);
            }
        }
        
        // Validate original quest attribution
        if (questpack.original_quest) {
            const requiredOriginalFields = ['id', 'title', 'attribution'];
            for (const field of requiredOriginalFields) {
                if (!questpack.original_quest[field]) {
                    errors.push(`Missing original quest field: ${field}`);
                }
            }
        }
        
        // Validate remix content
        if (questpack.remix_content) {
            if (!questpack.remix_content.story_content) {
                errors.push('Missing story content in remix');
            } else {
                // Content length validation
                const contentLength = questpack.remix_content.story_content.length;
                if (contentLength < 100) {
                    warnings.push('Story content seems very short (less than 100 characters)');
                } else if (contentLength > 10000) {
                    warnings.push('Story content is very long (over 10,000 characters)');
                }
            }
        }
        
        // Validate integrity hash if present
        if (questpack.integrity_hash) {
            try {
                const questpackString = JSON.stringify({
                    metadata: questpack.metadata,
                    remix_content: questpack.remix_content,
                    original_quest: questpack.original_quest
                });
                
                const encoder = new TextEncoder();
                const data = encoder.encode(questpackString);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                
                if (calculatedHash !== questpack.integrity_hash) {
                    errors.push('Integrity hash validation failed - questpack may have been modified');
                }
            } catch (hashError) {
                warnings.push('Could not verify integrity hash');
            }
        }
        
        // Check moderation status
        if (questpack.moderation_status && !questpack.moderation_status.approved) {
            warnings.push('Questpack has not been fully approved by moderation system');
        }
        
        // Validate media assets if present
        if (questpack.media_assets && Array.isArray(questpack.media_assets)) {
            for (let i = 0; i < questpack.media_assets.length; i++) {
                const asset = questpack.media_assets[i];
                if (!asset.filename || !asset.file_type) {
                    warnings.push(`Media asset ${i} missing required fields`);
                }
            }
        }
        
        // File size validation
        const questpackSize = JSON.stringify(questpack).length;
        if (questpackSize > 5 * 1024 * 1024) { // 5MB limit
            errors.push('Questpack exceeds maximum size limit (5MB)');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
        
    } catch (validationError) {
        return {
            isValid: false,
            errors: [`Validation failed: ${validationError.message}`],
            warnings: []
        };
    }
}

// Import questpack to database
async function importQuestpack({ questpack, userId, importOptions, supabaseUrl, serviceRoleKey }) {
    try {
        // Create remix quest record
        const remixData = {
            title: questpack.metadata.title,
            description: questpack.metadata.description,
            theme: questpack.metadata.theme,
            age_tier: questpack.metadata.age_tier,
            target_length: questpack.metadata.target_length,
            remix_type: questpack.metadata.remix_type || 'community-import',
            content: questpack.remix_content.story_content,
            custom_elements: questpack.remix_content.custom_elements || {},
            theme_modifications: questpack.remix_content.theme_modifications || {},
            age_adaptations: questpack.remix_content.age_adaptations || {},
            length_adjustments: questpack.remix_content.length_adjustments || {},
            original_quest_id: questpack.original_quest.id,
            created_by: userId,
            imported_from_questpack: true,
            original_creator: questpack.metadata.created_by,
            import_timestamp: new Date().toISOString(),
            moderation_status: questpack.moderation_status?.approved ? 'approved' : 'pending'
        };

        // Insert remix quest
        const remixResponse = await fetch(`${supabaseUrl}/rest/v1/remix_quests`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(remixData)
        });

        if (!remixResponse.ok) {
            const errorText = await remixResponse.text();
            throw new Error(`Failed to create remix quest: ${errorText}`);
        }

        const remixResult = await remixResponse.json();
        const remixId = remixResult[0].id;

        // Import version history if present
        if (questpack.version_history && questpack.version_history.length > 0) {
            const versionPromises = questpack.version_history.map(async (version, index) => {
                const versionData = {
                    remix_id: remixId,
                    version_number: version.version_number || index + 1,
                    content: questpack.remix_content.story_content, // Use current content for all versions
                    changes_description: version.changes_description || 'Imported from questpack',
                    content_hash: version.content_hash,
                    created_by: userId,
                    created_at: version.created_at || new Date().toISOString()
                };

                return fetch(`${supabaseUrl}/rest/v1/quest_versions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(versionData)
                });
            });

            await Promise.all(versionPromises);
        }

        // Import moderation reviews if present
        if (questpack.moderation_status?.reviews) {
            const reviewPromises = questpack.moderation_status.reviews.map(async (review) => {
                const reviewData = {
                    remix_id: remixId,
                    moderator_type: review.moderator_type,
                    status: review.status,
                    confidence_level: review.confidence_level,
                    concerns: review.concerns || [],
                    reviewed_at: review.reviewed_at,
                    imported_review: true
                };

                return fetch(`${supabaseUrl}/rest/v1/moderation_reviews`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reviewData)
                });
            });

            await Promise.all(reviewPromises);
        }

        // Create import record
        const importData = {
            remix_id: remixId,
            imported_by: userId,
            questpack_title: questpack.metadata.title,
            original_creator: questpack.metadata.created_by,
            questpack_version: questpack.format_version,
            import_options: importOptions,
            imported_at: new Date().toISOString(),
            status: 'completed'
        };

        const importResponse = await fetch(`${supabaseUrl}/rest/v1/questpack_imports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(importData)
        });

        if (!importResponse.ok) {
            console.warn('Failed to create import record, but remix was created successfully');
        }

        const importResult = await importResponse.json();

        return {
            importId: importResult[0]?.id,
            remixId: remixId,
            status: 'success'
        };

    } catch (importError) {
        console.error('Import process error:', importError);
        throw new Error(`Failed to import questpack: ${importError.message}`);
    }
}