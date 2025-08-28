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
        const { action, userId, childId, parentId, contentData, controlSettings } = await req.json();

        if (!action) {
            throw new Error('Action is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        let result;

        switch (action) {
            case 'check_content_access':
                if (!userId || !contentData) {
                    throw new Error('userId and contentData are required for content access check');
                }
                result = await checkContentAccess({
                    userId,
                    contentData,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'rate_content':
                if (!contentData) {
                    throw new Error('contentData is required for content rating');
                }
                result = await rateContent({
                    contentData,
                    raterId: userId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'setup_parental_controls':
                if (!parentId || !childId) {
                    throw new Error('parentId and childId are required for parental controls setup');
                }
                result = await setupParentalControls({
                    parentId,
                    childId,
                    controlSettings,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_parental_controls':
                if (!parentId) {
                    throw new Error('parentId is required to get parental controls');
                }
                result = await getParentalControls({
                    parentId,
                    childId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'update_parental_controls':
                if (!parentId || !childId) {
                    throw new Error('parentId and childId are required for updating parental controls');
                }
                result = await updateParentalControls({
                    parentId,
                    childId,
                    controlSettings,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'get_user_age_profile':
                if (!userId) {
                    throw new Error('userId is required to get age profile');
                }
                result = await getUserAgeProfile({
                    userId,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            case 'verify_age_for_content':
                if (!userId || !contentData) {
                    throw new Error('userId and contentData are required for age verification');
                }
                result = await verifyAgeForContent({
                    userId,
                    contentData,
                    supabaseUrl,
                    serviceRoleKey
                });
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Age gating error:', error);

        const errorResponse = {
            error: {
                code: 'AGE_GATING_ERROR',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Check if user can access specific content based on age and parental controls
async function checkContentAccess({ userId, contentData, supabaseUrl, serviceRoleKey }) {
    const { contentId, contentType, requestedRating } = contentData;

    // Get user's age profile and parental controls
    const userProfile = await getUserAgeProfile({ userId, supabaseUrl, serviceRoleKey });
    
    // Get content age rating
    const contentRating = await getContentRating({ contentId, contentType, supabaseUrl, serviceRoleKey });
    
    // Check basic age restrictions
    const ageAccessResult = checkAgeBasedAccess(userProfile, contentRating);
    
    // For child accounts, check parental controls
    let parentalControlResult = { allowed: true, reason: null };
    if (userProfile.isChild && userProfile.parentId) {
        parentalControlResult = await checkParentalControls({
            parentId: userProfile.parentId,
            childId: userId,
            contentRating,
            contentType,
            supabaseUrl,
            serviceRoleKey
        });
    }
    
    const accessAllowed = ageAccessResult.allowed && parentalControlResult.allowed;
    
    return {
        userId,
        contentId,
        contentType,
        accessAllowed,
        contentRating: contentRating.rating,
        userAgeGroup: userProfile.ageGroup,
        restrictions: {
            age_based: !ageAccessResult.allowed ? ageAccessResult.reason : null,
            parental_control: !parentalControlResult.allowed ? parentalControlResult.reason : null
        },
        parentalOverrideAvailable: userProfile.isChild && parentalControlResult.overrideAvailable,
        checkedAt: new Date().toISOString()
    };
}

// Rate content for age appropriateness
async function rateContent({ contentData, raterId, supabaseUrl, serviceRoleKey }) {
    const {
        contentId,
        contentType,
        ageRating,
        ratingCriteria,
        ratingReason,
        automaticRating
    } = contentData;

    // Validate age rating
    const validRatings = ['all_ages', 'teen_13_plus', 'adult_18_plus', 'parent_guardian'];
    if (!validRatings.includes(ageRating)) {
        throw new Error(`Invalid age rating. Must be one of: ${validRatings.join(', ')}`);
    }

    const now = new Date().toISOString();

    // Check if rating already exists
    const existingRatingResponse = await fetch(
        `${supabaseUrl}/rest/v1/content_age_ratings?content_id=eq.${contentId}&content_type=eq.${contentType}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    const ratingRecord = {
        content_id: contentId,
        content_type: contentType,
        age_rating: ageRating,
        rating_criteria: {
            violence_level: ratingCriteria?.violenceLevel || 0,
            scary_content: ratingCriteria?.scaryContent || 0,
            complex_themes: ratingCriteria?.complexThemes || 0,
            language_complexity: ratingCriteria?.languageComplexity || 0,
            emotional_intensity: ratingCriteria?.emotionalIntensity || 0,
            educational_value: ratingCriteria?.educationalValue || 5
        },
        rated_by: raterId,
        rating_reason: ratingReason || '',
        automatic_rating: !!automaticRating,
        created_at: now,
        updated_at: now
    };

    let ratingResponse;
    if (existingRatingResponse.ok) {
        const existingRatings = await existingRatingResponse.json();
        if (existingRatings.length > 0) {
            // Update existing rating
            ratingResponse = await fetch(
                `${supabaseUrl}/rest/v1/content_age_ratings?content_id=eq.${contentId}&content_type=eq.${contentType}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(ratingRecord)
                }
            );
        } else {
            // Create new rating
            ratingResponse = await fetch(`${supabaseUrl}/rest/v1/content_age_ratings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(ratingRecord)
            });
        }
    }

    if (!ratingResponse || !ratingResponse.ok) {
        const errorText = await ratingResponse?.text();
        throw new Error(`Failed to rate content: ${errorText}`);
    }

    const savedRating = await ratingResponse.json();
    const rating = savedRating[0];

    return {
        ratingId: rating.id,
        contentId: rating.content_id,
        contentType: rating.content_type,
        ageRating: rating.age_rating,
        ratedBy: rating.rated_by,
        automaticRating: rating.automatic_rating,
        ratedAt: rating.created_at,
        message: `Content has been rated as ${ageRating}`
    };
}

// Setup parental controls for a child account
async function setupParentalControls({ parentId, childId, controlSettings, supabaseUrl, serviceRoleKey }) {
    // Verify parental authority
    const parentalAuth = await verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey });
    if (!parentalAuth.isAuthorized) {
        throw new Error('Parental authority could not be verified');
    }

    const now = new Date().toISOString();

    // Create parental control records for different restriction types
    const controlRecords = [];

    // Content rating restrictions
    if (controlSettings.contentRating) {
        controlRecords.push({
            user_id: parentId,
            child_id: childId,
            restriction_type: 'content_rating',
            restriction_settings: {
                max_rating: controlSettings.contentRating.maxRating || 'all_ages',
                allowed_ratings: controlSettings.contentRating.allowedRatings || ['all_ages'],
                block_unrated: controlSettings.contentRating.blockUnrated !== false,
                require_approval: controlSettings.contentRating.requireApproval || false
            },
            parent_override_allowed: controlSettings.contentRating.parentOverride !== false,
            active: true,
            created_at: now,
            updated_at: now
        });
    }

    // Time limit restrictions
    if (controlSettings.timeLimits) {
        controlRecords.push({
            user_id: parentId,
            child_id: childId,
            restriction_type: 'time_limit',
            restriction_settings: {
                daily_minutes: controlSettings.timeLimits.dailyMinutes || 60,
                session_minutes: controlSettings.timeLimits.sessionMinutes || 30,
                allowed_hours: controlSettings.timeLimits.allowedHours || { start: 9, end: 18 },
                weekend_extension: controlSettings.timeLimits.weekendExtension || 30,
                break_reminders: controlSettings.timeLimits.breakReminders !== false
            },
            parent_override_allowed: controlSettings.timeLimits.parentOverride !== false,
            active: true,
            created_at: now,
            updated_at: now
        });
    }

    // Communication restrictions
    if (controlSettings.communication) {
        controlRecords.push({
            user_id: parentId,
            child_id: childId,
            restriction_type: 'communication',
            restriction_settings: {
                allow_private_messages: controlSettings.communication.allowPrivateMessages || false,
                allow_group_discussions: controlSettings.communication.allowGroupDiscussions !== false,
                require_moderation: controlSettings.communication.requireModeration !== false,
                block_adult_contact: controlSettings.communication.blockAdultContact !== false,
                whitelist_only: controlSettings.communication.whitelistOnly || false
            },
            parent_override_allowed: controlSettings.communication.parentOverride !== false,
            active: true,
            created_at: now,
            updated_at: now
        });
    }

    // Feature access restrictions
    if (controlSettings.featureAccess) {
        controlRecords.push({
            user_id: parentId,
            child_id: childId,
            restriction_type: 'feature_access',
            restriction_settings: {
                content_creation: controlSettings.featureAccess.contentCreation !== false,
                content_sharing: controlSettings.featureAccess.contentSharing || false,
                community_participation: controlSettings.featureAccess.communityParticipation !== false,
                progress_sharing: controlSettings.featureAccess.progressSharing !== false,
                external_links: controlSettings.featureAccess.externalLinks || false
            },
            parent_override_allowed: controlSettings.featureAccess.parentOverride !== false,
            active: true,
            created_at: now,
            updated_at: now
        });
    }

    // Insert all control records
    const results = [];
    for (const record of controlRecords) {
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/parental_controls`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(record)
        });

        if (insertResponse.ok) {
            const savedRecord = await insertResponse.json();
            results.push(savedRecord[0]);
        } else {
            const errorText = await insertResponse.text();
            console.warn(`Failed to create ${record.restriction_type} control: ${errorText}`);
        }
    }

    return {
        parentId,
        childId,
        controlsCreated: results.length,
        controlTypes: results.map(r => r.restriction_type),
        setupAt: now,
        message: `Parental controls have been successfully configured for child account`
    };
}

// Get parental controls for a child account
async function getParentalControls({ parentId, childId, supabaseUrl, serviceRoleKey }) {
    const controlsResponse = await fetch(
        `${supabaseUrl}/rest/v1/parental_controls?user_id=eq.${parentId}&child_id=eq.${childId}&active=eq.true`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!controlsResponse.ok) {
        throw new Error('Failed to retrieve parental controls');
    }

    const controls = await controlsResponse.json();

    // Organize controls by type
    const organizedControls = {
        contentRating: null,
        timeLimits: null,
        communication: null,
        featureAccess: null
    };

    controls.forEach(control => {
        switch (control.restriction_type) {
            case 'content_rating':
                organizedControls.contentRating = {
                    id: control.id,
                    settings: control.restriction_settings,
                    parentOverride: control.parent_override_allowed,
                    updatedAt: control.updated_at
                };
                break;
            case 'time_limit':
                organizedControls.timeLimits = {
                    id: control.id,
                    settings: control.restriction_settings,
                    parentOverride: control.parent_override_allowed,
                    updatedAt: control.updated_at
                };
                break;
            case 'communication':
                organizedControls.communication = {
                    id: control.id,
                    settings: control.restriction_settings,
                    parentOverride: control.parent_override_allowed,
                    updatedAt: control.updated_at
                };
                break;
            case 'feature_access':
                organizedControls.featureAccess = {
                    id: control.id,
                    settings: control.restriction_settings,
                    parentOverride: control.parent_override_allowed,
                    updatedAt: control.updated_at
                };
                break;
        }
    });

    return {
        parentId,
        childId,
        controls: organizedControls,
        totalControls: controls.length,
        retrievedAt: new Date().toISOString()
    };
}

// Update parental controls
async function updateParentalControls({ parentId, childId, controlSettings, supabaseUrl, serviceRoleKey }) {
    // Verify parental authority
    const parentalAuth = await verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey });
    if (!parentalAuth.isAuthorized) {
        throw new Error('Parental authority could not be verified');
    }

    const now = new Date().toISOString();
    const updatedControls = [];

    // Update each control type if provided
    for (const [controlType, settings] of Object.entries(controlSettings)) {
        if (!settings) continue;

        const restrictionType = {
            contentRating: 'content_rating',
            timeLimits: 'time_limit',
            communication: 'communication',
            featureAccess: 'feature_access'
        }[controlType];

        if (!restrictionType) continue;

        const updateResponse = await fetch(
            `${supabaseUrl}/rest/v1/parental_controls?user_id=eq.${parentId}&child_id=eq.${childId}&restriction_type=eq.${restrictionType}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    restriction_settings: settings,
                    updated_at: now
                })
            }
        );

        if (updateResponse.ok) {
            const updatedRecord = await updateResponse.json();
            if (updatedRecord.length > 0) {
                updatedControls.push(restrictionType);
            }
        }
    }

    return {
        parentId,
        childId,
        updatedControls,
        updatedAt: now,
        message: `Parental controls have been updated for ${updatedControls.join(', ')}`
    };
}

// Get user's age profile and restrictions
async function getUserAgeProfile({ userId, supabaseUrl, serviceRoleKey }) {
    // Get user profile
    const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!profileResponse.ok) {
        throw new Error('User profile not found');
    }

    const profiles = await profileResponse.json();
    if (profiles.length === 0) {
        throw new Error('User profile not found');
    }

    const profile = profiles[0];
    const isChild = !!profile.parent_id;

    return {
        userId: profile.id,
        ageGroup: profile.age_group,
        isChild,
        parentId: profile.parent_id,
        ageProfileRetrievedAt: new Date().toISOString()
    };
}

// Verify age requirements for specific content
async function verifyAgeForContent({ userId, contentData, supabaseUrl, serviceRoleKey }) {
    const { contentId, contentType, minimumAge } = contentData;

    // Get user age profile
    const userProfile = await getUserAgeProfile({ userId, supabaseUrl, serviceRoleKey });
    
    // Get content rating if not provided
    let contentRating = null;
    if (contentId && contentType) {
        contentRating = await getContentRating({ contentId, contentType, supabaseUrl, serviceRoleKey });
    }

    // Determine age requirements
    let requiredAge = minimumAge;
    if (contentRating) {
        const ratingAgeMap = {
            'all_ages': 0,
            'teen_13_plus': 13,
            'adult_18_plus': 18,
            'parent_guardian': 18
        };
        requiredAge = ratingAgeMap[contentRating.rating] || 0;
    }

    // Age verification logic
    const ageVerificationResult = {
        verified: false,
        reason: 'Unknown age or content requirements',
        requiresParentalConsent: false,
        parentalOverrideAvailable: false
    };

    // For child accounts, check if parental consent exists
    if (userProfile.isChild) {
        if (requiredAge <= 13 || (contentRating && contentRating.rating === 'all_ages')) {
            ageVerificationResult.verified = true;
            ageVerificationResult.reason = 'Content is appropriate for child account';
        } else {
            ageVerificationResult.requiresParentalConsent = true;
            ageVerificationResult.parentalOverrideAvailable = true;
            ageVerificationResult.reason = 'Content requires parental consent for child account';
        }
    } else {
        // Adult account - check age group
        const ageGroupMap = {
            'child': 12,
            'youth': 16,
            'adult': 18
        };
        const estimatedAge = ageGroupMap[userProfile.ageGroup] || 18;
        
        if (estimatedAge >= requiredAge) {
            ageVerificationResult.verified = true;
            ageVerificationResult.reason = 'User meets age requirements';
        } else {
            ageVerificationResult.reason = `Content requires minimum age of ${requiredAge}`;
        }
    }

    return {
        userId,
        contentId,
        contentType,
        requiredAge,
        userAgeGroup: userProfile.ageGroup,
        isChildAccount: userProfile.isChild,
        ageVerification: ageVerificationResult,
        verifiedAt: new Date().toISOString()
    };
}

// Helper functions
async function getContentRating({ contentId, contentType, supabaseUrl, serviceRoleKey }) {
    const ratingResponse = await fetch(
        `${supabaseUrl}/rest/v1/content_age_ratings?content_id=eq.${contentId}&content_type=eq.${contentType}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (ratingResponse.ok) {
        const ratings = await ratingResponse.json();
        if (ratings.length > 0) {
            return {
                rating: ratings[0].age_rating,
                criteria: ratings[0].rating_criteria,
                ratedAt: ratings[0].created_at,
                automatic: ratings[0].automatic_rating
            };
        }
    }

    // Default rating if none exists
    return {
        rating: 'all_ages',
        criteria: {},
        ratedAt: null,
        automatic: true
    };
}

function checkAgeBasedAccess(userProfile, contentRating) {
    const ageGroupLimits = {
        'child': ['all_ages'],
        'youth': ['all_ages', 'teen_13_plus'],
        'adult': ['all_ages', 'teen_13_plus', 'adult_18_plus', 'parent_guardian']
    };

    const allowedRatings = ageGroupLimits[userProfile.ageGroup] || ['all_ages'];
    const allowed = allowedRatings.includes(contentRating.rating);

    return {
        allowed,
        reason: allowed ? null : `Content rating ${contentRating.rating} not allowed for age group ${userProfile.ageGroup}`
    };
}

async function checkParentalControls({ parentId, childId, contentRating, contentType, supabaseUrl, serviceRoleKey }) {
    // Get parental controls
    const controlsResponse = await fetch(
        `${supabaseUrl}/rest/v1/parental_controls?user_id=eq.${parentId}&child_id=eq.${childId}&restriction_type=eq.content_rating&active=eq.true`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    if (!controlsResponse.ok) {
        // No parental controls found - allow by default
        return { allowed: true, reason: null, overrideAvailable: false };
    }

    const controls = await controlsResponse.json();
    if (controls.length === 0) {
        // No content rating controls - allow by default
        return { allowed: true, reason: null, overrideAvailable: false };
    }

    const contentControl = controls[0];
    const settings = contentControl.restriction_settings;

    // Check if content rating is allowed
    const allowedRatings = settings.allowed_ratings || ['all_ages'];
    const maxRating = settings.max_rating || 'all_ages';
    
    const ratingOrder = ['all_ages', 'teen_13_plus', 'adult_18_plus', 'parent_guardian'];
    const contentRatingIndex = ratingOrder.indexOf(contentRating.rating);
    const maxRatingIndex = ratingOrder.indexOf(maxRating);
    
    let allowed = allowedRatings.includes(contentRating.rating) && contentRatingIndex <= maxRatingIndex;
    
    // Check if unrated content is blocked
    if (settings.block_unrated && !contentRating.ratedAt) {
        allowed = false;
    }
    
    // Check if approval is required
    if (settings.require_approval) {
        // This would need additional logic to check if approval has been granted
        // For now, we'll assume approval is needed
        allowed = false;
    }

    return {
        allowed,
        reason: allowed ? null : 'Content blocked by parental controls',
        overrideAvailable: contentControl.parent_override_allowed
    };
}

async function verifyParentalAuthority({ parentId, childId, supabaseUrl, serviceRoleKey }) {
    const familyResponse = await fetch(
        `${supabaseUrl}/rest/v1/family_accounts?parent_id=eq.${parentId}&child_id=eq.${childId}`,
        {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        }
    );

    let isAuthorized = false;
    if (familyResponse.ok) {
        const familyData = await familyResponse.json();
        isAuthorized = familyData.length > 0;
    }

    return { isAuthorized, parentId, childId };
}