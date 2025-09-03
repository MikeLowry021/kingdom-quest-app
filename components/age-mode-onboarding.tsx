'use client'

import { useState } from 'react'
import { AgeTier } from '@/lib/supabase'
import { getAgeTierLabel, isChildTier } from '@/lib/age-modes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, User, Heart, Shield, Sparkles, BookOpen } from 'lucide-react'
import { useAgeMode } from '@/lib/use-age-mode'
import { useAuth } from '@/lib/auth'

interface AgeModeOnboardingProps {
  onComplete: () => void
}

const AGE_TIERS: { tier: AgeTier; icon: React.ReactNode; title: string; description: string }[] = [
  {
    tier: 'toddler',
    icon: <Heart className="h-8 w-8 text-pink-500" />,
    title: 'Toddler (2-3)',
    description: 'Simple stories with big pictures and sounds'
  },
  {
    tier: 'preschool',
    icon: <Sparkles className="h-8 w-8 text-purple-500" />,
    title: 'Preschool (4-5)',
    description: 'Interactive stories about God\'s love and kindness'
  },
  {
    tier: 'elementary',
    icon: <BookOpen className="h-8 w-8 text-blue-500" />,
    title: 'Elementary (6-8)',
    description: 'Bible stories with easy reading and fun activities'
  },
  {
    tier: 'preteen',
    icon: <Users className="h-8 w-8 text-green-500" />,
    title: 'Pre-teen (9-12)',
    description: 'Character studies and real-life applications'
  },
  {
    tier: 'early-teen',
    icon: <Shield className="h-8 w-8 text-indigo-500" />,
    title: 'Early Teen (13-15)',
    description: 'Identity, faith questions, and peer relationships'
  },
  {
    tier: 'late-teen',
    icon: <User className="h-8 w-8 text-teal-500" />,
    title: 'Late Teen (16-17)',
    description: 'Leadership, calling, and mature faith decisions'
  },
  {
    tier: 'young-adult',
    icon: <User className="h-8 w-8 text-orange-500" />,
    title: 'Young Adult (18-25)',
    description: 'Life integration, relationships, and ministry'
  },
  {
    tier: 'adult',
    icon: <User className="h-8 w-8 text-gray-600" />,
    title: 'Adult (26-64)',
    description: 'Family leadership and theological depth'
  },
  {
    tier: 'senior',
    icon: <User className="h-8 w-8 text-amber-600" />,
    title: 'Senior (65+)',
    description: 'Wisdom sharing and legacy building'
  }
]

export function AgeModeOnboarding({ onComplete }: AgeModeOnboardingProps) {
  const { user } = useAuth()
  const { setupAgeMode } = useAgeMode()
  const [step, setStep] = useState<'select-tier' | 'profile-info' | 'parent-info'>('select-tier')
  const [selectedTier, setSelectedTier] = useState<AgeTier | null>(null)
  const [fullName, setFullName] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [isCreatingChildAccount, setIsCreatingChildAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTierSelect = (tier: AgeTier) => {
    setSelectedTier(tier)
    if (tier === 'adult' || tier === 'senior') {
      setStep('profile-info')
    } else {
      // For child/teen tiers, determine if this is a parent creating a child account
      // or if they need parent supervision
      setStep('parent-info')
    }
  }

  const handleProfileComplete = async () => {
    if (!selectedTier || !fullName) {
      setError('Please provide all required information')
      return
    }

    try {
      setLoading(true)
      setError(null)

      let parentId = undefined
      if (isChildTier(selectedTier) && isCreatingChildAccount) {
        // For now, we'll skip parent linking in this demo
        // In production, you'd implement parent account lookup/creation
        parentId = user?.id
      }

      await setupAgeMode(selectedTier, fullName, parentId)
      onComplete()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set up age mode')
    } finally {
      setLoading(false)
    }
  }

  const renderTierSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Choose Your Age Experience
        </h2>
        <p className="text-gray-600">
          We'll customize KingdomQuest to be perfect for your learning stage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AGE_TIERS.map(({ tier, icon, title, description }) => (
          <Card
            key={tier}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTier === tier ? 'ring-2 ring-kingdom-blue-500 shadow-lg' : ''
            }`}
            onClick={() => handleTierSelect(tier)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">{icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderProfileInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Profile Information
        </h2>
        <p className="text-gray-600">
          Let's set up your profile for {getAgeTierLabel(selectedTier)}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setStep('select-tier')}>
              Back
            </Button>
            <Button onClick={handleProfileComplete} disabled={!fullName || loading}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderParentInfo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          Parental Guidance
        </h2>
        <p className="text-gray-600">
          {getAgeTierLabel(selectedTier)} accounts have special safety features
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="child-account"
                name="account-type"
                checked={isCreatingChildAccount}
                onChange={() => setIsCreatingChildAccount(true)}
                className="h-4 w-4 text-kingdom-blue-600"
              />
              <label htmlFor="child-account" className="text-sm font-medium text-gray-700">
                I'm a parent creating an account for my child
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="own-account"
                name="account-type"
                checked={!isCreatingChildAccount}
                onChange={() => setIsCreatingChildAccount(false)}
                className="h-4 w-4 text-kingdom-blue-600"
              />
              <label htmlFor="own-account" className="text-sm font-medium text-gray-700">
                I'm setting up my own account
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isCreatingChildAccount ? "Child's" : 'Your'} Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isCreatingChildAccount ? "Enter child's full name" : "Enter your full name"}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Safety Features Include:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Age-appropriate content filtering</li>
              <li>• Larger, easier-to-use interface elements</li>
              <li>• Simplified navigation and controls</li>
              <li>• Progress tracking and parental oversight</li>
              {isChildTier(selectedTier) && <li>• Parental approval for certain activities</li>}
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={() => setStep('select-tier')}>
              Back
            </Button>
            <Button onClick={handleProfileComplete} disabled={!fullName || loading}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-kingdom-blue-50 to-gold-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === 'select-tier' && renderTierSelection()}
        {step === 'profile-info' && renderProfileInfo()}
        {step === 'parent-info' && renderParentInfo()}
      </div>
    </div>
  )
}