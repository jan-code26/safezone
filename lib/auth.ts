import { supabase } from "./supabase"
import type { Session, AuthError } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  created_at: string
  last_sign_in_at?: string
}

export interface SignUpData {
  email: string
  password: string
  username?: string
  full_name?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateProfileData {
  username?: string
  full_name?: string
  avatar_url?: string
}

class AuthService {
  // Sign up new user
  async signUp({ email, password, username, full_name }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name,
          },
        },
      })

      if (error) throw error

      // The profile should be created automatically by the database trigger
      // But let's add a fallback in case it doesn't work
      if (data.user && data.session) {
        // Wait a moment for the trigger to complete
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if profile was created, if not create it manually
        const { profile } = await this.getUserProfile(data.user.id)
        if (!profile) {
          console.log("Profile not created by trigger, creating manually...")
          await this.createUserProfileFallback(data.user.id, {
            email,
            username,
            full_name,
          })
        }
      }

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { user: null, session: null, error: error as AuthError }
    }
  }

  // Sign in existing user
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      return { user: data.user, session: data.session, error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { user: null, session: null, error: error as AuthError }
    }
  }

  // Sign in with OAuth (Google)
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Google sign in error:", error)
      return { error: error as AuthError }
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Sign out error:", error)
      return { error: error as AuthError }
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return { session: data.session, error: null }
    } catch (error) {
      console.error("Get session error:", error)
      return { session: null, error: error as AuthError }
    }
  }

  // Get current user
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      console.error("Get user error:", error)
      return { user: null, error: error as AuthError }
    }
  }

  // Fallback method to create user profile (should rarely be needed)
  private async createUserProfileFallback(userId: string, profileData: Partial<AuthUser>) {
    try {
      // First, let's try with the current session
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          email: profileData.email,
          username: profileData.username,
          full_name: profileData.full_name,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Fallback profile creation failed:", error)
        // Don't throw here - profile creation failure shouldn't block signup
        return null
      }

      return data
    } catch (error) {
      console.error("Fallback profile creation error:", error)
      // Don't throw here - profile creation failure shouldn't block signup
      return null
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<{ profile: AuthUser | null; error: AuthError | null }> {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error) {
        // If no profile found, that's not necessarily an error
        if (error.code === "PGRST116") {
          return { profile: null, error: null }
        }
        throw error
      }
      return { profile: data, error: null }
    } catch (error) {
      console.error("Get profile error:", error)
      return { profile: null, error: error as AuthError }
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: UpdateProfileData) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error("Update profile error:", error)
      return { profile: null, error: error as AuthError }
    }
  }

  // Create or update user profile (upsert)
  async upsertUserProfile(userId: string, profileData: Partial<AuthUser>) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .upsert(
          {
            id: userId,
            email: profileData.email,
            username: profileData.username,
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "id",
          },
        )
        .select()
        .single()

      if (error) throw error
      return { profile: data, error: null }
    } catch (error) {
      console.error("Upsert profile error:", error)
      return { profile: null, error: error as AuthError }
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: error as AuthError }
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error) {
      console.error("Update password error:", error)
      return { user: null, error: error as AuthError }
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const authService = new AuthService()
