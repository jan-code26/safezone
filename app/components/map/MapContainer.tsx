// app/components/map/MapContainer.tsx
"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css"
import "leaflet-defaulticon-compatibility"

// 🔑 KEY FIX: Import Leaflet properly to avoid UMD global error
import * as L from "leaflet"

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })

const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

// ✅ Now this function works because L is properly imported
const setupLeafletIcons = () => {
  if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/leaflet/marker-icon-2x.png",
      iconUrl: "/leaflet/marker-icon.png",
      shadowUrl: "/leaflet/marker-shadow.png",
    })
  }
}

export default function Map() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setupLeafletIcons()
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
