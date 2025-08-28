'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, FileText, Users, Settings, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { OptimizedImage } from '@/components/ui/optimized-image';

export default function PrivacyPage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 p-4 rounded-full">
              <Shield className="h-12 w-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary-600 mb-4">
            Privacy & Trust Center
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-sans">
            At KingdomQuest, we are committed to protecting your privacy and ensuring transparency 
            in how we handle your personal information. Your trust is sacred to us.
          </p>
          <div className="mt-6">
            <Badge variant="secondary" className="text-sm">
              POPIA Compliant • Child-Safe • Church-Trusted
            </Badge>
          </div>
        </div>

        {/* Quick Actions for Logged-in Users */}
        {user && (
          <div className="mb-12">
            <Card className="bg-gradient-to-r from-accent-50 to-tertiary-50 border-accent-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent-700 font-serif">
                  <Settings className="h-5 w-5" />
                  Your Privacy Controls
                </CardTitle>
                <CardDescription>
                  Manage your consent preferences and data rights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/consent">
                    <Button variant="outline" className="w-full justify-between group hover:bg-accent-50">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Consent Settings
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/data-rights">
                    <Button variant="outline" className="w-full justify-between group hover:bg-accent-50">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Data Rights
                      </span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Privacy Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Privacy Policy */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-8 w-8 text-primary-500" />
                <Badge variant="outline" className="text-xs">
                  Updated Aug 2025
                </Badge>
              </div>
              <CardTitle className="font-serif text-primary-600">
                Privacy Policy
              </CardTitle>
              <CardDescription className="font-sans">
                Comprehensive details about how we collect, use, and protect your information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2 mb-4 font-sans">
                <li>• Information we collect</li>
                <li>• How we use your data</li>
                <li>• Your rights under POPIA</li>
                <li>• Child protection measures</li>
              </ul>
              <a 
                href="/legal/privacy.md" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Read Full Policy
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-secondary-500" />
                <Badge variant="outline" className="text-xs">
                  Updated Aug 2025
                </Badge>
              </div>
              <CardTitle className="font-serif text-primary-600">
                Terms of Service
              </CardTitle>
              <CardDescription className="font-sans">
                The rules and guidelines that govern your use of KingdomQuest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2 mb-4 font-sans">
                <li>• Community guidelines</li>
                <li>• User responsibilities</li>
                <li>• Church admin roles</li>
                <li>• Account management</li>
              </ul>
              <Link href="/terms">
                <Button variant="outline" size="sm" className="w-full">
                  View Terms
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Data Rights */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Shield className="h-8 w-8 text-accent-500" />
                <Badge variant="secondary" className="text-xs">
                  Your Rights
                </Badge>
              </div>
              <CardTitle className="font-serif text-primary-600">
                Data Subject Rights
              </CardTitle>
              <CardDescription className="font-sans">
                Exercise your rights to access, correct, or delete your personal data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2 mb-4 font-sans">
                <li>• Request your data</li>
                <li>• Correct information</li>
                <li>• Delete your account</li>
                <li>• Restrict processing</li>
              </ul>
              {user ? (
                <Link href="/data-rights">
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Data Rights
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="w-full">
                  Sign in to manage
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Child Protection Section */}
        <Card className="mb-12 bg-gradient-to-r from-accent-50 to-primary-50 border-accent-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-accent-700 font-serif">
              <div className="bg-accent-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-accent-600" />
              </div>
              Child Protection & Family Safety
            </CardTitle>
            <CardDescription className="text-accent-600">
              Special protections for children and families in our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-accent-700 mb-3 font-serif">For Children (Under 18)</h4>
                <ul className="space-y-2 text-sm text-gray-700 font-sans">
                  <li>• Parental consent required</li>
                  <li>• Limited data collection</li>
                  <li>• Enhanced safety monitoring</li>
                  <li>• Content appropriateness filters</li>
                  <li>• No direct marketing</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-accent-700 mb-3 font-serif">For Parents & Guardians</h4>
                <ul className="space-y-2 text-sm text-gray-700 font-sans">
                  <li>• Full control over child accounts</li>
                  <li>• Monitor activity and progress</li>
                  <li>• Manage consent preferences</li>
                  <li>• Request data deletion anytime</li>
                  <li>• Direct communication with us</li>
                </ul>
              </div>
            </div>
            {user && profile?.age_group !== 'adult' && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-accent-200">
                <p className="text-sm text-accent-700 font-medium font-sans">
                  Youth Account: This account has enhanced privacy protections. 
                  Parents can manage settings and data preferences.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-serif text-primary-600">
              Questions About Privacy?
            </CardTitle>
            <CardDescription className="text-center font-sans">
              We're here to help you understand and control your data
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6 font-sans">
              If you have questions about our privacy practices, data handling, or your rights, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default">
                Contact Support
              </Button>
              <Button variant="outline">
                Data Protection Officer
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-500 font-sans">
              <p>Privacy Officer • KingdomQuest</p>
              <p>Committed to POPIA compliance and Christian values</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}