"use client"

import { useState, useEffect } from "react"
import { useMapContext } from "../../contexts/MapContext"

interface WeatherData {
  location: { lat: number; lng: number }
  current: {
    temperature: number
    condition: string
    windSpeed: number
    humidity: number
    pressure?: number
    visibility?: number
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

export default function InfoPanel() {
  const { selectedMarker } = useMapContext()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedMarker) {
      fetchWeatherAndAlerts()
    }
  }, [selectedMarker])

  const fetchWeatherAndAlerts = async () => {
    if (!selectedMarker) return

    try {
      setLoadingWeather(true)
      setLoadingAlerts(true)
      setError(null)

      // Fetch weather data for selected marker location
      console.log('Fetching weather for:', selectedMarker.position)
      const weatherRes = await fetch(`/api/weather?lat=${selectedMarker.position[0]}&lng=${selectedMarker.position[1]}`)
      const weatherDataRes = await weatherRes.json()
      
      if (weatherDataRes.success) {
        setWeatherData(weatherDataRes.data)
        console.log('Weather loaded:', weatherDataRes.data)
      } else {
        console.error('Failed to fetch weather:', weatherDataRes.error)
      }
      setLoadingWeather(false)

      // Fetch alerts data
      console.log('Fetching alerts...')
      const alertsRes = await fetch('/api/alerts')
      const alertsData = await alertsRes.json()
      
      if (alertsData.success) {
        setAlerts(alertsData.data || [])
        console.log('Alerts loaded:', alertsData.data?.length || 0)
      } else {
        console.error('Failed to fetch alerts:', alertsData.error)
      }
      setLoadingAlerts(false)

    } catch (error) {
      console.error('Failed to fetch data:', error)
      setError('Failed to load weather and alert data')
      setLoadingWeather(false)
      setLoadingAlerts(false)
    }
  }

  const getRiskLevelColor = (status: string) => {
    switch (status) {
      case "safe":
        return "bg-green-100 text-green-800 border-green-200"
      case "caution":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "danger":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "safe":
        return "SAFE"
      case "caution":
        return "CAUTION"
      case "danger":
        return "DANGER"
      default:
        return "UNKNOWN"
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

  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('rain')) return '🌧️'
    if (conditionLower.includes('snow')) return '❄️'
    if (conditionLower.includes('storm')) return '⛈️'
    if (conditionLower.includes('cloud')) return '☁️'
    if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return '☀️'
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️'
    return '🌤️'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'person': return '👤'
      case 'school': return '🏫'
      case 'home': return '🏠'
      case 'work': return '🏢'
      case 'emergency': return '🚨'
      default: return '📍'
    }
  }

  const handleContactAction = (action: string) => {
    if (!selectedMarker) return
    
    switch (action) {
      case 'call':
        alert(`Calling ${selectedMarker.name}...`)
        break
      case 'message':
        alert(`Sending message to ${selectedMarker.name}...`)
        break
      case 'directions':
        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.position[0]},${selectedMarker.position[1]}`
        window.open(url, '_blank')
        break
      case 'emergency':
        alert(`Emergency alert sent to ${selectedMarker.name}!`)
        break
    }
  }

  if (!selectedMarker) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📍</div>
          <p>Select a contact or location to view details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{getTypeIcon(selectedMarker.type)}</span>
          <h2 className="text-xl font-bold text-gray-900">{selectedMarker.name}</h2>
        </div>
        {selectedMarker.relationship && (
          <p className="text-sm text-gray-600">{selectedMarker.relationship}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Type */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Type</div>
          <div className="text-base font-semibold text-gray-900 capitalize">{selectedMarker.type}</div>
        </div>

        {/* Status */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Status</div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getRiskLevelColor(selectedMarker.status)}`}
          >
            {getStatusText(selectedMarker.status)}
          </span>
        </div>

        {/* Address */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Address</div>
          <div className="text-base font-semibold text-gray-900">{selectedMarker.address}</div>
        </div>

        {/* Description */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
          <div className="text-sm text-gray-700 leading-relaxed">{selectedMarker.description}</div>
        </div>

        {/* Coordinates */}
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">Coordinates</div>
          <div className="text-sm text-gray-900">
            {selectedMarker.position[0].toFixed(4)}, {selectedMarker.position[1].toFixed(4)}
          </div>
        </div>

        {/* Contact Actions (only for person type) */}
        {selectedMarker.type === 'person' && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleContactAction('call')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <span>📞</span>
                <span>Call</span>
              </button>
              <button
                onClick={() => handleContactAction('message')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>💬</span>
                <span>Message</span>
              </button>
              <button
                onClick={() => handleContactAction('directions')}
                className="flex items-center justify-center gap-2 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span>🗺️</span>
                <span>Directions</span>
              </button>
              <button
                onClick={() => handleContactAction('emergency')}
                className="flex items-center justify-center gap-2 py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <span>🚨</span>
                <span>Alert</span>
              </button>
            </div>
          </div>
        )}

        {/* Current Weather Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Current Weather</h3>
            <button 
              onClick={fetchWeatherAndAlerts}
              className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
              title="Refresh weather data"
            >
              🔄
            </button>
          </div>

          {loadingWeather ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading weather...</span>
            </div>
          ) : weatherData ? (
            <>
              {/* Temperature and Condition */}
              <div className="flex items-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mr-4">{weatherData.current.temperature}°C</div>
                <div className="flex flex-col">
                  <div className="text-base font-semibold text-gray-900">{weatherData.current.condition}</div>
                  <div className="text-sm text-gray-600">
                    {selectedMarker.position[0].toFixed(2)}, {selectedMarker.position[1].toFixed(2)}
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">{getWeatherIcon(weatherData.current.condition)}</span>
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Humidity</div>
                  <div className="text-lg font-bold text-gray-900">{weatherData.current.humidity}%</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Wind</div>
                  <div className="text-lg font-bold text-gray-900">{weatherData.current.windSpeed} km/h</div>
                </div>
                {weatherData.current.pressure && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Pressure</div>
                    <div className="text-lg font-bold text-gray-900">{weatherData.current.pressure} hPa</div>
                  </div>
                )}
                {weatherData.current.visibility && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Visibility</div>
                    <div className="text-lg font-bold text-gray-900">{weatherData.current.visibility} km</div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">⚠️</div>
              <p>Unable to load weather data</p>
            </div>
          )}
        </div>

        {/* Emergency Alerts Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Alerts</h3>
          
          {loadingAlerts ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
              <span className="ml-3 text-gray-600">Loading alerts...</span>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-yellow-800 text-sm">{alert.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-2">{alert.description}</p>
                  <div className="text-xs text-yellow-600 space-y-1">
                    <p><span className="font-semibold">Location:</span> {alert.location}</p>
                    <p><span className="font-semibold">Radius:</span> {alert.radius} km</p>
                    <p><span className="font-semibold">Expires:</span> {formatTimeAgo(alert.expires)}</p>
                  </div>
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View {alerts.length - 3} more alerts
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-2xl mb-2">✅</div>
              <p>No active emergency alerts</p>
            </div>
          )}
        </div>

        {/* Weather Impact Assessment */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Safety Assessment</h3>
          <div className="space-y-3">
            {selectedMarker.status === 'safe' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">Location is currently safe and secure</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">Emergency protocols are in place</div>
                </div>
              </>
            )}
            {selectedMarker.status === 'caution' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">Exercise caution in this area</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">Monitor weather conditions closely</div>
                </div>
              </>
            )}
            {selectedMarker.status === 'danger' && (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">High risk area - immediate attention needed</div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="text-sm text-gray-700">Consider evacuation or shelter options</div>
                </div>
              </>
            )}
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="text-sm text-gray-700">Emergency services are available if needed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}