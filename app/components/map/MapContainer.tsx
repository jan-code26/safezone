"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useMapContext } from "../../contexts/MapContext"
import { fetchWithRetry } from "../../utils/fetchUtils";
import { useLiveLocation } from "../../hooks/useLiveLocation"

import { useAuth } from "@/contexts/AuthContexts"

import "leaflet/dist/leaflet.css"

// Import our custom Leaflet configuration with custom icons
import { createStatusIcon } from "../../../lib/leaflet-config"

// Import L from leaflet for type usage if needed for the LayersControl cast
import L from 'leaflet';
import { LayersControlProps } from 'react-leaflet'; // Import LayersControlProps
import { ComponentType, RefAttributes } from 'react'; // For casting dynamic import

// Statically import LayersControl for accessing its static properties BaseLayer and Overlay for type definition
import { LayersControl as StaticLayersControl } from 'react-leaflet';


const MapContainerComp = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayerComp = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })

// Define the type for LayersControl including its static sub-components
type CustomLayersControlType = ComponentType<LayersControlProps & RefAttributes<L.Control.Layers>> & {
  BaseLayer: typeof StaticLayersControl.BaseLayer;
  Overlay: typeof StaticLayersControl.Overlay;
};
const LayersControlComp = dynamic(() => import("react-leaflet").then((mod) => mod.LayersControl), { ssr: false }) as CustomLayersControlType;

const MarkerComp = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const PopupComp = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })
const CircleComp = dynamic(() => import("react-leaflet").then((mod) => mod.Circle), { ssr: false })


