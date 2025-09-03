// supabase/functions/update-altar-streak/index.ts

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

    // Get current date in user's timezone or UTC
    const currentDate = new Date().toISOString().split('T')[0];

    // Check if user already has a streak record for today
    const { data: streakHistory, error: historyError } = await supabase
      .from('altar_streak_history')
      .select('*')
      .eq('user_id', user_id)
      .eq('streak_date', currentDate)
      .single();

    if (historyError && historyError.code !== 'PGRST116') { // PGRST116 is the error code for no results
      throw historyError;
    }

    // If user already has a streak record for today, increment the prayers_count
    if (streakHistory) {
      await supabase
        .from('altar_streak_history')
        .update({ prayers_count: streakHistory.prayers_count + 1 })
        .eq('id', streakHistory.id);
    } else {
      // If not, create a new streak record for today
      await supabase
        .from('altar_streak_history')
        .insert({
          user_id,
          streak_date: currentDate,
          prayers_count: 1
        });

      // Get user's streak record
      const { data: userStreak, error: streakError } = await supabase
        .from('altar_streaks')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      let newStreakData;
      const now = new Date();

      if (!userStreak) {
        // If user doesn't have a streak record yet, create one
        newStreakData = {
          user_id,
          current_streak: 1,
          longest_streak: 1,
          last_prayer_at: now.toISOString(),
          streak_start_date: now.toISOString()
        };
      } else {
        // Check if last prayer was yesterday or earlier today
        const lastPrayerDate = userStreak.last_prayer_at ? new Date(userStreak.last_prayer_at) : null;
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split('T')[0];
        const lastPrayerDay = lastPrayerDate ? lastPrayerDate.toISOString().split('T')[0] : null;
        const todayDate = now.toISOString().split('T')[0];

        let currentStreak = userStreak.current_streak;

        // If last prayer was yesterday, increment streak
        if (lastPrayerDay === yesterdayDate) {
          currentStreak += 1;
        }
        // If last prayer was earlier today, maintain current streak
        else if (lastPrayerDay === todayDate) {
          currentStreak = userStreak.current_streak;
        }
        // If last prayer was before yesterday, reset streak to 1
        else {
          currentStreak = 1;
        }

        newStreakData = {
          current_streak: currentStreak,
          longest_streak: Math.max(userStreak.longest_streak || 0, currentStreak),
          last_prayer_at: now.toISOString(),
          streak_start_date: currentStreak === 1 ? now.toISOString() : userStreak.streak_start_date
        };
      }

      // Update or insert the streak record
      if (userStreak) {
        await supabase
          .from('altar_streaks')
          .update(newStreakData)
          .eq('user_id', user_id);
      } else {
        await supabase
          .from('altar_streaks')
          .insert(newStreakData);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Streak updated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
