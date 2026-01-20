// File: src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  email: string
  user_metadata: {
    name?: string
    surname?: string
    full_name?: string
    is_provider?: boolean
  }
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isProvider: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  signup: (email: string, password: string, name: string, surname: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  showAuthModal: (mode?: 'login' | 'signup') => void
  hideAuthModal: () => void
  authModalVisible: boolean
  authModalMode: 'login' | 'signup'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProvider, setIsProvider] = useState(false)
  const [authModalVisible, setAuthModalVisible] = useState(false)
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login')
  const router = useRouter()

  useEffect(() => {
    // Check active session
    const checkUser = async () => {
      try {
        setIsLoading(true)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          return
        }

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata || {}
          })
          setIsProvider(session.user.user_metadata?.is_provider === true)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata || {}
        })
        setIsProvider(session.user.user_metadata?.is_provider === true)
      } else {
        setUser(null)
        setIsProvider(false)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error)
        return { 
          success: false, 
          message: error.message || 'Invalid login credentials' 
        }
      }

      setUser({
        id: data.user.id,
        email: data.user.email!,
        user_metadata: data.user.user_metadata || {}
      })
      setIsProvider(data.user.user_metadata?.is_provider === true)
      
      // Close modal on successful login
      setAuthModalVisible(false)
      
      return { success: true }
    } catch (error: any) {
      console.error('Login exception:', error)
      return { 
        success: false, 
        message: 'An unexpected error occurred' 
      }
    }
  }

  const signup = async (email: string, password: string, name: string, surname: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            surname,
            full_name: `${name} ${surname}`,
            is_provider: false, // All users start as normal users
            created_at: new Date().toISOString()
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return { 
          success: false, 
          message: error.message || 'Failed to create account' 
        }
      }

      if (data.user) {
        // Don't auto-login - wait for email verification
        return { 
          success: true, 
          message: 'Account created! Please check your email for verification.' 
        }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Signup exception:', error)
      return { 
        success: false, 
        message: 'An unexpected error occurred' 
      }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setIsProvider(false)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const showAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode)
    setAuthModalVisible(true)
  }

  const hideAuthModal = () => {
    setAuthModalVisible(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isProvider,
      login,
      signup,
      logout,
      showAuthModal,
      hideAuthModal,
      authModalVisible,
      authModalMode
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}