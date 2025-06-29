// app/contexts/MapContext.tsx
"use client"
import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

export interface MarkerData {
  id: string
  name: string
  type: "person" | "school" | "home" | "work" | "emergency"
  status: "safe" | "caution" | "danger"
  position: [number, number]
  address: string
  description: string
  relationship?: string
}

export interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  pressure: number
  visibility: number
  uvIndex: number
  icon: string
  location: string
}

interface MapContextType {
  selectedMarker: MarkerData | null
  setSelectedMarker: (marker: MarkerData | null) => void
  weatherData: WeatherData | null
  setWeatherData: (weather: WeatherData | null) => void
  isLoadingWeather: boolean
  setIsLoadingWeather: (loading: boolean) => void
  markers: MarkerData[]
}

const MapContext = createContext<MapContextType | undefined>(undefined)

export const useMapContext = () => {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider")
  }
  return context
}

const defaultMarkers: MarkerData[] = [
  // Contact markers
  {
    id: "mom-work",
    name: "Mom",
    type: "work",
    status: "safe",
    position: [40.7282, -73.7949],
    address: "321 Manhattan Plaza, NY",
    description: "Safe location with shelter access",
    relationship: "Mother - At Work",
  },
  {
    id: "jake-school",
    name: "Jake (Son)",
    type: "school",
    status: "safe",
    position: [40.7589, -73.9851],
    address: "789 Education Blvd, Midtown, NY",
    description: "Elementary school with emergency protocols in place",
    relationship: "Son - At School",
  },
  {
    id: "emma-friend",
    name: "Emma (Daughter)",
    type: "person",
    status: "danger",
    position: [40.7505, -73.9934],
    address: "456 Upper East Side, NY",
    description: "At friend's house during storm warning",
    relationship: "Daughter - At Friend's House",
  },
  {
    id: "dad-brooklyn",
    name: "Dad",
    type: "person",
    status: "caution",
    position: [40.6892, -74.0445],
    address: "123 Brooklyn Ave, Brooklyn, NY",
    description: "Near storm area, monitoring conditions",
    relationship: "Father - In Brooklyn",
  },
]

export const MapProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(defaultMarkers[0])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [isLoadingWeather, setIsLoadingWeather] = useState(false)

  return (
    <MapContext.Provider
      value={{
        selectedMarker,
        setSelectedMarker,
        weatherData,
        setWeatherData,
        isLoadingWeather,
        setIsLoadingWeather,
        markers: defaultMarkers,
      }}
    >
      {children}
    </MapContext.Provider>
  )
}
