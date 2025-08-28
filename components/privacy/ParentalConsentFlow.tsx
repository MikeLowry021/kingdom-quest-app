'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Calendar, Shield, AlertTriangle, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface ParentalConsentFlowProps {
  parentId: string;
  onConsentGranted?: (data: {
    childId: string;
    childName: string;
    ageTier: string;
  }) => void;
}

interface ConsentStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

const CONSENT_STEPS: ConsentStep[] = [
  {
    id: 'child_info',
    title: 'Child Information',
    description: 'Provide basic information about your child for age-appropriate content.',
    required: true
  },
  {
    id: 'data_consent',
    title: 'Data Processing Consent',
    description: 'Grant consent for processing your child\'s personal information.',
    required: true
  },
  {
    id: 'content_oversight',
    title: 'Content Oversight',
    description: 'Set your preferences for content supervision and parental controls.',
    required: true
  },
  {
    id: 'verification',
    title: 'Identity Verification',
    description: 'Verify your identity as the parent or legal guardian.',
    required: true
  }
];

const AGE_TIERS = [
  { value: 'toddler', label: 'Toddler (3-4 years)', description: 'Simple stories with basic concepts' },
  { value: 'preschool', label: 'Preschool (5-6 years)', description: 'Interactive stories with learning activities' },
  { value: 'elementary', label: 'Elementary (7-10 years)', description: 'Rich narratives with deeper biblical themes' },
  { value: 'preteen', label: 'Preteen (11-12 years)', description: 'Complex stories addressing life challenges' },
  { value: 'early-teen', label: 'Early Teen (13-15 years)', description: 'Mature themes with guidance for teenage issues' }
];

