"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface LiveLocation {
  id: string;
  user_id: string;
  name: string;
  lat: number;
  lng: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  is_sharing: boolean;
  share_with: string[];
  last_updated: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseLiveLocationReturn {
  // Current user's location
  currentLocation: GeolocationPosition | null;
  isSharing: boolean;
  locationError: string | null;
  
  // Other users' locations
  liveLocations: LiveLocation[];
  
  // Loading states
  isLoading: boolean;
  isUpdatingLocation: boolean;
  
  // Actions
  startSharing: (shareWith?: string[]) => Promise<void>;
  stopSharing: () => Promise<void>;
  updateSharingSettings: (shareWith: string[]) => Promise<void>;
  refreshLocations: () => Promise<void>;
  
  // Location permissions
  requestLocationPermission: () => Promise<boolean>;
  locationPermissionStatus: PermissionState | null;
}

const DEFAULT_OPTIONS: LocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000, // 1 minute
};

export function useLiveLocation(options: LocationOptions = {}): UseLiveLocationReturn {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [liveLocations, setLiveLocations] = useState<LiveLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<PermissionState | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeChannelRef = useRef<any>(null);
  
  const locationOptions = { ...DEFAULT_OPTIONS, ...options };

  // Check location permission status
  const checkLocationPermission = useCallback(async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setLocationPermissionStatus(permission.state);
        });
      } catch (error) {
        console.warn('Could not check location permission:', error);
      }
    }
  }, []);

  // Request location permission
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by this browser');
        resolve(false);
        return;
      }

      // Check if we're on desktop and provide helpful message
      const isDesktop = !('ontouchstart' in window) && !navigator.userAgent.match(/Mobile|Android|iPhone|iPad/);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
          setLocationError(null);
          setLocationPermissionStatus('granted');
          resolve(true);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user. Please allow location access in your browser settings.';
              setLocationPermissionStatus('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              if (isDesktop) {
                errorMessage = 'Location services work best on mobile devices with GPS. On desktop computers, location accuracy may be limited or unavailable. You can still view others\' live locations.';
              } else {
                errorMessage = 'Location information unavailable. Please check your device\'s location settings.';
              }
              setLocationPermissionStatus('denied');
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or check your internet connection.';
              break;
          }
          setLocationError(errorMessage);
          resolve(false);
        },
        {
          ...locationOptions,
          timeout: 15000, // Increase timeout for better reliability
        }
      );
    });
  }, [locationOptions]);

  // Get current location
  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocation not supported');
        setLocationError('Geolocation is not supported by this browser');
        reject(error);
        return;
      }

      const isDesktop = !('ontouchstart' in window) && !navigator.userAgent.match(/Mobile|Android|iPhone|iPad/);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation(position);
          setLocationError(null);
          resolve(position);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please allow location access in your browser settings.';
              setLocationPermissionStatus('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              if (isDesktop) {
                errorMessage = 'Location services work best on mobile devices with GPS. On desktop computers, location accuracy may be limited or unavailable.';
              } else {
                errorMessage = 'Location information unavailable. Please check your device\'s location settings and ensure you have a good internet connection.';
              }
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again or check your internet connection.';
              break;
          }
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          ...locationOptions,
          timeout: 15000, // Increase timeout
        }
      );
    });
  }, [locationOptions]);

  // Update location on server
  const updateLocationOnServer = useCallback(async (position: GeolocationPosition, shareWith: string[] = []) => {
    try {
      setIsUpdatingLocation(true);
      
      const response = await fetch('/api/live-locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          is_sharing: true,
          share_with: shareWith,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update location');
      }
    } catch (error) {
      console.error('Failed to update location on server:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to update location');
    } finally {
      setIsUpdatingLocation(false);
    }
  }, []);

  // Start location sharing
  const startSharing = useCallback(async (shareWith: string[] = []) => {
    try {
      setIsLoading(true);
      
      // Get current location first
      const position = await getCurrentLocation();
      
      // Update location on server
      await updateLocationOnServer(position, shareWith);
      
      // Start watching position
      if (navigator.geolocation && !watchIdRef.current) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (newPosition) => {
            setCurrentLocation(newPosition);
            // Update server every time position changes significantly
            const lastPos = currentLocation;
            if (!lastPos || 
                Math.abs(newPosition.coords.latitude - lastPos.coords.latitude) > 0.0001 ||
                Math.abs(newPosition.coords.longitude - lastPos.coords.longitude) > 0.0001) {
              updateLocationOnServer(newPosition, shareWith);
            }
          },
          (error) => {
            console.error('Location watch error:', error);
            setLocationError('Failed to track location changes');
          },
          {
            ...locationOptions,
            maximumAge: 30000, // 30 seconds for watching
          }
        );
      }

      // Set up periodic updates (every 30 seconds)
      if (!updateIntervalRef.current) {
        updateIntervalRef.current = setInterval(async () => {
          try {
            const position = await getCurrentLocation();
            await updateLocationOnServer(position, shareWith);
          } catch (error) {
            console.error('Periodic location update failed:', error);
          }
        }, 30000);
      }

      setIsSharing(true);
    } catch (error) {
      console.error('Failed to start sharing:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to start sharing');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentLocation, updateLocationOnServer, currentLocation, locationOptions]);

  // Stop location sharing
  const stopSharing = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Stop location sharing on server
      const response = await fetch('/api/live-locations', {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to stop sharing');
      }

      // Clear watch and interval
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      setIsSharing(false);
    } catch (error) {
      console.error('Failed to stop sharing:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to stop sharing');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update sharing settings
  const updateSharingSettings = useCallback(async (shareWith: string[]) => {
    try {
      const response = await fetch('/api/live-locations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_sharing: true,
          share_with: shareWith,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update sharing settings');
      }
    } catch (error) {
      console.error('Failed to update sharing settings:', error);
      setLocationError(error instanceof Error ? error.message : 'Failed to update sharing settings');
    }
  }, []);

  // Fetch live locations from other users
  const refreshLocations = useCallback(async () => {
    try {
      const response = await fetch('/api/live-locations?include_own=false');
      const data = await response.json();
      
      if (data.success) {
        setLiveLocations(data.data || []);
      } else {
        console.error('Failed to fetch live locations:', data.error);
      }
    } catch (error) {
      console.error('Failed to refresh locations:', error);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        // Subscribe to live_locations table changes
        realtimeChannelRef.current = supabase
          .channel('live-locations-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'live_locations',
            },
            (payload) => {
              console.log('Live location change:', payload);
              // Refresh locations when there are changes
              refreshLocations();
            }
          )
          .subscribe();
      } catch (error) {
        console.error('Failed to set up realtime subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [refreshLocations]);

  // Initial setup
  useEffect(() => {
    checkLocationPermission();
    refreshLocations();
    
    // Try to get initial location if permission is already granted
    const tryInitialLocation = async () => {
      if (locationPermissionStatus === 'granted') {
        try {
          await getCurrentLocation();
        } catch (error) {
          console.log('Initial location fetch failed:', error);
        }
      }
    };
    
    tryInitialLocation();
  }, [checkLocationPermission, refreshLocations, getCurrentLocation, locationPermissionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, []);

  return {
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
  };
}
