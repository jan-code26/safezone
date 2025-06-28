// app/components/ClientComponentsWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from './ui/LoadingSpinner';

// Dynamic imports for client-only components
const MapContainer = dynamic(() => import('./map/MapContainer'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading map..." />
});

const WeatherPanel = dynamic(() => import('./weather/WeatherPanel'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading weather data..." />
});

const ContactsList = dynamic(() => import('./contacts/ContactsList'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading contacts..." />
});

const AlertsPanel = dynamic(() => import('./alerts/AlertsPanel'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading alerts..." />
});

export default function ClientComponentsWrapper() {
  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-1/2 border-b border-gray-200 overflow-hidden">
          <ContactsList />
        </div>
        <div className="h-1/2 overflow-hidden">
          <WeatherPanel />
        </div>
      </aside>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <MapContainer />
      </div>

      {/* Right Sidebar */}
      <aside className="w-80 bg-white border-l border-gray-200">
        <AlertsPanel />
      </aside>
    </div>
  );
}
