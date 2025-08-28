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
            parentId,
            childName,
            childEmail,
            ageTier,
            temporaryPassword = 'KingdomQuest123!' // Temporary password that must be changed on first login
        } = await req.json();

        // Enhanced input validation
        if (!parentId || typeof parentId !== 'string') {
            throw new Error('Valid parentId is required');
        }
        
        if (!childName || typeof childName !== 'string' || childName.trim().length === 0) {
            throw new Error('Valid childName is required');
        }
        
        if (!childEmail || typeof childEmail !== 'string') {
            throw new Error('Valid childEmail is required');
        }
        
        if (!ageTier || typeof ageTier !== 'string') {
            throw new Error('Valid ageTier is required');
        }
        
        // Validate UUID format for parentId
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(parentId)) {
            throw new Error('Invalid parentId format - must be a valid UUID');
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(childEmail)) {
            throw new Error('Invalid email format');
        }
        
        // Validate age tier values
        const validChildAgeTiers = ['toddler', 'preschool', 'elementary', 'preteen', 'early-teen'];
        if (!validChildAgeTiers.includes(ageTier)) {
            throw new Error(`Invalid ageTier for child. Must be one of: ${validChildAgeTiers.join(', ')}`);
        }
        
        // Validate that childName is reasonable length
        if (childName.trim().length > 100) {
            throw new Error('childName too long - maximum 100 characters');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Verify parent exists and is actually a parent
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

        // Check if email already exists
        const existingUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(childEmail)}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        if (existingUserResponse.ok) {
            const existingUsers = await existingUserResponse.json();
            if (existingUsers && existingUsers.users && existingUsers.users.length > 0) {
                throw new Error('An account with this email already exists');
            }
        }

        // Step 1: Create the child user account
        const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: childEmail,
                password: temporaryPassword,
                email_confirm: true, // Auto-confirm email since parent is creating
                user_metadata: {
                    full_name: childName.trim(),
                    created_by_parent: parentId,
                    age_tier: ageTier,
                    requires_password_change: true
                }
            })
        });

        if (!createUserResponse.ok) {
            const errorText = await createUserResponse.text();
            throw new Error(`Failed to create user account: ${errorText}`);
        }

        const newUser = await createUserResponse.json();
        const childUserId = newUser.id;

        // Step 2: Create profile entry for the child
        const profileData = {
            id: childUserId,
            email: childEmail,
            full_name: childName.trim(),
            age_group: ageTier === 'toddler' || ageTier === 'preschool' ? 'child' : 
                      ageTier === 'elementary' || ageTier === 'preteen' ? 'child' :
                      ageTier === 'early-teen' ? 'youth' : 'child',
            parent_id: parentId,
            is_parent: false,
            preferences: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(profileData)
        });

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            // If profile creation fails, we should clean up the user account
            await fetch(`${supabaseUrl}/auth/v1/admin/users/${childUserId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });
            throw new Error(`Failed to create profile: ${errorText}`);
        }

        // Step 3: Set up age mode for the child by calling age-mode-setup function
        const ageModeSetupResponse = await fetch(`${supabaseUrl}/functions/v1/age-mode-setup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: childUserId,
                ageTier: ageTier,
                fullName: childName.trim(),
                parentId: parentId,
                isParent: false
            })
        });

        if (!ageModeSetupResponse.ok) {
            const errorText = await ageModeSetupResponse.text();
            console.warn(`Age mode setup failed for child ${childUserId}: ${errorText}`);
            // We don't fail the entire operation, but log the warning
        }

        // Step 4: Create family account relationship
        const familyAccountData = {
            parent_id: parentId,
            child_id: childUserId,
            relationship_type: 'parent-child',
            permissions: {
                content_approval: ageTier === 'toddler' || ageTier === 'preschool' ? 'required' : 'recommended',
                time_restrictions: true,
                progress_reporting: 'detailed',
                supervision_level: ageTier === 'toddler' || ageTier === 'preschool' ? 'full' : 'partial'
            },
            oversight_level: ageTier === 'toddler' || ageTier === 'preschool' ? 'full' : 'partial',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const familyAccountResponse = await fetch(`${supabaseUrl}/rest/v1/family_accounts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(familyAccountData)
        });

        if (!familyAccountResponse.ok) {
            const errorText = await familyAccountResponse.text();
            console.warn(`Family account relationship creation failed: ${errorText}`);
            // We don't fail the entire operation, but log the warning
        }

        const familyAccount = familyAccountResponse.ok ? await familyAccountResponse.json() : null;

        // Return success response with all the created data
        return new Response(JSON.stringify({
            data: {
                childUserId: childUserId,
                childEmail: childEmail,
                childName: childName.trim(),
                ageTier: ageTier,
                parentId: parentId,
                temporaryPassword: temporaryPassword,
                familyAccountId: familyAccount ? familyAccount[0]?.id : null,
                ageModeSetupCompleted: ageModeSetupResponse.ok,
                message: 'Child account created successfully. Please share the temporary password with the child and ensure they change it on first login.',
                nextSteps: [
                    'Share the temporary password with the child',
                    'Child should log in and change password immediately',
                    'Review parental control settings',
                    'Set up content preferences if needed'
                ]
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Child account creation error:', error);

        const errorResponse = {
            error: {
                code: 'CHILD_ACCOUNT_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});