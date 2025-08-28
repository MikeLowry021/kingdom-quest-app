'use client';

import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConsentManager } from '@/components/privacy/ConsentManager';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ConsentPage() {
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
          <p className="text-gray-600 font-sans">Loading consent settings...</p>
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
            <div className="bg-primary-100 p-3 rounded-full">
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary-600 mb-2">
            Consent Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans">
            Control how your personal information is used. You can update these preferences anytime.
          </p>
          <div className="mt-4">
            <Badge variant={userType === 'adult' ? 'default' : 'secondary'}>
              {userType === 'adult' ? 'Adult Account' : 'Youth Account'}
            </Badge>
            {isParentAccount && (
              <Badge variant="outline" className="ml-2">
                Parent/Guardian
              </Badge>
            )}
          </div>
        </div>

        {/* Important Notice for Youth Accounts */}
        {userType === 'child' && (
          <Card className="mb-6 bg-accent-50 border-accent-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-accent-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-accent-700 font-serif mb-2">
                    Youth Account Protection
                  </h3>
                  <p className="text-sm text-accent-600 font-sans">
                    This account has enhanced privacy protections. Your parent or guardian can 
                    manage these consent settings and has been notified of any changes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parent Account Notice */}
        {isParentAccount && (
          <Card className="mb-6 bg-secondary-50 border-secondary-200">
            <CardHeader>
              <CardTitle className="text-secondary-700 font-serif text-lg">
                Parent/Guardian Controls
              </CardTitle>
              <CardDescription>
                As a parent/guardian, you can manage consent for child accounts in your family
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 font-sans">
                You have authority to manage privacy settings for children in your care. 
                All changes will be recorded with proper audit trails as required by law.
              </p>
              <div className="flex gap-3">
                <Link href="/family-settings">
                  <Button variant="outline" size="sm">
                    Manage Child Accounts
                  </Button>
                </Link>
                <Link href="/parental-controls">
                  <Button variant="outline" size="sm">
                    Parental Controls
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Consent Manager Component */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-serif text-primary-600">
              Your Consent Preferences
            </CardTitle>
            <CardDescription className="font-sans">
              Choose how we can use your information. Required consents are marked and cannot be disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConsentManager 
              userId={user.id}
              userType={userType}
              onConsentChange={(consent) => {
                console.log('Consent updated:', consent);
                // Optional: Add toast notification or other UI feedback
              }}
            />
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif text-primary-600">
                What This Means
            </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 font-sans">
                <li>• <strong>Required consents</strong> are necessary for the app to work</li>
                <li>• <strong>Optional consents</strong> enhance your experience but aren't required</li>
                <li>• You can withdraw consent anytime (except required ones)</li>
                <li>• All changes are recorded with timestamps for legal compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif text-primary-600">
                Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 font-sans">
                <li>• <strong>Transparency:</strong> Know exactly how your data is used</li>
                <li>• <strong>Control:</strong> Choose what you're comfortable sharing</li>
                <li>• <strong>Withdrawal:</strong> Change your mind anytime</li>
                <li>• <strong>Portability:</strong> Request your data in a standard format</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/privacy">
              <Button variant="outline">
                Privacy Policy
              </Button>
            </Link>
            <Link href="/data-rights">
              <Button variant="outline">
                Data Rights
              </Button>
            </Link>
            <Button variant="outline">
              Contact Support
            </Button>
          </div>
          <p className="text-xs text-gray-500 font-sans">
            Consent management system compliant with POPIA and international privacy standards.
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}