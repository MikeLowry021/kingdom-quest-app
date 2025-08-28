// supabase/functions/check-award-badges/index.ts

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
    const { user_id } = requestData;

    if (!user_id) {
      throw new Error('Missing user_id in request body');
    }

    // Get all badges already awarded to the user
    const { data: userBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', user_id);

    if (badgesError) {
      throw badgesError;
    }

    // Create a set of badge IDs the user already has
    const userBadgeIds = new Set(userBadges?.map(badge => badge.badge_id) || []);

    // Get all available badges
    const { data: allBadges, error: allBadgesError } = await supabase
      .from('altar_badges')
      .select('*')
      .order('tier', { ascending: true });

    if (allBadgesError) {
      throw allBadgesError;
    }

    // Get user stats for badge requirements
    const prayerCountPromise = supabase
      .from('user_prayers')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id);

    const answeredPrayerCountPromise = supabase
      .from('user_prayers')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('is_answered', true);

    const userStreakPromise = supabase
      .from('altar_streaks')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const completedIntentionsPromise = supabase
      .from('user_intentions')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('status', 'completed');

    const completedChallengesPromise = supabase
      .from('user_family_challenges')
      .select('id', { count: 'exact' })
      .eq('user_id', user_id)
      .eq('status', 'completed');

    // Wait for all promises to resolve
    const [
      prayerCountResult,
      answeredPrayerCountResult,
      userStreakResult,
      completedIntentionsResult,
      completedChallengesResult
    ] = await Promise.all([
      prayerCountPromise,
      answeredPrayerCountPromise,
      userStreakPromise,
      completedIntentionsPromise,
      completedChallengesPromise
    ]);

    // Check for errors
    if (prayerCountResult.error || 
        answeredPrayerCountResult.error || 
        (userStreakResult.error && userStreakResult.error.code !== 'PGRST116') || 
        completedIntentionsResult.error || 
        completedChallengesResult.error) {
      throw new Error('Error fetching user stats');
    }

    // Extract counts from results
    const prayerCount = prayerCountResult.count || 0;
    const answeredPrayerCount = answeredPrayerCountResult.count || 0;
    const currentStreak = userStreakResult.data?.current_streak || 0;
    const completedIntentionsCount = completedIntentionsResult.count || 0;
    const completedChallengesCount = completedChallengesResult.count || 0;

    // Check which badges the user has earned but not yet been awarded
    const newlyEarnedBadges = [];

    for (const badge of allBadges || []) {
      // Skip if user already has this badge
      if (userBadgeIds.has(badge.id)) {
        continue;
      }

      // Check if user meets requirements for this badge
      let hasEarned = false;

      switch (badge.requirement_type) {
        case 'prayer_count':
          hasEarned = prayerCount >= badge.requirement_value;
          break;
        case 'streak_length':
          hasEarned = currentStreak >= badge.requirement_value;
          break;
        case 'answered_prayers':
          hasEarned = answeredPrayerCount >= badge.requirement_value;
          break;
        case 'intention_completed':
          hasEarned = completedIntentionsCount >= badge.requirement_value;
          break;
        case 'challenge_completed':
          hasEarned = completedChallengesCount >= badge.requirement_value;
          break;
      }

      if (hasEarned) {
        newlyEarnedBadges.push(badge);
      }
    }

    // Award new badges to the user
    const newBadgeAwards = [];

    if (newlyEarnedBadges.length > 0) {
      for (const badge of newlyEarnedBadges) {
        const { data, error } = await supabase
          .from('user_badges')
          .insert({
            user_id,
            badge_id: badge.id,
            awarded_at: new Date().toISOString()
          })
          .select();

        if (error) {
          console.error('Error awarding badge:', error);
        } else if (data) {
          newBadgeAwards.push({ ...badge, award: data[0] });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBadges: newBadgeAwards,
        stats: {
          prayerCount,
          answeredPrayerCount,
          currentStreak,
          completedIntentionsCount,
          completedChallengesCount
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
