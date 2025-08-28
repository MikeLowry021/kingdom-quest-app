// supabase/functions/generate-weekly-challenge/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get request body
    const requestData = await req.json();
    const { user_id, difficulty = 'beginner', category } = requestData;

    if (!user_id) {
      throw new Error('Missing user_id in request body');
    }

    // Fetch active challenges for the user
    const { data: activeUserChallenges, error: activeError } = await supabase
      .from('user_family_challenges')
      .select('challenge_id')
      .eq('user_id', user_id)
      .eq('status', 'active');

    if (activeError) {
      throw activeError;
    }

    // Get IDs of challenges the user is already doing
    const activeChallengeIds = activeUserChallenges?.map(c => c.challenge_id) || [];

    // Fetch completed challenges for the user
    const { data: completedUserChallenges, error: completedError } = await supabase
      .from('user_family_challenges')
      .select('challenge_id')
      .eq('user_id', user_id)
      .eq('status', 'completed');

    if (completedError) {
      throw completedError;
    }

    // Get IDs of challenges the user has already completed
    const completedChallengeIds = completedUserChallenges?.map(c => c.challenge_id) || [];

    // Combine active and completed challenge IDs to exclude
    const excludeChallengeIds = [...activeChallengeIds, ...completedChallengeIds];

    // Query to get eligible challenges
    let query = supabase
      .from('family_challenges')
      .select('*')
      .eq('is_active', true)
      .eq('difficulty', difficulty);

    // Add category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Exclude challenges the user is already doing or has completed
    if (excludeChallengeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeChallengeIds.join(',')})`);
    }

    // Limit to 5 results
    query = query.limit(5);

    // Execute the query
    const { data: eligibleChallenges, error: eligibleError } = await query;

    if (eligibleError) {
      throw eligibleError;
    }

    // If no eligible challenges found, look for ones with different difficulty
    if (!eligibleChallenges || eligibleChallenges.length === 0) {
      let fallbackQuery = supabase
        .from('family_challenges')
        .select('*')
        .eq('is_active', true);

      // Add category filter if provided
      if (category) {
        fallbackQuery = fallbackQuery.eq('category', category);
      }

      // Exclude challenges the user is already doing or has completed
      if (excludeChallengeIds.length > 0) {
        fallbackQuery = fallbackQuery.not('id', 'in', `(${excludeChallengeIds.join(',')})`);
      }

      // Limit to 5 results
      fallbackQuery = fallbackQuery.limit(5);

      // Execute the fallback query
      const { data: fallbackChallenges, error: fallbackError } = await fallbackQuery;

      if (fallbackError) {
        throw fallbackError;
      }

      if (!fallbackChallenges || fallbackChallenges.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No eligible challenges found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Return a random challenge from the fallback results
      const randomIndex = Math.floor(Math.random() * fallbackChallenges.length);
      const selectedChallenge = fallbackChallenges[randomIndex];

      return new Response(
        JSON.stringify({ challenge: selectedChallenge, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Return a random challenge from the eligible results
    const randomIndex = Math.floor(Math.random() * eligibleChallenges.length);
    const selectedChallenge = eligibleChallenges[randomIndex];

    return new Response(
      JSON.stringify({ challenge: selectedChallenge, fallback: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
