// Edge Function: update-streak
// Purpose: Update a user's prayer streak after they log a prayer

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { differenceInDays, startOfDay } from 'https://esm.sh/date-fns';

// Default CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user ID from the request body
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get the current date (UTC)
    const today = startOfDay(new Date());
    
    // Check if the user already has a streak record
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      // PGRST116 is the error code for 'no rows returned'
      throw streakError;
    }
    
    // If the user doesn't have a streak record, create one
    if (!streakData) {
      const { data, error } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_prayer_date: new Date().toISOString(),
          streak_starts: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ success: true, data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // User has an existing streak record
    // Calculate days since last prayer
    const lastPrayerDate = startOfDay(new Date(streakData.last_prayer_date));
    const daysSinceLastPrayer = differenceInDays(today, lastPrayerDate);
    
    let newStreakData;
    
    // If the user already prayed today, don't update the streak
    if (daysSinceLastPrayer === 0) {
      newStreakData = streakData;
    }
    // If the user prayed yesterday, increment the streak
    else if (daysSinceLastPrayer === 1) {
      const newCurrentStreak = streakData.current_streak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, streakData.longest_streak);
      
      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_prayer_date: new Date().toISOString(),
        })
        .eq('id', streakData.id)
        .select()
        .single();
      
      if (error) throw error;
      newStreakData = data;
    }
    // If the user missed a day (or more), reset the streak
    else {
      const { data, error } = await supabase
        .from('streaks')
        .update({
          current_streak: 1,
          last_prayer_date: new Date().toISOString(),
          streak_starts: new Date().toISOString(),
          missed_days: streakData.missed_days + 1,
        })
        .eq('id', streakData.id)
        .select()
        .single();
      
      if (error) throw error;
      newStreakData = data;
    }
    
    return new Response(
      JSON.stringify({ success: true, data: newStreakData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
