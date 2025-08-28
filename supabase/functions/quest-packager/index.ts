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
        const { remixId, includeMedia = true, exportType = 'questpack' } = requestData;

        if (!remixId) {
            throw new Error('Remix ID is required for packaging');
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

        // Fetch remix quest data
        const remixResponse = await fetch(`${supabaseUrl}/rest/v1/remix_quests?id=eq.${remixId}&select=*,original_quest:quests(*),versions:quest_versions(*)`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        if (!remixResponse.ok) {
            throw new Error('Failed to fetch remix quest data');
        }

        const remixData = await remixResponse.json();
        if (!remixData || remixData.length === 0) {
            throw new Error('Remix quest not found');
        }

        const remix = remixData[0];

        // Verify user has access to this remix
        if (remix.created_by !== userId) {
            throw new Error('Unauthorized access to remix quest');
        }

        // Create .questpack bundle structure
        const questpack = await createQuestpackBundle({
            remix,
            originalQuest: remix.original_quest,
            versions: remix.versions,
            includeMedia,
            supabaseUrl,
            serviceRoleKey
        });

        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${remix.title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.questpack`;

        // Save export record to database
        const exportData = {
            remix_id: remixId,
            exported_by: userId,
            filename: fileName,
            file_size: JSON.stringify(questpack).length,
            export_type: exportType,
            include_media: includeMedia,
            questpack_version: '1.0',
            exported_at: new Date().toISOString(),
            download_count: 0
        };

        const exportResponse = await fetch(`${supabaseUrl}/rest/v1/questpack_exports`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(exportData)
        });

        if (!exportResponse.ok) {
            const errorText = await exportResponse.text();
            console.error('Failed to save export record:', errorText);
            throw new Error('Failed to save export record');
        }

        const savedExport = await exportResponse.json();

        // Prepare questpack for download
        const questpackBlob = JSON.stringify(questpack, null, 2);

        // Return packaged quest data
        const result = {
            exportId: savedExport[0]?.id,
            filename: fileName,
            questpack,
            fileSize: questpackBlob.length,
            metadata: {
                original_title: remix.original_quest?.title,
                remix_title: remix.title,
                created_by: remix.created_by,
                created_at: remix.created_at,
                version_count: remix.versions?.length || 0,
                export_timestamp: new Date().toISOString(),
                questpack_version: '1.0'
            }
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Quest packaging error:', error);

        const errorResponse = {
            error: {
                code: 'QUEST_PACKAGING_ERROR',
                message: error.message,
                details: 'Failed to package quest for export'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Create .questpack bundle structure
async function createQuestpackBundle({ remix, originalQuest, versions, includeMedia, supabaseUrl, serviceRoleKey }) {
    try {
        // Base questpack structure
        const questpack = {
            format_version: '1.0',
            package_type: 'kingdomquest-remix',
            created_at: new Date().toISOString(),
            metadata: {
                title: remix.title,
                description: remix.description,
                theme: remix.theme,
                age_tier: remix.age_tier,
                target_length: remix.target_length,
                remix_type: remix.remix_type,
                created_by: remix.created_by,
                created_at: remix.created_at,
                updated_at: remix.updated_at
            },
            original_quest: {
                id: originalQuest?.id,
                title: originalQuest?.title,
                description: originalQuest?.description,
                attribution: {
                    original_author: originalQuest?.created_by,
                    original_created_at: originalQuest?.created_at,
                    remix_attribution: `Remixed from "${originalQuest?.title}" by ${remix.created_by}`,
                    license: 'KingdomQuest Remix License v1.0'
                }
            },
            remix_content: {
                story_content: remix.content,
                custom_elements: remix.custom_elements || {},
                theme_modifications: remix.theme_modifications || {},
                age_adaptations: remix.age_adaptations || {},
                length_adjustments: remix.length_adjustments || {}
            },
            version_history: [],
            media_assets: [],
            moderation_status: {
                theology_guard: 'pending',
                safety_moderator: 'pending',
                last_reviewed: null,
                approved: false
            },
            technical_metadata: {
                export_timestamp: new Date().toISOString(),
                source_platform: 'KingdomQuest',
                compatibility_version: '1.0',
                file_format: 'json',
                compression: 'none'
            }
        };

        // Add version history if available
        if (versions && versions.length > 0) {
            questpack.version_history = versions.map(version => ({
                version_number: version.version_number,
                created_at: version.created_at,
                changes_description: version.changes_description,
                content_hash: version.content_hash,
                created_by: version.created_by
            }));
        }

        // Add media assets if requested
        if (includeMedia) {
            try {
                // Fetch media assets related to the remix
                const mediaResponse = await fetch(`${supabaseUrl}/rest/v1/quest_media?quest_id=eq.${remix.original_quest_id}`, {
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey
                    }
                });

                if (mediaResponse.ok) {
                    const mediaAssets = await mediaResponse.json();
                    questpack.media_assets = mediaAssets.map(asset => ({
                        id: asset.id,
                        filename: asset.filename,
                        file_type: asset.file_type,
                        file_size: asset.file_size,
                        storage_path: asset.storage_path,
                        description: asset.description,
                        usage_context: asset.usage_context
                    }));
                }
            } catch (mediaError) {
                console.warn('Failed to fetch media assets:', mediaError);
                questpack.media_assets = [];
            }
        }

        // Fetch latest moderation status
        try {
            const moderationResponse = await fetch(`${supabaseUrl}/rest/v1/moderation_reviews?remix_id=eq.${remix.id}&order=reviewed_at.desc&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (moderationResponse.ok) {
                const moderationReviews = await moderationResponse.json();
                const theologyReview = moderationReviews.find(r => r.moderator_type === 'theology-guard');
                const safetyReview = moderationReviews.find(r => r.moderator_type === 'safety-moderator');

                questpack.moderation_status = {
                    theology_guard: theologyReview?.status || 'pending',
                    safety_moderator: safetyReview?.status || 'pending',
                    last_reviewed: moderationReviews[0]?.reviewed_at || null,
                    approved: theologyReview?.status === 'APPROVED' && safetyReview?.status === 'APPROVED',
                    reviews: moderationReviews.map(review => ({
                        moderator_type: review.moderator_type,
                        status: review.status,
                        confidence_level: review.confidence_level,
                        reviewed_at: review.reviewed_at,
                        concerns: review.concerns
                    }))
                };
            }
        } catch (moderationError) {
            console.warn('Failed to fetch moderation status:', moderationError);
        }

        // Add security hash for integrity verification
        const questpackString = JSON.stringify({
            metadata: questpack.metadata,
            remix_content: questpack.remix_content,
            original_quest: questpack.original_quest
        });
        
        // Simple hash using crypto API
        const encoder = new TextEncoder();
        const data = encoder.encode(questpackString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        questpack.integrity_hash = hashHex;

        return questpack;

    } catch (error) {
        console.error('Questpack bundle creation error:', error);
        throw new Error(`Failed to create questpack bundle: ${error.message}`);
    }
}