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
        const requestData = await req.json();
        const { userId, eventType, eventData, churchId, sessionId, userAgent, ipAddress } = requestData;

        console.log('Analytics event:', { userId, eventType, churchId });

        // Validate required parameters
        if (!userId || !eventType) {
            throw new Error('Missing required parameters: userId and eventType');
        }

        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }

        // Get client IP if not provided
        let clientIp = ipAddress;
        if (!clientIp) {
            const forwardedFor = req.headers.get('x-forwarded-for');
            const realIp = req.headers.get('x-real-ip');
            clientIp = forwardedFor?.split(',')[0] || realIp || 'unknown';
        }

        // Create analytics record
        const analyticsRecord = {
            user_id: userId,
            church_id: churchId || null,
            event_type: eventType,
            event_data: eventData || {},
            session_id: sessionId || null,
            user_agent: userAgent || req.headers.get('user-agent') || null,
            ip_address: clientIp,
            created_at: new Date().toISOString()
        };

        // Insert analytics record
        const response = await fetch(`${supabaseUrl}/rest/v1/user_analytics`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(analyticsRecord)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to insert analytics record:', errorText);
            throw new Error(`Database error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Analytics event logged successfully:', result[0]?.id);

        return new Response(JSON.stringify({
            data: {
                id: result[0]?.id,
                success: true
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Analytics logging error:', error);

        const errorResponse = {
            error: {
                code: 'ANALYTICS_FAILED',
                message: error.message || 'Failed to log analytics event'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});