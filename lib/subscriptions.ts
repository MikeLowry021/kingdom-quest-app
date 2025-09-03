import { supabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-browser';

export async function getSubscription() {
  // For server-side rendering, use the main supabase client
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      // If no subscription found, user is on free plan
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

// Client-side version for use in components
export async function getSubscriptionClient() {
  const client = createClient();
  
  try {
    const { data: { user }, error: authError } = await client.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: subscription, error } = await client
      .from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (error) {
      // If no subscription found, user is on free plan
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}