// Define OpenWeatherMap API key placeholder
const OPENWEATHERMAP_API_KEY = "YOUR_OPENWEATHERMAP_API_KEY_HERE"; // Replace with your actual API key

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

  const { user, loading: authLoading } = useAuth()
  

  const [isClient, setIsClient] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  // Cache duration in milliseconds (e.g., 10 minutes)
  const CACHE_DURATION_MS = 10 * 60 * 1000;

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

      const cacheKeyAlertsMap = `alerts_map_global`; // Using a global key for now
      const cacheKeyLocationsMap = `locations_map_global`; // Key for locations in map

      // Attempt to load alerts from cache for MapContainer
      const cachedAlertsMap = localStorage.getItem(cacheKeyAlertsMap);
      let alertsStillNeedFetching = true;
      if (cachedAlertsMap) {
        const { data, timestamp } = JSON.parse(cachedAlertsMap);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          setAlerts(data || []);
          console.log('Map alerts loaded from cache:', data?.length || 0);
          alertsStillNeedFetching = false;
        } else {
          localStorage.removeItem(cacheKeyAlertsMap); // Stale data
        }
      }

      if (alertsStillNeedFetching) {
        console.log("Fetching alerts for map...")
        try {
          const alertsRes = await fetchWithRetry("/api/alerts"); // Potentially add lat/lng/radius
          const alertsData = await alertsRes.json();

          if (alertsData.success) {
            setAlerts(alertsData.data || []);
            localStorage.setItem(cacheKeyAlertsMap, JSON.stringify({ data: alertsData.data || [], timestamp: Date.now() }));
            console.log("Map alerts fetched and cached:", alertsData.data?.length || 0);
          } else {
            console.error("Failed to fetch alerts for map (after retries):", alertsData.error);
            setError(prev => prev ? `${prev}, Map alerts fetch failed` : 'Map alerts fetch failed');
          }
        } catch (networkError) {
          console.error('Network error fetching alerts for map (after retries):', networkError);
          setError(prev => prev ? `${prev}, Map alerts network error` : 'Map alerts network error');
        }
      }

      // Attempt to load locations from cache for MapContainer
      const cachedLocationsMap = localStorage.getItem(cacheKeyLocationsMap);
      let locationsStillNeedFetching = true;
      if (cachedLocationsMap) {
        const { data, timestamp, demo } = JSON.parse(cachedLocationsMap);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          setLocations(data || []);
          setIsDemo(demo || false);
          console.log('Map locations loaded from cache:', data?.length || 0, 'Demo:', demo);
          locationsStillNeedFetching = false;
        } else {
          localStorage.removeItem(cacheKeyLocationsMap); // Stale data
        }
      }

      if (locationsStillNeedFetching) {
        console.log("Fetching locations for map...")
        try {
          const locationsRes = await fetchWithRetry("/api/locations");
          const locationsData = await locationsRes.json();

          if (locationsData.success) {
            setLocations(locationsData.data || []);
            setIsDemo(locationsData.demo || false);
            localStorage.setItem(cacheKeyLocationsMap, JSON.stringify({
              data: locationsData.data || [],
              demo: locationsData.demo || false,
              timestamp: Date.now()
            }));
            console.log("Map locations fetched and cached:", locationsData.data?.length || 0, "Demo:", locationsData.demo);
          } else {
            console.error("Failed to fetch locations for map (after retries):", locationsData.error);
            setError(prev => prev ? `${prev}, Map locations fetch failed` : 'Map locations fetch failed');
          }
        } catch (networkError) {
          console.error('Network error fetching locations for map (after retries):', networkError);
          setError(prev => prev ? `${prev}, Map locations network error` : 'Map locations network error');
        }
      }
    } catch (error) { // This outer catch is for issues with cache logic itself, or if fetchWithRetry re-throws an unhandled error
      console.error("Error in fetchData for map (cache or unhandled network):", error);
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

      <MapContainerComp
        center={[40.7589, -73.9851]} // NYC coordinates
        zoom={11}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        className="leaflet-container"
      >
        <LayersControlComp position="topright">
          <LayersControlComp.BaseLayer checked name="OpenStreetMap">
            <TileLayerComp
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          </LayersControlComp.BaseLayer>

          {OPENWEATHERMAP_API_KEY !== "YOUR_OPENWEATHERMAP_API_KEY_HERE" ? (
            <LayersControlComp.Overlay name="Weather Radar (Precipitation)">
              <TileLayerComp
                url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPENWEATHERMAP_API_KEY}`}
                attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                opacity={0.7}
              />
            </LayersControlComp.Overlay>
          ) : null}
          {/* Don't render anything if API key is missing for radar, warning is already logged */}

          {OPENWEATHERMAP_API_KEY !== "YOUR_OPENWEATHERMAP_API_KEY_HERE" ? (
            <LayersControlComp.Overlay name="Wind Patterns">
              <TileLayerComp
                url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPENWEATHERMAP_API_KEY}`}
                attribution='&copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                opacity={0.7}
              />
            </LayersControlComp.Overlay>
          ) : (
            // UI could also show a message "Wind layer unavailable - API key missing"
            // Warning for missing key is already logged once for radar, no need to repeat.
            // If radar is also missing key, this just won't show up.
            // If radar has key but this somehow doesn't (which is not possible with current setup),
            // then a specific warning for wind could be added. For now, this is fine.
            null
          )}
        </LayersControlComp>

        {/* Render contact markers from MapContext with custom icons */}
        {markers &&
          markers.length > 0 &&
          markers.map((marker) => {
            console.log("Rendering marker:", marker.name, "at position:", marker.position)
            return (
              <MarkerComp
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
                <PopupComp>
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
                </PopupComp>
              </MarkerComp>
            )
          })}

        {/* Render locations from API with custom icons */}
        {locations &&
          locations.length > 0 &&
          locations.map((location) => (
            <MarkerComp
              key={`location-${location.id}`}
              position={[location.lat, location.lng]}
              icon={createStatusIcon(location.status, location.type)}
            >
              <PopupComp>
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
              </PopupComp>
            </MarkerComp>
          ))}

        {/* Render live locations from other users */}
        {liveLocations &&
          liveLocations.length > 0 &&
          liveLocations.map((liveLocation) => (
            <MarkerComp
              key={`live-${liveLocation.id}`}
              position={[liveLocation.lat, liveLocation.lng]}
              icon={createStatusIcon("safe", "person")} // Live locations are always people and safe
            >
              <PopupComp>
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
              </PopupComp>
            </MarkerComp>
          ))}

        {/* Render current user's location if sharing */}
        {isSharing && currentLocation && (
          <MarkerComp
            position={[currentLocation.coords.latitude, currentLocation.coords.longitude]}
            icon={createStatusIcon("safe", "person")}
          >
            <PopupComp>
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
            </PopupComp>
          </MarkerComp>
        )}

        {/* Render alert zones from API */}
        {alerts &&
          alerts.length > 0 &&
          alerts.map((alert) => (
            <CircleComp
              key={`alert-${alert.id}`}
              center={[alert.coordinates.lat, alert.coordinates.lng]}
              radius={alert.radius * 1000} // Convert km to meters
              color={getAlertColor(alert.severity)}
              fillColor={getAlertColor(alert.severity)}
              fillOpacity={0.2}
              weight={2}
            >
              <PopupComp>
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
              </PopupComp>
            </CircleComp>
          ))}
      </MapContainerComp>
    </div>
  )
}
