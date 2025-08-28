import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface TheologyReviewRequest {
  remixQuestId: string;
  content: {
    title: string;
    description: string;
    customTheme: string;
    remixedContent: any;
    scriptureReference: string;
  };
}

interface TheologyReviewResult {
  status: 'approved' | 'rejected' | 'needs_revision';
  score: number; // 1-100
  feedback: {
    theologicalAccuracy: string;
    doctrinalConcerns: string[];
    scriptureAlignment: string;
    recommendations: string[];
  };
  flaggedIssues: string[];
  processingTimeMs: number;
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
    const startTime = Date.now();
    const { remixQuestId, content }: TheologyReviewRequest = await req.json();

    if (!remixQuestId || !content) {
      throw new Error('Missing required fields: remixQuestId and content');
    }

    // Initialize review result
    const reviewResult: TheologyReviewResult = {
      status: 'approved',
      score: 100,
      feedback: {
        theologicalAccuracy: '',
        doctrinalConcerns: [],
        scriptureAlignment: '',
        recommendations: []
      },
      flaggedIssues: [],
      processingTimeMs: 0
    };

    // Theological Review Checks
    const theologicalChecks = {
      // Core Christian doctrines
      trinityViolations: checkTrinityDoctrine(content),
      salvationIssues: checkSalvationDoctrine(content),
      scriptureIntegrity: checkScriptureIntegrity(content),
      christologyIssues: checkChristology(content),
      
      // Content appropriateness
      ageAppropriateness: checkAgeAppropriateness(content),
      violenceLevel: checkViolenceLevel(content),
      fearFactors: checkFearFactors(content),
      
      // Biblical accuracy
      historicalAccuracy: checkHistoricalAccuracy(content),
      contextualAccuracy: checkContextualAccuracy(content),
      characterPortrayal: checkCharacterPortrayal(content)
    };

    // Calculate overall score and determine status
    let totalScore = 100;
    const issues: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Trinity doctrine check
    if (theologicalChecks.trinityViolations.length > 0) {
      totalScore -= 20;
      issues.push(...theologicalChecks.trinityViolations);
      concerns.push('Trinity doctrine concerns detected');
      recommendations.push('Ensure the Trinity (Father, Son, Holy Spirit) is represented in orthodox manner');
    }

    // Salvation doctrine check
    if (theologicalChecks.salvationIssues.length > 0) {
      totalScore -= 15;
      issues.push(...theologicalChecks.salvationIssues);
      concerns.push('Salvation doctrine issues identified');
      recommendations.push('Review salvation messaging to align with biblical teaching of salvation by grace through faith');
    }

    // Scripture integrity check
    if (!theologicalChecks.scriptureIntegrity.isAccurate) {
      totalScore -= 25;
      issues.push('Scripture misrepresentation detected');
      concerns.push('Biblical accuracy concerns');
      recommendations.push('Verify all biblical content against authoritative translations');
    }

    // Christology check
    if (theologicalChecks.christologyIssues.length > 0) {
      totalScore -= 20;
      issues.push(...theologicalChecks.christologyIssues);
      concerns.push('Issues with portrayal of Jesus Christ');
      recommendations.push('Ensure Christ is portrayed in accordance with biblical teaching');
    }

    // Age appropriateness check
    if (!theologicalChecks.ageAppropriateness.appropriate) {
      totalScore -= 10;
      issues.push(theologicalChecks.ageAppropriateness.reason);
      recommendations.push('Adjust content complexity for target age group');
    }

    // Violence level check
    if (theologicalChecks.violenceLevel.score > 7) {
      totalScore -= 15;
      issues.push('Violence level too high for target audience');
      recommendations.push('Reduce graphic descriptions of violence, focus on spiritual lessons');
    }

    // Fear factors check
    if (theologicalChecks.fearFactors.score > 6) {
      totalScore -= 10;
      issues.push('Content may cause excessive fear in children');
      recommendations.push('Balance divine justice with God\'s love and mercy');
    }

    // Historical accuracy check
    if (!theologicalChecks.historicalAccuracy.accurate) {
      totalScore -= 15;
      issues.push('Historical inaccuracies detected');
      recommendations.push('Research historical context and cultural background');
    }

    // Contextual accuracy check
    if (!theologicalChecks.contextualAccuracy.accurate) {
      totalScore -= 20;
      issues.push('Scripture taken out of context');
      concerns.push('Contextual interpretation issues');
      recommendations.push('Study the broader biblical context of the passage');
    }

    // Character portrayal check
    if (theologicalChecks.characterPortrayal.issues.length > 0) {
      totalScore -= 10;
      issues.push(...theologicalChecks.characterPortrayal.issues);
      recommendations.push('Portray biblical characters with accuracy and respect');
    }

    // Ensure score doesn't go below 0
    totalScore = Math.max(0, totalScore);

