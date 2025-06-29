// app/components/ClientComponentsWrapper.tsx
"use client"

import dynamic from "next/dynamic"
import LoadingSpinner from "./ui/LoadingSpinner"
import { ContactsProvider } from "../contexts/ContactsContext"

// Dynamic imports for client-only components
const MapContainer = dynamic(() => import("./map/MapContainer"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading map..." />,
})

const ContactsList = dynamic(() => import("./contacts/ContactsList"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading contacts..." />,
})

const AlertsPanel = dynamic(() => import("./alerts/AlertsPanel"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading alerts..." />,
})

const InfoPanel = dynamic(() => import("./info/InfoPanel"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading info..." />,
})

const LiveLocationPanel = dynamic(() => import("./live-location/LiveLocationPanel"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading live locations..." />,
})

export default function ClientComponentsWrapper() {
  return (
    <ContactsProvider>
      <div className="h-full flex bg-gray-50">
        {/* Left Sidebar - Contacts and Alerts */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="h-2/3 border-b border-gray-200 overflow-hidden">
            <ContactsList />
          </div>
          <div className="h-1/3 overflow-hidden">
            <AlertsPanel />
          </div>
        </aside>

        {/* Main Map Area */}
        <div className="flex-1 relative">
          <MapContainer />

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-1000">
            <button className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 flex items-center gap-2">
              <span>📡</span> Show Radar
            </button>
            <button className="px-3 py-2 bg-white border border-gray-300 rounded shadow-sm text-sm hover:bg-gray-50 flex items-center gap-2">
              <span>🎯</span> Center Map
            </button>
          </div>
        </div>

        {/* Right Sidebar - Live Location and Info Panel */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="h-1/2 border-b border-gray-200 overflow-hidden">
            <LiveLocationPanel />
          </div>
          <div className="h-1/2 overflow-hidden">
            <InfoPanel />
          </div>
        </aside>
      </div>
    </ContactsProvider>
  )
}
