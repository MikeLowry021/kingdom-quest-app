'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Users, MessageCircle, Eye, Settings, AlertTriangle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ParentalControlsProps {
  parentId: string;
  childId: string;
  childName?: string;
  onControlsUpdated?: () => void;
}

interface ControlSettings {
  contentRating?: {
    id: string;
    settings: {
      max_rating: string;
      allowed_ratings: string[];
      block_unrated: boolean;
      require_approval: boolean;
    };
    parentOverride: boolean;
    updatedAt: string;
  };
  timeLimits?: {
    id: string;
    settings: {
      daily_minutes: number;
      session_minutes: number;
      allowed_hours: { start: number; end: number };
      weekend_extension: number;
      break_reminders: boolean;
    };
    parentOverride: boolean;
    updatedAt: string;
  };
  communication?: {
    id: string;
    settings: {
      allow_private_messages: boolean;
      allow_group_discussions: boolean;
      require_moderation: boolean;
      block_adult_contact: boolean;
      whitelist_only: boolean;
    };
    parentOverride: boolean;
    updatedAt: string;
  };
  featureAccess?: {
    id: string;
    settings: {
      content_creation: boolean;
      content_sharing: boolean;
      community_participation: boolean;
      progress_sharing: boolean;
      external_links: boolean;
    };
    parentOverride: boolean;
    updatedAt: string;
  };
}

const AGE_RATINGS = [
  { value: 'all_ages', label: 'All Ages', description: 'Suitable for all children' },
  { value: 'teen_13_plus', label: 'Teen 13+', description: 'Suitable for teenagers 13 and older' },
  { value: 'adult_18_plus', label: 'Adult 18+', description: 'Adult content only' },
  { value: 'parent_guardian', label: 'Parent/Guardian', description: 'Requires parental supervision' }
];

const TIME_PRESETS = {
  restricted: { daily: 30, session: 15, start: 9, end: 17 },
  moderate: { daily: 60, session: 30, start: 8, end: 19 },
  flexible: { daily: 120, session: 45, start: 7, end: 20 }
};

