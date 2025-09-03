'use client'

import { createContext, useContext } from 'react'
import { User } from '@supabase/supabase-js'
import { type Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signInWithMagicLink: (email: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Minimal auth provider to prevent hooks issues during deployment
  const value = {
    user: null,
    profile: null,
    loading: false,
    signUp: async () => ({}),
    signIn: async () => ({}),
    signInWithMagicLink: async () => ({}),
    signOut: async () => {},
    updateProfile: async () => {},
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
