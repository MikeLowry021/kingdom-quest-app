import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
};

interface SafetyReviewRequest {
  remixQuestId: string;
  content: {
    title: string;
    description: string;
    customTheme: string;
    remixedContent: any;
    targetAgeTier: string;
  };
}

interface SafetyReviewResult {
  status: 'approved' | 'rejected' | 'needs_revision';
  score: number; // 1-100
  feedback: {
    ageAppropriateness: string;
    contentSafety: string;
    languageCheck: string;
    psychologicalImpact: string;
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
    const { remixQuestId, content }: SafetyReviewRequest = await req.json();

    if (!remixQuestId || !content) {
      throw new Error('Missing required fields: remixQuestId and content');
    }

    // Initialize review result
    const reviewResult: SafetyReviewResult = {
      status: 'approved',
      score: 100,
      feedback: {
        ageAppropriateness: '',
        contentSafety: '',
        languageCheck: '',
        psychologicalImpact: '',
        recommendations: []
      },
      flaggedIssues: [],
      processingTimeMs: 0
    };

    // Child Safety Review Checks
    const safetyChecks = {
      ageAppropriate: checkAgeAppropriate(content),
      languageAppropriate: checkLanguageAppropriate(content),
      violenceLevel: checkViolenceLevel(content),
      scarinessLevel: checkScarinessLevel(content),
      psychologicalSafety: checkPsychologicalSafety(content),
      inappropriateContent: checkInappropriateContent(content),
      readingLevel: checkReadingLevel(content),
      positiveMessaging: checkPositiveMessaging(content)
    };

    // Calculate overall score and determine status
    let totalScore = 100;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Age appropriateness check
    if (!safetyChecks.ageAppropriate.appropriate) {
      const deduction = safetyChecks.ageAppropriate.severity === 'high' ? 30 : 15;
      totalScore -= deduction;
      issues.push(safetyChecks.ageAppropriate.reason);
      recommendations.push('Adjust content complexity and themes for target age group');
    }

    // Language appropriateness check
    if (safetyChecks.languageAppropriate.issues.length > 0) {
      totalScore -= 20;
      issues.push(...safetyChecks.languageAppropriate.issues);
      recommendations.push('Review and modify language for child-appropriate communication');
    }

    // Violence level check
    if (safetyChecks.violenceLevel.score > getViolenceThreshold(content.targetAgeTier)) {
      totalScore -= 25;
      issues.push(`Violence level (${safetyChecks.violenceLevel.score}/10) exceeds safe threshold for ${content.targetAgeTier}`);
      recommendations.push('Reduce violent content or focus on non-violent resolution approaches');
    }

    // Scariness level check
    if (safetyChecks.scarinessLevel.score > getScarinessThreshold(content.targetAgeTier)) {
      totalScore -= 20;
      issues.push(`Scariness level (${safetyChecks.scarinessLevel.score}/10) too high for ${content.targetAgeTier}`);
      recommendations.push('Reduce frightening elements and emphasize comfort and safety');
    }

    // Psychological safety check
    if (safetyChecks.psychologicalSafety.risks.length > 0) {
      totalScore -= 25;
      issues.push(...safetyChecks.psychologicalSafety.risks);
      recommendations.push('Address psychological safety concerns and promote emotional wellbeing');
    }

    // Inappropriate content check
    if (safetyChecks.inappropriateContent.issues.length > 0) {
      totalScore -= 35; // Major deduction for inappropriate content
      issues.push(...safetyChecks.inappropriateContent.issues);
      recommendations.push('Remove all inappropriate content and ensure family-friendly material');
    }

    // Reading level check
    if (!safetyChecks.readingLevel.appropriate) {
      totalScore -= 10;
      issues.push(safetyChecks.readingLevel.reason);
      recommendations.push('Adjust vocabulary and sentence complexity for target age group');
    }

    // Positive messaging check
    if (safetyChecks.positiveMessaging.score < 7) {
      totalScore -= 15;
      issues.push('Content lacks sufficient positive, encouraging messaging');
      recommendations.push('Include more positive role models and encouraging themes');
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
    reviewResult.feedback.recommendations = recommendations;
    reviewResult.feedback.ageAppropriateness = generateAgeAppropriatenessFeedback(safetyChecks.ageAppropriate, content.targetAgeTier);
    reviewResult.feedback.contentSafety = generateContentSafetyFeedback(totalScore);
    reviewResult.feedback.languageCheck = generateLanguageFeedback(safetyChecks.languageAppropriate);
    reviewResult.feedback.psychologicalImpact = generatePsychologicalFeedback(safetyChecks.psychologicalSafety);
    reviewResult.processingTimeMs = Date.now() - startTime;

    // Store review result in database
    await storeReviewResult(remixQuestId, 'safety_moderator', reviewResult);

    return new Response(
      JSON.stringify({ success: true, review: reviewResult }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('SafetyModerator Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Safety review failed', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Safety checking functions
function checkAgeAppropriate(content: any): { appropriate: boolean; reason?: string; severity?: 'low' | 'medium' | 'high' } {
  const contentText = JSON.stringify(content).toLowerCase();
  const ageTier = content.targetAgeTier;
  
  // Define age-inappropriate concepts by tier
  const inappropriateByAge = {
    'early_childhood': {
      high: ['death', 'hell', 'damnation', 'torture', 'murder', 'suicide'],
      medium: ['war', 'battle', 'prison', 'punishment', 'betrayal']
    },
    'elementary': {
      high: ['torture', 'murder', 'suicide', 'sexual', 'rape'],
      medium: ['hell', 'damnation', 'extreme violence']
    },
    'middle_school': {
      high: ['sexual', 'rape', 'extreme torture', 'graphic violence'],
      medium: ['substance abuse', 'self-harm']
    },
    'high_school': {
      high: ['graphic sexual content', 'extreme graphic violence'],
      medium: []
    }
  };
  
  const ageGroup = inappropriateByAge[ageTier as keyof typeof inappropriateByAge] || inappropriateByAge['elementary'];
  
  // Check high severity issues
  for (const concept of ageGroup.high) {
    if (contentText.includes(concept)) {
      return {
        appropriate: false,
        reason: `Content contains '${concept}' which is inappropriate for ${ageTier}`,
        severity: 'high'
      };
    }
  }
  
  // Check medium severity issues
  for (const concept of ageGroup.medium) {
    if (contentText.includes(concept)) {
      return {
        appropriate: false,
        reason: `Content contains '${concept}' which may be inappropriate for ${ageTier}`,
        severity: 'medium'
      };
    }
  }
  
  return { appropriate: true };
}

function checkLanguageAppropriate(content: any): { issues: string[]; severity: 'none' | 'low' | 'medium' | 'high' } {
  const issues: string[] = [];
  const contentText = JSON.stringify(content).toLowerCase();
  
  // Check for inappropriate language
  const inappropriateLanguage = [
    { words: ['damn', 'hell'], severity: 'low', context: 'mild profanity' },
    { words: ['stupid', 'idiot', 'dumb'], severity: 'medium', context: 'negative labeling' },
    { words: ['hate', 'kill', 'destroy'], severity: 'medium', context: 'aggressive language' }
  ];
  
  let maxSeverity: 'none' | 'low' | 'medium' | 'high' = 'none';
  
  inappropriateLanguage.forEach(category => {
    category.words.forEach(word => {
      if (contentText.includes(word)) {
        issues.push(`Inappropriate language detected: '${word}' (${category.context})`);
        if (category.severity === 'high' || (category.severity === 'medium' && maxSeverity !== 'high') || (category.severity === 'low' && maxSeverity === 'none')) {
          maxSeverity = category.severity;
        }
      }
    });
  });
  
  return { issues, severity: maxSeverity };
}

function checkViolenceLevel(content: any): { score: number; description: string; details: string[] } {
  const contentText = JSON.stringify(content).toLowerCase();
  let violenceScore = 0;
  const details: string[] = [];
  
  // Violence keywords with weights
  const violenceKeywords = [
    { words: ['fight', 'battle'], weight: 1, description: 'combat references' },
    { words: ['blood', 'wound', 'injury'], weight: 2, description: 'injury references' },
    { words: ['kill', 'murder', 'death'], weight: 3, description: 'death references' },
    { words: ['sword', 'weapon', 'knife'], weight: 1, description: 'weapon references' },
    { words: ['torture', 'pain', 'suffering'], weight: 3, description: 'suffering references' },
    { words: ['destroy', 'crush', 'smash'], weight: 2, description: 'destructive references' }
  ];
  
  violenceKeywords.forEach(category => {
    let found = false;
    category.words.forEach(word => {
      if (contentText.includes(word)) {
        if (!found) {
          violenceScore += category.weight;
          details.push(category.description);
          found = true;
        }
      }
    });
  });
  
  let description = 'Minimal violence';
  if (violenceScore > 8) description = 'Extreme violence';
  else if (violenceScore > 6) description = 'High violence';
  else if (violenceScore > 4) description = 'Moderate violence';
  else if (violenceScore > 2) description = 'Low violence';
  
  return { score: Math.min(violenceScore, 10), description, details };
}

function checkScarinessLevel(content: any): { score: number; factors: string[] } {
  const contentText = JSON.stringify(content).toLowerCase();
  let scarinessScore = 0;
  const factors: string[] = [];
  
  const scaryElements = [
    { words: ['dark', 'darkness', 'shadow'], weight: 1, factor: 'Darkness themes' },
    { words: ['monster', 'demon', 'evil'], weight: 3, factor: 'Evil entities' },
    { words: ['scared', 'afraid', 'terrified'], weight: 2, factor: 'Fear emotions' },
    { words: ['nightmare', 'horror', 'frightening'], weight: 3, factor: 'Horror elements' },
    { words: ['lost', 'alone', 'abandoned'], weight: 2, factor: 'Isolation fears' },
    { words: ['punishment', 'wrath', 'anger'], weight: 2, factor: 'Divine judgment' }
  ];
  
  scaryElements.forEach(category => {
    let found = false;
    category.words.forEach(word => {
      if (contentText.includes(word)) {
        if (!found) {
          scarinessScore += category.weight;
          factors.push(category.factor);
          found = true;
        }
      }
    });
  });
  
  return { score: Math.min(scarinessScore, 10), factors };
}

function checkPsychologicalSafety(content: any): { risks: string[]; protectiveFactors: string[] } {
  const contentText = JSON.stringify(content).toLowerCase();
  const risks: string[] = [];
  const protectiveFactors: string[] = [];
  
  // Psychological risks
  const psychRisks = [
    { patterns: [/abandon/i, /left alone/i], risk: 'Abandonment themes may cause anxiety' },
    { patterns: [/not good enough/i, /worthless/i], risk: 'Self-worth issues may impact self-esteem' },
    { patterns: [/never forgive/i, /unforgivable/i], risk: 'Unforgiveness themes may cause guilt' },
    { patterns: [/always watching/i, /constantly judged/i], risk: 'Surveillance themes may cause anxiety' }
  ];
  
  psychRisks.forEach(riskItem => {
    if (riskItem.patterns.some(pattern => pattern.test(contentText))) {
      risks.push(riskItem.risk);
    }
  });
  
  // Protective factors
  const protectivePatterns = [
    { patterns: [/love/i, /loved/i], factor: 'Love and acceptance themes' },
    { patterns: [/forgive/i, /forgiveness/i], factor: 'Forgiveness and mercy themes' },
    { patterns: [/help/i, /support/i], factor: 'Support and assistance themes' },
    { patterns: [/hope/i, /hopeful/i], factor: 'Hope and encouragement themes' },
    { patterns: [/safe/i, /protected/i], factor: 'Safety and protection themes' }
  ];
  
  protectivePatterns.forEach(protectiveItem => {
    if (protectiveItem.patterns.some(pattern => pattern.test(contentText))) {
      protectiveFactors.push(protectiveItem.factor);
    }
  });
  
  return { risks, protectiveFactors };
}

function checkInappropriateContent(content: any): { issues: string[]; severity: 'none' | 'low' | 'medium' | 'high' } {
  const contentText = JSON.stringify(content).toLowerCase();
  const issues: string[] = [];
  let maxSeverity: 'none' | 'low' | 'medium' | 'high' = 'none';
  
  // Inappropriate content categories
  const inappropriateContent = [
    {
      patterns: [/sexual/i, /sex/i, /intimate/i],
      severity: 'high' as const,
      issue: 'Sexual content inappropriate for children'
    },
    {
      patterns: [/drug/i, /alcohol/i, /smoking/i],
      severity: 'medium' as const,
      issue: 'Substance references may be inappropriate'
    },
    {
      patterns: [/gambling/i, /betting/i],
      severity: 'medium' as const,
      issue: 'Gambling references inappropriate for children'
    },
    {
      patterns: [/discrimination/i, /racism/i, /prejudice/i],
      severity: 'high' as const,
      issue: 'Discriminatory content detected'
    }
  ];
  
  inappropriateContent.forEach(category => {
    if (category.patterns.some(pattern => pattern.test(contentText))) {
      issues.push(category.issue);
      if (category.severity === 'high' || (category.severity === 'medium' && maxSeverity !== 'high') || (category.severity === 'low' && maxSeverity === 'none')) {
        maxSeverity = category.severity;
      }
    }
  });
  
  return { issues, severity: maxSeverity };
}

function checkReadingLevel(content: any): { appropriate: boolean; reason?: string; estimatedLevel?: string } {
  const contentText = JSON.stringify(content);
  const avgWordsPerSentence = calculateAverageWordsPerSentence(contentText);
  const avgSyllablesPerWord = calculateAverageSyllablesPerWord(contentText);
  const targetAgeTier = content.targetAgeTier;
  
  // Simplified reading level thresholds
  const readingLevelThresholds = {
    'early_childhood': { maxWordsPerSentence: 8, maxSyllablesPerWord: 1.3 },
    'elementary': { maxWordsPerSentence: 12, maxSyllablesPerWord: 1.6 },
    'middle_school': { maxWordsPerSentence: 16, maxSyllablesPerWord: 1.8 },
    'high_school': { maxWordsPerSentence: 20, maxSyllablesPerWord: 2.0 }
  };
  
  const threshold = readingLevelThresholds[targetAgeTier as keyof typeof readingLevelThresholds] || readingLevelThresholds['elementary'];
  
  if (avgWordsPerSentence > threshold.maxWordsPerSentence) {
    return {
      appropriate: false,
      reason: `Average sentence length (${avgWordsPerSentence.toFixed(1)} words) too high for ${targetAgeTier}`,
      estimatedLevel: 'Too advanced'
    };
  }
  
  if (avgSyllablesPerWord > threshold.maxSyllablesPerWord) {
    return {
      appropriate: false,
      reason: `Vocabulary complexity (${avgSyllablesPerWord.toFixed(1)} syllables/word) too high for ${targetAgeTier}`,
      estimatedLevel: 'Too advanced'
    };
  }
  
  return { appropriate: true, estimatedLevel: 'Appropriate' };
}

function checkPositiveMessaging(content: any): { score: number; positiveElements: string[]; negativeElements: string[] } {
  const contentText = JSON.stringify(content).toLowerCase();
  let positiveScore = 0;
  const positiveElements: string[] = [];
  const negativeElements: string[] = [];
  
  // Positive messaging indicators
  const positiveIndicators = [
    { words: ['love', 'loving', 'beloved'], points: 2, element: 'Love themes' },
    { words: ['hope', 'hopeful', 'optimistic'], points: 2, element: 'Hope and optimism' },
    { words: ['kind', 'kindness', 'compassion'], points: 2, element: 'Kindness and compassion' },
    { words: ['forgive', 'forgiveness', 'mercy'], points: 2, element: 'Forgiveness themes' },
    { words: ['help', 'helping', 'support'], points: 1, element: 'Helping others' },
    { words: ['brave', 'courage', 'strong'], points: 1, element: 'Courage and strength' },
    { words: ['grateful', 'thankful', 'blessing'], points: 1, element: 'Gratitude themes' }
  ];
  
  // Negative messaging indicators
  const negativeIndicators = [
    { words: ['hate', 'hatred', 'despise'], element: 'Hate themes' },
    { words: ['hopeless', 'despair', 'give up'], element: 'Hopelessness themes' },
    { words: ['worthless', 'useless', 'failure'], element: 'Self-worth issues' },
    { words: ['revenge', 'vengeance', 'payback'], element: 'Revenge themes' }
  ];
  
  positiveIndicators.forEach(indicator => {
    let found = false;
    indicator.words.forEach(word => {
      if (contentText.includes(word)) {
        if (!found) {
          positiveScore += indicator.points;
          positiveElements.push(indicator.element);
          found = true;
        }
      }
    });
  });
  
  negativeIndicators.forEach(indicator => {
    let found = false;
    indicator.words.forEach(word => {
      if (contentText.includes(word)) {
        if (!found) {
          negativeElements.push(indicator.element);
          found = true;
        }
      }
    });
  });
  
  return {
    score: Math.min(positiveScore, 10),
    positiveElements,
    negativeElements
  };
}

// Helper functions
function calculateAverageWordsPerSentence(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const totalWords = sentences.reduce((total, sentence) => {
    return total + sentence.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, 0);
  
  return totalWords / sentences.length;
}

function calculateAverageSyllablesPerWord(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (words.length === 0) return 0;
  
  const totalSyllables = words.reduce((total, word) => {
    return total + countSyllables(word);
  }, 0);
  
  return totalSyllables / words.length;
}

function countSyllables(word: string): number {
  // Simple syllable counting algorithm
  let count = word.toLowerCase().match(/[aeiouy]+/g)?.length || 0;
  if (word.endsWith('e')) count--;
  return Math.max(1, count);
}

function getViolenceThreshold(ageTier: string): number {
  const thresholds = {
    'early_childhood': 1,
    'elementary': 3,
    'middle_school': 5,
    'high_school': 7
  };
  return thresholds[ageTier as keyof typeof thresholds] || 3;
}

function getScarinessThreshold(ageTier: string): number {
  const thresholds = {
    'early_childhood': 1,
    'elementary': 3,
    'middle_school': 5,
    'high_school': 7
  };
  return thresholds[ageTier as keyof typeof thresholds] || 3;
}

// Feedback generation functions
function generateAgeAppropriatenessFeedback(check: any, ageTier: string): string {
  if (check.appropriate) {
    return `Content is appropriately designed for ${ageTier} audience.`;
  } else {
    return `Content contains elements inappropriate for ${ageTier}: ${check.reason}`;
  }
}

function generateContentSafetyFeedback(score: number): string {
  if (score >= 95) return 'Excellent content safety with no concerns detected.';
  if (score >= 85) return 'Good content safety with minor areas for improvement.';
  if (score >= 70) return 'Adequate safety but requires attention to child protection standards.';
  if (score >= 60) return 'Safety concerns present that need addressing before approval.';
  return 'Significant safety issues detected requiring major revision or rejection.';
}

function generateLanguageFeedback(check: any): string {
  if (check.issues.length === 0) {
    return 'Language is appropriate and child-friendly.';
  } else {
    return `Language concerns detected (${check.severity} severity): ${check.issues.join(', ')}`;
  }
}

function generatePsychologicalFeedback(check: any): string {
  if (check.risks.length === 0) {
    return 'Content promotes positive psychological wellbeing.';
  } else {
    const riskSummary = check.risks.join('; ');
    const protectiveSummary = check.protectiveFactors.length > 0 
      ? ` Positive elements include: ${check.protectiveFactors.join(', ')}.`
      : '';
    return `Psychological risks identified: ${riskSummary}.${protectiveSummary}`;
  }
}

async function storeReviewResult(remixQuestId: string, reviewType: string, result: SafetyReviewResult) {
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
        reviewer_agent: 'SafetyModerator',
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