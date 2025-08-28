'use client';

import React from 'react';
import { Shield, ArrowLeft, Download, Edit, Trash2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataSubjectRights } from '@/components/privacy/DataSubjectRights';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DataRightsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans">Loading data rights...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const userType = profile?.age_group === 'adult' ? 'adult' : 'child';
  const isParentAccount = profile?.is_parent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/privacy">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Privacy Center
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-accent-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-accent-600" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary-600 mb-2">
            Data Subject Rights
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans mb-4">
            Exercise your rights to access, correct, or delete your personal data under POPIA and other privacy laws.
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant={userType === 'adult' ? 'default' : 'secondary'}>
              {userType === 'adult' ? 'Adult Account' : 'Youth Account'}
            </Badge>
            {isParentAccount && (
              <Badge variant="outline">
                Parent/Guardian
              </Badge>
            )}
          </div>
        </div>

        {/* Important Information for Youth Accounts */}
        {userType === 'child' && (
          <Card className="mb-6 bg-accent-50 border-accent-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-accent-700 font-serif mb-2">
                    Youth Account Protection
                  </h3>
                  <p className="text-sm text-accent-600 font-sans mb-3">
                    As a youth account holder, you have the same data rights as adults, but some requests 
                    may require parental consent or notification for your protection.
                  </p>
                  <p className="text-sm text-accent-600 font-sans">
                    Your parent or guardian will be notified of any data rights requests and may need to 
                    approve certain actions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Overview of Rights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-6 w-6 text-primary-500" />
                <CardTitle className="font-serif text-primary-600">Access Your Data</CardTitle>
              </div>
              <CardDescription className="font-sans">
                Get a complete copy of all personal data we have about you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 font-sans">
                <li>• Profile information</li>
                <li>• Activity history</li>
                <li>• Consent records</li>
                <li>• Communication logs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Edit className="h-6 w-6 text-secondary-500" />
                <CardTitle className="font-serif text-primary-600">Correct Information</CardTitle>
              </div>
              <CardDescription className="font-sans">
                Update or fix any incorrect personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 font-sans">
                <li>• Name and contact details</li>
                <li>• Profile preferences</li>
                <li>• Account settings</li>
                <li>• Church affiliations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Trash2 className="h-6 w-6 text-red-500" />
                <CardTitle className="font-serif text-primary-600">Delete Your Data</CardTitle>
              </div>
              <CardDescription className="font-sans">
                Request complete removal of your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1 font-sans">
                <li>• Account deletion</li>
                <li>• Activity records</li>
                <li>• Stored preferences</li>
                <li>• Communication history</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Parent Account Controls */}
        {isParentAccount && (
          <Card className="mb-6 bg-secondary-50 border-secondary-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-secondary-700 font-serif">
                <Shield className="h-5 w-5" />
                Parent/Guardian Rights Management
              </CardTitle>
              <CardDescription className="font-sans">
                As a parent/guardian, you can exercise data rights on behalf of children in your care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-secondary-700 mb-2 font-serif">Your Authority</h4>
                  <ul className="text-sm text-gray-600 space-y-1 font-sans">
                    <li>• Submit requests for child accounts</li>
                    <li>• Access children's data exports</li>
                    <li>• Request corrections to child information</li>
                    <li>• Delete child accounts if needed</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-secondary-700 mb-2 font-serif">Legal Requirements</h4>
                  <ul className="text-sm text-gray-600 space-y-1 font-sans">
                    <li>• Proof of parental authority required</li>
                    <li>• Child notification where appropriate</li>
                    <li>• Audit trail maintained for all actions</li>
                    <li>• Legal compliance verification</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-secondary-200">
                <p className="text-sm text-secondary-700 font-medium font-sans">
                  Note: All parental requests are processed with additional verification to ensure 
                  child safety and legal compliance.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Subject Rights Component */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-primary-600">
              Submit a Data Rights Request
            </CardTitle>
            <CardDescription className="font-sans">
              Use the form below to exercise your data protection rights. We'll respond within the legally required timeframes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataSubjectRights 
              userId={user.id}
              userType={userType}
              parentId={isParentAccount ? user.id : undefined}
            />
          </CardContent>
        </Card>

        {/* Processing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
                <Info className="h-5 w-5" />
                Processing Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Data Access Request</span>
                  <Badge variant="outline">7 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Data Correction</span>
                  <Badge variant="outline">14 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Data Deletion</span>
                  <Badge variant="outline">7 days</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Complex Requests</span>
                  <Badge variant="outline">30 days</Badge>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 font-sans">
                Processing times may be extended in complex cases, with proper notification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
                <AlertTriangle className="h-5 w-5" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 font-sans">
                <li>• <strong>Verification required:</strong> Identity confirmation for all requests</li>
                <li>• <strong>Child accounts:</strong> Parental consent may be required</li>
                <li>• <strong>Legal obligations:</strong> Some data must be retained by law</li>
                <li>• <strong>Service impact:</strong> Some requests may affect app functionality</li>
                <li>• <strong>No charge:</strong> Data rights requests are always free</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-serif text-primary-600">
              Need Help with Your Request?
            </CardTitle>
            <CardDescription className="text-center font-sans">
              Our data protection team is here to assist you
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6 font-sans">
              If you need help understanding your rights, have questions about a request, or need 
              assistance with the process, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default">
                Contact Data Protection Team
              </Button>
              <Button variant="outline">
                Live Chat Support
              </Button>
              <Link href="/privacy">
                <Button variant="outline">
                  Privacy Information
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500 font-sans">
              <p>Data Protection Officer • KingdomQuest</p>
              <p>Committed to your privacy rights and data security</p>
              <p className="text-xs mt-2">All requests processed in compliance with POPIA and international privacy laws</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}