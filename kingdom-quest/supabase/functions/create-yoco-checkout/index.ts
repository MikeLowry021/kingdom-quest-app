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
        const { planId, billingCycle, amount, customerInfo } = requestData;

        console.log('Yoco checkout request:', { planId, billingCycle, amount, customerEmail: customerInfo?.email });

        // Validate required parameters
        if (!planId || !billingCycle || !amount || !customerInfo) {
            throw new Error('Missing required parameters');
        }

        // Get environment variables
        const yocoSecretKey = Deno.env.get('YOCO_SECRET_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000';

        if (!yocoSecretKey || !supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing environment variables');
        }

        // Get user from auth header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            throw new Error('No authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        
        // Verify token and get user
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

        console.log('User authenticated:', userId);

        // Create Yoco checkout session
        const checkoutData = {
            amount: amount, // Amount in cents
            currency: 'ZAR',
            cancelUrl: `${siteUrl}/billing?cancelled=true`,
            successUrl: `${siteUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            failureUrl: `${siteUrl}/billing?error=payment_failed`,
            metadata: {
                userId: userId,
                planId: planId,
                billingCycle: billingCycle,
                source: 'kingdom-quest'
            },
            customer: {
                email: customerInfo.email,
                firstName: customerInfo.name?.split(' ')[0] || '',
                lastName: customerInfo.name?.split(' ').slice(1).join(' ') || '',
                phone: customerInfo.phone || ''
            }
        };

        console.log('Creating Yoco checkout session with real API...');
        
        // Real Yoco API integration
        const yocoResponse = await fetch('https://online.yoco.com/v1/charges/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${yocoSecretKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(checkoutData)
        });

        if (!yocoResponse.ok) {
            const errorData = await yocoResponse.text();
            console.error('Yoco API error:', errorData);
            throw new Error(`Yoco API error: ${yocoResponse.status} - ${errorData}`);
        }

        const yocoSession = await yocoResponse.json();
        console.log('Yoco checkout session created:', yocoSession.id);

        // Store checkout session for tracking
        const sessionRecord = {
            yoco_session_id: yocoSession.id,
            user_id: userId,
            plan_id: planId,
            billing_cycle: billingCycle,
            amount: amount,
            currency: 'ZAR',
            status: 'pending',
            customer_email: customerInfo.email,
            customer_name: customerInfo.name,
            created_at: new Date().toISOString()
        };

        // Store session in database
        const sessionResponse = await fetch(`${supabaseUrl}/rest/v1/checkout_sessions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionRecord)
        });

        if (!sessionResponse.ok) {
            console.error('Failed to store checkout session, but continuing...');
        }

        return new Response(JSON.stringify({
            data: {
                checkoutUrl: yocoSession.redirectUrl,
                sessionId: yocoSession.id
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Yoco checkout error:', error);

        const errorResponse = {
            error: {
                code: 'YOCO_CHECKOUT_FAILED',
                message: error.message || 'Failed to create checkout session'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});