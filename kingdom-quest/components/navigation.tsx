'use client'

import { useAuth } from '@/lib/auth'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Home,
  BookOpen,
  HelpCircle,
  Heart,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Map,
  CreditCard,
  Church
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userPlan, setUserPlan] = useState('free')
  
  // Get user plan for church admin access
  useEffect(() => {
    async function getUserPlan() {
      if (user) {
        try {
          const { getSubscriptionClient } = await import('@/lib/subscriptions')
          const subscription = await getSubscriptionClient()
          const plan = subscription?.subscription_plans?.name?.toLowerCase() || 'free'
          setUserPlan(plan)
        } catch (error) {
          console.error('Error getting subscription:', error)
          setUserPlan('free')
        }
      }
    }
    getUserPlan()
  }, [user])

  const navigation = [
    { name: t('nav.home'), href: `/${locale}`, icon: Home },
    { name: t('nav.stories'), href: `/${locale}/select-story`, icon: BookOpen },
    { name: t('nav.quizzes'), href: `/${locale}/quiz`, icon: HelpCircle },
    { name: t('nav.mapExplorer'), href: `/${locale}/map`, icon: Map },
    { name: t('nav.familyAltar'), href: `/${locale}/altar`, icon: Heart },
    { name: t('nav.profile'), href: `/${locale}/profile`, icon: User },
    { name: 'Billing', href: `/${locale}/billing`, icon: CreditCard },
  ]

  const adminNavigation = [
    { name: t('nav.admin'), href: `/${locale}/admin`, icon: Settings },
  ]
  
  const churchAdminNavigation = [
    { name: 'Church Admin', href: `/${locale}/church-admin`, icon: Church },
  ]

  const isAdmin = profile?.is_parent && profile?.age_group === 'adult'
  const isChurchAdmin = profile?.plan_type === 'church' || userPlan === 'church' // Add this for church users

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <Image
                src="/images/kingdomquest-logo-horizontal.png"
                alt="KingdomQuest Logo"
                width={160}
                height={48}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language switcher */}
            <LanguageSwitcher variant="dropdown" size="sm" showFlag={true} />
            
            {user && (
              <div className="flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium font-sans transition-colors min-h-[2.75rem]',
                      pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-muted-foreground hover:text-foreground hover:bg-tertiary-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {isAdmin && adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium font-sans transition-colors min-h-[2.75rem]',
                      pathname === item.href
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-muted-foreground hover:text-foreground hover:bg-tertiary-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {isChurchAdmin && churchAdminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium font-sans transition-colors min-h-[2.75rem]',
                      pathname === item.href
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'text-muted-foreground hover:text-foreground hover:bg-tertiary-50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut()}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('nav.signOut')}</span>
                </Button>
              </div>
            )}
            
            {!user && (
              <div className="flex items-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href={`/${locale}/auth`}>{t('auth.logIn')}</Link>
                </Button>
                <Button asChild>
                  <Link href={`/${locale}/auth?tab=sign-up`}>{t('auth.signUp')}</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher variant="dropdown" size="sm" showFlag={true} className="mr-2" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
              aria-label={mobileMenuOpen ? t('nav.close') : t('nav.menu')}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
            {user ? (
              <>
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {isAdmin && adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                {isChurchAdmin && churchAdminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium font-sans transition-colors min-h-[2.75rem]',
                      pathname === item.href
                        ? 'bg-secondary-100 text-secondary-700'
                        : 'text-muted-foreground hover:text-foreground hover:bg-tertiary-100'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <button
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>{t('nav.signOut')}</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/${locale}/auth`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('auth.logIn')}
                </Link>
                <Link
                  href={`/${locale}/auth?tab=sign-up`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('auth.signUp')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}