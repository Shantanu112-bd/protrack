import React, { createContext, useContext, useEffect, useState } from 'react'

export type UserRole = 'manufacturer' | 'packager' | 'wholesaler' | 'seller' | 'inspector' | 'customer' | 'admin'

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  company_name?: string
  wallet_address?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  linkWallet: (walletAddress: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // For demo purposes, set mock user data
    const mockUser: User = {
      id: 'demo-user-123',
      email: 'demo@protrack.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const mockProfile: UserProfile = {
      id: 'demo-user-123',
      email: 'demo@protrack.com',
      role: 'manufacturer',
      company_name: 'GreenTech Manufacturing',
      wallet_address: '0x1234567890abcdef',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Simulate loading delay
    setTimeout(() => {
      setUser(mockUser)
      setProfile(mockProfile)
      setLoading(false)
    }, 500)
  }, [])

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    // Mock implementation for demo
    console.log('Mock signUp:', { email, password, userData })
  }

  const signIn = async (email: string, password: string) => {
    // Mock implementation for demo
    console.log('Mock signIn:', { email, password })
  }

  const signOut = async () => {
    // Mock implementation for demo
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) throw new Error('No profile available')
    
    // Mock implementation for demo
    const updatedProfile = { ...profile, ...updates }
    setProfile(updatedProfile)
  }

  const linkWallet = async (walletAddress: string) => {
    await updateProfile({ wallet_address: walletAddress })
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    linkWallet
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
