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
        // Extract content from request
        const requestData = await req.json();
        const { content, questId, remixId, targetAge, contentType = 'story' } = requestData;

        if (!content) {
            throw new Error('Content is required for safety review');
        }

        // Get environment variables
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        // Define safety evaluation criteria based on age groups
        const ageTiers = {
            'early-childhood': {
                name: 'Early Childhood (3-5)',
                maxScaryContent: 0,
                maxViolence: 0,
                allowedThemes: ['love', 'kindness', 'sharing', 'helping', 'friendship'],
                bannedWords: ['death', 'kill', 'war', 'scary', 'monster', 'evil']
            },
            'elementary': {
                name: 'Elementary (6-10)',
                maxScaryContent: 1,
                maxViolence: 1,
                allowedThemes: ['courage', 'honesty', 'perseverance', 'forgiveness', 'responsibility'],
                bannedWords: ['violence', 'hatred', 'revenge', 'torture']
            },
            'middle-school': {
                name: 'Middle School (11-13)',
                maxScaryContent: 2,
                maxViolence: 2,
                allowedThemes: ['justice', 'integrity', 'identity', 'purpose', 'relationships'],
                bannedWords: ['explicit violence', 'inappropriate content']
            },
            'high-school': {
                name: 'High School (14-18)',
                maxScaryContent: 3,
                maxViolence: 3,
                allowedThemes: ['leadership', 'wisdom', 'calling', 'faith challenges', 'social justice'],
                bannedWords: ['hate speech', 'discriminatory language']
            }
        };

        const currentTier = ageTiers[targetAge] || ageTiers['elementary'];

        // Safety review prompt for AI analysis
        const systemPrompt = `You are SafetyModerator, an AI content moderator specialized in ensuring child safety and age-appropriate content for Christian educational materials.

Your role is to evaluate user-generated content modifications to ensure they are safe and appropriate for children and families. You must assess content against these safety criteria:

1. **Age Appropriateness**: Content suitable for target age group (${currentTier.name})
2. **Violence/Fear Content**: Minimize scary or violent themes inappropriate for children
3. **Language Safety**: Ensure language is appropriate and non-harmful
4. **Emotional Safety**: Content should not cause undue fear, anxiety, or trauma
5. **Educational Value**: Content should maintain positive learning outcomes
6. **Family-Friendly**: Suitable for family and church environments

For each piece of content, provide:
- Overall safety status (SAFE/NEEDS_REVIEW/UNSAFE)
- Specific safety concerns if any
- Age-appropriate suggestions for improvement
- Confidence level (HIGH/MEDIUM/LOW)

Return your response in JSON format with detailed reasoning.`;

        const userPrompt = `Please review the following ${contentType} content for child safety and age-appropriateness for ${currentTier.name}:

"${content}"

Evaluate against safety criteria and provide comprehensive safety assessment.`;

        // Perform safety content analysis using Gemini Pro
        const safetyAnalysis = await performGeminiSafetyAnalysis({
            content,
            contentType,
            targetAge,
            ageTier: currentTier,
            geminiApiKey
        });

        // Save moderation review to database
        const reviewData = {
            quest_id: questId,
            remix_id: remixId,
            content_type: contentType,
            content_excerpt: content.substring(0, 500),
            moderator_type: 'safety-moderator',
            status: safetyAnalysis.status === 'SAFE' ? 'APPROVED' : safetyAnalysis.status === 'NEEDS_REVIEW' ? 'REQUIRES_REVIEW' : 'REJECTED',
            confidence_level: safetyAnalysis.confidence,
            concerns: safetyAnalysis.concerns,
            suggestions: safetyAnalysis.suggestions,
            detailed_analysis: safetyAnalysis.detailedAnalysis,
            target_age: targetAge,
            reviewed_at: new Date().toISOString()
        };

        // Insert review into database
        const insertResponse = await fetch(`${supabaseUrl}/rest/v1/moderation_reviews`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(reviewData)
        });

        if (!insertResponse.ok) {
            const errorText = await insertResponse.text();
            console.error('Database insert failed:', errorText);
            throw new Error(`Failed to save safety review: ${errorText}`);
        }

        const savedReview = await insertResponse.json();

        // Return safety review result
        const result = {
            reviewId: savedReview[0]?.id,
            status: safetyAnalysis.status,
            confidence: safetyAnalysis.confidence,
            safety_assessment: {
                age_appropriateness: safetyAnalysis.ageAppropriateness,
                violence_content: safetyAnalysis.violenceContent,
                language_safety: safetyAnalysis.languageSafety,
                emotional_safety: safetyAnalysis.emotionalSafety,
                family_friendly: safetyAnalysis.familyFriendly
            },
            target_age_tier: currentTier.name,
            concerns: safetyAnalysis.concerns,
            suggestions: safetyAnalysis.suggestions,
            requires_human_review: safetyAnalysis.confidence === 'LOW' || safetyAnalysis.status === 'NEEDS_REVIEW',
            processed_at: new Date().toISOString()
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('SafetyModerator error:', error);

        const errorResponse = {
            error: {
                code: 'SAFETY_MODERATOR_ERROR',
                message: error.message,
                details: 'Failed to complete safety content review'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Real AI safety analysis using Google Gemini Pro
async function performGeminiSafetyAnalysis({ content, contentType, targetAge, ageTier, geminiApiKey }) {
    try {
        const safetyPrompt = `You are SafetyModerator, an expert AI content moderator specialized in child safety and age-appropriate content analysis for Christian educational materials.

Your role is to evaluate user-generated content modifications to ensure they are safe and appropriate for children and families. Target age group: ${ageTier.name}.

Analyze the following content against these safety criteria:

1. **Age Appropriateness**: Content suitable for ${ageTier.name} (violence limit: ${ageTier.maxViolence}, scary content limit: ${ageTier.maxScaryContent})
2. **Violence/Fear Content**: Minimize scary or violent themes inappropriate for children
3. **Language Safety**: Ensure language is appropriate and non-harmful
4. **Emotional Safety**: Content should not cause undue fear, anxiety, or trauma
5. **Educational Value**: Content should maintain positive learning outcomes
6. **Family-Friendly**: Suitable for family and church environments

Content to analyze:
"${content}"

Provide your response in the following JSON format:
{
  "status": "SAFE" | "NEEDS_REVIEW" | "UNSAFE",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "concerns": ["array of specific safety concerns"],
  "suggestions": ["array of improvement suggestions"],
  "age_appropriateness": "Appropriate" | "Questionable" | "Inappropriate",
  "violence_content": "Acceptable" | "Mild Concern" | "Excessive",
  "language_safety": "Safe" | "Some Concerns" | "Inappropriate",
  "emotional_safety": "Safe" | "May Cause Mild Anxiety" | "May Cause Distress",
  "family_friendly": "Yes" | "With Guidance" | "No",
  "reasoning": "detailed explanation of your safety analysis"
}

Be thorough in your analysis. Consider the specific age group and err on the side of caution for child safety.`;

        // Call Gemini Pro API
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: safetyPrompt }]
                }],
                generationConfig: {
                    temperature: 0.1, // Low temperature for consistent, conservative analysis
                    topK: 1,
                    topP: 0.8,
                    maxOutputTokens: 1024
                }
            })
        });

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Gemini API error: ${errorText}`);
        }

        const geminiResult = await geminiResponse.json();
        const generatedText = geminiResult.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('No response from Gemini AI');
        }

        // Parse AI response
        let aiAnalysis;
        try {
            // Extract JSON from response (handle potential markdown formatting)
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : generatedText;
            aiAnalysis = JSON.parse(jsonString);
        } catch (parseError) {
            console.warn('Failed to parse AI response as JSON, using fallback analysis');
            // Fallback analysis based on keyword detection
            aiAnalysis = createFallbackSafetyAnalysis(content, generatedText, ageTier);
        }

        // Validate and normalize the response
        return {
            status: aiAnalysis.status || 'NEEDS_REVIEW',
            confidence: aiAnalysis.confidence || 'MEDIUM',
            concerns: Array.isArray(aiAnalysis.concerns) ? aiAnalysis.concerns : ['AI analysis completed with limited parsing'],
            suggestions: Array.isArray(aiAnalysis.suggestions) ? aiAnalysis.suggestions : ['Review content for safety appropriateness'],
            ageAppropriateness: aiAnalysis.age_appropriateness || 'Requires Review',
            violenceContent: aiAnalysis.violence_content || 'Requires Review',
            languageSafety: aiAnalysis.language_safety || 'Requires Review',
            emotionalSafety: aiAnalysis.emotional_safety || 'Requires Review',
            familyFriendly: aiAnalysis.family_friendly || 'Requires Review',
            detailedAnalysis: {
                ai_model: 'gemini-pro',
                reasoning: aiAnalysis.reasoning || generatedText.substring(0, 500),
                analysis_timestamp: new Date().toISOString(),
                content_length: content.length,
                target_age: targetAge,
                age_tier_name: ageTier.name
            }
        };
        
    } catch (error) {
        console.error('Gemini safety analysis error:', error);
        
        // Return safe fallback
        return {
            status: 'NEEDS_REVIEW',
            confidence: 'LOW',
            concerns: [`AI analysis failed: ${error.message}`],
            suggestions: ['Please review content manually for safety'],
            ageAppropriateness: 'Unknown',
            violenceContent: 'Unknown',
            languageSafety: 'Unknown',
            emotionalSafety: 'Unknown',
            familyFriendly: 'Unknown',
            detailedAnalysis: {
                error: error.message,
                fallback_analysis: true,
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Fallback safety analysis when JSON parsing fails
function createFallbackSafetyAnalysis(content, aiResponse, ageTier) {
    const contentLower = content.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    // Safety keyword analysis
    const concerningWords = ['violent', 'scary', 'dangerous', 'inappropriate', 'unsafe', 'disturbing'];
    const safeWords = ['gentle', 'kind', 'safe', 'appropriate', 'peaceful', 'loving'];
    
    let status = 'SAFE';
    let confidence = 'MEDIUM';
    let concerns = [];
    let suggestions = [];
    
    // Check if AI response indicates safety concerns
    if (concerningWords.some(word => responseLower.includes(word))) {
        status = 'NEEDS_REVIEW';
        concerns.push('AI analysis identified potential safety concerns');
    }
    
    // Check for banned words specific to age tier
    let bannedWordCount = 0;
    for (const bannedWord of ageTier.bannedWords) {
        if (contentLower.includes(bannedWord.toLowerCase())) {
            bannedWordCount++;
            concerns.push(`Contains potentially inappropriate term for ${ageTier.name}: "${bannedWord}"`);
            status = 'NEEDS_REVIEW';
        }
    }
    
    // Check for safe content indicators
    const safeScore = safeWords.filter(word => contentLower.includes(word)).length;
    if (safeScore >= 2) {
        confidence = 'HIGH';
    } else if (safeScore === 0 && status === 'SAFE') {
        suggestions.push('Consider adding more positive and reassuring language');
    }
    
    return {
        status,
        confidence,
        concerns: concerns.length > 0 ? concerns : ['Fallback analysis - manual review recommended'],
        suggestions: suggestions.length > 0 ? suggestions : ['Content appears safe'],
        age_appropriateness: status === 'SAFE' ? 'Appropriate' : 'Requires Review',
        violence_content: bannedWordCount === 0 ? 'Acceptable' : 'Requires Review',
        language_safety: bannedWordCount === 0 ? 'Safe' : 'Some Concerns',
        emotional_safety: status === 'SAFE' ? 'Safe' : 'Requires Review',
        family_friendly: safeScore > 0 ? 'Yes' : 'Requires Review',
        reasoning: `Fallback analysis based on keyword detection for ${ageTier.name}. Original AI response: ${aiResponse.substring(0, 200)}`
    };
}