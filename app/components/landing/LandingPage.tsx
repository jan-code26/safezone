"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"

export default function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [showRedirectMessage, setShowRedirectMessage] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if user was redirected from a protected route
    const redirectTo = searchParams.get("redirectTo")
    if (redirectTo) {
      setShowRedirectMessage(true)
      // Hide message after 5 seconds
      setTimeout(() => setShowRedirectMessage(false), 5000)
    }
  }, [searchParams])

  const features = [
    {
      title: "Real-Time Family Tracking",
      description: "Keep track of your family members' locations and safety status in real-time during emergencies.",
      icon: "👨‍👩‍👧‍👦",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Weather Alerts & Monitoring",
      description: "Get instant notifications about severe weather conditions affecting your loved ones' areas.",
      icon: "🌩️",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Emergency Response",
      description: "Quick access to emergency services and instant communication with family members.",
      icon: "🚨",
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      title: "Safe Zone Management",
      description: "Set up safe zones and get alerts when family members enter or leave designated areas.",
      icon: "🛡️",
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of 3",
      content:
        "SafeGuard Radar gave me peace of mind during Hurricane Sandy. I could track my family's safety in real-time.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Mike Chen",
      role: "Emergency Coordinator",
      content:
        "This platform is invaluable for emergency response teams. The real-time data helps us make better decisions.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Lisa Rodriguez",
      role: "School Administrator",
      content:
        "We use SafeGuard Radar to keep parents informed about their children's safety during weather emergencies.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Show redirect message if user was redirected from protected route */}
      {showRedirectMessage && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-500">ℹ️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Please sign in to access that page.
                <Link href="/auth/signin" className="font-medium underline ml-1">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl">🛡️</span>
              <span className="ml-2 text-xl font-bold text-gray-900">SafeGuard Radar</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Keep Your Family
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600"> Safe</span>
              <br />
              During Emergencies
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Real-time family tracking, weather alerts, and emergency response coordination all in one powerful
              platform. Stay connected and protected when it matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Start Protecting Your Family
              </Link>
              <Link
                href="/auth/signin"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-gray-50"
              >
                Sign In to Dashboard
              </Link>
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <img
                src="/placeholder.svg?height=600&width=1200"
                alt="SafeGuard Radar Dashboard Preview"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need for Family Safety</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed to keep your family safe and connected during any emergency situation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Navigation */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all ${
                    currentFeature === index
                      ? "bg-blue-50 border-2 border-blue-200 shadow-md"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{feature.icon}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl p-8">
                <img
                  src={features[currentFeature].image || "/placeholder.svg"}
                  alt={features[currentFeature].title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Families Protected</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Reliability</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Emergency Monitoring</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">30s</div>
              <div className="text-blue-100">Alert Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Families Everywhere</h2>
            <p className="text-xl text-gray-600">See what our users have to say about SafeGuard Radar</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
                <div className="flex text-yellow-400 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Ready to Protect Your Family?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of families who trust SafeGuard Radar to keep their loved ones safe during emergencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signin"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold transition-all hover:bg-gray-50"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Free 30-day trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl">🛡️</span>
                <span className="ml-2 text-xl font-bold">SafeGuard Radar</span>
              </div>
              <p className="text-gray-400">
                Keeping families safe and connected during emergencies with real-time monitoring and alerts.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white transition-colors">
                    System Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SafeGuard Radar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
