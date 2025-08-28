'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { badgeDefinitions } from '@/lib/altar-data';
import { Badge, UserBadge } from '@/lib/altar-types';
import { altarApi } from '@/lib/altar-api';
import { Award, Lock, Info } from 'lucide-react';

export default function BadgeGallery() {
  const { user } = useAuth();
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  
  // Fetch user badges
  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would use:
        // const badgeData = await altarApi.getUserBadges(user?.id);
        
        // Mock user badges data (first 3 badges as earned)
        const mockUserBadges: UserBadge[] = [
          {
            id: '1',
            user_id: user?.id || 'user1',
            badge_id: 'prayer-warrior',
            earned_date: '2025-08-10T14:30:00Z',
          },
          {
            id: '2',
            user_id: user?.id || 'user1',
            badge_id: 'intercessor',
            earned_date: '2025-08-15T09:45:00Z',
          },
          {
            id: '3',
            user_id: user?.id || 'user1',
            badge_id: 'gratitude-heart',
            earned_date: '2025-08-20T16:20:00Z',
          },
        ];
        
        setUserBadges(mockUserBadges);
        
      } catch (err) {
        console.error('Error fetching badge data:', err);
        setError('Failed to load your badges. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchUserBadges();
    }
  }, [user]);
  
  // Check if user has earned a badge
  const hasBadge = (badgeId: string) => {
    return userBadges.some(userBadge => userBadge.badge_id === badgeId);
  };
  
  // Get badge details
  const getBadgeDetails = (badgeId: string) => {
    return badgeDefinitions.find(badge => badge.id === badgeId);
  };
  
  // Handle badge click for details
  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };
  
  // Close badge details modal
  const closeBadgeDetails = () => {
    setSelectedBadge(null);
  };
  
  // Calculate progress for a badge
  const getBadgeProgress = (badgeId: string) => {
    // This would be calculated based on user's actual progress in a real implementation
    // For now, we'll use mock data
    const earned = hasBadge(badgeId);
    if (earned) return 100;
    
    const badge = getBadgeDetails(badgeId);
    if (!badge) return 0;
    
    // Random progress for non-earned badges between 10-90%
    return Math.floor(Math.random() * 81) + 10;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary">Scripture-Based Badges</h2>
          <p className="text-muted-foreground">
            Earn badges as you develop spiritual habits and engage with God's Word.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted p-2 rounded-md text-sm">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span>You've earned {userBadges.length} of {badgeDefinitions.length} badges</span>
        </div>
      </div>
      
      {/* Badge Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {badgeDefinitions.map(badge => {
          const earned = hasBadge(badge.id);
          const progress = getBadgeProgress(badge.id);
          
          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBadgeClick(badge)}
              className="cursor-pointer"
            >
              <Card className={`overflow-hidden h-full ${earned ? 'border-primary/30 bg-primary/5' : 'border-gray-200 bg-gray-50/50'}`}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    {/* Badge icon/image */}
                    <div className={`
                      w-20 h-20 rounded-full flex items-center justify-center
                      ${earned ? 'bg-primary/20' : 'bg-gray-200/80'}
                      mb-2 mt-2
                    `}>
                      {earned ? (
                        <Award className="h-10 w-10 text-primary" />
                      ) : (
                        <Lock className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Progress circle */}
                    {!earned && progress > 0 && (
                      <svg className="absolute top-0 left-0 w-20 h-20" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 stroke-current"
                          strokeWidth="4"
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                        />
                        <circle
                          className="text-primary stroke-current"
                          strokeWidth="4"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="46"
                          fill="transparent"
                          strokeDasharray="289.03"
                          strokeDashoffset={289.03 - (289.03 * progress) / 100}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    )}
                  </div>
                  
                  <h3 className={`font-medium text-base ${earned ? 'text-primary' : 'text-gray-600'}`}>
                    {badge.name}
                  </h3>
                  
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                  
                  {!earned && (
                    <span className="mt-2 text-xs font-medium text-primary">
                      {progress}% Complete
                    </span>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Badge details modal */}
      {selectedBadge && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4" onClick={closeBadgeDetails}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center
                ${hasBadge(selectedBadge.id) ? 'bg-primary/20' : 'bg-gray-200'}
                mb-4
              `}>
                {hasBadge(selectedBadge.id) ? (
                  <Award className="h-12 w-12 text-primary" />
                ) : (
                  <Lock className="h-10 w-10 text-gray-400" />
                )}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedBadge.name}</h2>
              
              <div className="p-2 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                {hasBadge(selectedBadge.id) ? 'Earned' : 'Not Yet Earned'}
              </div>
              
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              <div className="bg-gray-50 p-4 rounded-md w-full mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Scripture Inspiration</h3>
                <p className="text-sm text-gray-600 italic">{selectedBadge.scriptureRef}</p>
              </div>
              
              <div className="w-full">
                <h3 className="text-sm font-medium text-gray-700 mb-2">How to earn this badge:</h3>
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                  {(() => {
                    const req = selectedBadge.requirement;
                    switch (req.type) {
                      case 'streak':
                        return `Maintain a prayer streak for ${req.days} consecutive days.`;
                      case 'count':
                        return `Log ${req.count} prayers in the "${req.category}" category.`;
                      case 'challenges':
                        return `Complete ${req.count} family challenges.`;
                      case 'cards':
                        return `Create and share ${req.count} blessing cards.`;
                      default:
                        return 'Complete the required activities to earn this badge.';
                    }
                  })()}
                </div>
              </div>
              
              {!hasBadge(selectedBadge.id) && (
                <div className="w-full mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Your Progress:</h3>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${getBadgeProgress(selectedBadge.id)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {getBadgeProgress(selectedBadge.id)}% Complete
                  </p>
                </div>
              )}
              
              <button
                onClick={closeBadgeDetails}
                className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
