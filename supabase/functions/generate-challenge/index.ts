// Edge Function: generate-challenge
// Purpose: Generate a new weekly challenge for a family

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { addDays } from 'https://esm.sh/date-fns';

// Default CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Challenge templates
const challengeTemplates = [
  {
    id: 'gratitude',
    title: 'Gratitude Challenge',
    description: 'Each family member shares one thing they\'re grateful for each day this week.',
    scriptureRef: 'Colossians 3:15',
    difficulty: 'easy'
  },
  {
    id: 'kindness',
    title: 'Secret Acts of Kindness',
    description: 'Perform one secret act of kindness for another family member each day.',
    scriptureRef: 'Ephesians 4:32',
    difficulty: 'medium'
  },
  {
    id: 'memorization',
    title: 'Scripture Memorization',
    description: 'Work together to memorize a verse as a family by the end of the week.',
    scriptureRef: 'Psalm 119:11',
    difficulty: 'medium'
  },
  {
    id: 'prayer-walk',
    title: 'Family Prayer Walk',
    description: 'Take a walk around your neighborhood and pray for your neighbors.',
    scriptureRef: '1 Timothy 2:1',
    difficulty: 'easy'
  },
  {
    id: 'worship',
    title: 'Family Worship Night',
    description: 'Set aside one evening for family worship with songs, prayer, and sharing.',
    scriptureRef: 'Psalm 95:1-2',
    difficulty: 'medium'
  },
  {
    id: 'blessing',
    title: 'Blessing Declarations',
    description: 'Parents speak a blessing over each child every morning this week.',
    scriptureRef: 'Numbers 6:24-26',
    difficulty: 'easy'
  },
  {
    id: 'service',
    title: 'Family Service Project',
    description: 'Plan and complete a service project together as a family.',
    scriptureRef: 'Galatians 5:13',
    difficulty: 'hard'
  },
  {
    id: 'tech-fast',
    title: 'Digital Sabbath',
    description: 'Choose one day to disconnect from screens and connect with God and each other.',
    scriptureRef: 'Exodus 20:8-10',
    difficulty: 'hard'
  }
];

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
    
    // Get the family ID from the request body
    const { familyId } = await req.json();
    
    if (!familyId) {
      return new Response(
        JSON.stringify({ error: 'Family ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check if there's already an active challenge for this family
    const now = new Date();
    const { data: existingChallenge, error: existingError } = await supabase
      .from('family_challenges')
      .select('*')
      .eq('family_id', familyId)
      .lte('week_start', now.toISOString())
      .gte('week_end', now.toISOString())
      .maybeSingle();
    
    if (existingError) throw existingError;
    
    // If there's an active challenge, return it
    if (existingChallenge) {
      return new Response(
        JSON.stringify({ success: true, data: existingChallenge, isNew: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get completed challenges to avoid repetition
    const { data: completedChallenges, error: completedError } = await supabase
      .from('family_challenges')
      .select('title')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (completedError) throw completedError;
    
    // Get completed challenge titles for exclusion
    const recentTitles = completedChallenges.map(c => c.title);
    
    // Filter out recently completed challenges
    const eligibleTemplates = challengeTemplates.filter(t => !recentTitles.includes(t.title));
    
    // If all challenges have been used recently, use the full list
    const templatesPool = eligibleTemplates.length > 0 ? eligibleTemplates : challengeTemplates;
    
    // Pick a random challenge template
    const randomIndex = Math.floor(Math.random() * templatesPool.length);
    const selectedTemplate = templatesPool[randomIndex];
    
    // Calculate week start and end dates
    const weekStart = now;
    const weekEnd = addDays(now, 7);
    
    // Create the new challenge
    const { data: newChallenge, error: createError } = await supabase
      .from('family_challenges')
      .insert({
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        scripture_ref: selectedTemplate.scriptureRef,
        week_start: weekStart.toISOString(),
        week_end: weekEnd.toISOString(),
        difficulty: selectedTemplate.difficulty,
        completed: false,
        family_id: familyId,
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    return new Response(
      JSON.stringify({ success: true, data: newChallenge, isNew: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