export function ParentalConsentFlow({ parentId, onConsentGranted }: ParentalConsentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    childName: '',
    childEmail: '',
    ageTier: '',
    birthYear: new Date().getFullYear(),
    dataProcessing: false,
    educationalContent: true,
    progressTracking: true,
    parentalOversight: true,
    contentApproval: 'recommended',
    communicationRestrictions: true,
    reportingFrequency: 'weekly',
    verificationMethod: 'email_verification',
    parentalDeclaration: false
  });

  const handleNext = () => {
    if (currentStep < CONSENT_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.childName || !formData.childEmail || !formData.ageTier) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!formData.parentalDeclaration) {
        toast.error('You must confirm your parental authority');
        return;
      }

      // Create child account
      const { data: childAccountData, error: childError } = await supabase.functions.invoke('create-child-account', {
        body: {
          parentId,
          childName: formData.childName,
          childEmail: formData.childEmail,
          ageTier: formData.ageTier
        }
      });

      if (childError) throw childError;

      const childId = childAccountData.childUserId;

      // Set up parental consent
      const { data: consentData, error: consentError } = await supabase.functions.invoke('consent-manager', {
        body: {
          action: 'setup_parental_consent',
          childId,
          parentId,
          consentData: {
            birthYear: formData.birthYear,
            verificationMethod: formData.verificationMethod,
            dataProcessing: formData.dataProcessing,
            educationalContent: formData.educationalContent,
            progressTracking: formData.progressTracking,
            parentalOversight: formData.parentalOversight,
            contentApproval: formData.contentApproval,
            communicationRestrictions: formData.communicationRestrictions,
            reportingFrequency: formData.reportingFrequency
          }
        }
      });

      if (consentError) throw consentError;

      toast.success('Child account created successfully with parental consent');
      
      onConsentGranted?.({
        childId,
        childName: formData.childName,
        ageTier: formData.ageTier
      });

    } catch (error: any) {
      console.error('Failed to create child account:', error);
      toast.error(error.message || 'Failed to create child account');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.childName && formData.childEmail && formData.ageTier;
      case 1:
        return formData.dataProcessing;
      case 2:
        return true; // Content oversight has defaults
      case 3:
        return formData.parentalDeclaration;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="childName">Child's Name *</Label>
              <Input
                id="childName"
                placeholder="Enter your child's full name"
                value={formData.childName}
                onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="childEmail">Child's Email Address *</Label>
              <Input
                id="childEmail"
                type="email"
                placeholder="child@example.com"
                value={formData.childEmail}
                onChange={(e) => setFormData({ ...formData, childEmail: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                This will be used for account creation and notifications.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageTier">Age Group *</Label>
              <Select value={formData.ageTier} onValueChange={(value) => setFormData({ ...formData, ageTier: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your child's age group" />
                </SelectTrigger>
                <SelectContent>
                  {AGE_TIERS.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      <div>
                        <div className="font-medium">{tier.label}</div>
                        <div className="text-sm text-muted-foreground">{tier.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthYear">Birth Year</Label>
              <Input
                id="birthYear"
                type="number"
                min="2005"
                max={new Date().getFullYear()}
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: parseInt(e.target.value) || new Date().getFullYear() })}
              />
              <p className="text-sm text-muted-foreground">
                This helps us provide age-appropriate content.
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                POPIA Compliance Notice
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Under South Africa's Protection of Personal Information Act (POPIA), 
                we require explicit parental consent before processing children's personal information.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="dataProcessing"
                  checked={formData.dataProcessing}
                  onCheckedChange={(checked) => setFormData({ ...formData, dataProcessing: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="dataProcessing" className="font-medium">
                    Data Processing Consent *
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    I consent to the processing of my child's personal information for providing 
                    educational services, progress tracking, and account management.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="educationalContent"
                  checked={formData.educationalContent}
                  onCheckedChange={(checked) => setFormData({ ...formData, educationalContent: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="educationalContent" className="font-medium">
                    Educational Content Access
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow access to age-appropriate biblical stories, quizzes, and educational activities.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="progressTracking"
                  checked={formData.progressTracking}
                  onCheckedChange={(checked) => setFormData({ ...formData, progressTracking: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="progressTracking" className="font-medium">
                    Progress Tracking
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Track my child's learning progress and provide personalized recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="parentalOversight"
                  checked={formData.parentalOversight}
                  onCheckedChange={(checked) => setFormData({ ...formData, parentalOversight: !!checked })}
                />
                <div className="space-y-1">
                  <Label htmlFor="parentalOversight" className="font-medium">
                    Parental Oversight & Reports
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive regular reports about my child's activities and allow parental oversight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="contentApproval">Content Approval Level</Label>
              <Select value={formData.contentApproval} onValueChange={(value) => setFormData({ ...formData, contentApproval: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required - All content needs approval</SelectItem>
                  <SelectItem value="recommended">Recommended - Approval for challenging content</SelectItem>
                  <SelectItem value="optional">Optional - Child can access age-appropriate content freely</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="communicationRestrictions"
                checked={formData.communicationRestrictions}
                onCheckedChange={(checked) => setFormData({ ...formData, communicationRestrictions: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="communicationRestrictions" className="font-medium">
                  Communication Restrictions
                </Label>
                <p className="text-sm text-muted-foreground">
                  Restrict my child's ability to communicate with other users and limit messaging features.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportingFrequency">Progress Reporting Frequency</Label>
              <Select value={formData.reportingFrequency} onValueChange={(value) => setFormData({ ...formData, reportingFrequency: value })}>
                <SelectTrigger>
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
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-950">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                Parental Authority Verification
              </h4>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                By proceeding, you confirm that you are the parent or legal guardian of the child 
                and have the authority to make decisions regarding their personal information.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationMethod">Verification Method</Label>
              <Select value={formData.verificationMethod} onValueChange={(value) => setFormData({ ...formData, verificationMethod: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email_verification">Email Verification</SelectItem>
                  <SelectItem value="phone_verification">Phone Verification</SelectItem>
                  <SelectItem value="document_verification">Document Verification</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                We will use this method to verify your identity as the parent or guardian.
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="parentalDeclaration"
                checked={formData.parentalDeclaration}
                onCheckedChange={(checked) => setFormData({ ...formData, parentalDeclaration: !!checked })}
              />
              <div className="space-y-1">
                <Label htmlFor="parentalDeclaration" className="font-medium text-base">
                  Parental Declaration *
                </Label>
                <p className="text-sm text-muted-foreground">
                  I declare that I am the parent or legal guardian of {formData.childName || '[Child Name]'} 
                  and have the legal authority to provide consent for the processing of their personal information. 
                  I understand my rights under POPIA and can withdraw this consent at any time.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-6 h-6 text-primary" />
            <CardTitle>Child Account Setup</CardTitle>
          </div>
          <CardDescription>
            Create a safe and supervised account for your child with POPIA-compliant parental consent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {CONSENT_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                  ${index <= currentStep 
                    ? 'border-primary bg-primary text-primary-foreground' 
                    : 'border-muted-foreground bg-background text-muted-foreground'
                  }
                `}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < CONSENT_STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2
                    ${index < currentStep ? 'bg-primary' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{CONSENT_STEPS[currentStep].title}</h3>
              <p className="text-muted-foreground">{CONSENT_STEPS[currentStep].description}</p>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < CONSENT_STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Child Account'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legal Notice */}
      <Card className="mt-6 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                POPIA Compliance & Your Rights
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This consent process complies with South Africa's Protection of Personal Information Act (POPIA). 
                You have the right to access, correct, or delete your child's information at any time. 
                You can also withdraw consent, which may affect service availability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ParentalConsentFlow;