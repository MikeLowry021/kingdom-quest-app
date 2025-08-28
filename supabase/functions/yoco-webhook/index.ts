// Supabase Edge Function for Yoco Webhook Handling

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-yoco-signature',
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

    // Verify webhook signature
    const yocoWebhookSecret = Deno.env.get('YOCO_WEBHOOK_SECRET');
    if (!yocoWebhookSecret) {
      throw new Error('Yoco webhook secret not configured');
    }

    const signature = req.headers.get('x-yoco-signature');
    const rawBody = await req.text();
    
    // For production, you should verify the webhook signature here
    // const expectedSignature = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawBody + yocoWebhookSecret));
    
    console.log('Received webhook with signature:', signature);
    console.log('Webhook payload:', rawBody);

    const webhookData = JSON.parse(rawBody);
    const { type, payload } = webhookData;

    console.log('Webhook type:', type);
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Handle payment success
    if (type === 'payment.succeeded' || type === 'checkout.succeeded') {
      const checkoutId = payload.checkout?.id || payload.id;
      const amount = payload.amount || payload.checkout?.amount;
      const metadata = payload.metadata || payload.checkout?.metadata || {};
      
      const userId = metadata.user_id;
      const planType = metadata.plan_type;
      const billingCycle = metadata.billing_cycle || 'monthly';

      if (!userId || !planType) {
        console.error('Missing required metadata:', { userId, planType });
        throw new Error('Missing user_id or plan_type in webhook metadata');
      }

      console.log('Processing payment success for:', { userId, planType, billingCycle });

      // Update payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .update({
          status: 'completed',
          yoco_payment_id: payload.id,
          receipt_url: payload.receipt?.url,
          receipt_number: payload.receipt?.number,
          updated_at: new Date().toISOString()
        })
        .eq('yoco_checkout_id', checkoutId);

      if (paymentError) {
        console.error('Payment update error:', paymentError);
      }

      // Get the plan details
      const { data: plan, error: planError } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('name', planType)
        .single();

      if (planError || !plan) {
        console.error('Plan lookup error:', planError);
        throw new Error(`Plan '${planType}' not found`);
      }

      // Calculate subscription end date
      const startDate = new Date();
      const endDate = new Date();
      if (billingCycle === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (billingCycle === 'annually') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create or update subscription
      const { error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .upsert({
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          current_period_start: startDate.toISOString(),
          current_period_end: endDate.toISOString(),
          billing_cycle: billingCycle,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (subscriptionError) {
        console.error('Subscription creation error:', subscriptionError);
        throw subscriptionError;
      }

      console.log('Subscription activated successfully for user:', userId);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Payment processed and subscription activated'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle payment failure
    if (type === 'payment.failed' || type === 'checkout.failed') {
      const checkoutId = payload.checkout?.id || payload.id;
      const failureReason = payload.failure_reason || 'Payment failed';

      // Update payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: failureReason,
          updated_at: new Date().toISOString()
        })
        .eq('yoco_checkout_id', checkoutId);

      if (paymentError) {
        console.error('Payment failure update error:', paymentError);
      }

      console.log('Payment failed for checkout:', checkoutId);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Payment failure processed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // For other webhook types, just acknowledge
    console.log('Unhandled webhook type:', type);
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook received'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    const errorResponse = {
      error: {
        code: 'WEBHOOK_PROCESSING_ERROR',
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
