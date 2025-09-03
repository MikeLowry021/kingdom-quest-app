'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSpeechToText } from '@/lib/use-speech-to-text';
import { motion } from 'framer-motion';
import { Mic, MicOff, Send, PlusCircle, Info, BookOpen, Tag, X } from 'lucide-react';
import { altarApi } from '@/lib/altar-api';
import { useAuth } from '@/lib/auth';

export default function PrayerForm() {
  const { user } = useAuth();
  const [prayerContent, setPrayerContent] = useState('');
  const [category, setCategory] = useState('personal');
  const [scriptureReference, setScriptureReference] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  
  // Setup speech-to-text
  const {
    text,
    isListening,
    startListening,
    stopListening,
    hasRecognitionSupport,
    clearText,
  } = useSpeechToText({
    onTextChange: (text) => setPrayerContent(text),
  });
  
  // Sync text from speech recognition to prayer content
  useEffect(() => {
    if (text) {
      setPrayerContent(text);
    }
  }, [text]);
  
  // Handle adding tags
  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim().toLowerCase())) {
      setTags([...tags, currentTag.trim().toLowerCase()]);
      setCurrentTag('');
    }
  };
  
  // Handle tag input key press (add on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle prayer submission
  const handleSubmitPrayer = async () => {
    if (!prayerContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      setSubmissionError('');
      
      if (!user) {
        setSubmissionError('You must be logged in to submit a prayer.');
        return;
      }
      
      // Prepare prayer data
      const prayerData = {
        user_id: user.id,
        content: prayerContent.trim(),
        category,
        tags,
        scripture_reference: scriptureReference || undefined,
        is_private: isPrivate,
        answered: false,
      };
      
      // In a real implementation, we would use:
      // await altarApi.addPrayer(prayerData);
      console.log('Submitting prayer:', prayerData);
      
      // Mock successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update streak after prayer (would call edge function in real implementation)
      // await altarApi.updateStreak(user.id);
      
      // Check for badges (would call edge function in real implementation)
      // await altarApi.checkBadges(user.id);
      
      // Reset form
      setPrayerContent('');
      setScriptureReference('');
      setTags([]);
      clearText();
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error submitting prayer:', error);
      setSubmissionError('Failed to submit your prayer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl">Daily Prayer</CardTitle>
          <CardDescription>
            Log your prayers, track answered prayers, and maintain your daily prayer habit.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Prayer content textarea with voice input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="prayer-content" className="text-base font-medium">
                Your Prayer
              </Label>
              
              {hasRecognitionSupport && (
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-1 ${isListening ? 'bg-red-50 text-red-500 border-red-200' : ''}`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-4 w-4" />
                      Stop Dictation
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
                      Dictate Prayer
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <Textarea
              id="prayer-content"
              placeholder={isListening ? 'Speak your prayer...' : 'Type your prayer here...'}
              value={prayerContent}
              onChange={(e) => setPrayerContent(e.target.value)}
              rows={6}
              className={`resize-none ${isListening ? 'border-primary' : ''}`}
            />
            
            {isListening && (
              <p className="text-sm text-primary animate-pulse">
                Listening... Speak clearly into your microphone.
              </p>
            )}
          </div>
          
          {/* Prayer category */}
          <div className="space-y-2">
            <Label htmlFor="prayer-category" className="text-base font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="prayer-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                <SelectItem value="intercession">Intercession</SelectItem>
                <SelectItem value="scripture">Scripture-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Scripture reference */}
          <div className="space-y-2">
            <Label htmlFor="scripture-reference" className="text-base font-medium flex items-center gap-1">
              Scripture Reference
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <Input
                id="scripture-reference"
                placeholder="e.g., Psalm 23:1-6"
                value={scriptureReference}
                onChange={(e) => setScriptureReference(e.target.value)}
              />
            </div>
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="prayer-tags" className="text-base font-medium flex items-center gap-1">
              Tags
              <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <Input
                id="prayer-tags"
                placeholder="Add tags (e.g., health, guidance)"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                onClick={handleAddTag}
                disabled={!currentTag.trim()}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tag display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    #{tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-primary/70 hover:text-primary"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Privacy toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="private-prayer"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="private-prayer" className="text-sm cursor-pointer flex items-center gap-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              Keep this prayer private (only visible to you)
            </Label>
          </div>
          
          {/* Submit button */}
          <div className="pt-4">
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              size="lg"
              onClick={handleSubmitPrayer}
              disabled={isSubmitting || !prayerContent.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Prayer
                </>
              )}
            </Button>
          </div>
          
          {/* Success message */}
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm flex items-center mt-4"
            >
              <div className="rounded-full bg-green-100 p-1 mr-2">
                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Prayer submitted successfully! Your streak has been updated.
            </motion.div>
          )}
          
          {/* Error message */}
          {submissionError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm flex items-center mt-4">
              <div className="rounded-full bg-red-100 p-1 mr-2">
                <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              {submissionError}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
