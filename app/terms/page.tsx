'use client';

import React from 'react';
import { FileText, ArrowLeft, Shield, Users, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function TermsPage() {
  const [acceptedTerms, setAcceptedTerms] = React.useState(false);

  // Check if user has accepted terms (you might want to load this from user preferences)
  React.useEffect(() => {
    // Load acceptance status from local storage or user profile
    const accepted = localStorage.getItem('kingdomquest-terms-accepted');
    setAcceptedTerms(accepted === 'true');
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('kingdomquest-terms-accepted', 'true');
    setAcceptedTerms(true);
  };

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
            <div className="bg-secondary-100 p-3 rounded-full">
              <FileText className="h-8 w-8 text-secondary-600" />
            </div>
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary-600 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto font-sans mb-4">
            The rules and guidelines that govern your use of KingdomQuest
          </p>
          <div className="flex justify-center gap-2">
            <Badge variant="outline">
              Effective Date: August 27, 2025
            </Badge>
            <Badge variant="secondary">
              Last Updated: August 27, 2025
            </Badge>
          </div>
        </div>

        {/* Terms Acceptance Status */}
        <Card className={`mb-6 ${acceptedTerms ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {acceptedTerms ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold font-sans">Terms Accepted</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold font-sans">Please Review Terms</span>
                  </div>
                )}
              </div>
              {!acceptedTerms && (
                <Button onClick={handleAcceptTerms} size="sm">
                  Accept Terms
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-primary-600">
              Quick Navigation
            </CardTitle>
            <CardDescription className="font-sans">
              Jump to specific sections of our Terms of Service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#agreement" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                <FileText className="h-4 w-4" />
                Agreement to Terms
              </a>
              <a href="#service-description" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                <Shield className="h-4 w-4" />
                Service Description
              </a>
              <a href="#user-accounts" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                <Users className="h-4 w-4" />
                User Accounts & Responsibilities
              </a>
              <a href="#child-protection" className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
                <Shield className="h-4 w-4" />
                Child Protection
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Full Terms Document */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
              <FileText className="h-5 w-5" />
              Complete Terms of Service
            </CardTitle>
            <CardDescription className="font-sans">
              Please read the complete terms document carefully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Embedded terms content - in a real app, you might load this from the markdown file */}
              <div className="prose prose-sm max-w-none">
                <iframe 
                  src="/legal/terms.md" 
                  className="w-full h-96 border rounded-lg"
                  title="Terms of Service Document"
                />
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-4">
                <a 
                  href="/legal/terms.md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Open Full Document
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Separator orientation="vertical" className="h-4" />
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  Print Terms
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
                <Shield className="h-5 w-5" />
                Child Safety
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 font-sans">
                <li>• Parental consent required for children under 18</li>
                <li>• Enhanced content moderation and safety measures</li>
                <li>• Limited data collection from minors</li>
                <li>• Direct parental control and oversight</li>
                <li>• Immediate reporting of safety concerns</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
                <Users className="h-5 w-5" />
                Community Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 font-sans">
                <li>• Respectful and faith-appropriate content only</li>
                <li>• No harassment, bullying, or inappropriate behavior</li>
                <li>• Church community guidelines apply</li>
                <li>• Content moderation by trained staff</li>
                <li>• Consequences for violations clearly defined</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
                <FileText className="h-5 w-5" />
                Account Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 font-sans">
                <li>• Maintain accurate account information</li>
                <li>• Keep login credentials secure</li>
                <li>• Report security issues immediately</li>
                <li>• Use the service lawfully and appropriately</li>
                <li>• Respect intellectual property rights</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-primary-600">
                <AlertCircle className="h-5 w-5" />
                Important Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700 font-sans">
                <li>• Terms may be updated with advance notice</li>
                <li>• Service availability not guaranteed 100%</li>
                <li>• Dispute resolution through mediation first</li>
                <li>• South African law governs this agreement</li>
                <li>• Contact us with questions or concerns</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Contact and Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center font-serif text-primary-600">
              Questions About These Terms?
            </CardTitle>
            <CardDescription className="text-center font-sans">
              We're here to help you understand your rights and responsibilities
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6 font-sans">
              If you have questions about these terms, your account, or how to use KingdomQuest appropriately, 
              please don't hesitate to reach out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="default">
                Contact Support
              </Button>
              <Button variant="outline">
                Church Admin Help
              </Button>
              <Link href="/privacy">
                <Button variant="outline">
                  Privacy Information
                </Button>
              </Link>
            </div>
            <div className="mt-6 text-sm text-gray-500 font-sans">
              <p>Legal Team • KingdomQuest</p>
              <p>Committed to transparency and Christian community values</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}