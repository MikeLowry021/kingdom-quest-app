'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Edit, Shield, AlertTriangle, Clock, CheckCircle, XCircle, FileText, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DataSubjectRequest {
  id: string;
  requestType: string;
  status: string;
  submittedAt: string;
  completedAt?: string;
  description?: string;
  priority: string;
}

interface DataSubjectRightsProps {
  userId: string;
  userType?: 'adult' | 'child' | 'parent';
  childId?: string;
  parentId?: string;
}

const REQUEST_TYPES = {
  access: {
    title: 'Data Access',
    description: 'Request a copy of all personal data we hold about you',
    icon: FileText,
    estimatedTime: '7 days',
    automated: true
  },
  portability: {
    title: 'Data Portability', 
    description: 'Get your data in a structured format to transfer to another service',
    icon: Download,
    estimatedTime: '7 days',
    automated: true
  },
  correction: {
    title: 'Data Correction',
    description: 'Request correction of inaccurate or incomplete personal data',
    icon: Edit,
    estimatedTime: '14 days',
    automated: false
  },
  deletion: {
    title: 'Data Deletion',
    description: 'Request deletion of your personal data (right to be forgotten)',
    icon: Trash2,
    estimatedTime: '7 days',
    automated: true
  },
  restriction: {
    title: 'Processing Restriction',
    description: 'Limit how we process your personal data',
    icon: Shield,
    estimatedTime: '14 days',
    automated: false
  },
  objection: {
    title: 'Processing Objection',
    description: 'Object to specific types of data processing',
    icon: XCircle,
    estimatedTime: '14 days',
    automated: false
  }
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export function DataSubjectRights({ userId, userType = 'adult', childId, parentId }: DataSubjectRightsProps) {
  const [requests, setRequests] = useState<DataSubjectRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({
    requestType: '',
    description: '',
    priority: 'normal',
    specificData: [] as string[],
    reason: '',
    contactMethod: 'email'
  });
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  useEffect(() => {
    loadUserRequests();
  }, [userId]);

  const loadUserRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('data-subject-rights', {
        body: {
          action: 'get_user_requests',
          userId: userId
        }
      });

      if (error) throw error;
      setRequests(data.requests || []);
    } catch (error: any) {
      console.error('Failed to load user requests:', error);
      toast.error('Failed to load data requests');
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async () => {
    try {
      setSubmitting(true);

      if (!requestForm.requestType || !requestForm.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const { data, error } = await supabase.functions.invoke('data-subject-rights', {
        body: {
          action: 'submit_request',
          userId: userType === 'parent' && childId ? childId : userId,
          requestType: requestForm.requestType,
          requestDetails: {
            description: requestForm.description,
            priority: requestForm.priority,
            specificData: requestForm.specificData,
            reason: requestForm.reason,
            contactMethod: requestForm.contactMethod
          },
          ...(userType === 'parent' && childId ? { childId, parentId: userId } : {})
        }
      });

      if (error) throw error;

      toast.success('Data subject rights request submitted successfully');
      setShowRequestDialog(false);
      setRequestForm({
        requestType: '',
        description: '',
        priority: 'normal',
        specificData: [],
        reason: '',
        contactMethod: 'email'
      });
      loadUserRequests();
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const exportData = async () => {
    try {
      setSubmitting(true);
      const { data, error } = await supabase.functions.invoke('data-subject-rights', {
        body: {
          action: 'export_user_data',
          userId: userType === 'parent' && childId ? childId : userId
        }
      });

      if (error) throw error;

      // Create and download the data export
      const exportJson = JSON.stringify(data.exportData, null, 2);
      const blob = new Blob([exportJson], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kingdomquest_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error: any) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-primary" />
            <CardTitle>Data Subject Rights</CardTitle>
          </div>
          <CardDescription>
            Loading your data requests...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-muted rounded-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted-foreground rounded" />
                  <div className="h-3 w-48 bg-muted-foreground rounded" />
                </div>
                <div className="w-20 h-6 bg-muted-foreground rounded" />
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
                <Database className="w-6 h-6 text-primary" />
                <CardTitle>
                  {userType === 'parent' ? 'Child Data Rights Management' : 'Your Data Subject Rights'}
                </CardTitle>
              </div>
              <CardDescription className="mt-2">
                Exercise your rights under POPIA to access, correct, or delete your personal information.
                {userType === 'parent' && ' You are managing data rights for your child\'s account.'}
              </CardDescription>
            </div>
            <Button onClick={exportData} disabled={submitting} className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export My Data</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="request">Submit Request</TabsTrigger>
          <TabsTrigger value="history">Request History</TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(REQUEST_TYPES).map(([key, config]) => {
              const IconComponent = config.icon;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => {
                    setRequestForm({ ...requestForm, requestType: key });
                    setShowRequestDialog(true);
                  }}
                >
                  <Card className="border-2 hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <IconComponent className="w-6 h-6 text-primary" />
                        <div className="space-y-2 flex-1">
                          <h3 className="font-semibold">{config.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant={config.automated ? 'default' : 'secondary'}>
                              {config.automated ? 'Automated' : 'Manual Review'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ~{config.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => {
                const requestConfig = REQUEST_TYPES[request.requestType as keyof typeof REQUEST_TYPES];
                const IconComponent = requestConfig?.icon || FileText;

                return (
                  <motion.div
                    key={request.id}
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
                                  {requestConfig?.title || request.requestType}
                                </h4>
                                <Badge 
                                  className={STATUS_COLORS[request.status as keyof typeof STATUS_COLORS]}
                                >
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(request.status)}
                                    <span>{request.status}</span>
                                  </div>
                                </Badge>
                                <Badge 
                                  className={PRIORITY_COLORS[request.priority as keyof typeof PRIORITY_COLORS]}
                                  size="sm"
                                >
                                  {request.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {request.description}
                              </p>
                              <div className="text-xs text-muted-foreground">
                                Submitted: {new Date(request.submittedAt).toLocaleString()}
                                {request.completedAt && (
                                  <span>
                                    {' '} • Completed: {new Date(request.completedAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {request.status === 'completed' && request.requestType === 'access' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportData()}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          )}
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
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No data requests submitted yet</p>
                  <p className="text-sm">Your data subject rights requests will appear here</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Submit {REQUEST_TYPES[requestForm.requestType as keyof typeof REQUEST_TYPES]?.title}
            </DialogTitle>
            <DialogDescription>
              {REQUEST_TYPES[requestForm.requestType as keyof typeof REQUEST_TYPES]?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your request in detail..."
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Optional: Explain why you're making this request"
                value={requestForm.reason}
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={requestForm.priority} onValueChange={(value) => setRequestForm({ ...requestForm, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactMethod">Contact Method</Label>
                <Select value={requestForm.contactMethod} onValueChange={(value) => setRequestForm({ ...requestForm, contactMethod: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitRequest} disabled={submitting}>
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </div>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* POPIA Rights Information */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Your Rights Under POPIA
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <p>
                  Under South Africa's Protection of Personal Information Act (POPIA), you have several important rights:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Right to be informed about how your data is processed</li>
                  <li>Right to access your personal information</li>
                  <li>Right to correct inaccurate or incomplete data</li>
                  <li>Right to delete your personal information</li>
                  <li>Right to restrict or object to processing</li>
                  <li>Right to data portability</li>
                </ul>
                <p className="mt-3">
                  We will respond to your requests within the legally required timeframes and free of charge.
                  For children under 18, these rights can be exercised by a parent or guardian.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataSubjectRights;