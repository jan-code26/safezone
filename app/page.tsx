"use client"

import { useAuth } from "@/contexts/AuthContexts"
import Header from "./components/layout/Header"
import ClientComponentsWrapper from "./components/ClientComponentsWrapper"
import LandingPage from "./components/landing/LandingPage"
import LoadingScreen from "./components/ui/LoadingScreen"

export default function HomePage() {
  const { user, loading } = useAuth()

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingScreen message="Initializing SafeGuard Radar..." />
  }

  // Show landing page for unauthenticated users
  if (!user) {
    return <LandingPage />
  }

  // Show dashboard for authenticated users
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <ClientComponentsWrapper />
      </main>
    </div>
  )
}
