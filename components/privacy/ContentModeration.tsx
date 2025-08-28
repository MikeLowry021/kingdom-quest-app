'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flag, MessageCircle, AlertTriangle, Eye, Ban, CheckCircle, Clock, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ContentReport {
  id: string;
  reportType: string;
  reportReason: string;
  status: string;
  priority: string;
  submittedAt: string;
}

interface ModerationAppeal {
  id: string;
  appealReason: string;
  status: string;
  submittedAt: string;
  resolvedAt?: string;
}

interface ContentModerationProps {
  userId: string;
  userType?: 'user' | 'moderator' | 'admin';
}

const REPORT_TYPES = {
  inappropriate_content: {
    title: 'Inappropriate Content',
    description: 'Content that violates community guidelines',
    icon: Flag,
    priority: 'high'
  },
  harassment: {
    title: 'Harassment or Bullying',
    description: 'User behavior that targets or harms others',
    icon: Ban,
    priority: 'high'
  },
  spam: {
    title: 'Spam or Unwanted Content',
    description: 'Repetitive, promotional, or off-topic content',
    icon: MessageCircle,
    priority: 'normal'
  },
  safety_concern: {
    title: 'Safety Concern',
    description: 'Content or behavior that may pose safety risks',
    icon: AlertTriangle,
    priority: 'critical'
  },
  child_safety: {
    title: 'Child Safety Issue',
    description: 'Content or behavior that may harm children',
    icon: AlertTriangle,
    priority: 'critical'
  },
  other: {
    title: 'Other Violation',
    description: 'Other violations not covered by specific categories',
    icon: Flag,
    priority: 'normal'
  }
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  dismissed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  escalated: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export function ContentModeration({ userId, userType = 'user' }: ContentModerationProps) {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [appeals, setAppeals] = useState<ModerationAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showAppealDialog, setShowAppealDialog] = useState(false);
  const [reportForm, setReportForm] = useState({
    reportType: '',
    reportReason: '',
    description: '',
    evidence: [] as string[],
    anonymous: false,
    reportedContentId: '',
    reportedUserId: ''
  });
  const [appealForm, setAppealForm] = useState({
    moderationActionId: '',
    appealReason: '',
    description: '',
    evidence: [] as string[],
    context: ''
  });

  useEffect(() => {
    loadUserReports();
    loadUserAppeals();
  }, [userId]);

  const loadUserReports = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'get_user_reports',
          reportData: { reporterId: userId }
        }
      });

      if (error) throw error;
      setReports(data.reports || []);
    } catch (error: any) {
      console.error('Failed to load user reports:', error);
      toast.error('Failed to load reports');
    }
  };

  const loadUserAppeals = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'get_user_appeals',
          appealData: { userId }
        }
      });

      if (error) throw error;
      setAppeals(data.appeals || []);
    } catch (error: any) {
      console.error('Failed to load user appeals:', error);
      toast.error('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    try {
      setSubmitting(true);

      if (!reportForm.reportType || !reportForm.reportReason) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!reportForm.reportedContentId && !reportForm.reportedUserId) {
        toast.error('Please specify what you are reporting');
        return;
      }

      const { data, error } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'submit_report',
          reportData: {
            reporterId: reportForm.anonymous ? null : userId,
            reportedContentId: reportForm.reportedContentId || null,
            reportedUserId: reportForm.reportedUserId || null,
            reportType: reportForm.reportType,
            reportReason: reportForm.reportReason,
            reportDetails: {
              description: reportForm.description,
              evidenceUrls: reportForm.evidence,
              context: 'User-submitted report'
            },
            anonymous: reportForm.anonymous
          }
        }
      });

      if (error) throw error;

      toast.success('Report submitted successfully');
      setShowReportDialog(false);
      setReportForm({
        reportType: '',
        reportReason: '',
        description: '',
        evidence: [],
        anonymous: false,
        reportedContentId: '',
        reportedUserId: ''
      });
      loadUserReports();
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const submitAppeal = async () => {
    try {
      setSubmitting(true);

      if (!appealForm.moderationActionId || !appealForm.appealReason) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data, error } = await supabase.functions.invoke('content-moderation', {
        body: {
          action: 'submit_appeal',
          appealData: {
            userId,
            moderationActionId: appealForm.moderationActionId,
            appealReason: appealForm.appealReason,
            appealDetails: {
              description: appealForm.description,
              evidence: appealForm.evidence,
              context: appealForm.context
            }
          }
        }
      });

      if (error) throw error;

      toast.success('Appeal submitted successfully');
      setShowAppealDialog(false);
      setAppealForm({
        moderationActionId: '',
        appealReason: '',
        description: '',
        evidence: [],
        context: ''
      });
      loadUserAppeals();
    } catch (error: any) {
      console.error('Failed to submit appeal:', error);
      toast.error('Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'under_review':
      case 'processing':
      case 'submitted':
        return <Clock className="w-4 h-4" />;
      case 'dismissed':
      case 'denied':
        return <XCircle className="w-4 h-4" />;
      case 'escalated':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Flag className="w-6 h-6 text-primary" />
            <CardTitle>Content Moderation</CardTitle>
          </div>
          <CardDescription>
            Loading moderation data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <Flag className="w-6 h-6 text-primary" />
                <CardTitle>Content Moderation & Safety</CardTitle>
              </div>
              <CardDescription className="mt-2">
                Report inappropriate content, track your reports, and appeal moderation decisions.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowReportDialog(true)} className="flex items-center space-x-2">
                <Flag className="w-4 h-4" />
                <span>Report Content</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAppealDialog(true)}
                className="flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Appeal Decision</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="appeals">My Appeals</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => {
                const reportConfig = REPORT_TYPES[report.reportType as keyof typeof REPORT_TYPES];
                const IconComponent = reportConfig?.icon || Flag;

                return (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <IconComponent className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">
                                  {reportConfig?.title || report.reportType}
                                </h4>
                                <Badge 
                                  className={STATUS_COLORS[report.status as keyof typeof STATUS_COLORS]}
                                >
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(report.status)}
                                    <span>{report.status.replace('_', ' ')}</span>
                                  </div>
                                </Badge>
                                <Badge 
                                  className={PRIORITY_COLORS[report.priority as keyof typeof PRIORITY_COLORS]}
                                  size="sm"
                                >
                                  {report.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {report.reportReason}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                Submitted: {new Date(report.submittedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports submitted yet</p>
                  <p className="text-sm">Your content reports will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appeals" className="space-y-4">
          {appeals.length > 0 ? (
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <motion.div
                  key={appeal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium">Moderation Appeal</h4>
                              <Badge 
                                className={STATUS_COLORS[appeal.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending}
                              >
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(appeal.status)}
                                  <span>{appeal.status.replace('_', ' ')}</span>
                                </div>
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {appeal.appealReason}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Submitted: {new Date(appeal.submittedAt).toLocaleString()}
                              {appeal.resolvedAt && (
                                <span>
                                  {' '} • Resolved: {new Date(appeal.resolvedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appeals submitted yet</p>
                  <p className="text-sm">Your moderation appeals will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Report Content or User</DialogTitle>
            <DialogDescription>
              Help us maintain a safe community by reporting inappropriate content or behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select value={reportForm.reportType} onValueChange={(value) => setReportForm({ ...reportForm, reportType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REPORT_TYPES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{config.title}</div>
                        <div className="text-sm text-muted-foreground">{config.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportReason">Reason *</Label>
              <Textarea
                id="reportReason"
                placeholder="Please describe what happened..."
                value={reportForm.reportReason}
                onChange={(e) => setReportForm({ ...reportForm, reportReason: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                placeholder="Any additional context or details..."
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contentId">Content ID (if applicable)</Label>
                <Input
                  id="contentId"
                  placeholder="Content identifier"
                  value={reportForm.reportedContentId}
                  onChange={(e) => setReportForm({ ...reportForm, reportedContentId: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (if applicable)</Label>
                <Input
                  id="userId"
                  placeholder="User identifier"
                  value={reportForm.reportedUserId}
                  onChange={(e) => setReportForm({ ...reportForm, reportedUserId: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="anonymous"
                checked={reportForm.anonymous}
                onCheckedChange={(checked) => setReportForm({ ...reportForm, anonymous: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="anonymous" className="font-medium">
                  Submit Anonymously
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your identity will not be shared with the reported user or content creator.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitReport} disabled={submitting}>
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appeal Dialog */}
      <Dialog open={showAppealDialog} onOpenChange={setShowAppealDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Appeal Moderation Decision</DialogTitle>
            <DialogDescription>
              If you believe a moderation decision was incorrect, you can appeal it here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="moderationActionId">Moderation Action ID *</Label>
              <Input
                id="moderationActionId"
                placeholder="Enter the moderation action ID from the notification"
                value={appealForm.moderationActionId}
                onChange={(e) => setAppealForm({ ...appealForm, moderationActionId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appealReason">Appeal Reason *</Label>
              <Textarea
                id="appealReason"
                placeholder="Explain why you believe the moderation decision was incorrect..."
                value={appealForm.appealReason}
                onChange={(e) => setAppealForm({ ...appealForm, appealReason: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appealDescription">Additional Evidence</Label>
              <Textarea
                id="appealDescription"
                placeholder="Provide any additional evidence or context to support your appeal..."
                value={appealForm.description}
                onChange={(e) => setAppealForm({ ...appealForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                placeholder="Any additional context that might be relevant..."
                value={appealForm.context}
                onChange={(e) => setAppealForm({ ...appealForm, context: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitAppeal} disabled={submitting}>
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Appeal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Safety Guidelines */}
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-amber-900 dark:text-amber-100">
                Community Safety Guidelines
              </h4>
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-2">
                <p>
                  Help us maintain a safe and welcoming community for all users, especially children:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Report any content that violates our community guidelines</li>
                  <li>Use anonymous reporting for sensitive safety concerns</li>
                  <li>Provide clear, detailed descriptions in your reports</li>
                  <li>Appeals will be reviewed by our moderation team within 14 days</li>
                </ul>
                <p className="mt-3">
                  For immediate safety concerns involving children, contact our emergency support line.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContentModeration;