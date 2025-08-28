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
        const { events } = await req.json();

        if (!events || !Array.isArray(events)) {
            throw new Error('events array is required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Process and validate events
        const processedEvents = events.map(event => {
            if (!event.event_type || !event.event_category) {
                throw new Error('event_type and event_category are required for each event');
            }

            return {
                user_id: event.userId || null,
                session_id: event.sessionId || null,
                event_type: event.event_type,
                event_category: event.event_category,
                event_data: event.event_data || {},
                age_tier: event.age_tier || null,
                difficulty_level: event.difficulty_level || null,
                timestamp: new Date().toISOString()
            };
        });

        // Batch insert analytics events
        const analyticsResponse = await fetch(`${supabaseUrl}/rest/v1/user_analytics_events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(processedEvents)
        });

        if (!analyticsResponse.ok) {
            const errorText = await analyticsResponse.text();
            throw new Error(`Failed to insert analytics events: ${errorText}`);
        }

        return new Response(JSON.stringify({
            data: {
                eventsProcessed: processedEvents.length,
                timestamp: new Date().toISOString(),
                status: 'success'
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Analytics tracking error:', error);

        const errorResponse = {
            error: {
                code: 'ANALYTICS_TRACKING_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});