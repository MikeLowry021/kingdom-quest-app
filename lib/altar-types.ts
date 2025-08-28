// Type definitions for the Family Altar feature

// Prayer types
export interface Prayer {
  id: string;
  user_id: string;
  content: string;
  category: string;
  created_at: string;
  answered: boolean;
  answered_date?: string;
  answer_content?: string;
  tags: string[];
  scripture_reference?: string;
  is_private: boolean;
}

// Streak tracking
export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_prayer_date: string;
  streak_starts: string;
  missed_days?: number;
}

// Badge system
export interface Badge {
  id: string;
  name: string;
  description: string;
  scriptureRef: string;
  image: string;
  requirement: BadgeRequirement;
}

export type BadgeRequirement = 
  | { type: 'streak', days: number }
  | { type: 'count', category: string, count: number }
  | { type: 'challenges', count: number }
  | { type: 'cards', count: number };

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_date: string;
}

// Weekly challenge
export interface FamilyChallenge {
  id: string;
  title: string;
  description: string;
  scriptureRef: string;
  week_start: string;
  week_end: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  completion_date?: string;
  family_id: string;
}

// Prayer intentions
export interface Intention {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  active: boolean;
  reminder_frequency?: 'daily' | 'weekly' | 'monthly';
  last_reminder_date?: string;
}

// Blessing card
export interface BlessingCard {
  id: string;
  user_id: string;
  verse_id: string;
  template: string;
  message: string;
  recipient: string;
  created_at: string;
  shared: boolean;
}

// Analytics
export interface PrayerAnalytics {
  total_prayers: number;
  answered_prayers: number;
  prayer_categories: Record<string, number>;
  average_per_week: number;
  prayer_growth_rate: number;
}