export function ParentalControlsDashboard({ parentId, childId, childName, onControlsUpdated }: ParentalControlsProps) {
  const [controls, setControls] = useState<ControlSettings>({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [timePreset, setTimePreset] = useState<string>('moderate');

  useEffect(() => {
    loadParentalControls();
  }, [parentId, childId]);

  const loadParentalControls = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('age-gating-system', {
        body: {
          action: 'get_parental_controls',
          parentId,
          childId
        }
      });

      if (error) throw error;
      setControls(data.controls || {});
    } catch (error: any) {
      console.error('Failed to load parental controls:', error);
      toast.error('Failed to load parental controls');
    } finally {
      setLoading(false);
    }
  };

  const updateControls = async (controlType: string, settings: any) => {
    try {
      setUpdating(controlType);
      
      const { data, error } = await supabase.functions.invoke('age-gating-system', {
        body: {
          action: 'update_parental_controls',
          parentId,
          childId,
          controlSettings: {
            [controlType]: settings
          }
        }
      });

      if (error) throw error;

      // Update local state
      setControls(prev => ({
        ...prev,
        [controlType]: {
          ...prev[controlType as keyof ControlSettings],
          settings
        }
      }));

      toast.success(`${controlType} settings updated successfully`);
      onControlsUpdated?.();
    } catch (error: any) {
      console.error('Failed to update controls:', error);
      toast.error('Failed to update parental controls');
    } finally {
      setUpdating(null);
    }
  };

  const applyTimePreset = (preset: string) => {
    const presetSettings = TIME_PRESETS[preset as keyof typeof TIME_PRESETS];
    if (!presetSettings) return;

    const timeSettings = {
      daily_minutes: presetSettings.daily,
      session_minutes: presetSettings.session,
      allowed_hours: { start: presetSettings.start, end: presetSettings.end },
      weekend_extension: 30,
      break_reminders: true
    };

    updateControls('timeLimits', timeSettings);
    setTimePreset(preset);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle>Parental Controls</CardTitle>
          </div>
          <CardDescription>
            Loading parental control settings...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
                <div className="h-4 w-32 bg-muted-foreground rounded mb-2" />
                <div className="h-3 w-48 bg-muted-foreground rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-primary" />
            <CardTitle>Parental Controls for {childName}</CardTitle>
          </div>
          <CardDescription>
            Manage your child's access to content, communication, and app features to ensure a safe experience.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content Rating</TabsTrigger>
          <TabsTrigger value="time">Time Limits</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Content Rating & Access</span>
              </CardTitle>
              <CardDescription>
                Control what content your child can access based on age ratings and approval requirements.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum Content Rating</Label>
                  <Select 
                    value={controls.contentRating?.settings.max_rating || 'all_ages'} 
                    onValueChange={(value) => updateControls('contentRating', {
                      ...controls.contentRating?.settings,
                      max_rating: value,
                      allowed_ratings: AGE_RATINGS.filter(r => 
                        AGE_RATINGS.findIndex(rating => rating.value === r.value) <= 
                        AGE_RATINGS.findIndex(rating => rating.value === value)
                      ).map(r => r.value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RATINGS.map((rating) => (
                        <SelectItem key={rating.value} value={rating.value}>
                          <div>
                            <div className="font-medium">{rating.label}</div>
                            <div className="text-sm text-muted-foreground">{rating.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Block Unrated Content</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevent access to content that hasn't been age-rated
                      </p>
                    </div>
                    <Switch
                      checked={controls.contentRating?.settings.block_unrated || false}
                      onCheckedChange={(checked) => updateControls('contentRating', {
                        ...controls.contentRating?.settings,
                        block_unrated: checked
                      })}
                      disabled={updating === 'contentRating'}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Require Parental Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Child must ask for permission to access challenging content
                      </p>
                    </div>
                    <Switch
                      checked={controls.contentRating?.settings.require_approval || false}
                      onCheckedChange={(checked) => updateControls('contentRating', {
                        ...controls.contentRating?.settings,
                        require_approval: checked
                      })}
                      disabled={updating === 'contentRating'}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Time Management</span>
              </CardTitle>
              <CardDescription>
                Set daily and session time limits to promote healthy screen time habits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Presets */}
              <div className="space-y-2">
                <Label>Quick Presets</Label>
                <div className="flex space-x-2">
                  {Object.entries(TIME_PRESETS).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant={timePreset === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => applyTimePreset(key)}
                      disabled={updating === 'timeLimits'}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Daily Time Limit (minutes)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[controls.timeLimits?.settings.daily_minutes || 60]}
                      onValueChange={([value]) => updateControls('timeLimits', {
                        ...controls.timeLimits?.settings,
                        daily_minutes: value
                      })}
                      max={240}
                      min={15}
                      step={15}
                      className="w-full"
                      disabled={updating === 'timeLimits'}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {controls.timeLimits?.settings.daily_minutes || 60} minutes
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Session Length (minutes)</Label>
                  <div className="space-y-2">
                    <Slider
                      value={[controls.timeLimits?.settings.session_minutes || 30]}
                      onValueChange={([value]) => updateControls('timeLimits', {
                        ...controls.timeLimits?.settings,
                        session_minutes: value
                      })}
                      max={90}
                      min={10}
                      step={5}
                      className="w-full"
                      disabled={updating === 'timeLimits'}
                    />
                    <div className="text-center text-sm text-muted-foreground">
                      {controls.timeLimits?.settings.session_minutes || 30} minutes
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Allowed Hours</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Select 
                      value={controls.timeLimits?.settings.allowed_hours?.start?.toString() || '9'}
                      onValueChange={(value) => updateControls('timeLimits', {
                        ...controls.timeLimits?.settings,
                        allowed_hours: {
                          ...controls.timeLimits?.settings.allowed_hours,
                          start: parseInt(value)
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Select 
                      value={controls.timeLimits?.settings.allowed_hours?.end?.toString() || '18'}
                      onValueChange={(value) => updateControls('timeLimits', {
                        ...controls.timeLimits?.settings,
                        allowed_hours: {
                          ...controls.timeLimits?.settings.allowed_hours,
                          end: parseInt(value)
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Break Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send periodic reminders to take breaks from screen time
                  </p>
                </div>
                <Switch
                  checked={controls.timeLimits?.settings.break_reminders || false}
                  onCheckedChange={(checked) => updateControls('timeLimits', {
                    ...controls.timeLimits?.settings,
                    break_reminders: checked
                  })}
                  disabled={updating === 'timeLimits'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Communication & Interaction</span>
              </CardTitle>
              <CardDescription>
                Control how your child can communicate and interact with other users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Private Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow direct messaging between users
                    </p>
                  </div>
                  <Switch
                    checked={controls.communication?.settings.allow_private_messages || false}
                    onCheckedChange={(checked) => updateControls('communication', {
                      ...controls.communication?.settings,
                      allow_private_messages: checked
                    })}
                    disabled={updating === 'communication'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Group Discussions</Label>
                    <p className="text-sm text-muted-foreground">
                      Participate in community group discussions
                    </p>
                  </div>
                  <Switch
                    checked={controls.communication?.settings.allow_group_discussions !== false}
                    onCheckedChange={(checked) => updateControls('communication', {
                      ...controls.communication?.settings,
                      allow_group_discussions: checked
                    })}
                    disabled={updating === 'communication'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Require Moderation</Label>
                    <p className="text-sm text-muted-foreground">
                      All messages must be approved before being sent
                    </p>
                  </div>
                  <Switch
                    checked={controls.communication?.settings.require_moderation !== false}
                    onCheckedChange={(checked) => updateControls('communication', {
                      ...controls.communication?.settings,
                      require_moderation: checked
                    })}
                    disabled={updating === 'communication'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Block Adult Contact</Label>
                    <p className="text-sm text-muted-foreground">
                      Prevent communication with users marked as adults
                    </p>
                  </div>
                  <Switch
                    checked={controls.communication?.settings.block_adult_contact !== false}
                    onCheckedChange={(checked) => updateControls('communication', {
                      ...controls.communication?.settings,
                      block_adult_contact: checked
                    })}
                    disabled={updating === 'communication'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Whitelist Only</Label>
                    <p className="text-sm text-muted-foreground">
                      Only allow communication with pre-approved users
                    </p>
                  </div>
                  <Switch
                    checked={controls.communication?.settings.whitelist_only || false}
                    onCheckedChange={(checked) => updateControls('communication', {
                      ...controls.communication?.settings,
                      whitelist_only: checked
                    })}
                    disabled={updating === 'communication'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Feature Access</span>
              </CardTitle>
              <CardDescription>
                Control which app features and capabilities your child can use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Content Creation</Label>
                    <p className="text-sm text-muted-foreground">
                      Create and publish their own stories and content
                    </p>
                  </div>
                  <Switch
                    checked={controls.featureAccess?.settings.content_creation !== false}
                    onCheckedChange={(checked) => updateControls('featureAccess', {
                      ...controls.featureAccess?.settings,
                      content_creation: checked
                    })}
                    disabled={updating === 'featureAccess'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Content Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share stories and content with the community
                    </p>
                  </div>
                  <Switch
                    checked={controls.featureAccess?.settings.content_sharing || false}
                    onCheckedChange={(checked) => updateControls('featureAccess', {
                      ...controls.featureAccess?.settings,
                      content_sharing: checked
                    })}
                    disabled={updating === 'featureAccess'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Community Participation</Label>
                    <p className="text-sm text-muted-foreground">
                      Participate in community activities and events
                    </p>
                  </div>
                  <Switch
                    checked={controls.featureAccess?.settings.community_participation !== false}
                    onCheckedChange={(checked) => updateControls('featureAccess', {
                      ...controls.featureAccess?.settings,
                      community_participation: checked
                    })}
                    disabled={updating === 'featureAccess'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Progress Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share learning progress and achievements publicly
                    </p>
                  </div>
                  <Switch
                    checked={controls.featureAccess?.settings.progress_sharing !== false}
                    onCheckedChange={(checked) => updateControls('featureAccess', {
                      ...controls.featureAccess?.settings,
                      progress_sharing: checked
                    })}
                    disabled={updating === 'featureAccess'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>External Links</Label>
                    <p className="text-sm text-muted-foreground">
                      Access external websites and resources
                    </p>
                  </div>
                  <Switch
                    checked={controls.featureAccess?.settings.external_links || false}
                    onCheckedChange={(checked) => updateControls('featureAccess', {
                      ...controls.featureAccess?.settings,
                      external_links: checked
                    })}
                    disabled={updating === 'featureAccess'}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Safety Notice */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-green-900 dark:text-green-100">
                Child Safety First
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                These parental controls are designed to keep your child safe while allowing them to 
                enjoy age-appropriate content. You can adjust these settings at any time, and we'll 
                send you regular reports about your child's activity and any safety concerns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ParentalControlsDashboard;