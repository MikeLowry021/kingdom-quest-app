import { createClient } from '@/lib/supabase-browser';
import { Prayer, Streak, UserBadge, FamilyChallenge, Intention, BlessingCard } from './altar-types';

// Create a Supabase client for browser-side requests
const supabase = createClient();

// Prayer-related API calls
export const prayerApi = {
  // Get all prayers for the current user
  getPrayers: async (userId: string): Promise<Prayer[]> => {
    const { data, error } = await supabase
      .from('prayers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Prayer[];
  },
  
  // Add a new prayer
  addPrayer: async (prayer: Omit<Prayer, 'id' | 'created_at'>): Promise<Prayer> => {
    const { data, error } = await supabase
      .from('prayers')
      .insert(prayer)
      .select()
      .single();
    
    if (error) throw error;
    return data as Prayer;
  },
  
  // Mark a prayer as answered
  markAsAnswered: async (prayerId: string, answerContent?: string): Promise<void> => {
    const { error } = await supabase
      .from('prayers')
      .update({
        answered: true,
        answered_date: new Date().toISOString(),
        answer_content: answerContent || '',
      })
      .eq('id', prayerId);
    
    if (error) throw error;
  },
};

// Streak-related API calls
export const streakApi = {
  // Get streak information for a user
  getStreak: async (userId: string): Promise<Streak | null> => {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Streak;
  },
  
  // Update streak after prayer
  updateStreak: async (userId: string): Promise<void> => {
    // This would call the update-streak edge function
    const { error } = await supabase.functions.invoke('update-streak', {
      body: { userId },
    });
    
    if (error) throw error;
  },
};

// Badge-related API calls
export const badgeApi = {
  // Get badges earned by user
  getUserBadges: async (userId: string): Promise<UserBadge[]> => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as UserBadge[];
  },
  
  // Check for badge eligibility and award if earned
  checkBadges: async (userId: string): Promise<void> => {
    // This would call the award-badges edge function
    const { error } = await supabase.functions.invoke('award-badges', {
      body: { userId },
    });
    
    if (error) throw error;
  },
};

// Challenge-related API calls
export const challengeApi = {
  // Get current weekly challenge
  getCurrentChallenge: async (familyId: string): Promise<FamilyChallenge | null> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('family_challenges')
      .select('*')
      .eq('family_id', familyId)
      .lte('week_start', now)
      .gte('week_end', now)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as FamilyChallenge;
  },
  
  // Generate a new challenge
  generateChallenge: async (familyId: string): Promise<FamilyChallenge | null> => {
    // This would call the generate-challenge edge function
    const { data, error } = await supabase.functions.invoke('generate-challenge', {
      body: { familyId },
    });
    
    if (error) throw error;
    return data as FamilyChallenge;
  },
  
  // Mark a challenge as completed
  completeChallenge: async (challengeId: string): Promise<void> => {
    const { error } = await supabase
      .from('family_challenges')
      .update({
        completed: true,
        completion_date: new Date().toISOString(),
      })
      .eq('id', challengeId);
    
    if (error) throw error;
  },
};

// Intention-related API calls
export const intentionApi = {
  // Get all active intentions
  getIntentions: async (userId: string): Promise<Intention[]> => {
    const { data, error } = await supabase
      .from('intentions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Intention[];
  },
  
  // Add a new intention
  addIntention: async (intention: Omit<Intention, 'id' | 'created_at'>): Promise<Intention> => {
    const { data, error } = await supabase
      .from('intentions')
      .insert(intention)
      .select()
      .single();
    
    if (error) throw error;
    return data as Intention;
  },
  
  // Deactivate an intention
  deactivateIntention: async (intentionId: string): Promise<void> => {
    const { error } = await supabase
      .from('intentions')
      .update({ active: false })
      .eq('id', intentionId);
    
    if (error) throw error;
  },
};

// Blessing card-related API calls
export const blessingCardApi = {
  // Save a blessing card
  saveCard: async (card: Omit<BlessingCard, 'id' | 'created_at'>): Promise<BlessingCard> => {
    const { data, error } = await supabase
      .from('blessing_cards')
      .insert(card)
      .select()
      .single();
    
    if (error) throw error;
    return data as BlessingCard;
  },
  
  // Track when a blessing card is created
  trackBlessingCard: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('blessing_cards')
      .insert({
        user_id: userId,
        verse_id: 'custom',  // Default value
        template: 'light',   // Default value
        message: '',         // Default value
        recipient: '',       // Default value
        shared: false,       // Default value
      });
    
    if (error) throw error;
  },
  
  // Get blessing cards created by user
  getUserCards: async (userId: string): Promise<BlessingCard[]> => {
    const { data, error } = await supabase
      .from('blessing_cards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as BlessingCard[];
  },
};

// Combined altar API
export const altarApi = {
  ...prayerApi,
  ...streakApi,
  ...badgeApi,
  ...challengeApi,
  ...intentionApi,
  ...blessingCardApi,
};
