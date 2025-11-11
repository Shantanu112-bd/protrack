/**
 * Authentication Hook
 * Provides authentication state and methods
 */

import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../services/supabase/client'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'manufacturer' | 'packager' | 'wholesaler' | 'seller' | 'inspector' | 'customer' | 'admin'

export interface AuthUser extends User {
  role?: UserRole
  companyName?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: { role?: UserRole; companyName?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('users')
            .select('role, company_name')
            .eq('id', session.user.id)
            .single()

          setUser({
            ...session.user,
            role: profile?.role,
            companyName: profile?.company_name
          })
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('users')
            .select('role, company_name')
            .eq('id', session.user.id)
            .single()

          setUser({
            ...session.user,
            role: profile?.role,
            companyName: profile?.company_name
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, role: UserRole) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (error) throw error

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            role
          })

        if (profileError) throw profileError
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: { role?: UserRole; companyName?: string }) => {
    if (!user) throw new Error('No user logged in')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          role: updates.role,
          company_name: updates.companyName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        role: updates.role || prev.role,
        companyName: updates.companyName || prev.companyName
      } : null)
    } catch (error) {
      console.error('Profile update error:', error)
      throw error
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  }
}
