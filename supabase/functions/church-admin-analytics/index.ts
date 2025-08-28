// Edge Function to provide Church Admin analytics data

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the JWT token from the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set the auth context
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Verify user has Church plan subscription
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription || subscription.subscription_plans?.name !== 'Church') {
      throw new Error('Unauthorized: Church subscription required');
    }

    // Get church members associated with this church admin
    const { data: churchMembers } = await supabaseClient
      .from('church_members')
      .select('user_id')
      .eq('church_admin_id', user.id);

    const memberIds = churchMembers?.map(m => m.user_id) || [];
    memberIds.push(user.id); // Include the admin as well

    // Get date range for analytics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // Fetch various analytics data in parallel
    const [members, prayers, donations, streaks, quizAttempts, analyticsEvents] = await Promise.all([
      // Total church members
      supabaseClient
        .from('church_members')
        .select('*')
        .eq('church_admin_id', user.id),
      
      // Prayer activities
      supabaseClient
        .from('user_prayers')
        .select('*')
        .in('user_id', memberIds)
        .gte('created_at', thirtyDaysAgoStr),
      
      // Donations
      supabaseClient
        .from('donations')
        .select('*')
        .in('user_id', memberIds)
        .gte('created_at', thirtyDaysAgoStr),
      
      // Altar streaks
      supabaseClient
        .from('altar_streaks')
        .select('*')
        .in('user_id', memberIds),
      
      // Quiz attempts
      supabaseClient
        .from('quiz_attempts')
        .select('*')
        .in('user_id', memberIds)
        .gte('created_at', thirtyDaysAgoStr),
      
      // User analytics events
      supabaseClient
        .from('user_analytics_events')
        .select('*')
        .in('user_id', memberIds)
        .gte('created_at', thirtyDaysAgoStr)
    ]);

    // Process analytics data
    const analytics = {
      overview: {
        totalMembers: members.data?.length || 0,
        activePrayers: prayers.data?.length || 0,
        totalDonations: donations.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
        activeStreaks: streaks.data?.filter(s => s.current_streak > 0).length || 0
      },
      
      engagement: {
        dailyActiveUsers: {},
        prayersByDay: {},
        quizzesByDay: {},
        streakActivity: {}
      },
      
      donations: {
        total: donations.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0,
        byDay: {},
        byType: {}
      },
      
      spiritual: {
        averageStreak: streaks.data?.reduce((sum, s) => sum + s.current_streak, 0) / (streaks.data?.length || 1) || 0,
        totalPrayers: prayers.data?.length || 0,
        completedQuizzes: quizAttempts.data?.filter(q => q.completed_at).length || 0
      }
    };

    // Process daily analytics for last 30 days
    const dailyData = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyData[dateKey] = {
        prayers: 0,
        quizzes: 0,
        donations: 0,
        activeUsers: new Set()
      };
    }

    // Fill in actual data
    prayers.data?.forEach(prayer => {
      const dateKey = prayer.created_at.split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].prayers++;
        dailyData[dateKey].activeUsers.add(prayer.user_id);
      }
    });

    quizAttempts.data?.forEach(quiz => {
      const dateKey = quiz.created_at.split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].quizzes++;
        dailyData[dateKey].activeUsers.add(quiz.user_id);
      }
    });

    donations.data?.forEach(donation => {
      const dateKey = donation.created_at.split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].donations += donation.amount;
        dailyData[dateKey].activeUsers.add(donation.user_id);
      }
    });

    // Convert sets to counts and fill analytics
    Object.keys(dailyData).forEach(date => {
      analytics.engagement.dailyActiveUsers[date] = dailyData[date].activeUsers.size;
      analytics.engagement.prayersByDay[date] = dailyData[date].prayers;
      analytics.engagement.quizzesByDay[date] = dailyData[date].quizzes;
      analytics.donations.byDay[date] = dailyData[date].donations;
    });

    // Group donations by type
    donations.data?.forEach(donation => {
      const type = donation.type || 'general';
      analytics.donations.byType[type] = (analytics.donations.byType[type] || 0) + donation.amount;
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: analytics 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const errorResponse = {
      error: {
        code: 'CHURCH_ANALYTICS_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
