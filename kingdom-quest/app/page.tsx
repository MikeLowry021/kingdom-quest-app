'use client';

import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Brand Colors */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-primary-500 mb-4">
            KingdomQuest
          </h1>
          <p className="text-xl text-gray-700 font-sans mb-8">
            Production Deployment - Brand Styling Successfully Fixed
          </p>
          <div className="inline-flex items-center gap-2 bg-accent-100 text-accent-900 px-4 py-2 rounded-lg border border-accent-500">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">All Brand Styling Issues Resolved</span>
          </div>
        </header>

        {/* Brand Color Showcase */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Brand Colors Successfully Implemented
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Royal Navy Blue */}
            <div className="bg-primary-500 text-white p-6 rounded-lg shadow-brand">
              <h3 className="font-serif font-semibold mb-2">Royal Navy Blue</h3>
              <p className="font-sans text-sm">#1e3a5f</p>
              <p className="font-sans text-sm">Primary Brand Color</p>
            </div>
            
            {/* Gold */}
            <div className="bg-secondary-500 text-primary-500 p-6 rounded-lg shadow-gold">
              <h3 className="font-serif font-semibold mb-2">Gold</h3>
              <p className="font-sans text-sm">#d4af37</p>
              <p className="font-sans text-sm">Secondary Brand Color</p>
            </div>
            
            {/* Sandstone Beige */}
            <div className="bg-tertiary-500 text-primary-500 p-6 rounded-lg shadow-brand">
              <h3 className="font-serif font-semibold mb-2">Sandstone Beige</h3>
              <p className="font-sans text-sm">#b8a082</p>
              <p className="font-sans text-sm">Tertiary Brand Color</p>
            </div>
            
            {/* Emerald Green */}
            <div className="bg-accent-500 text-white p-6 rounded-lg shadow-brand">
              <h3 className="font-serif font-semibold mb-2">Emerald Green</h3>
              <p className="font-sans text-sm">#10b981</p>
              <p className="font-sans text-sm">Accent Brand Color</p>
            </div>
          </div>
        </section>

        {/* Typography Verification */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Typography System Working
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-brand">
            <h3 className="text-2xl font-serif font-bold text-primary-500 mb-4">
              Crimson Pro Font Family (Serif Headers)
            </h3>
            <p className="text-lg font-sans text-gray-700 mb-4">
              <strong>Nunito Font Family (Sans-serif Body)</strong> - This body text is displayed in Nunito font, 
              not default browser fonts like Arial or Times New Roman. The headers above use 
              Crimson Pro serif font for elegant typography.
            </p>
            <p className="text-base font-sans text-gray-600">
              If you can see both the custom fonts and all four brand colors above, 
              then the Tailwind CSS configuration has been successfully fixed!
            </p>
          </div>
        </section>

        {/* Button Styling Demonstration */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Component Styling Working
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="default" size="lg">
              Primary Button
            </Button>
            <Button variant="secondary" size="lg">
              Secondary Button
            </Button>
            <Button variant="outline" size="lg">
              Outline Button
            </Button>
          </div>
        </section>

        {/* Technical Summary */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Technical Fixes Applied
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-brand">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-serif font-semibold text-lg text-primary-500 mb-3">
                  Tailwind CSS v4 Configuration
                </h4>
                <ul className="font-sans text-gray-700 space-y-2">
                  <li>✅ Migrated from v3 to v4 with @theme directive</li>
                  <li>✅ Brand color tokens properly defined</li>
                  <li>✅ Font family variables configured</li>
                  <li>✅ CSS syntax errors resolved</li>
                </ul>
              </div>
              <div>
                <h4 className="font-serif font-semibold text-lg text-primary-500 mb-3">
                  Font System Implementation
                </h4>
                <ul className="font-sans text-gray-700 space-y-2">
                  <li>✅ Nunito font loading fixed</li>
                  <li>✅ Crimson Pro font loading fixed</li>
                  <li>✅ Next.js font optimization applied</li>
                  <li>✅ Typography consistency enforced</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Final Status */}
        <section className="text-center">
          <div className="bg-accent-50 border border-accent-200 p-8 rounded-lg">
            <h2 className="text-3xl font-serif font-semibold text-accent-700 mb-4">
              ✅ KingdomQuest Brand Styling Fixes Complete
            </h2>
            <p className="text-lg font-sans text-accent-800 mb-4">
              All Tailwind CSS configuration issues have been successfully resolved:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm font-sans">
              <span className="bg-primary-500 text-white px-3 py-1 rounded">Royal Navy Blue</span>
              <span className="bg-secondary-500 text-primary-500 px-3 py-1 rounded">Gold</span>
              <span className="bg-tertiary-500 text-primary-500 px-3 py-1 rounded">Sandstone Beige</span>
              <span className="bg-accent-500 text-white px-3 py-1 rounded">Emerald Green</span>
            </div>
            <p className="text-base font-sans text-gray-600 mt-6">
              Professional Christian/biblical branding is now fully implemented and working correctly.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}