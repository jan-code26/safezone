"use client"

import { createContext, useContext, type ReactNode, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { authService, type AuthUser } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: AuthUser | null
  loading: boolean
  signUp: (data: { email: string; password: string; username?: string; full_name?: string }) => Promise<{
    success: boolean
    error?: string
  }>
  signIn: (data: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: { username?: string; full_name?: string; avatar_url?: string }) => Promise<{
    success: boolean
    error?: string
  }>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { session } = await authService.getSession()
        if (session) {
          setSession(session)
          setUser(session.user)
          // Don't wait for profile loading to complete initialization
          loadUserProfile(session.user.id).catch(error => {
            console.error("Error loading profile during init:", error)
          })
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)

        // Redirect to dashboard on successful sign in
        if (event === "SIGNED_IN") {
          router.push("/")
        }
      } else {
        setProfile(null)

        // Redirect to landing page on sign out
        if (event === "SIGNED_OUT") {
          router.push("/")
        }
      }

      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Load user profile with retry logic
  const loadUserProfile = async (userId: string, retryCount = 0) => {
    try {
      const { profile, error } = await authService.getUserProfile(userId)

      if (error) {
        console.error("Error loading profile:", error)
        return
      }

      if (!profile && retryCount < 3) {
        // Profile might not be created yet, wait and retry
        console.log(`Profile not found, retrying... (${retryCount + 1}/3)`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return loadUserProfile(userId, retryCount + 1)
      }

      if (!profile) {
        console.log("Profile not found after retries, creating fallback profile...")
        // Create a basic profile if it doesn't exist
        const { profile: newProfile } = await authService.upsertUserProfile(userId, {
          email: user?.email || "",
          username: user?.user_metadata?.username,
          full_name: user?.user_metadata?.full_name,
        })
        setProfile(newProfile)
      } else {
        setProfile(profile)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  // Sign up
  const signUp = async (data: { email: string; password: string; username?: string; full_name?: string }) => {
    try {
      setLoading(true)
      const { user, error } = await authService.signUp(data)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred during sign up" }
    } finally {
      setLoading(false)
    }
  }

  // Sign in
  const signIn = async (data: { email: string; password: string }) => {
    try {
      setLoading(true)
      const { user, error } = await authService.signIn(data)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred during sign in" }
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { error } = await authService.signInWithGoogle()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred during Google sign in" }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      await authService.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update profile
  const updateProfile = async (data: { username?: string; full_name?: string; avatar_url?: string }) => {
    if (!user) {
      return { success: false, error: "No user logged in" }
    }

    try {
      const { profile, error } = await authService.updateUserProfile(user.id, data)

      if (error) {
        return { success: false, error: error.message }
      }

      setProfile(profile)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred updating profile" }
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred sending reset email" }
    }
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
