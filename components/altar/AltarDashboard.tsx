'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Prayer, Streak, UserBadge, FamilyChallenge } from '@/lib/altar-types';
import { altarApi } from '@/lib/altar-api';
import { Heart, Award, BookOpen, Target, Bookmark, Calendar, PenSquare } from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import Link from 'next/link';

export default function AltarDashboard() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak | null>(null);
  const [recentPrayers, setRecentPrayers] = useState<Prayer[]>([]);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [challenge, setChallenge] = useState<FamilyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, we would make multiple API calls:
        // const streakData = await altarApi.getStreak(user?.id);
        // const prayersData = await altarApi.getPrayers(user?.id);
        // const badgesData = await altarApi.getUserBadges(user?.id);
        // const challengeData = await altarApi.getCurrentChallenge(user?.familyId);
        
        // For now, we'll use mock data
        
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
        
        // Mock prayers data (5 most recent)
        const mockPrayers: Prayer[] = [
          {
            id: '1',
            user_id: user?.id || 'user1',
            content: 'For wisdom in making an important decision about my career path.',
            category: 'personal',
            created_at: new Date().toISOString(),
            answered: false,
            tags: ['wisdom', 'career'],
            is_private: false,
          },
          {
            id: '2',
            user_id: user?.id || 'user1',
            content: "For my mother\'s health concerns to be resolved.",
            category: 'family',
            created_at: subDays(new Date(), 1).toISOString(),
            answered: true,
            answered_date: new Date().toISOString(),
            answer_content: "Mom\'s test results came back negative! Praise God!",
            tags: ['health', 'family'],
            is_private: false,
          },
          {
            id: '3',
            user_id: user?.id || 'user1',
            content: "For our church\'s upcoming mission trip to Mexico.",
            category: 'community',
            created_at: subDays(new Date(), 2).toISOString(),
            answered: false,
            tags: ['church', 'missions'],
            is_private: false,
          },
        ];
        
        // Mock badges data (3 most recent)
        const mockBadges: UserBadge[] = [
          {
            id: '1',
            user_id: user?.id || 'user1',
            badge_id: 'prayer-warrior',
            earned_date: subDays(new Date(), 5).toISOString(),
          },
          {
            id: '2',
            user_id: user?.id || 'user1',
            badge_id: 'intercessor',
            earned_date: subDays(new Date(), 10).toISOString(),
          },
          {
            id: '3',
            user_id: user?.id || 'user1',
            badge_id: 'gratitude-heart',
            earned_date: subDays(new Date(), 15).toISOString(),
          },
        ];
        
        // Mock challenge data
        const mockChallenge: FamilyChallenge = {
          id: '1',
          title: 'Gratitude Challenge',
          description: "Each family member shares one thing they\'re grateful for each day this week.",
          scriptureRef: 'Colossians 3:15',
          week_start: subDays(new Date(), 3).toISOString(),
          week_end: subDays(new Date(), -4).toISOString(), // 4 days from now
          difficulty: 'easy',
          completed: false,
          family_id: 'family1',
        };
        
        // Update state with mock data
        setStreak(mockStreak);
        setRecentPrayers(mockPrayers);
        setBadges(mockBadges);
        setChallenge(mockChallenge);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);
  
  // Get badge name from badge ID
  const getBadgeName = (badgeId: string) => {
    // This would look up the badge name from a list of badge definitions
    const badgeNames: Record<string, string> = {
      'prayer-warrior': 'Prayer Warrior',
      'intercessor': 'Intercessor',
      'gratitude-heart': 'Gratitude Heart',
      'scripture-devotion': 'Scripture Devotion',
      'family-leadership': 'Family Leadership',
      'challenge-champion': 'Challenge Champion',
      'consistency-crown': 'Consistency Crown',
      'blessing-bearer': 'Blessing Bearer',
    };
    
    return badgeNames[badgeId] || 'Unknown Badge';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Welcome Card */}
      <Card className="bg-gradient-to-br from-tertiary-50 to-primary-50 border-tertiary-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-700 mb-2">Welcome to Your Family Altar</h2>
              <p className="text-muted-foreground font-sans">
                A place to strengthen your family's spiritual foundation through prayer and scripture.
              </p>
            </div>
            
            <Link href="/altar/pray">
              <Button className="btn-primary bg-gradient-to-r from-primary-500 to-accent-600 hover:from-primary-600 hover:to-accent-700 text-white min-h-[2.75rem]">
                <PenSquare className="mr-2 h-4 w-4" />
                <span className="font-sans">Log Today's Prayer</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <Card className="hover:shadow-brand transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-primary-100 p-3 mb-3">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-base font-medium font-sans mb-1">Current Streak</h3>
            {loading ? (
              <div className="animate-pulse h-8 w-20 bg-tertiary-200 rounded-md"></div>
            ) : (
              <p className="text-3xl font-bold font-serif text-primary-700">{streak?.current_streak || 0}</p>
            )}
            <p className="text-xs text-muted-foreground font-sans mt-1">consecutive days</p>
          </CardContent>
        </Card>
        
        {/* Recent Prayers */}
        <Card className="hover:shadow-brand transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-accent-100 p-3 mb-3">
              <Heart className="h-6 w-6 text-accent-600" />
            </div>
            <h3 className="text-base font-medium font-sans mb-1">Recent Prayers</h3>
            {loading ? (
              <div className="animate-pulse h-8 w-20 bg-tertiary-200 rounded-md"></div>
            ) : (
              <p className="text-3xl font-bold font-serif text-accent-700">{recentPrayers.length}</p>
            )}
            <p className="text-xs text-muted-foreground font-sans mt-1">in the last 7 days</p>
          </CardContent>
        </Card>
        
        {/* Badges Earned */}
        <Card className="hover:shadow-brand transition-shadow duration-200">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-secondary-100 p-3 mb-3">
              <Award className="h-6 w-6 text-secondary-600" />
            </div>
            <h3 className="text-base font-medium font-sans mb-1">Badges Earned</h3>
            {loading ? (
              <div className="animate-pulse h-8 w-20 bg-tertiary-200 rounded-md"></div>
            ) : (
              <p className="text-3xl font-bold font-serif text-secondary-700">{badges.length}</p>
            )}
            <p className="text-xs text-muted-foreground font-sans mt-1">out of 8 total</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Prayers */}
        <Card className="hover:shadow-brand transition-shadow duration-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-serif flex items-center">
              <Heart className="h-5 w-5 mr-2 text-primary" />
              Recent Prayers
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-16 bg-tertiary-100 rounded-md"></div>
                ))}
              </div>
            ) : recentPrayers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground font-sans">No recent prayers.</p>
                <Link href="/altar/pray">
                  <Button className="btn-secondary" variant="link">
                    <span className="font-sans mt-2">Add your first prayer</span>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPrayers.map(prayer => (
                  <div key={prayer.id} className="p-3 bg-muted/30 rounded-md">
                    <div className="flex justify-between items-start">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {prayer.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(prayer.created_at), 'MMM d')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm line-clamp-2">{prayer.content}</p>
                    {prayer.answered && (
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-green-600 font-medium flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Answered
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0">
            <Link href="/altar/journal" className="w-full">
              <Button variant="outline" className="w-full text-sm" size="sm">
                <BookOpen className="mr-2 h-4 w-4" />
                View Prayer Journal
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Current Challenge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Weekly Family Challenge
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-6 bg-gray-100 rounded-md w-3/4"></div>
                <div className="h-20 bg-gray-100 rounded-md"></div>
              </div>
            ) : !challenge ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No active challenge.</p>
                <Link href="/altar/challenges">
                  <Button variant="link" className="mt-2">
                    Generate a challenge
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{challenge.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </span>
                </div>
                
                <p className="text-sm">{challenge.description}</p>
                
                <div className="flex items-center text-xs text-muted-foreground">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {challenge.scriptureRef}
                </div>
                
                {challenge.completed ? (
                  <div className="bg-green-100 text-green-800 p-2 rounded-md text-xs flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Challenge completed!
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs">
                    <span>Progress:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date().getTime() - new Date(challenge.week_start).getTime()) / 
                      (new Date(challenge.week_end).getTime() - new Date(challenge.week_start).getTime()) * 100)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0">
            <Link href="/altar/challenges" className="w-full">
              <Button variant="outline" className="w-full text-sm" size="sm">
                <Target className="mr-2 h-4 w-4" />
                View Challenges
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Badges and Blessing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Badges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-24 bg-gray-100 rounded-md"></div>
                ))}
              </div>
            ) : badges.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No badges earned yet.</p>
                <Link href="/altar/badges">
                  <Button variant="link" className="mt-2">
                    View available badges
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {badges.map(badge => (
                  <div key={badge.id} className="bg-muted/30 rounded-md p-3 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-xs font-medium line-clamp-2">{getBadgeName(badge.badge_id)}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {format(parseISO(badge.earned_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0">
            <Link href="/altar/badges" className="w-full">
              <Button variant="outline" className="w-full text-sm" size="sm">
                <Award className="mr-2 h-4 w-4" />
                View All Badges
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Blessing Cards */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Bookmark className="h-5 w-5 mr-2 text-primary" />
              Blessing Cards
            </CardTitle>
            <CardDescription>
              Create and share scripture blessing cards with others.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Bookmark className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-base font-medium mb-2">Create Custom Blessing Cards</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Design personalized scripture cards to share with family and friends.
            </p>
          </CardContent>
          
          <CardFooter className="pt-0">
            <Link href="/altar/blessings" className="w-full">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                <Bookmark className="mr-2 h-4 w-4" />
                Create Blessing Card
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      
      {/* Scripture of the Day */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-medium mb-3 text-amber-800">Scripture of the Day</h3>
          <p className="italic text-amber-700 mb-2">
            "And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another—and all the more as you see the Day approaching."
          </p>
          <p className="text-sm font-medium text-amber-600">Hebrews 10:24-25</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
