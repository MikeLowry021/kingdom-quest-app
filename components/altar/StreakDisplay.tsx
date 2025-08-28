'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Streak } from '@/lib/altar-types';
import { altarApi } from '@/lib/altar-api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isToday, isPast, subDays } from 'date-fns';

export default function StreakDisplay() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get calendar days for the current month
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  
  // Get days with prayers for current month (mock data)
  const [prayerDays, setPrayerDays] = useState<Date[]>([]);
  
  // Mock data for streak
  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would use:
        // const streakData = await altarApi.getStreak(user?.id);
        
        // Mock streak data
        const mockStreak: Streak = {
          id: '1',
          user_id: user?.id || 'user1',
          current_streak: 12,
          longest_streak: 30,
          last_prayer_date: new Date().toISOString(),
          streak_starts: subDays(new Date(), 12).toISOString(),
          missed_days: 3,
        };
        
        setStreak(mockStreak);
        
        // Generate mock prayer days (last 12 days for streak)
        const mockPrayerDays: Date[] = [];
        for (let i = 0; i < 12; i++) {
          mockPrayerDays.push(subDays(new Date(), i));
        }
        // Add some random days earlier in the month
        for (let i = 14; i < 30; i += 2) {
          if (Math.random() > 0.3) { // 70% chance
            mockPrayerDays.push(subDays(new Date(), i));
          }
        }
        
        setPrayerDays(mockPrayerDays);
        
      } catch (err) {
        console.error('Error fetching streak data:', err);
        setError('Failed to load your prayer streak. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchStreakData();
    }
  }, [user]);
  
  // Check if a day has a prayer
  const hasPrayer = (day: Date) => {
    return prayerDays.some(prayerDay => isSameDay(prayerDay, day));
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Go to current month
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Streak Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <Card className="bg-gradient-to-br from-secondary-50 to-tertiary-50 border-secondary-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-secondary-100 p-3 mb-4">
              <svg className="h-6 w-6 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Current Streak</h3>
            {loading ? (
              <div className="animate-pulse h-9 w-16 bg-secondary-200 rounded-md mt-1"></div>
            ) : (
              <p className="text-3xl font-bold text-secondary-700">{streak?.current_streak || 0} days</p>
            )}
            <p className="text-sm text-secondary-600 mt-2">
              {streak?.current_streak ? "Keep going! You\'re building a great habit." : 'Start your streak today!'}
            </p>
          </CardContent>
        </Card>
        
        {/* Longest Streak */}
        <Card className="bg-gradient-to-br from-primary-50 to-tertiary-50 border-primary-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary-100 p-3 mb-4">
              <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Longest Streak</h3>
            {loading ? (
              <div className="animate-pulse h-9 w-16 bg-primary-200 rounded-md mt-1"></div>
            ) : (
              <p className="text-3xl font-bold text-primary-700">{streak?.longest_streak || 0} days</p>
            )}
            <p className="text-sm text-primary-600 mt-2">
              {streak?.longest_streak ? 'Your personal record so far' : 'Your personal best will show here'}
            </p>
          </CardContent>
        </Card>
        
        {/* Last Prayer */}
        <Card className="bg-gradient-to-br from-accent-50 to-tertiary-50 border-accent-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-accent-100 p-3 mb-4">
              <svg className="h-6 w-6 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-1">Last Prayer</h3>
            {loading ? (
              <div className="animate-pulse h-9 w-32 bg-accent-200 rounded-md mt-1"></div>
            ) : streak?.last_prayer_date ? (
              <p className="text-lg font-bold text-accent-700">
                {isToday(parseISO(streak.last_prayer_date)) ? 
                  'Today' : 
                  format(parseISO(streak.last_prayer_date), 'MMM d, yyyy')}
              </p>
            ) : (
              <p className="text-lg font-bold text-accent-700">No prayers yet</p>
            )}
            <p className="text-sm text-accent-600 mt-2">
              {isToday(parseISO(streak?.last_prayer_date || new Date().toISOString())) ? 
                "You\'ve prayed today!" : 
                'Don\'t forget to pray today'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Prayer Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-serif">Prayer Calendar</CardTitle>
          <CardDescription>
            Track your daily prayer habit and view your consistency over time.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Month navigation */}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              onClick={goToCurrentMonth}
              className="px-3 py-1 text-sm rounded-md bg-gray-100 hover:bg-gray-200 font-medium"
            >
              {format(currentMonth, 'MMMM yyyy')}
            </button>
            
            <button 
              onClick={goToNextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              disabled={isSameDay(startOfMonth(currentMonth), startOfMonth(new Date()))}
            >
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
            
            {/* Day cells */}
            {calendarDays.map(day => {
              const isCurrentDay = isToday(day);
              const isPrayerDay = hasPrayer(day);
              const isPastDay = isPast(day) && !isCurrentDay;
              
              return (
                <div key={day.toISOString()} className="relative p-1">
                  <div 
                    className={`
                      relative w-full pt-[100%] rounded-md flex items-center justify-center
                      ${isCurrentDay ? 'bg-primary text-white' : ''}
                      ${isPrayerDay && !isCurrentDay ? 'bg-primary/10 text-primary' : ''}
                      ${!isPrayerDay && isPastDay ? 'bg-gray-100 text-gray-400' : ''}
                      ${!isPrayerDay && !isPastDay && !isCurrentDay ? 'bg-gray-50 text-gray-500' : ''}
                    `}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-sm">
                      {format(day, 'd')}
                    </span>
                    {isPrayerDay && (
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 rounded-full bg-current"></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-primary mr-1"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-primary/10 mr-1"></div>
              <span>Prayer logged</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-gray-100 mr-1"></div>
              <span>No prayer</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Scripture encouragement */}
      <Card className="bg-gradient-to-r from-secondary-50 to-tertiary-50 border-secondary-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-serif font-medium mb-3 text-secondary-800">Scripture Encouragement</h3>
          <p className="italic text-secondary-700">
            "Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you."
          </p>
          <p className="text-sm font-medium text-secondary-600 mt-2">1 Thessalonians 5:16-18</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
