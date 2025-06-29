"use client";

import { useState, useEffect } from 'react';
import { useLiveLocation } from '@/app/hooks/useLiveLocation';
import { useContacts } from '@/app/contexts/ContactsContext';

interface LiveLocationPanelProps {
  className?: string;
}

export default function LiveLocationPanel({ className = '' }: LiveLocationPanelProps) {
  const { contacts } = useContacts();
  const {
    currentLocation,
    isSharing,
    locationError,
    liveLocations,
    isLoading,
    isUpdatingLocation,
    startSharing,
    stopSharing,
    updateSharingSettings,
    refreshLocations,
    requestLocationPermission,
    locationPermissionStatus,
  } = useLiveLocation();

  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);

  // Update last location update time
  useEffect(() => {
    if (currentLocation) {
      setLastLocationUpdate(new Date(currentLocation.timestamp));
    }
  }, [currentLocation]);

  // Handle starting location sharing
  const handleStartSharing = async () => {
    try {
      if (locationPermissionStatus !== 'granted') {
        const granted = await requestLocationPermission();
        if (!granted) {
          return;
        }
      }
      
      await startSharing(selectedContacts);
      setShowContactSelector(false);
    } catch (error) {
      console.error('Failed to start sharing:', error);
    }
  };

  // Handle stopping location sharing
  const handleStopSharing = async () => {
    try {
      await stopSharing();
    } catch (error) {
      console.error('Failed to stop sharing:', error);
    }
  };

  // Handle updating sharing settings
  const handleUpdateSharing = async () => {
    try {
      await updateSharingSettings(selectedContacts);
      setShowContactSelector(false);
    } catch (error) {
      console.error('Failed to update sharing settings:', error);
    }
  };

  // Toggle contact selection
  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Get location accuracy text
  const getAccuracyText = (accuracy?: number) => {
    if (!accuracy) return 'Unknown';
    if (accuracy < 10) return 'Very High';
    if (accuracy < 50) return 'High';
    if (accuracy < 100) return 'Medium';
    return 'Low';
  };

  // Get location accuracy color
  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'text-gray-500';
    if (accuracy < 10) return 'text-green-600';
    if (accuracy < 50) return 'text-blue-600';
    if (accuracy < 100) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Live Location</h2>
        <button
          onClick={refreshLocations}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          title="Refresh locations"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Location Permission Status */}
      {locationPermissionStatus !== 'granted' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Location Permission Required</p>
              <p className="text-sm text-yellow-700">Allow location access to share your location with others.</p>
            </div>
          </div>
          <button
            onClick={requestLocationPermission}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* Error Display */}
      {locationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-800">{locationError}</p>
          </div>
        </div>
      )}

      {/* Current Location Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Your Location</h3>
          <div className="flex items-center space-x-2">
            {isUpdatingLocation && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isSharing 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {isSharing ? '🟢 Sharing' : '⚫ Not Sharing'}
            </span>
          </div>
        </div>

        {currentLocation && (
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Coordinates:</span>
              <span className="font-mono">
                {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span className={getAccuracyColor(currentLocation.coords.accuracy)}>
                {getAccuracyText(currentLocation.coords.accuracy)} 
                {currentLocation.coords.accuracy && ` (±${Math.round(currentLocation.coords.accuracy)}m)`}
              </span>
            </div>
            {currentLocation.coords.speed !== null && (
              <div className="flex justify-between">
                <span>Speed:</span>
                <span>{Math.round((currentLocation.coords.speed || 0) * 3.6)} km/h</span>
              </div>
            )}
            {lastLocationUpdate && (
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{formatTimeAgo(lastLocationUpdate)}</span>
              </div>
            )}
          </div>
        )}

        {!currentLocation && locationPermissionStatus === 'granted' && (
          <p className="text-sm text-gray-500">Getting your location...</p>
        )}
      </div>

      {/* Sharing Controls */}
      <div className="mb-6">
        {!isSharing ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowContactSelector(!showContactSelector)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || locationPermissionStatus !== 'granted'}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Start Sharing Location
                </>
              )}
            </button>

            {showContactSelector && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Share with:</h4>
                {contacts.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {contacts.map((contact) => (
                      <label key={contact.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.relationship}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No contacts available. Add contacts first to share your location.</p>
                )}
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleStartSharing}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Start Sharing
                  </button>
                  <button
                    onClick={() => setShowContactSelector(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowContactSelector(!showContactSelector)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Manage Sharing
              </button>
              <button
                onClick={handleStopSharing}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Stopping...' : 'Stop Sharing'}
              </button>
            </div>

            {showContactSelector && (
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Currently sharing with:</h4>
                {contacts.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {contacts.map((contact) => (
                      <label key={contact.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.relationship}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No contacts available.</p>
                )}
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleUpdateSharing}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Update Sharing
                  </button>
                  <button
                    onClick={() => setShowContactSelector(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Live Locations from Others */}
      {liveLocations.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Live Locations</h3>
          <div className="space-y-3">
            {liveLocations.map((location) => (
              <div key={location.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-gray-900">
                      {location.user?.name || location.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(new Date(location.last_updated))}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Coordinates:</span>
                    <span className="font-mono">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </span>
                  </div>
                  {location.accuracy && (
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span className={getAccuracyColor(location.accuracy)}>
                        {getAccuracyText(location.accuracy)} (±{Math.round(location.accuracy)}m)
                      </span>
                    </div>
                  )}
                  {location.speed !== null && location.speed !== undefined && (
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{Math.round(location.speed * 3.6)} km/h</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
