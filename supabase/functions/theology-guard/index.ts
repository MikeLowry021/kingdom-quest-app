// Import Gemini AI - Note: Import statement handled differently in Deno
// Use dynamic import or fetch directly to Gemini API

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
        const { content, questId, remixId, contentType = 'story' } = requestData;

        if (!content) {
            throw new Error('Content is required for theological review');
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

        // Perform real AI theological analysis using Gemini Pro
        const aiAnalysis = await performGeminiTheologicalAnalysis({
            content,
            contentType,
            geminiApiKey
        });

        // Save moderation review to database
        const reviewData = {
            quest_id: questId,
            remix_id: remixId,
            content_type: contentType,
            content_excerpt: content.substring(0, 500),
            moderator_type: 'theology-guard',
            status: aiAnalysis.status,
            confidence_level: aiAnalysis.confidence,
            concerns: aiAnalysis.concerns,
            suggestions: aiAnalysis.suggestions,
            detailed_analysis: aiAnalysis.detailedAnalysis,
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
            throw new Error(`Failed to save moderation review: ${errorText}`);
        }

        const savedReview = await insertResponse.json();

        // Return theological review result
        const result = {
            reviewId: savedReview[0]?.id,
            status: aiAnalysis.status,
            confidence: aiAnalysis.confidence,
            theological_assessment: {
                doctrinal_accuracy: aiAnalysis.doctrinalphrases,
                biblical_fidelity: aiAnalysis.biblicalFidelity,
                age_appropriateness: aiAnalysis.ageAppropriateness,
                denominational_neutrality: aiAnalysis.denominationalNeutrality,
                scripture_alignment: aiAnalysis.scriptureAlignment
            },
            concerns: aiAnalysis.concerns,
            suggestions: aiAnalysis.suggestions,
            requires_human_review: aiAnalysis.confidence === 'LOW' || aiAnalysis.status === 'REQUIRES_REVIEW',
            processed_at: new Date().toISOString()
        };

        return new Response(JSON.stringify({ data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('TheologyGuard error:', error);

        const errorResponse = {
            error: {
                code: 'THEOLOGY_GUARD_ERROR',
                message: error.message,
                details: 'Failed to complete theological content review'
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Real AI theological analysis using Google Gemini Pro
async function performGeminiTheologicalAnalysis({ content, contentType, geminiApiKey }) {
    try {
        const theologicalPrompt = `You are TheologyGuard, an expert AI content moderator specialized in Biblical and Christian theological analysis.

Your role is to evaluate user-generated content modifications to Bible stories for theological accuracy and appropriateness. Analyze the following content against these specific criteria:

1. **Doctrinal Accuracy**: Does the content align with orthodox Christian doctrine?
2. **Biblical Fidelity**: Does it remain faithful to the original Biblical narrative?
3. **Age Appropriateness**: Are theological concepts suitable for the target audience?
4. **Denominational Neutrality**: Is the content broadly acceptable across Christian denominations?
5. **Scripture Alignment**: Does the content avoid contradicting Biblical teachings?

Content to analyze:
"${content}"

Provide your response in the following JSON format:
{
  "status": "APPROVED" | "REQUIRES_REVIEW" | "REJECTED",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "concerns": ["array of specific theological concerns"],
  "suggestions": ["array of improvement suggestions"],
  "doctrinal_accuracy": "Sound" | "Questionable" | "Problematic",
  "biblical_fidelity": "Maintained" | "Somewhat Maintained" | "Compromised",
  "denominational_neutrality": "Broadly Acceptable" | "Some Concerns" | "Divisive",
  "scripture_alignment": "Aligned" | "Mostly Aligned" | "Contradictory",
  "reasoning": "detailed explanation of your analysis"
}

Be thorough but fair in your analysis. Focus on substantial theological concerns rather than minor stylistic preferences.`;

        // Call Gemini Pro API
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: theologicalPrompt }]
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
            aiAnalysis = createFallbackTheologicalAnalysis(content, generatedText);
        }

        // Validate and normalize the response
        return {
            status: aiAnalysis.status || 'REQUIRES_REVIEW',
            confidence: aiAnalysis.confidence || 'MEDIUM',
            concerns: Array.isArray(aiAnalysis.concerns) ? aiAnalysis.concerns : ['AI analysis completed with limited parsing'],
            suggestions: Array.isArray(aiAnalysis.suggestions) ? aiAnalysis.suggestions : ['Review content for theological accuracy'],
            doctrinalphrases: aiAnalysis.doctrinal_accuracy || 'Requires Review',
            biblicalFidelity: aiAnalysis.biblical_fidelity || 'Requires Review',
            denominationalNeutrality: aiAnalysis.denominational_neutrality || 'Requires Review',
            scriptureAlignment: aiAnalysis.scripture_alignment || 'Requires Review',
            ageAppropriateness: 'Requires age-specific review',
            detailedAnalysis: {
                ai_model: 'gemini-pro',
                reasoning: aiAnalysis.reasoning || generatedText.substring(0, 500),
                analysis_timestamp: new Date().toISOString(),
                content_length: content.length
            }
        };
        
    } catch (error) {
        console.error('Gemini theological analysis error:', error);
        
        // Return safe fallback
        return {
            status: 'REQUIRES_REVIEW',
            confidence: 'LOW',
            concerns: [`AI analysis failed: ${error.message}`],
            suggestions: ['Please review content manually for theological accuracy'],
            doctrinalphrases: 'Unknown',
            biblicalFidelity: 'Unknown',
            denominationalNeutrality: 'Unknown', 
            scriptureAlignment: 'Unknown',
            ageAppropriateness: 'Unknown',
            detailedAnalysis: { 
                error: error.message,
                fallback_analysis: true,
                timestamp: new Date().toISOString()
            }
        };
    }
}

// Fallback analysis when JSON parsing fails
function createFallbackTheologicalAnalysis(content, aiResponse) {
    const contentLower = content.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    // Basic keyword analysis
    const positiveTheologyWords = ['jesus', 'christ', 'god', 'love', 'forgiveness', 'salvation', 'grace', 'faith'];
    const concerningWords = ['contradict', 'heretical', 'false', 'error', 'inappropriate'];
    
    let status = 'APPROVED';
    let confidence = 'MEDIUM';
    let concerns = [];
    let suggestions = [];
    
    // Check if AI response indicates concerns
    if (concerningWords.some(word => responseLower.includes(word))) {
        status = 'REQUIRES_REVIEW';
        concerns.push('AI analysis identified potential theological concerns');
    }
    
    // Check for positive theological content
    const positiveScore = positiveTheologyWords.filter(word => contentLower.includes(word)).length;
    if (positiveScore >= 2) {
        confidence = 'HIGH';
    } else if (positiveScore === 0) {
        suggestions.push('Consider including more explicit Christian theological elements');
    }
    
    return {
        status,
        confidence,
        concerns: concerns.length > 0 ? concerns : ['Fallback analysis - manual review recommended'],
        suggestions: suggestions.length > 0 ? suggestions : ['Content appears theologically sound'],
        doctrinal_accuracy: status === 'APPROVED' ? 'Sound' : 'Requires Review',
        biblical_fidelity: 'Requires Review',
        denominational_neutrality: 'Broadly Acceptable',
        scripture_alignment: status === 'APPROVED' ? 'Aligned' : 'Requires Review',
        reasoning: `Fallback analysis based on keyword detection. Original AI response: ${aiResponse.substring(0, 200)}`
    };
}