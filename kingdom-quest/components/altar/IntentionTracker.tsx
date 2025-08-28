'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Intention } from '@/lib/altar-types';
import { altarApi } from '@/lib/altar-api';
import { PlusCircle, Heart, Bell, Trash2, CheckCircle } from 'lucide-react';

export default function IntentionTracker() {
  const { user } = useAuth();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIntention, setNewIntention] = useState('');
  const [reminderFrequency, setReminderFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Fetch intentions
  useEffect(() => {
    const fetchIntentions = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would use:
        // const intentionsData = await altarApi.getIntentions(user?.id);
        
        // Mock intentions data
        const mockIntentions: Intention[] = [
          {
            id: '1',
            user_id: user?.id || 'user1',
            content: "For my son\'s college applications",
            created_at: '2025-08-01T14:30:00Z',
            active: true,
            reminder_frequency: 'daily',
          },
          {
            id: '2',
            user_id: user?.id || 'user1',
            content: "For my sister\'s health concerns",
            created_at: '2025-08-10T09:15:00Z',
            active: true,
            reminder_frequency: 'weekly',
          },
          {
            id: '3',
            user_id: user?.id || 'user1',
            content: 'For our church building project',
            created_at: '2025-08-15T16:45:00Z',
            active: true,
            reminder_frequency: 'monthly',
          },
        ];
        
        setIntentions(mockIntentions);
        
      } catch (err) {
        console.error('Error fetching intentions:', err);
        setError('Failed to load your prayer intentions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchIntentions();
    }
  }, [user]);
  
  // Add a new intention
  const handleAddIntention = async () => {
    if (!newIntention.trim()) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // In a real implementation, we would use:
      // const intention = await altarApi.addIntention({
      //   user_id: user?.id,
      //   content: newIntention.trim(),
      //   active: true,
      //   reminder_frequency: reminderFrequency,
      // });
      
      // Mock adding a new intention
      const mockIntention: Intention = {
        id: Date.now().toString(),
        user_id: user?.id || 'user1',
        content: newIntention.trim(),
        created_at: new Date().toISOString(),
        active: true,
        reminder_frequency: reminderFrequency,
      };
      
      // Update the state with the new intention
      setIntentions([mockIntention, ...intentions]);
      
      // Reset the form
      setNewIntention('');
      
    } catch (err) {
      console.error('Error adding intention:', err);
      setError('Failed to add your prayer intention. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Remove an intention
  const handleRemoveIntention = async (intentionId: string) => {
    try {
      setError('');
      
      // In a real implementation, we would use:
      // await altarApi.deactivateIntention(intentionId);
      
      // Update the state by removing the intention
      setIntentions(intentions.filter(intention => intention.id !== intentionId));
      
    } catch (err) {
      console.error('Error removing intention:', err);
      setError('Failed to remove your prayer intention. Please try again.');
    }
  };
  
  // Format reminder frequency for display
  const formatReminderFrequency = (frequency: string | undefined) => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'None';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Prayer Intentions</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add new intention form */}
        <div className="space-y-3">
          <Label htmlFor="new-intention" className="text-sm font-medium">
            Add Prayer Intention
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="new-intention"
              placeholder="Enter a prayer intention..."
              value={newIntention}
              onChange={(e) => setNewIntention(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddIntention()}
              className="flex-1"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleAddIntention}
              disabled={isSubmitting || !newIntention.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="reminder-frequency" className="text-xs">
              Reminder:
            </Label>
            <Select value={reminderFrequency} onValueChange={(value) => setReminderFrequency(value as 'daily' | 'weekly' | 'monthly')}>
              <SelectTrigger id="reminder-frequency" className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs">
            {error}
          </div>
        )}
        
        {/* Loading state */}
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : intentions.length === 0 ? (
          <div className="py-8 text-center">
            <Heart className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground">No active prayer intentions.</p>
            <p className="text-xs text-muted-foreground">Add your first intention above.</p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            <h3 className="text-sm font-medium">Active Intentions</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {intentions.map((intention) => (
                <motion.div
                  key={intention.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 bg-muted/50 rounded-md flex items-start justify-between gap-2 group"
                >
                  <div className="flex-1">
                    <p className="text-sm">{intention.content}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Bell className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatReminderFrequency(intention.reminder_frequency)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveIntention(intention.id)}
                    className="text-muted-foreground/70 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove intention"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {intentions.length > 0 && (
          <div className="border-t pt-4 text-center">
            <Button
              variant="link"
              className="text-xs text-muted-foreground"
              onClick={() => window.open('/altar/journal', '_self')}
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              View answered prayers in your journal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
