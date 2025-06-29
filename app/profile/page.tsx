"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContexts"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut, loading, refreshProfile } = useAuth()
  const router = useRouter()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    full_name: "",
    avatar_url: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)

    const { success, error } = await updateProfile(formData)

    if (success) {
      setSuccess("Profile updated successfully!")
      setIsEditing(false)
      await refreshProfile()
    } else {
      setError(error || "An error occurred updating your profile")
    }

    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSignOut = async () => {
    await signOut()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl">🛡️</span>
                <span className="ml-2 text-xl font-bold text-gray-900">SafeGuard Radar</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {success && (
                <div className="mb-4 rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{success}</div>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Choose a username"
                    />
                  </div>

                  <div>
                    <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar_url"
                      id="avatar_url"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setError(null)
                        setSuccess(null)
                        // Reset form data
                        if (profile) {
                          setFormData({
                            username: profile.username || "",
                            full_name: profile.full_name || "",
                            avatar_url: profile.avatar_url || "",
                          })
                        }
                      }}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                      {profile?.avatar_url ? (
                        <img
                          className="h-20 w-20 rounded-full object-cover"
                          src={profile.avatar_url || "/placeholder.svg"}
                          alt="Profile"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-2xl text-gray-600">
                            {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {profile?.full_name || profile?.username || "User"}
                      </h2>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="border-t border-gray-200 pt-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile?.full_name || "Not provided"}</dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">Username</dt>
                        <dd className="mt-1 text-sm text-gray-900">{profile?.username || "Not provided"}</dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {profile?.created_at ? formatDate(profile.created_at) : "Unknown"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Unknown"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                        <dd className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Account Actions */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                    <div className="space-y-3">
                      <Link
                        href="/auth/change-password"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Change Password
                      </Link>
                      <div>
                        <button
                          onClick={handleSignOut}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
