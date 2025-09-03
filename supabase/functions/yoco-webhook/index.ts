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
        // Get environment variables
        const yocoWebhookSecret = Deno.env.get('YOCO_WEBHOOK_SECRET');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Missing Supabase configuration');
        }

        // Verify webhook signature (important for security)
        const signature = req.headers.get('X-Yoco-Signature');
        const rawBody = await req.text();
        
        if (yocoWebhookSecret && signature) {
            // Verify webhook signature using HMAC
            const encoder = new TextEncoder();
            const key = await crypto.subtle.importKey(
                'raw',
                encoder.encode(yocoWebhookSecret),
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );
            
            const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
            const expectedHex = Array.from(new Uint8Array(expectedSignature))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
            
            if (`sha256=${expectedHex}` !== signature) {
                console.error('Invalid webhook signature');
                return new Response('Unauthorized', { status: 401 });
            }
        }

        const webhookData = JSON.parse(rawBody);
        console.log('Yoco webhook received:', webhookData.type, webhookData.id);

        // Handle different webhook events
        switch (webhookData.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(webhookData.data, supabaseUrl, serviceRoleKey);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(webhookData.data, supabaseUrl, serviceRoleKey);
                break;
                
            case 'payment_intent.cancelled':
                await handlePaymentCancelled(webhookData.data, supabaseUrl, serviceRoleKey);
                break;
                
            default:
                console.log('Unhandled webhook event:', webhookData.type);
        }

        return new Response('OK', { status: 200 });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
});

async function handlePaymentSuccess(paymentData, supabaseUrl, serviceRoleKey) {
    try {
        console.log('Processing successful payment:', paymentData.id);
        
        const userId = paymentData.metadata?.userId;
        const planId = paymentData.metadata?.planId;
        const billingCycle = paymentData.metadata?.billingCycle;
        
        if (!userId || !planId || !billingCycle) {
            console.error('Missing metadata in payment:', paymentData.metadata);
            return;
        }

        // Create or update user subscription
        const subscriptionData = {
            user_id: userId,
            plan_id: planId,
            status: 'active',
            billing_cycle: billingCycle,
            current_period_start: new Date().toISOString(),
            current_period_end: calculatePeriodEnd(billingCycle),
            yoco_payment_method_id: paymentData.payment_method_id,
            yoco_customer_id: paymentData.customer_id,
            updated_at: new Date().toISOString()
        };

        // Upsert subscription
        const subscriptionResponse = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(subscriptionData)
        });

        if (!subscriptionResponse.ok) {
            const errorText = await subscriptionResponse.text();
            console.error('Failed to create/update subscription:', errorText);
            return;
        }

        // Update user profile plan_type
        const profileUpdate = {
            plan_type: planId,
            updated_at: new Date().toISOString()
        };

        await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileUpdate)
        });

        // Create payment record
        const paymentRecord = {
            user_id: userId,
            yoco_payment_id: paymentData.id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: 'completed',
            payment_type: 'subscription',
            description: `${planId} subscription (${billingCycle})`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await fetch(`${supabaseUrl}/rest/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentRecord)
        });

        console.log('Payment success processed for user:', userId);
        
    } catch (error) {
        console.error('Error processing payment success:', error);
    }
}

async function handlePaymentFailed(paymentData, supabaseUrl, serviceRoleKey) {
    try {
        console.log('Processing failed payment:', paymentData.id);
        
        const userId = paymentData.metadata?.userId;
        
        if (!userId) {
            console.error('Missing userId in payment metadata');
            return;
        }

        // Create payment record with failed status
        const paymentRecord = {
            user_id: userId,
            yoco_payment_id: paymentData.id,
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: 'failed',
            payment_type: 'subscription',
            failure_reason: paymentData.failure_reason || 'Payment failed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        await fetch(`${supabaseUrl}/rest/v1/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentRecord)
        });

        console.log('Payment failure processed for user:', userId);
        
    } catch (error) {
        console.error('Error processing payment failure:', error);
    }
}

async function handlePaymentCancelled(paymentData, supabaseUrl, serviceRoleKey) {
    try {
        console.log('Processing cancelled payment:', paymentData.id);
        
        const userId = paymentData.metadata?.userId;
        
        if (!userId) {
            console.error('Missing userId in payment metadata');
            return;
        }

        // Log the cancellation - no subscription created
        console.log('Payment cancelled for user:', userId);
        
    } catch (error) {
        console.error('Error processing payment cancellation:', error);
    }
}

function calculatePeriodEnd(billingCycle) {
    const now = new Date();
    if (billingCycle === 'monthly') {
        now.setMonth(now.getMonth() + 1);
    } else if (billingCycle === 'annually') {
        now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString();
}