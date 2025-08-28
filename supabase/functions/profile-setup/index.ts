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
        const { fullName, ageGroup, parentEmail } = await req.json();

        // Get the current user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get current user
        const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': serviceRoleKey
            }
        });

        if (!userResponse.ok) {
            throw new Error('Invalid token');
        }

        const userData = await userResponse.json();
        const userId = userData.id;
        const userEmail = userData.email;

        let parentId = null;
        let isParent = true;

        // If parent email is provided, find the parent
        if (parentEmail && parentEmail !== userEmail) {
            const parentResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${parentEmail}&select=id`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                }
            });

            if (parentResponse.ok) {
                const parentData = await parentResponse.json();
                if (parentData.length > 0) {
                    parentId = parentData[0].id;
                    isParent = false;
                }
            }
        }

        // Create or update profile
        const profileData = {
            id: userId,
            email: userEmail,
            full_name: fullName,
            age_group: ageGroup,
            parent_id: parentId,
            is_parent: isParent,
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
            // Try to update instead
            const updateResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    full_name: fullName,
                    age_group: ageGroup,
                    parent_id: parentId,
                    is_parent: isParent,
                    updated_at: new Date().toISOString()
                })
            });

            if (!updateResponse.ok) {
                const errorText = await updateResponse.text();
                throw new Error(`Profile update failed: ${errorText}`);
            }

            const profile = await updateResponse.json();

            return new Response(JSON.stringify({
                data: {
                    profile: profile[0],
                    message: 'Profile updated successfully'
                }
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const profile = await profileResponse.json();

        return new Response(JSON.stringify({
            data: {
                profile: profile[0],
                message: 'Profile created successfully'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile setup error:', error);

        const errorResponse = {
            error: {
                code: 'PROFILE_SETUP_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});