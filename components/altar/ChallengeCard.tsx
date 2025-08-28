'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { FamilyChallenge } from '@/lib/altar-types';
import { challengeTemplates } from '@/lib/altar-data';
import { altarApi } from '@/lib/altar-api';
import { CheckCircle, Target, RefreshCw, Clock, Trophy, Share2 } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function ChallengeCard() {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<FamilyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  
  // Fetch current challenge
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        setLoading(true);
        setError('');
        
        // In a real implementation, we would use:
        // const challengeData = await altarApi.getCurrentChallenge(user?.familyId);
        
        // Mock challenge data
        const mockChallenge: FamilyChallenge = {
          id: '1',
          title: 'Gratitude Challenge',
          description: "Each family member shares one thing they\'re grateful for each day this week.",
          scriptureRef: 'Colossians 3:15',
          week_start: new Date().toISOString(),
          week_end: addDays(new Date(), 7).toISOString(),
          difficulty: 'easy',
          completed: false,
          family_id: 'family1',
        };
        
        setChallenge(mockChallenge);
        
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load your family challenge. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchChallenge();
    }
  }, [user]);
  
  // Handle challenge regeneration
  const handleRegenerateChallenge = async () => {
    try {
      setRegenerating(true);
      setError('');
      
      // In a real implementation, we would use:
      // const newChallenge = await altarApi.generateChallenge(user?.familyId);
      
      // Mock a new challenge
      const randomIndex = Math.floor(Math.random() * challengeTemplates.length);
      const template = challengeTemplates[randomIndex];
      
      const mockChallenge: FamilyChallenge = {
        id: Date.now().toString(), // Generate a unique ID
        title: template.title,
        description: template.description,
        scriptureRef: template.scriptureRef,
        week_start: new Date().toISOString(),
        week_end: addDays(new Date(), 7).toISOString(),
        difficulty: template.difficulty as 'easy' | 'medium' | 'hard',
        completed: false,
        family_id: 'family1',
      };
      
      // Update the state with the new challenge
      setChallenge(mockChallenge);
      
    } catch (err) {
      console.error('Error regenerating challenge:', err);
      setError('Failed to generate a new challenge. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };
  
  // Handle challenge completion
  const handleCompleteChallenge = async () => {
    if (!challenge) return;
    
    try {
      setCompleting(true);
      setError('');
      
      // In a real implementation, we would use:
      // await altarApi.completeChallenge(challenge.id);
      
      // Update the challenge state to mark as completed
      setChallenge({
        ...challenge,
        completed: true,
        completion_date: new Date().toISOString(),
      });
      
      // Show completion message
      setShowCompletionMessage(true);
      setTimeout(() => setShowCompletionMessage(false), 5000);
      
      // Check for badges (would call edge function in real implementation)
      // await altarApi.checkBadges(user?.id);
      
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError('Failed to mark challenge as completed. Please try again.');
    } finally {
      setCompleting(false);
    }
  };
  
  // Handle share challenge
  const handleShareChallenge = () => {
    if (!challenge) return;
    
    // In a real implementation, this would open a share dialog or copy to clipboard
    const shareText = `We're taking on the "${challenge.title}" family challenge this week: ${challenge.description} #KingdomQuest #FamilyAltar`;
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(shareText)
      .then(() => {
        alert('Challenge copied to clipboard for sharing!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy challenge. Please try again.');
      });
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-accent-100 text-accent-800';
      case 'medium':
        return 'bg-secondary-100 text-secondary-800';
      case 'hard':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-primary-100 text-primary-800';
    }
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
          <h2 className="text-2xl font-serif font-bold text-primary">Weekly Family Challenge</h2>
          <p className="text-muted-foreground">
            Complete scripture-based challenges together as a family to grow spiritually.
          </p>
        </div>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-700">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : challenge ? (
        <div className="space-y-6">
          {/* Current Challenge Card */}
          <Card className={`overflow-hidden ${challenge.completed ? 'border-green-200 bg-green-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-serif">{challenge.title}</CardTitle>
                  <CardDescription>
                    {format(new Date(challenge.week_start), 'MMM d')} - {format(new Date(challenge.week_end), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="text-base font-serif font-medium mb-1">Challenge Description</h3>
                    <p className="text-gray-700">{challenge.description}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="text-base font-serif font-medium mb-1">Time Remaining</h3>
                    <p className="text-gray-700">
                      {challenge.completed ? 
                        'Challenge completed!' : 
                        `${Math.ceil((new Date(challenge.week_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-primary mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <div>
                    <h3 className="text-base font-serif font-medium mb-1">Scripture Reference</h3>
                    <p className="text-gray-700">{challenge.scriptureRef}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-0">
              {challenge.completed ? (
                <div className="w-full flex items-center justify-center bg-green-100 text-green-800 p-3 rounded-md">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Challenge completed on {challenge.completion_date ? format(new Date(challenge.completion_date), 'MMMM d, yyyy') : 'recently'}!</span>
                </div>
              ) : (
                <Button
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                  onClick={handleCompleteChallenge}
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </>
                  )}
                </Button>
              )}
              
              <Button
                variant="outline"
                className="flex-1 btn-secondary"
                onClick={handleShareChallenge}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Challenge
              </Button>
            </CardFooter>
          </Card>
          
          {/* Generate New Challenge */}
          <Card className="bg-muted/50">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-serif font-medium mb-1">Want a different challenge?</h3>
                <p className="text-sm text-muted-foreground">
                  Generate a new random challenge for your family to tackle this week.
                </p>
              </div>
              
              <Button
                variant="outline"
                onClick={handleRegenerateChallenge}
                disabled={regenerating}
                className="min-w-[180px] btn-secondary"
              >
                {regenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate New Challenge
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          {/* Challenge Tips */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-serif">Tips for Success</CardTitle>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Schedule a specific time each day for your family to work on the challenge together.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Read the scripture reference together and discuss how it relates to the challenge.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Consider keeping a family journal to record your experiences with each challenge.</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Complete at least 3 challenges to earn the "Challenge Champion" badge.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Success message */}
          {showCompletionMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 right-4 p-4 bg-accent-100 border border-accent-200 rounded-md text-accent-800 shadow-lg max-w-md flex items-center"
            >
              <Trophy className="h-5 w-5 mr-2 text-accent-600" />
              <div>
                <p className="font-medium">Challenge Completed!</p>
                <p className="text-sm">Great job! Your family has successfully completed this week's challenge.</p>
              </div>
              <button 
                className="ml-4 text-accent-600 hover:text-accent-800"
                onClick={() => setShowCompletionMessage(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700 mb-4">No active challenge found for your family.</p>
            <Button
              onClick={handleRegenerateChallenge}
              disabled={regenerating}
            >
              {regenerating ? 'Generating...' : 'Generate Your First Challenge'}
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
