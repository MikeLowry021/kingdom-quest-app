import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface CreateRemixRequest {
  originalQuestId: string;
  title: string;
  description?: string;
  customTheme: string;
  targetAgeTier: 'early_childhood' | 'elementary' | 'middle_school' | 'high_school';
  targetDuration: 'short' | 'medium' | 'long';
}

interface RemixedContent {
  scenes: Array<{
    id: string;
    title: string;
    description: string;
    content: string;
    questions: Array<{
      question: string;
      options: string[];
      correct: number;
    }>;
  }>;
  lesson: string;
  memory_verse: string;
  customizations: {
    theme: string;
    ageAdaptations: string[];
    durationAdaptations: string[];
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { originalQuestId, title, description, customTheme, targetAgeTier, targetDuration }: CreateRemixRequest = await req.json();

    if (!originalQuestId || !title || !customTheme || !targetAgeTier || !targetDuration) {
      throw new Error('Missing required fields');
    }

    // Verify user has premium/church subscription
    const userResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_user_subscription`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({})
    });

    const userData = await userResponse.json();
    if (!userData || !['premium', 'church'].includes(userData.plan_id)) {
      return new Response(
        JSON.stringify({ error: 'Premium or Church subscription required for remix feature' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const userId = userData.user_id;

    // Fetch original quest
    const originalQuestResponse = await fetch(`${supabaseUrl}/rest/v1/original_quests?id=eq.${originalQuestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    const originalQuests = await originalQuestResponse.json();
    if (!originalQuests || originalQuests.length === 0) {
      throw new Error('Original quest not found');
    }

    const originalQuest = originalQuests[0];

    // Generate AI-remixed content based on theme and specifications
    const remixedContent = await generateRemixedContent(
      originalQuest,
      customTheme,
      targetAgeTier,
      targetDuration
    );

    // Create remix quest record
    const createRemixResponse = await fetch(`${supabaseUrl}/rest/v1/remix_quests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        original_quest_id: originalQuestId,
        creator_id: userId,
        title,
        description,
        custom_theme: customTheme,
        target_age_tier: targetAgeTier,
        target_duration: targetDuration,
        remixed_content: remixedContent,
        moderation_status: 'pending'
      })
    });

    if (!createRemixResponse.ok) {
      throw new Error(`Failed to create remix: ${await createRemixResponse.text()}`);
    }

    const remixQuest = await createRemixResponse.json();
    const remixQuestId = remixQuest[0].id;

    // Create initial version record
    await fetch(`${supabaseUrl}/rest/v1/quest_versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        remix_quest_id: remixQuestId,
        version_number: 1,
        content: remixedContent,
        change_summary: 'Initial remix creation',
        created_by: userId
      })
    });

    // Trigger AI moderation reviews
    const reviewPromises = [
      triggerTheologyReview(remixQuestId, {
        title,
        description: description || '',
        customTheme,
        remixedContent,
        scriptureReference: originalQuest.scripture_reference
      }),
      triggerSafetyReview(remixQuestId, {
        title,
        description: description || '',
        customTheme,
        remixedContent,
        targetAgeTier
      })
    ];

    // Execute reviews in parallel
    await Promise.all(reviewPromises);

    return new Response(
      JSON.stringify({
        success: true,
        remixQuest: {
          id: remixQuestId,
          title,
          originalQuestId,
          status: 'pending_review',
          remixedContent
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Create Remix Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create remix', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateRemixedContent(
  originalQuest: any,
  customTheme: string,
  targetAgeTier: string,
  targetDuration: string
): Promise<RemixedContent> {
  const originalContent = originalQuest.content;
  
  // Age-based adaptations
  const ageAdaptations = getAgeAdaptations(targetAgeTier);
  
  // Duration-based adaptations
  const durationAdaptations = getDurationAdaptations(targetDuration);
  
  // Apply thematic customizations
  const themedScenes = await applyThemeToScenes(originalContent.scenes, customTheme, ageAdaptations);
  
  // Adapt lesson and memory verse
  const adaptedLesson = await adaptLessonForAge(originalContent.lesson, targetAgeTier, customTheme);
  const adaptedMemoryVerse = await adaptMemoryVerseForAge(originalContent.memory_verse, targetAgeTier);
  
  return {
    scenes: themedScenes,
    lesson: adaptedLesson,
    memory_verse: adaptedMemoryVerse,
    customizations: {
      theme: customTheme,
      ageAdaptations,
      durationAdaptations
    }
  };
}

function getAgeAdaptations(ageTier: string): string[] {
  const adaptations = {
    'early_childhood': [
      'Simplified vocabulary',
      'Shorter sentences',
      'More visual descriptions',
      'Basic moral concepts',
      'Emphasis on love and kindness'
    ],
    'elementary': [
      'Age-appropriate vocabulary',
      'Clear cause and effect',
      'Interactive questions',
      'Character development focus',
      'Biblical values emphasis'
    ],
    'middle_school': [
      'More complex themes',
      'Historical context',
      'Moral reasoning',
      'Personal application',
      'Discussion questions'
    ],
    'high_school': [
      'Advanced theological concepts',
      'Cultural and historical analysis',
      'Critical thinking elements',
      'Life application challenges',
      'Leadership principles'
    ]
  };
  
  return adaptations[ageTier as keyof typeof adaptations] || adaptations.elementary;
}

function getDurationAdaptations(duration: string): string[] {
  const adaptations = {
    'short': [
      'Condensed scenes',
      'Focus on key message',
      'Fewer questions',
      'Quick activities',
      'Simple reflection'
    ],
    'medium': [
      'Balanced pacing',
      'Multiple scenes',
      'Comprehensive questions',
      'Moderate activities',
      'Thoughtful reflection'
    ],
    'long': [
      'Extended scenes',
      'Deep exploration',
      'Multiple question sets',
      'Extended activities',
      'In-depth reflection'
    ]
  };
  
  return adaptations[duration as keyof typeof adaptations] || adaptations.medium;
}

async function applyThemeToScenes(scenes: any[], theme: string, ageAdaptations: string[]): Promise<any[]> {
  // This would normally use an AI service to apply thematic customizations
  // For now, we'll do rule-based adaptations
  
  return scenes.map((scene, index) => {
    let adaptedContent = scene.content;
    let adaptedDescription = scene.description;
    
    // Apply theme-based modifications
    if (theme.toLowerCase().includes('modern')) {
      adaptedContent = modernizeLanguage(adaptedContent);
      adaptedDescription = modernizeLanguage(adaptedDescription);
    }
    
    if (theme.toLowerCase().includes('adventure')) {
      adaptedContent = addAdventureElements(adaptedContent);
      adaptedDescription = addAdventureElements(adaptedDescription);
    }
    
    if (theme.toLowerCase().includes('family')) {
      adaptedContent = emphasizeFamilyValues(adaptedContent);
      adaptedDescription = emphasizeFamilyValues(adaptedDescription);
    }
    
    // Apply age adaptations
    if (ageAdaptations.includes('Simplified vocabulary')) {
      adaptedContent = simplifyVocabulary(adaptedContent);
      adaptedDescription = simplifyVocabulary(adaptedDescription);
    }
    
    return {
      ...scene,
      content: adaptedContent,
      description: adaptedDescription,
      questions: adaptQuestionsForAge(scene.questions, ageAdaptations)
    };
  });
}

function modernizeLanguage(text: string): string {
  // Replace archaic terms with modern equivalents
  return text
    .replace(/thou/gi, 'you')
    .replace(/thee/gi, 'you')
    .replace(/thy/gi, 'your')
    .replace(/thine/gi, 'yours')
    .replace(/verily/gi, 'truly')
    .replace(/behold/gi, 'look')
    .replace(/hath/gi, 'has')
    .replace(/doth/gi, 'does');
}

function addAdventureElements(text: string): string {
  // Add adventure-themed language
  return text
    .replace(/went/gi, 'journeyed')
    .replace(/saw/gi, 'discovered')
    .replace(/said/gi, 'declared')
    .replace(/walked/gi, 'ventured')
    .replace(/found/gi, 'uncovered');
}

function emphasizeFamilyValues(text: string): string {
  // Emphasize family and community aspects
  if (text.includes('people')) {
    text = text.replace(/people/gi, 'families and communities');
  }
  if (text.includes('everyone')) {
    text = text.replace(/everyone/gi, 'every family');
  }
  return text;
}

function simplifyVocabulary(text: string): string {
  // Replace complex words with simpler alternatives
  const replacements = {
    'magnificent': 'wonderful',
    'tremendous': 'very big',
    'extraordinary': 'amazing',
    'communicate': 'talk',
    'demonstrate': 'show',
    'nevertheless': 'but',
    'furthermore': 'also',
    'consequently': 'so'
  };
  
  let simplifiedText = text;
  Object.entries(replacements).forEach(([complex, simple]) => {
    const regex = new RegExp(complex, 'gi');
    simplifiedText = simplifiedText.replace(regex, simple);
  });
  
  return simplifiedText;
}

function adaptQuestionsForAge(questions: any[], ageAdaptations: string[]): any[] {
  return questions.map(question => {
    if (ageAdaptations.includes('Simplified vocabulary')) {
      return {
        ...question,
        question: simplifyVocabulary(question.question),
        options: question.options.map((option: string) => simplifyVocabulary(option))
      };
    }
    return question;
  });
}

async function adaptLessonForAge(lesson: string, ageTier: string, theme: string): Promise<string> {
  let adaptedLesson = lesson;
  
  // Apply theme modifications
  if (theme.toLowerCase().includes('modern')) {
    adaptedLesson = modernizeLanguage(adaptedLesson);
  }
  if (theme.toLowerCase().includes('family')) {
    adaptedLesson = emphasizeFamilyValues(adaptedLesson);
  }
  
  // Apply age-specific adaptations
  switch (ageTier) {
    case 'early_childhood':
      adaptedLesson = simplifyVocabulary(adaptedLesson);
      adaptedLesson = `Remember: ${adaptedLesson}`;
      break;
    case 'elementary':
      adaptedLesson = `What we learn: ${adaptedLesson}`;
      break;
    case 'middle_school':
      adaptedLesson = `Life Application: ${adaptedLesson} How can you apply this in your daily life?`;
      break;
    case 'high_school':
      adaptedLesson = `Key Insight: ${adaptedLesson} Consider how this principle can guide your decisions and relationships.`;
      break;
  }
  
  return adaptedLesson;
}

async function adaptMemoryVerseForAge(memoryVerse: string, ageTier: string): Promise<string> {
  switch (ageTier) {
    case 'early_childhood':
      // Keep it simple and short
      return simplifyVocabulary(memoryVerse).split('.')[0] + '.';
    case 'elementary':
      return simplifyVocabulary(memoryVerse);
    default:
      return memoryVerse;
  }
}

async function triggerTheologyReview(remixQuestId: string, content: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/theology-guard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        remixQuestId,
        content
      })
    });
    
    if (!response.ok) {
      console.error('Theology review failed:', await response.text());
    }
  } catch (error) {
    console.error('Error triggering theology review:', error);
  }
}

async function triggerSafetyReview(remixQuestId: string, content: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/safety-moderator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        remixQuestId,
        content
      })
    });
    
    if (!response.ok) {
      console.error('Safety review failed:', await response.text());
    }
  } catch (error) {
    console.error('Error triggering safety review:', error);
  }
}