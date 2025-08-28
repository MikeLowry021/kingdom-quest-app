// Edge Function: award-badges
// Purpose: Check for badge eligibility and award if earned

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    
    // Get all badges definitions
    const { data: badgeDefinitions, error: badgeDefError } = await supabase
      .from('badges')
      .select('*');
    
    if (badgeDefError) throw badgeDefError;
    
    // Get user's current badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);
    
    if (userBadgesError) throw userBadgesError;
    
    // Create a set of badge IDs the user already has
    const existingBadgeIds = new Set(userBadges.map(badge => badge.badge_id));
    
    // Array to hold newly awarded badges
    const newlyAwardedBadges = [];
    
    // Check each badge for eligibility
    for (const badge of badgeDefinitions) {
      // Skip if user already has this badge
      if (existingBadgeIds.has(badge.id)) continue;
      
      const requirement = badge.requirement;
      let isEligible = false;
      
      switch (requirement.type) {
        case 'streak': {
          // Check streak requirement
          const { data: streakData, error: streakError } = await supabase
            .from('streaks')
            .select('current_streak, longest_streak')
            .eq('user_id', userId)
            .single();
          
          if (streakError && streakError.code !== 'PGRST116') throw streakError;
          if (!streakData) continue; // User has no streak data
          
          // Check if current or longest streak meets the requirement
          isEligible = streakData.current_streak >= requirement.days || 
                       streakData.longest_streak >= requirement.days;
          break;
        }
        
        case 'count': {
          // Check prayer count by category
          const { count, error: countError } = await supabase
            .from('prayers')
            .select('id', { count: 'exact' })
            .eq('user_id', userId)
            .eq('category', requirement.category);
          
          if (countError) throw countError;
          
          isEligible = count >= requirement.count;
          break;
        }
        
        case 'challenges': {
          // Check completed challenges count
          const { count, error: countError } = await supabase
            .from('family_challenges')
            .select('id', { count: 'exact' })
            .eq('family_id', (
              await supabase
                .from('family_members')
                .select('family_id')
                .eq('member_id', userId)
                .single()
            ).data?.family_id)
            .eq('completed', true);
          
          if (countError) throw countError;
          
          isEligible = count >= requirement.count;
          break;
        }
        
        case 'cards': {
          // Check blessing cards count
          const { count, error: countError } = await supabase
            .from('blessing_cards')
            .select('id', { count: 'exact' })
            .eq('user_id', userId);
          
          if (countError) throw countError;
          
          isEligible = count >= requirement.count;
          break;
        }
      }
      
      // Award badge if eligible
      if (isEligible) {
        const { data, error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id,
            earned_date: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (error) throw error;
        
        newlyAwardedBadges.push({
          ...data,
          badge_name: badge.name,
          badge_description: badge.description,
        });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        awarded_badges: newlyAwardedBadges, 
        total_badges: userBadges.length + newlyAwardedBadges.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
