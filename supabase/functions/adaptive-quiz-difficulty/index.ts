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
        const { userId, quizId, scorePercentage, categoryType = 'general' } = await req.json();

        if (!userId || !quizId || scorePercentage === undefined) {
            throw new Error('userId, quizId, and scorePercentage are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Get current user performance metrics
        const metricsResponse = await fetch(`${supabaseUrl}/rest/v1/user_performance_metrics?user_id=eq.${userId}&category=eq.${categoryType}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            }
        });

        let currentMetrics = null;
        if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json();
            currentMetrics = metricsData.length > 0 ? metricsData[0] : null;
        }

        // Calculate new performance metrics
        const score = scorePercentage / 100; // Convert percentage to decimal
        let newTotalAttempts, newCorrectAnswers, newAccuracy, newRollingAccuracy, newDifficulty;

        if (currentMetrics) {
            newTotalAttempts = currentMetrics.total_attempts + 1;
            newCorrectAnswers = currentMetrics.correct_answers + (score >= 0.6 ? 1 : 0);
            newAccuracy = newCorrectAnswers / newTotalAttempts;
            
            // Calculate rolling accuracy (weighted towards recent performance)
            const weight = 0.3; // Weight for current score
            newRollingAccuracy = (currentMetrics.rolling_accuracy * (1 - weight)) + (score * weight);
        } else {
            newTotalAttempts = 1;
            newCorrectAnswers = score >= 0.6 ? 1 : 0;
            newAccuracy = newCorrectAnswers;
            newRollingAccuracy = score;
        }

        // Determine new difficulty level based on rolling accuracy
        let adjustmentReason = 'Performance-based adjustment';
        if (newRollingAccuracy >= 0.85) {
            newDifficulty = 'advanced';
            adjustmentReason = 'High accuracy - increasing difficulty';
        } else if (newRollingAccuracy >= 0.65) {
            newDifficulty = 'intermediate';
            adjustmentReason = 'Moderate accuracy - maintaining intermediate level';
        } else {
            newDifficulty = 'beginner';
            adjustmentReason = 'Lower accuracy - reducing to beginner level';
        }

        // Update or insert performance metrics
        const metricsData = {
            user_id: userId,
            category: categoryType,
            accuracy_score: newAccuracy,
            total_attempts: newTotalAttempts,
            correct_answers: newCorrectAnswers,
            rolling_accuracy: newRollingAccuracy,
            difficulty_level: newDifficulty,
            last_updated: new Date().toISOString()
        };

        let metricsUpdateResponse;
        if (currentMetrics) {
            // Update existing metrics
            metricsUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/user_performance_metrics?id=eq.${currentMetrics.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(metricsData)
            });
        } else {
            // Insert new metrics
            metricsData.created_at = new Date().toISOString();
            metricsUpdateResponse = await fetch(`${supabaseUrl}/rest/v1/user_performance_metrics`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(metricsData)
            });
        }

        if (!metricsUpdateResponse.ok) {
            const errorText = await metricsUpdateResponse.text();
            throw new Error(`Failed to update performance metrics: ${errorText}`);
        }

        // Log difficulty adjustment if it changed
        const originalDifficulty = currentMetrics?.difficulty_level || 'beginner';
        if (originalDifficulty !== newDifficulty) {
            const adjustmentData = {
                user_id: userId,
                quiz_id: quizId,
                original_difficulty: originalDifficulty,
                adjusted_difficulty: newDifficulty,
                adjustment_reason: adjustmentReason,
                performance_score: score,
                created_at: new Date().toISOString()
            };

            await fetch(`${supabaseUrl}/rest/v1/quiz_difficulty_adjustments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adjustmentData)
            });
        }

        // Return the results
        return new Response(JSON.stringify({
            data: {
                userId: userId,
                currentDifficulty: newDifficulty,
                rollingAccuracy: newRollingAccuracy,
                totalAttempts: newTotalAttempts,
                difficultyChanged: originalDifficulty !== newDifficulty,
                adjustmentReason: originalDifficulty !== newDifficulty ? adjustmentReason : null,
                metrics: {
                    accuracy: newAccuracy,
                    correctAnswers: newCorrectAnswers,
                    category: categoryType
                }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Adaptive difficulty error:', error);

        const errorResponse = {
            error: {
                code: 'ADAPTIVE_DIFFICULTY_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});