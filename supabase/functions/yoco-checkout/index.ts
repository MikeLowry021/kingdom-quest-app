// Supabase Edge Function for Yoco Checkout Creation

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the JWT token from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth context
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const requestData = await req.json();
    const { amount, plan_type, billing_cycle = 'monthly' } = requestData;

    // Validate required fields
    if (!amount || !plan_type) {
      throw new Error('Missing required fields: amount and plan_type');
    }

    // Get Yoco API key from environment
    const yocoSecretKey = Deno.env.get('YOCO_SECRET_KEY');
    if (!yocoSecretKey) {
      throw new Error('Yoco API key not configured');
    }

    // Create checkout session with Yoco
    const checkoutPayload = {
      amount: amount, // Amount in cents (ZAR)
      currency: 'ZAR',
      cancelUrl: `${req.headers.get('origin') || 'https://kingdom-quest.vercel.app'}/billing?cancelled=true`,
      successUrl: `${req.headers.get('origin') || 'https://kingdom-quest.vercel.app'}/billing/success?session_id={CHECKOUT_ID}`,
      failureUrl: `${req.headers.get('origin') || 'https://kingdom-quest.vercel.app'}/billing?failed=true`,
      metadata: {
        user_id: user.id,
        plan_type: plan_type,
        billing_cycle: billing_cycle,
        email: user.email || '',
      }
    };

    console.log('Creating Yoco checkout with payload:', JSON.stringify(checkoutPayload, null, 2));

    const yocoResponse = await fetch('https://online.yoco.com/v1/checkouts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${yocoSecretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutPayload)
    });

    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error('Yoco API error:', {
        status: yocoResponse.status,
        statusText: yocoResponse.statusText,
        error: errorText
      });
      throw new Error(`Yoco API error: ${yocoResponse.status} - ${errorText}`);
    }

    const checkoutData = await yocoResponse.json();
    console.log('Yoco checkout created:', checkoutData);

    // Store checkout session in database for tracking
    const { error: dbError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        yoco_checkout_id: checkoutData.id,
        amount: amount,
        currency: 'ZAR',
        status: 'pending',
        payment_type: 'subscription',
        description: `${plan_type} plan - ${billing_cycle}`,
        metadata: {
          plan_type,
          billing_cycle,
          checkout_created_at: new Date().toISOString()
        }
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if DB logging fails
    }

    return new Response(JSON.stringify({ 
      success: true,
      checkout_url: checkoutData.redirectUrl,
      checkout_id: checkoutData.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Checkout creation error:', error);
    const errorResponse = {
      error: {
        code: 'CHECKOUT_CREATION_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
