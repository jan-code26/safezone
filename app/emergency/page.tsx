"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function EmergencyPage() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(true)
  const [distressSignalSent, setDistressSignalSent] = useState(false)

  useEffect(() => {
    // Simulate connecting to emergency services
    const timer = setTimeout(() => {
      setIsConnecting(false)
      setDistressSignalSent(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleCall911 = () => {
    // In a real app, this would initiate a call
    window.location.href = "tel:911"
  }

  const handleGoBack = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-red-50 flex flex-col">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🚨 EMERGENCY SOS</h1>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-red-700 hover:bg-red-800 rounded-lg transition-colors"
          >
            ← Back to Safety
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full space-y-8">
          
          {/* Emergency Call Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🚨</div>
              <h2 className="text-3xl font-bold text-red-600">EMERGENCY SERVICES</h2>
              <p className="text-lg text-gray-700">
                If this is a life-threatening emergency, call 911 immediately
              </p>
              
              <button
                onClick={handleCall911}
                className="w-full py-6 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-xl transition-colors shadow-lg"
              >
                📞 CALL 911 NOW
              </button>
            </div>
          </div>

          {/* Distress Signal Status */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Distress Signal Status</h3>
            
            {isConnecting ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                <span className="text-orange-600 font-medium">Connecting to nearby services...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">✓ Distress signal sent successfully</span>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Services Notified:</h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Local Emergency Services</li>
                    <li>• Nearby Police Stations</li>
                    <li>• Emergency Medical Services</li>
                    <li>• Fire Department</li>
                    <li>• Your Emergency Contacts</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Location Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Your Location Information</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                <p><strong>Status:</strong> <span className="text-blue-600">Location shared with emergency services</span></p>
                <p><strong>Accuracy:</strong> <span className="text-green-600">High precision GPS</span></p>
                <p><strong>Last Updated:</strong> <span className="text-gray-600">Just now</span></p>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Additional Emergency Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="p-4 border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-colors">
                <div className="text-2xl mb-2">🏥</div>
                <div className="font-medium">Find Nearest Hospital</div>
              </button>
              
              <button className="p-4 border-2 border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                <div className="text-2xl mb-2">👮</div>
                <div className="font-medium">Contact Police</div>
              </button>
              
              <button className="p-4 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                <div className="text-2xl mb-2">🚒</div>
                <div className="font-medium">Fire Department</div>
              </button>
              
              <button className="p-4 border-2 border-green-300 rounded-lg hover:bg-green-50 transition-colors">
                <div className="text-2xl mb-2">📱</div>
                <div className="font-medium">Text Emergency Contacts</div>
              </button>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h4 className="font-bold text-yellow-800 mb-2">Important Notice</h4>
                <p className="text-sm text-yellow-700">
                  This emergency system is designed to assist you in crisis situations. 
                  For immediate life-threatening emergencies, always call 911 directly. 
                  Stay calm, provide clear information about your location and situation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
