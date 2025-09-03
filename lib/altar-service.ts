// lib/altar-service.ts

import { supabase } from './supabase';
import type { Prayer, Badge } from './altar-types';

// Prayers API
export async function createPrayer(prayer: Omit<Prayer, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('user_prayers')
    .insert(prayer)
    .select()
    .single();

  if (error) throw error;

  // Update streak
  try {
    await updatePrayerStreak();
  } catch (streakError) {
    console.error('Error updating streak:', streakError);
  }

  // Check for new badges
  try {
    await checkForBadges();
  } catch (badgeError) {
    console.error('Error checking badges:', badgeError);
  }

  return data;
}

export async function getPrayers(options: {
  limit?: number;
  offset?: number;
  type?: string;
  isAnswered?: boolean;
  searchQuery?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const {
    limit = 10,
    offset = 0,
    type,
    isAnswered,
    searchQuery,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  let query = supabase
    .from('user_prayers')
    .select('*', { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq('prayer_type', type);
  }

  if (isAnswered !== undefined) {
    query = query.eq('is_answered', isAnswered);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, count };
}

export async function getPrayer(id: string) {
  const { data, error } = await supabase
    .from('user_prayers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return data;
}

export async function updatePrayer(id: string, updates: Partial<Prayer>) {
  const { data, error } = await supabase
    .from('user_prayers')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (updates.is_answered) {
    // Check for new badges when a prayer is marked as answered
    try {
      await checkForBadges();
    } catch (badgeError) {
      console.error('Error checking badges:', badgeError);
    }
  }

  return data;
}

export async function deletePrayer(id: string) {
  const { error } = await supabase
    .from('user_prayers')
    .delete()
    .eq('id', id);

  if (error) throw error;

  return true;
}

// Intentions API
export async function createIntention(intention: any) {
  const { data, error } = await supabase
    .from('user_intentions')
    .insert(intention)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getIntentions(options: {
  limit?: number;
  offset?: number;
  category?: string;
  status?: 'active' | 'completed' | 'paused';
  searchQuery?: string;
  sortBy?: 'created_at' | 'updated_at' | 'title';
  sortOrder?: 'asc' | 'desc';
} = {}) {
  const {
    limit = 10,
    offset = 0,
    category,
    status,
    searchQuery,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  let query = supabase
    .from('user_intentions')
    .select('*', { count: 'exact' })
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  return { data, count };
}

export async function updateIntention(id: string, updates: any) {
  const { data, error } = await supabase
    .from('user_intentions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      // If status is being updated to completed, set completed_at
      ...(updates.status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (updates.status === 'completed') {
    // Check for new badges when an intention is completed
    try {
      await checkForBadges();
    } catch (badgeError) {
      console.error('Error checking badges:', badgeError);
    }
  }

  return data;
}

// Streaks API
export async function updatePrayerStreak() {
  const { user } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.functions.invoke('update-altar-streak', {
    body: { user_id: user.id }
  });

  if (error) throw error;

  return data;
}

export async function getUserStreak() {
  const { data, error } = await supabase
    .from('altar_streaks')
    .select('*')
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  return data || { current_streak: 0, longest_streak: 0 };
}

// Badges API
export async function checkForBadges() {
  const { user } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.functions.invoke('check-award-badges', {
    body: { user_id: user.id }
  });

  if (error) throw error;

  return data;
}

export async function getUserBadges() {
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      id,
      awarded_at,
      altar_badges:badge_id(
        id,
        name,
        description,
        scripture_reference,
        category,
        tier,
        icon_path
      )
    `)
    .order('awarded_at', { ascending: false });

  if (error) throw error;

  return data?.map((badge: any) => ({
    id: badge.id,
    awarded_at: badge.awarded_at,
    ...badge.altar_badges
  })) as Badge[];
}

// Family Challenges API
export async function getWeeklyChallenge(options: {
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
} = {}) {
  const { user } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase.functions.invoke('generate-weekly-challenge', {
    body: {
      user_id: user.id,
      ...options
    }
  });

  if (error) throw error;

  return data;
}

export async function startChallenge(challengeId: string, familyMemberCount: number = 1) {
  const { data, error } = await supabase
    .from('user_family_challenges')
    .insert({
      challenge_id: challengeId,
      family_member_count: familyMemberCount,
      status: 'active',
      start_date: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function completeChallenge(userChallengeId: string, reflection?: string) {
  const { data, error } = await supabase
    .from('user_family_challenges')
    .update({
      status: 'completed',
      completion_date: new Date().toISOString(),
      reflection: reflection || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userChallengeId)
    .select()
    .single();

  if (error) throw error;

  // Check for new badges when a challenge is completed
  try {
    await checkForBadges();
  } catch (badgeError) {
    console.error('Error checking badges:', badgeError);
  }

  return data;
}

export async function getUserChallenges(status?: 'active' | 'completed' | 'abandoned') {
  let query = supabase
    .from('user_family_challenges')
    .select(`
      id,
      start_date,
      completion_date,
      status,
      reflection,
      family_member_count,
      family_challenges:challenge_id(*)
    `)
    .order('start_date', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}

// Blessing Cards API
export async function getBlessingCardTemplates() {
  const { data, error } = await supabase
    .from('blessing_card_templates')
    .select('*')
    .order('name');

  if (error) throw error;

  return data;
}

export async function saveUserBlessingCard(cardData: any) {
  const { data, error } = await supabase
    .from('user_blessing_cards')
    .insert(cardData)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getUserBlessingCards() {
  const { data, error } = await supabase
    .from('user_blessing_cards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data;
}
