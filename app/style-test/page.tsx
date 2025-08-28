'use client';

import { Button } from '@/components/ui/button';

export default function StyleTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Brand Colors */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-primary-500 mb-4">
            KingdomQuest
          </h1>
          <p className="text-xl text-gray-700 font-sans">
            Tailwind CSS Brand Styling Test
          </p>
        </header>

        {/* Brand Color Showcase */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Brand Colors Test
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

        {/* Typography Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Typography Test
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-brand">
            <h3 className="text-2xl font-serif font-bold text-primary-500 mb-4">
              Crimson Pro Font Family (Serif)
            </h3>
            <p className="text-lg font-sans text-gray-700 mb-4">
              Nunito Font Family (Sans-serif) - This is the body text font used throughout the KingdomQuest application.
            </p>
            <p className="text-base font-sans text-gray-600">
              This text should be displayed in Nunito font, not default browser fonts like Arial or Times New Roman.
            </p>
          </div>
        </section>

        {/* Button Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Button Styling Test
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="default" size="lg">
              Primary Button
            </Button>
            <Button variant="secondary" size="lg">
              Secondary Button
            </Button>
            <Button variant="outline" size="lg">
              Outline Button
            </Button>
            <Button variant="ghost" size="lg">
              Ghost Button
            </Button>
          </div>
        </section>

        {/* Gradient Test */}
        <section className="mb-12">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-6">
            Brand Gradients Test
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="gradient-primary text-white p-8 rounded-lg">
              <h3 className="text-xl font-serif font-semibold mb-2">
                Primary Gradient
              </h3>
              <p className="font-sans">Navy Blue to Emerald Green</p>
            </div>
            <div className="gradient-secondary text-white p-8 rounded-lg">
              <h3 className="text-xl font-serif font-semibold mb-2">
                Secondary Gradient
              </h3>
              <p className="font-sans">Gold to Navy Blue</p>
            </div>
          </div>
        </section>

        {/* Final Verification */}
        <section className="text-center">
          <h2 className="text-3xl font-serif font-semibold text-primary-500 mb-4">
            ✅ Styling Verification Complete
          </h2>
          <p className="text-lg font-sans text-gray-700">
            If you can see all brand colors, proper typography, and styled elements above,
            then the Tailwind CSS configuration has been successfully fixed!
          </p>
        </section>
      </div>
    </div>
  );
}