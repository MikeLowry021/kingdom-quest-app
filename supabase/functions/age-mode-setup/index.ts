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
        const { 
            userId, 
            ageTier, 
            fullName, 
            parentId = null, 
            isParent = false,
            uiPreferences = {},
            contentRestrictions = {},
            accessibilitySettings = {},
            parentalControls = {}
        } = await req.json();

        // Enhanced input validation
        if (!userId || typeof userId !== 'string') {
            throw new Error('Valid userId is required');
        }
        
        if (!ageTier || typeof ageTier !== 'string') {
            throw new Error('Valid ageTier is required');
        }
        
        if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
            throw new Error('Valid fullName is required');
        }
        
        // Validate UUID format for userId and parentId
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            throw new Error('Invalid userId format - must be a valid UUID');
        }
        
        if (parentId && !uuidRegex.test(parentId)) {
            throw new Error('Invalid parentId format - must be a valid UUID');
        }
        
        // Validate age tier values
        const validAgeTiers = ['toddler', 'preschool', 'elementary', 'preteen', 'early-teen', 'late-teen', 'young-adult', 'adult', 'senior'];
        if (!validAgeTiers.includes(ageTier)) {
            throw new Error(`Invalid ageTier. Must be one of: ${validAgeTiers.join(', ')}`);
        }
        
        // Validate that fullName is reasonable length
        if (fullName.trim().length > 100) {
            throw new Error('fullName too long - maximum 100 characters');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify user exists in auth.users before proceeding
        const userCheckResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userCheckResponse.ok) {
            if (userCheckResponse.status === 404) {
                throw new Error('User not found in authentication system');
            }
            throw new Error('Failed to verify user existence');
        }

        // If parentId is provided, verify parent exists and is actually a parent
        if (parentId) {
            const parentCheckResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${parentId}&is_parent=eq.true`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            if (parentCheckResponse.ok) {
                const parentData = await parentCheckResponse.json();
                if (!parentData || parentData.length === 0) {
                    throw new Error('Parent account not found or is not marked as a parent');
                }
            } else {
                throw new Error('Failed to verify parent account');
            }
        }

        // Update the user's profile with age group and parent information
        const profileUpdate = {
            full_name: fullName.trim(),
            age_group: ageTier === 'toddler' || ageTier === 'preschool' ? 'child' : 
                      ageTier === 'elementary' || ageTier === 'preteen' ? 'child' :
                      ageTier === 'early-teen' || ageTier === 'late-teen' ? 'youth' : 'adult',
            parent_id: parentId,
            is_parent: isParent,
            updated_at: new Date().toISOString()
        };

        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileUpdate)
        });

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            throw new Error(`Failed to update profile: ${errorText}`);
        }

        // Set up age-specific settings based on the tier
        const getAgeSpecificSettings = (tier) => {
            switch (tier) {
                case 'toddler':
                case 'preschool':
                    return {
                        ui: {
                            fontSize: 'extra-large',
                            buttonSize: 'extra-large',
                            colorScheme: 'high-contrast',
                            animations: 'reduced',
                            touchTargetSize: 'extra-large',
                            audioFirst: true,
                            readingLevel: 'pre-reading',
                            navigation: 'simplified'
                        },
                        content: {
                            maxStoryLength: 5,
                            allowedThemes: ['creation', 'jesus-loves-me', 'kindness', 'sharing', 'family'],
                            vocabularyLevel: 'basic',
                            conceptComplexity: 'concrete',
                            requireSupervision: true
                        },
                        accessibility: {
                            screenReader: true,
                            keyboardNav: false,
                            voiceGuidance: true,
                            visualCues: 'enhanced',
                            motorAssistance: true
                        },
                        parental: {
                            fullControl: true,
                            contentApproval: 'required',
                            timeRestrictions: true,
                            progressReporting: 'detailed',
                            supervisionRequired: true
                        }
                    };
                case 'elementary':
                    return {
                        ui: {
                            fontSize: 'large',
                            buttonSize: 'large',
                            colorScheme: 'friendly',
                            animations: 'gentle',
                            touchTargetSize: 'large',
                            audioFirst: false,
                            readingLevel: 'beginning',
                            navigation: 'guided'
                        },
                        content: {
                            maxStoryLength: 10,
                            allowedThemes: ['bible-stories', 'moral-lessons', 'prayer', 'church', 'friendship'],
                            vocabularyLevel: 'elementary',
                            conceptComplexity: 'basic',
                            requireSupervision: false
                        },
                        accessibility: {
                            screenReader: true,
                            keyboardNav: true,
                            voiceGuidance: 'optional',
                            visualCues: 'standard',
                            motorAssistance: false
                        },
                        parental: {
                            fullControl: true,
                            contentApproval: 'recommended',
                            timeRestrictions: true,
                            progressReporting: 'regular',
                            supervisionRequired: false
                        }
                    };
                case 'preteen':
                    return {
                        ui: {
                            fontSize: 'standard',
                            buttonSize: 'standard',
                            colorScheme: 'modern',
                            animations: 'standard',
                            touchTargetSize: 'standard',
                            audioFirst: false,
                            readingLevel: 'intermediate',
                            navigation: 'standard'
                        },
                        content: {
                            maxStoryLength: 15,
                            allowedThemes: ['character-studies', 'life-application', 'social-issues', 'identity', 'purpose'],
                            vocabularyLevel: 'intermediate',
                            conceptComplexity: 'moderate',
                            requireSupervision: false
                        },
                        accessibility: {
                            screenReader: true,
                            keyboardNav: true,
                            voiceGuidance: 'off',
                            visualCues: 'standard',
                            motorAssistance: false
                        },
                        parental: {
                            fullControl: false,
                            contentApproval: 'optional',
                            timeRestrictions: false,
                            progressReporting: 'summary',
                            supervisionRequired: false
                        }
                    };
                default:
                    return {
                        ui: {
                            fontSize: 'standard',
                            buttonSize: 'standard',
                            colorScheme: 'adaptive',
                            animations: 'full',
                            touchTargetSize: 'standard',
                            audioFirst: false,
                            readingLevel: 'advanced',
                            navigation: 'full'
                        },
                        content: {
                            maxStoryLength: 0, // No limit
                            allowedThemes: 'all',
                            vocabularyLevel: 'advanced',
                            conceptComplexity: 'complex',
                            requireSupervision: false
                        },
                        accessibility: {
                            screenReader: true,
                            keyboardNav: true,
                            voiceGuidance: 'off',
                            visualCues: 'standard',
                            motorAssistance: false
                        },
                        parental: {
                            fullControl: false,
                            contentApproval: 'none',
                            timeRestrictions: false,
                            progressReporting: 'optional',
                            supervisionRequired: false
                        }
                    };
            }
        };

        const ageSpecificSettings = getAgeSpecificSettings(ageTier);
        
        // Merge provided settings with age-specific defaults
        const finalUiPreferences = { ...ageSpecificSettings.ui, ...uiPreferences };
        const finalContentRestrictions = { ...ageSpecificSettings.content, ...contentRestrictions };
        const finalAccessibilitySettings = { ...ageSpecificSettings.accessibility, ...accessibilitySettings };
        const finalParentalControls = { ...ageSpecificSettings.parental, ...parentalControls };

        // Create or update age mode settings
        const ageModeData = {
            user_id: userId,
            age_tier: ageTier,
            ui_preferences: finalUiPreferences,
            content_restrictions: finalContentRestrictions,
            accessibility_settings: finalAccessibilitySettings,
            parental_controls: finalParentalControls,
            updated_at: new Date().toISOString()
        };

        // Check if settings already exist
        const existingSettingsResponse = await fetch(`${supabaseUrl}/rest/v1/age_mode_settings?user_id=eq.${userId}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        let settingsResponse;
        if (existingSettingsResponse.ok) {
            const existingSettings = await existingSettingsResponse.json();
            if (existingSettings.length > 0) {
                // Update existing settings
                settingsResponse = await fetch(`${supabaseUrl}/rest/v1/age_mode_settings?user_id=eq.${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(ageModeData)
                });
            } else {
                // Create new settings
                ageModeData.created_at = new Date().toISOString();
                settingsResponse = await fetch(`${supabaseUrl}/rest/v1/age_mode_settings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(ageModeData)
                });
            }
        } else {
            throw new Error('Failed to check existing settings');
        }

        if (!settingsResponse.ok) {
            const errorText = await settingsResponse.text();
            throw new Error(`Failed to save age mode settings: ${errorText}`);
        }

        const settingsData = await settingsResponse.json();

        // Initialize performance metrics for this user
        const performanceData = {
            user_id: userId,
            category: 'general',
            accuracy_score: 0.0,
            total_attempts: 0,
            correct_answers: 0,
            rolling_accuracy: 0.0,
            difficulty_level: 'beginner',
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
        };

        await fetch(`${supabaseUrl}/rest/v1/user_performance_metrics`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(performanceData)
        });

        return new Response(JSON.stringify({
            data: {
                userId: userId,
                ageTier: ageTier,
                profileUpdated: true,
                settingsCreated: true,
                performanceInitialized: true,
                settings: {
                    ui: finalUiPreferences,
                    content: finalContentRestrictions,
                    accessibility: finalAccessibilitySettings,
                    parental: finalParentalControls
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Age mode setup error:', error);

        const errorResponse = {
            error: {
                code: 'AGE_MODE_SETUP_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});