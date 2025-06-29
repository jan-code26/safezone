"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useMapContext } from "../../contexts/MapContext"
import { useAuth } from "@/contexts/AuthContexts"
import "leaflet/dist/leaflet.css"

// Import our custom Leaflet configuration with custom icons
import { createStatusIcon } from "../../../lib/leaflet-config"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const Circle = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })

interface Location {
  id: number
  name: string
  lat: number
  lng: number
  type: "person" | "property"
  status: "safe" | "at_risk" | "unknown"
  location: string
  lastUpdated?: string
  created_at?: string
}

interface Alert {
  id: number
  type: string
  severity: "low" | "medium" | "high"
  title: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  radius: number
  issued: string
  expires: string
  source: string
}

export default function Map() {
  // Get markers and context from MapContext
  const { markers, selectedMarker, setSelectedMarker } = useMapContext()
  const { user, loading: authLoading } = useAuth()

  const [isClient, setIsClient] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !authLoading) {
      fetchData()
    }
  }, [isClient, authLoading, user])

  // Debug logging
  useEffect(() => {
    console.log("MapContainer Debug Info:")
    console.log("- isClient:", isClient)
    console.log("- authLoading:", authLoading)
    console.log("- user:", user?.email || "Not authenticated")
    console.log("- markers from context:", markers)
    console.log("- locations from API:", locations)
    console.log("- alerts from API:", alerts)
    console.log("- loading:", loading)
    console.log("- error:", error)
    console.log("- isDemo:", isDemo)
  }, [isClient, authLoading, user, markers, locations, alerts, loading, error, isDemo])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch alerts from your API (this should work without auth)
      console.log("Fetching alerts...")
      const alertsRes = await fetch("/api/alerts")
      const alertsData = await alertsRes.json()

      if (alertsData.success) {
        setAlerts(alertsData.data || [])
        console.log("Alerts loaded:", alertsData.data?.length || 0)
      } else {
        console.error("Failed to fetch alerts:", alertsData.error)
      }

      // Fetch locations (will return demo data if not authenticated)
      console.log("Fetching locations...")
      const locationsRes = await fetch("/api/locations")
      const locationsData = await locationsRes.json()

      if (locationsData.success) {
        setLocations(locationsData.data || [])
        setIsDemo(locationsData.demo || false)
        console.log("Locations loaded:", locationsData.data?.length || 0)
        if (locationsData.demo) {
          console.log("Using demo data - user not authenticated")
        }
      } else {
        console.error("Failed to fetch locations:", locationsData.error)
        setError("Failed to load location data")
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError("Failed to load map data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "person":
        return "👤"
      case "school":
        return "🏫"
      case "home":
        return "🏠"
      case "work":
        return "🏢"
      case "emergency":
        return "🚨"
      case "property":
        return "🏠"
      default:
        return "📍"
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800"
      case "caution":
        return "bg-orange-100 text-orange-800"
      case "danger":
        return "bg-red-100 text-red-800"
      case "at_risk":
        return "bg-amber-100 text-amber-800"
      case "unknown":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "#3B82F6" // blue
      case "medium":
        return "#F59E0B" // amber
      case "high":
        return "#EF4444" // red
      default:
        return "#6B7280" // gray
    }
  }

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-amber-100 text-amber-800"
      case "high":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">{authLoading ? "Loading authentication..." : "Loading map data..."}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative z-0">
      {/* Demo mode banner */}
      {isDemo && (
        <div className="absolute top-4 left-4 right-4 z-1000 bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">ℹ️</span>
              <span className="text-sm font-medium text-blue-800">
                Demo Mode - Sign in to manage your own locations
              </span>
            </div>
            <button onClick={() => setIsDemo(false)} className="text-blue-600 hover:text-blue-800">
              ✕
            </button>
          </div>
        </div>
      )}

      <MapContainer
        center={[40.7589, -73.9851]} // NYC coordinates
        zoom={11}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        className="leaflet-container"
        // zIndexOffset={-1000}
        // whenCreated={(mapInstance:any) => {
        //   console.log("Map created:", mapInstance)
        //   console.log("Map center:", mapInstance.getCenter())
        //   console.log("Map zoom:", mapInstance.getZoom())
        // }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Render contact markers from MapContext with custom icons */}
        {markers &&
          markers.length > 0 &&
          markers.map((marker) => {
            console.log("Rendering marker:", marker.name, "at position:", marker.position)
            return (
              <Marker
                key={marker.id}
                position={marker.position}
                icon={createStatusIcon(marker.status, marker.type)}
                eventHandlers={{
                  click: () => {
                    setSelectedMarker(marker)
                    console.log("Selected contact marker:", marker.name)
                  },
                }}
              >
                <Popup>
                  <div className="p-3 min-w-[250px]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{getTypeIcon(marker.type)}</span>
                      <h3 className="font-bold text-lg text-gray-900">{marker.name}</h3>
                    </div>

                    {marker.relationship && <p className="text-sm text-gray-600 mb-2">{marker.relationship}</p>}

                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(marker.status)}`}
                      >
                        {marker.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                        {getTypeIcon(marker.type)} {marker.type}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{marker.description}</p>
                    <p className="text-xs text-gray-600 mb-3">{marker.address}</p>

                    <div className="pt-2 border-t text-xs space-y-1">
                      <p>
                        <span className="font-semibold">Coordinates:</span>
                        <span className="ml-1">
                          {marker.position[0].toFixed(4)}, {marker.position[1].toFixed(4)}
                        </span>
                      </p>
                    </div>

                    {/* Quick actions in popup */}
                    {marker.type === "person" && (
                      <div className="mt-3 pt-2 border-t">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              alert(`Calling ${marker.name}...`)
                            }}
                            className="flex-1 py-1 px-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            📞 Call
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${marker.position[0]},${marker.position[1]}`
                              window.open(url, "_blank")
                            }}
                            className="flex-1 py-1 px-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            🗺️ Directions
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

        {/* Render locations from API with custom icons */}
        {locations &&
          locations.length > 0 &&
          locations.map((location) => (
            <Marker
              key={`location-${location.id}`}
              position={[location.lat, location.lng]}
              icon={createStatusIcon(location.status, location.type)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{location.location}</p>

                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(location.status)}`}
                    >
                      {location.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {location.type === "person" ? "👤" : "🏠"} {location.type}
                    </span>
                  </div>

                  {location.lastUpdated && (
                    <p className="text-xs text-gray-500">Last updated: {formatTimeAgo(location.lastUpdated)}</p>
                  )}

                  <div className="mt-2 pt-2 border-t text-xs">
                    <p>
                      <span className="font-semibold">Coordinates:</span> {location.lat.toFixed(4)},{" "}
                      {location.lng.toFixed(4)}
                    </p>
                  </div>

                  {isDemo && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-xs text-blue-600">Demo location - Sign in to add your own</p>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Render alert zones from API */}
        {alerts &&
          alerts.length > 0 &&
          alerts.map((alert) => (
            <Circle
              key={`alert-${alert.id}`}
              center={[alert.coordinates.lat, alert.coordinates.lng]}
              radius={alert.radius * 1000} // Convert km to meters
              color={getAlertColor(alert.severity)}
              fillColor={getAlertColor(alert.severity)}
              fillOpacity={0.2}
              weight={2}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-red-600">{alert.title}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(alert.severity)}`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-sm mb-2">{alert.description}</p>

                  <div className="space-y-1 text-xs text-gray-600">
                    <p>
                      <span className="font-semibold">Type:</span> {alert.type}
                    </p>
                    <p>
                      <span className="font-semibold">Location:</span> {alert.location}
                    </p>
                    <p>
                      <span className="font-semibold">Radius:</span> {alert.radius} km
                    </p>
                    <p>
                      <span className="font-semibold">Source:</span> {alert.source}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t text-xs">
                    <p>
                      <span className="font-semibold">Issued:</span> {new Date(alert.issued).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">Expires:</span> {new Date(alert.expires).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
      </MapContainer>
    </div>
  )
}
