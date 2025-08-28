// Edge Function to handle Church Admin branding and profile updates

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

    // Verify user has Church plan subscription
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription || subscription.subscription_plans?.name !== 'Church') {
      throw new Error('Unauthorized: Church subscription required');
    }

    const requestData = await req.json();
    const { type, data } = requestData;

    switch (type) {
      case 'branding': {
        const {
          church_name,
          church_address,
          church_phone,
          church_email,
          denomination,
          pastor_name,
          church_size,
          logo_url,
          primary_color,
          secondary_color,
          custom_message
        } = data;

        // Update or insert church profile
        const { data: profile, error } = await supabaseClient
          .from('church_profiles')
          .upsert({
            user_id: user.id,
            church_name,
            church_address,
            church_phone,
            church_email,
            denomination,
            pastor_name,
            church_size,
            logo_url,
            primary_color,
            secondary_color,
            custom_message,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: profile 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'privacy': {
        const {
          privacy_sla_accepted,
          data_retention_days,
          allow_analytics,
          allow_external_sharing
        } = data;

        // Update privacy settings
        const { data: profile, error } = await supabaseClient
          .from('church_profiles')
          .upsert({
            user_id: user.id,
            privacy_sla_accepted,
            privacy_sla_accepted_date: privacy_sla_accepted ? new Date().toISOString() : null,
            data_retention_days,
            allow_analytics,
            allow_external_sharing,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: profile 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        throw new Error('Invalid update type');
    }
  } catch (error) {
    const errorResponse = {
      error: {
        code: 'CHURCH_ADMIN_UPDATE_ERROR',
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
