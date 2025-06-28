// app/components/map/MapContainer.tsx
"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

// Import our custom Leaflet configuration
import L from "../../../lib/leaflet-config"

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
  type: 'person' | 'property'
  status: 'safe' | 'at_risk' | 'unknown'
  location: string
  lastUpdated?: string
  created_at?: string
}

interface Alert {
  id: number
  type: string
  severity: 'low' | 'medium' | 'high'
  title: string
  description: string
  location: string
  coordinates: { lat: number; lng: number }
  radius: number
  issued: string
  expires: string
  source: string
}

interface WeatherData {
  location: { lat: number; lng: number }
  current: {
    temperature: number
    condition: string
    windSpeed: number
    humidity: number
  }
  alerts: Array<{
    id: number
    type: string
    title: string
    description: string
    severity: string
    areas: string[]
    expires: string
  }>
  forecast: Array<{
    time: string
    temp: number
    condition: string
  }>
}

export default function Map() {
  const [isClient, setIsClient] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch locations from your API
      console.log('Fetching locations...')
      const locationsRes = await fetch('/api/locations')
      const locationsData = await locationsRes.json()
      
      if (locationsData.success) {
        setLocations(locationsData.data || [])
        console.log('Locations loaded:', locationsData.data?.length || 0)
      } else {
        console.error('Failed to fetch locations:', locationsData.error)
      }

      // Fetch alerts from your API
      console.log('Fetching alerts...')
      const alertsRes = await fetch('/api/alerts')
      const alertsData = await alertsRes.json()
      
      if (alertsData.success) {
        setAlerts(alertsData.data || [])
        console.log('Alerts loaded:', alertsData.data?.length || 0)
      } else {
        console.error('Failed to fetch alerts:', alertsData.error)
      }

      // Fetch weather for NYC area
      console.log('Fetching weather...')
      const weatherRes = await fetch('/api/weather?lat=40.7589&lng=-73.9851')
      const weatherDataRes = await weatherRes.json()
      
      if (weatherDataRes.success) {
        setWeatherData(weatherDataRes.data)
        console.log('Weather loaded:', weatherDataRes.data)
      } else {
        console.error('Failed to fetch weather:', weatherDataRes.error)
      }

    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load map data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return '#10B981' // green
      case 'at_risk': return '#F59E0B' // amber
      case 'unknown': return '#6B7280' // gray
      default: return '#6B7280'
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-100 text-green-800'
      case 'at_risk': return 'bg-amber-100 text-amber-800'
      case 'unknown': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#3B82F6' // blue
      case 'medium': return '#F59E0B' // amber
      case 'high': return '#EF4444' // red
      default: return '#6B7280' // gray
    }
  }

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-amber-100 text-amber-800' 
      case 'high': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
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
          <div className="text-gray-600">Loading locations and alerts...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️ {error}</div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      {/* Weather Info Panel */}
      {weatherData && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-bold text-lg mb-2">Current Weather</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold">Temperature:</span> {weatherData.current.temperature}°C</p>
            <p><span className="font-semibold">Condition:</span> {weatherData.current.condition}</p>
            <p><span className="font-semibold">Wind:</span> {weatherData.current.windSpeed} km/h</p>
            <p><span className="font-semibold">Humidity:</span> {weatherData.current.humidity}%</p>
          </div>
          {weatherData.alerts && weatherData.alerts.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <h4 className="font-semibold text-red-600 mb-1">Weather Alerts:</h4>
              {weatherData.alerts.map((alert, index) => (
                <div key={index} className="text-xs text-red-600">
                  {alert.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats Panel */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
        <div className="space-y-2 text-sm">
          <div><span className="font-semibold">Locations:</span> {locations.length}</div>
          <div><span className="font-semibold">Active Alerts:</span> {alerts.length}</div>
          <div className="text-xs text-gray-500">
            Last updated: {formatTimeAgo(new Date().toISOString())}
          </div>
        </div>
      </div>

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

        {/* Render locations from API */}
        {locations.map((location) => (
          <Marker 
            key={location.id} 
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{location.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{location.location}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(location.status)}`}
                  >
                    {location.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {location.type === 'person' ? '👤' : '🏠'} {location.type}
                  </span>
                </div>

                {location.lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last updated: {formatTimeAgo(location.lastUpdated)}
                  </p>
                )}

                <div className="mt-2 pt-2 border-t text-xs">
                  <p><span className="font-semibold">Coordinates:</span> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render alert zones from API */}
        {alerts.map((alert) => (
          <Circle
            key={alert.id}
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm mb-2">{alert.description}</p>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <p><span className="font-semibold">Type:</span> {alert.type}</p>
                  <p><span className="font-semibold">Location:</span> {alert.location}</p>
                  <p><span className="font-semibold">Radius:</span> {alert.radius} km</p>
                  <p><span className="font-semibold">Source:</span> {alert.source}</p>
                </div>

                <div className="mt-2 pt-2 border-t text-xs">
                  <p><span className="font-semibold">Issued:</span> {new Date(alert.issued).toLocaleString()}</p>
                  <p><span className="font-semibold">Expires:</span> {new Date(alert.expires).toLocaleString()}</p>
                </div>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  )
}