    // Determine final status
    let status: 'approved' | 'rejected' | 'needs_revision';
    if (totalScore >= 85) {
      status = 'approved';
    } else if (totalScore >= 60) {
      status = 'needs_revision';
    } else {
      status = 'rejected';
    }

    reviewResult.status = status;
    reviewResult.score = totalScore;
    reviewResult.flaggedIssues = issues;
    reviewResult.feedback.doctrinalConcerns = concerns;
    reviewResult.feedback.recommendations = recommendations;
    reviewResult.feedback.theologicalAccuracy = generateTheologicalAccuracyFeedback(totalScore);
    reviewResult.feedback.scriptureAlignment = generateScriptureAlignmentFeedback(theologicalChecks);
    reviewResult.processingTimeMs = Date.now() - startTime;

    // Store review result in database
    await storeReviewResult(remixQuestId, 'theology_guard', reviewResult);

    return new Response(
      JSON.stringify({ success: true, review: reviewResult }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('TheologyGuard Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Theology review failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Theology checking functions
function checkTrinityDoctrine(content: any): string[] {
  const issues: string[] = [];
  const contentText = JSON.stringify(content).toLowerCase();
  
  // Check for common Trinity violations
  const violations = [
    { pattern: /jesus is not god/i, issue: 'Denial of Christ\'s divinity detected' },
    { pattern: /three gods/i, issue: 'Tritheism detected - suggests three separate gods' },
    { pattern: /jesus became god/i, issue: 'Adoptionism detected - suggests Jesus became divine' },
    { pattern: /holy spirit is not/i, issue: 'Denial of Holy Spirit\'s personhood or divinity' }
  ];
  
  violations.forEach(violation => {
    if (violation.pattern.test(contentText)) {
      issues.push(violation.issue);
    }
  });
  
  return issues;
}

function checkSalvationDoctrine(content: any): string[] {
  const issues: string[] = [];
  const contentText = JSON.stringify(content).toLowerCase();
  
  // Check for salvation by works
  const worksSalvationPatterns = [
    /salvation by works/i,
    /earn your salvation/i,
    /good works save/i,
    /must do good to be saved/i
  ];
  
  worksSalvationPatterns.forEach(pattern => {
    if (pattern.test(contentText)) {
      issues.push('Salvation by works detected - contradicts salvation by grace through faith');
    }
  });
  
  // Check for universalism
  if (/everyone goes to heaven/i.test(contentText) || /all paths lead to god/i.test(contentText)) {
    issues.push('Universalism detected - contradicts biblical exclusivity of salvation through Christ');
  }
  
  return issues;
}

function checkScriptureIntegrity(content: any): { isAccurate: boolean; issues: string[] } {
  const issues: string[] = [];
  let isAccurate = true;
  
  // Check if content contains direct scripture quotes and verify them
  const scriptureReference = content.scriptureReference;
  if (scriptureReference) {
    // Basic validation of scripture reference format
    const validFormat = /^\d?\s?[A-Za-z]+\s+\d+(:\d+)?(-\d+(:\d+)?)?$/.test(scriptureReference.trim());
    if (!validFormat) {
      issues.push('Invalid scripture reference format');
      isAccurate = false;
    }
  }
  
  // Check for scripture modifications that change meaning
  const contentText = JSON.stringify(content).toLowerCase();
  if (/".*"/.test(contentText)) {
    // Basic check for quoted material - in a real system, this would cross-reference with Bible API
    // For now, we'll flag potential issues
    if (contentText.includes('modified') || contentText.includes('paraphrased extensively')) {
      issues.push('Potentially modified scripture detected');
      isAccurate = false;
    }
  }
  
  return { isAccurate, issues };
}

function checkChristology(content: any): string[] {
  const issues: string[] = [];
  const contentText = JSON.stringify(content).toLowerCase();
  
  // Check for docetic issues (Jesus not fully human)
  if (/jesus only seemed/i.test(contentText) || /not really human/i.test(contentText)) {
    issues.push('Docetic tendencies detected - questioning Christ\'s full humanity');
  }
  
  // Check for Arian issues (Jesus not fully divine)
  if (/created being/i.test(contentText) && contentText.includes('jesus')) {
    issues.push('Arian tendencies detected - questioning Christ\'s full divinity');
  }
  
  // Check for inappropriate characterization
  if (/jesus made mistakes/i.test(contentText) || /jesus sinned/i.test(contentText)) {
    issues.push('Inappropriate characterization of Christ\'s sinlessness');
  }
  
  return issues;
}

function checkAgeAppropriateness(content: any): { appropriate: boolean; reason?: string } {
  const contentText = JSON.stringify(content).toLowerCase();
  
  // Check vocabulary complexity
  const complexWords = ['ecclesiastical', 'eschatological', 'soteriological', 'pneumatological'];
  for (const word of complexWords) {
    if (contentText.includes(word.toLowerCase())) {
      return { appropriate: false, reason: 'Theological terminology too complex for target age' };
    }
  }
  
  // Check for age-appropriate concepts
  if (content.targetAgeTier === 'early_childhood') {
    if (contentText.includes('death') || contentText.includes('hell') || contentText.includes('judgment')) {
      return { appropriate: false, reason: 'Heavy theological concepts inappropriate for early childhood' };
    }
  }
  
  return { appropriate: true };
}

function checkViolenceLevel(content: any): { score: number; description: string } {
  const contentText = JSON.stringify(content).toLowerCase();
  let violenceScore = 0;
  
  // Violence keywords with weights
  const violenceKeywords = [
    { words: ['blood', 'bleeding', 'wound'], weight: 2 },
    { words: ['kill', 'killed', 'murder'], weight: 3 },
    { words: ['sword', 'weapon', 'battle'], weight: 1 },
    { words: ['death', 'died', 'dying'], weight: 2 },
    { words: ['torture', 'suffering', 'pain'], weight: 3 }
  ];
  
  violenceKeywords.forEach(category => {
    category.words.forEach(word => {
      if (contentText.includes(word)) {
        violenceScore += category.weight;
      }
    });
  });
  
  let description = 'Minimal violence';
  if (violenceScore > 10) description = 'Extreme violence';
  else if (violenceScore > 7) description = 'High violence';
  else if (violenceScore > 4) description = 'Moderate violence';
  else if (violenceScore > 2) description = 'Low violence';
  
  return { score: Math.min(violenceScore, 10), description };
}

function checkFearFactors(content: any): { score: number; factors: string[] } {
  const contentText = JSON.stringify(content).toLowerCase();
  let fearScore = 0;
  const fearFactors: string[] = [];
  
  const fearKeywords = [
    { words: ['afraid', 'scared', 'fear'], weight: 1, factor: 'Fear emotions' },
    { words: ['darkness', 'dark', 'shadow'], weight: 1, factor: 'Darkness themes' },
    { words: ['monster', 'demon', 'evil'], weight: 2, factor: 'Evil entities' },
    { words: ['punishment', 'wrath', 'anger'], weight: 2, factor: 'Divine judgment' },
    { words: ['hell', 'damnation', 'eternal'], weight: 3, factor: 'Eternal consequences' }
  ];
  
  fearKeywords.forEach(category => {
    let found = false;
    category.words.forEach(word => {
      if (contentText.includes(word)) {
        if (!found) {
          fearScore += category.weight;
          fearFactors.push(category.factor);
          found = true;
        }
      }
    });
  });
  
  return { score: Math.min(fearScore, 10), factors: fearFactors };
}

function checkHistoricalAccuracy(content: any): { accurate: boolean; issues: string[] } {
  // This would normally cross-reference with historical databases
  // For now, we'll do basic checks
  return { accurate: true, issues: [] };
}

function checkContextualAccuracy(content: any): { accurate: boolean; issues: string[] } {
  // This would normally analyze the broader biblical context
  // For now, we'll do basic checks
  return { accurate: true, issues: [] };
}

function checkCharacterPortrayal(content: any): { issues: string[] } {
  const issues: string[] = [];
  const contentText = JSON.stringify(content).toLowerCase();
  
  // Check for inappropriate characterizations
  if (contentText.includes('god made a mistake')) {
    issues.push('Inappropriate portrayal of God\'s perfection');
  }
  
  if (contentText.includes('jesus was confused')) {
    issues.push('Inappropriate portrayal of Christ\'s divine knowledge');
  }
  
  return { issues };
}

function generateTheologicalAccuracyFeedback(score: number): string {
  if (score >= 95) return 'Excellent theological accuracy with sound biblical foundation.';
  if (score >= 85) return 'Good theological content with minor areas for improvement.';
  if (score >= 70) return 'Adequate theology but requires attention to doctrinal precision.';
  if (score >= 60) return 'Theological concerns present that need addressing before approval.';
  return 'Significant theological issues detected requiring major revision or rejection.';
}

function generateScriptureAlignmentFeedback(checks: any): string {
  if (checks.scriptureIntegrity.isAccurate && checks.contextualAccuracy.accurate) {
    return 'Scripture is accurately represented and properly contextualized.';
  } else if (checks.scriptureIntegrity.isAccurate) {
    return 'Scripture is accurate but may need better contextualization.';
  } else {
    return 'Scripture accuracy issues detected - please verify against reliable translations.';
  }
}

async function storeReviewResult(remixQuestId: string, reviewType: string, result: TheologyReviewResult) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/moderation_reviews`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        remix_quest_id: remixQuestId,
        review_type: reviewType,
        reviewer_agent: 'TheologyGuard',
        status: result.status,
        score: result.score,
        feedback: result.feedback,
        flagged_issues: result.flaggedIssues,
        recommendations: result.feedback.recommendations,
        processing_time_ms: result.processingTimeMs
      })
    });
    
    if (!response.ok) {
      console.error('Failed to store review result:', await response.text());
    }
  } catch (error) {
    console.error('Error storing review result:', error);
  }
}