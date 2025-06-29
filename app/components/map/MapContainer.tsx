"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useMapContext } from "../../contexts/MapContext"
import { useLiveLocation } from "../../hooks/useLiveLocation"
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
  
  // Get live location data
  const { liveLocations, currentLocation, isSharing } = useLiveLocation()

  const [isClient, setIsClient] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    fetchData()
  }, [])

  // Debug logging
  useEffect(() => {
    console.log("MapContainer Debug Info:")
    console.log("- isClient:", isClient)
    console.log("- markers from context:", markers)
    console.log("- locations from API:", locations)
    console.log("- alerts from API:", alerts)
    console.log("- loading:", loading)
    console.log("- error:", error)
  }, [isClient, markers, locations, alerts, loading, error])

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

      // Try to fetch locations (this might fail due to auth)
      console.log("Fetching locations...")
      try {
        const locationsRes = await fetch("/api/locations")
        const locationsData = await locationsRes.json()

        if (locationsData.success) {
          setLocations(locationsData.data || [])
          console.log("Locations loaded:", locationsData.data?.length || 0)
        } else {
          console.warn("Failed to fetch locations (expected if no auth):", locationsData.error)
          // Don't set this as an error since we have fallback markers
        }
      } catch (locError) {
        console.warn("Location fetch error (expected if no auth):", locError)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setError("Failed to load some map data. Using fallback data.")
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Loading map data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[40.7589, -73.9851]} // NYC coordinates
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-container"
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
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Render live locations from other users */}
        {liveLocations &&
          liveLocations.length > 0 &&
          liveLocations.map((liveLocation) => (
            <Marker
              key={`live-${liveLocation.id}`}
              position={[liveLocation.lat, liveLocation.lng]}
              icon={createStatusIcon("safe", "person")} // Live locations are always people and safe
            >
              <Popup>
                <div className="p-3 min-w-[250px]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {liveLocation.user?.name || liveLocation.name}
                    </h3>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      LIVE
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex justify-between">
                      <span>Coordinates:</span>
                      <span className="font-mono">
                        {liveLocation.lat.toFixed(6)}, {liveLocation.lng.toFixed(6)}
                      </span>
                    </div>
                    {liveLocation.accuracy && (
                      <div className="flex justify-between">
                        <span>Accuracy:</span>
                        <span>±{Math.round(liveLocation.accuracy)}m</span>
                      </div>
                    )}
                    {liveLocation.speed !== null && liveLocation.speed !== undefined && (
                      <div className="flex justify-between">
                        <span>Speed:</span>
                        <span>{Math.round(liveLocation.speed * 3.6)} km/h</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{formatTimeAgo(liveLocation.last_updated)}</span>
                    </div>
                  </div>

                  {/* Quick actions for live locations */}
                  <div className="pt-2 border-t">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${liveLocation.lat},${liveLocation.lng}`
                          window.open(url, "_blank")
                        }}
                        className="flex-1 py-1 px-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                      >
                        🗺️ Directions
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Center map on this location
                          alert(`Centering on ${liveLocation.user?.name || liveLocation.name}`)
                        }}
                        className="flex-1 py-1 px-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        📍 Center
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Render current user's location if sharing */}
        {isSharing && currentLocation && (
          <Marker
            position={[currentLocation.coords.latitude, currentLocation.coords.longitude]}
            icon={createStatusIcon("safe", "person")}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-lg text-gray-900">Your Location</h3>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    SHARING
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-3">
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono">
                      {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
                    </span>
                  </div>
                  {currentLocation.coords.accuracy && (
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span>±{Math.round(currentLocation.coords.accuracy)}m</span>
                    </div>
                  )}
                  {currentLocation.coords.speed !== null && (
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{Math.round((currentLocation.coords.speed || 0) * 3.6)} km/h</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{formatTimeAgo(new Date(currentLocation.timestamp).toISOString())}</span>
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-gray-500">
                  <p>This is your current location being shared with others.</p>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

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

        {/* Debug marker to test if markers work at all */}
        {/* <Marker position={[40.7589, -73.9851]} icon={createStatusIcon("safe", "emergency")}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">Debug Marker</h3>
              <p>This is a test marker at NYC center</p>
              <p>If you see this, custom markers are working!</p>
            </div>
          </Popup>
        </Marker> */}
      </MapContainer>
    </div>
  )
}
