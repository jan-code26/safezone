"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/AuthContexts"
import Link from "next/link"

interface UserProfileProps {
  onShowAuth?: () => void
}

export default function UserProfile({ onShowAuth }: UserProfileProps) {
  const { user, profile, loading, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/auth/signin"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Sign In
      </Link>
    )
  }

  const displayName = profile?.full_name || profile?.username || user.email?.split("@")[0] || "User"
  const avatarInitial = profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url || "/placeholder.svg"}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {avatarInitial.toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 max-w-32 truncate">{displayName}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>

              {/* Menu Items */}
              <Link
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="mr-3">👤</span>
                  Profile Settings
                </div>
              </Link>

              <Link
                href="/"
                onClick={() => setShowDropdown(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="mr-3">🏠</span>
                  Dashboard
                </div>
              </Link>

              <div className="border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    signOut()
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="mr-3">🚪</span>
                    Sign Out
                  </div>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
