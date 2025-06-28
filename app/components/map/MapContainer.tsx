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

// Custom Leaflet configuration is already loaded via import
// No need for manual icon setup since it's handled in lib/leaflet-config.ts

export default function Map() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Icons are automatically configured via lib/leaflet-config.ts import
  }, [])

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[40.7589, -73.9851]} // NYC coordinates to match the screenshot
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Family member locations */}
        <Marker position={[40.7589, -73.9851]}>
          <Popup>
            Jake (Son) <br /> School - Midtown
          </Popup>
        </Marker>

        <Marker position={[40.7505, -73.9934]}>
          <Popup>
            Emma (Daughter) <br /> Friend's House - UES
          </Popup>
        </Marker>

        <Marker position={[40.6892, -74.0445]}>
          <Popup>
            Dad <br /> Brooklyn - Near Storm
          </Popup>
        </Marker>

        <Marker position={[40.7282, -73.7949]}>
          <Popup>
            Mom <br /> At Work - Manhattan
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
