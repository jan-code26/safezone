"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import LoadingScreen from "@/app/components/ui/LoadingScreen"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          router.push("/auth/signin?error=auth_error")
          return
        }

        if (data.session) {
          console.log("Authentication successful")
          router.push("/")
        } else {
          router.push("/auth/signin?error=no_session")
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        router.push("/auth/signin?error=callback_error")
      }
    }

    handleAuthCallback()
  }, [router])

  return <LoadingScreen message="Completing authentication..." />
}
