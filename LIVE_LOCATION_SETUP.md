# Live Location Feature Setup

This document explains how to set up and use the live location sharing feature in the SafeZone application.

## Overview

The live location feature allows users to:
- Share their real-time location with selected contacts
- View live locations of contacts who are sharing with them
- See live location markers on the map with real-time updates
- Control who can see their location and manage sharing settings

## Components Created

### 1. API Routes
- `app/api/live-locations/route.ts` - Handles CRUD operations for live locations
- Supports GET, POST, PUT, DELETE operations
- Integrates with Supabase for data persistence

### 2. Custom Hook
- `app/hooks/useLiveLocation.ts` - Manages live location state and operations
- Handles geolocation API integration
- Manages location permissions
- Provides real-time location updates
- Handles sharing controls

### 3. UI Components
- `app/components/live-location/LiveLocationPanel.tsx` - Main UI for live location controls
- Integrated into the right sidebar of the main application
- Shows current location status, sharing controls, and live locations from others

### 4. Context Integration
- `app/contexts/ContactsContext.tsx` - Shared contacts state management
- Used by both ContactsList and LiveLocationPanel
- Provides centralized contact data access

### 5. Database Schema
The live locations feature requires the following database table:

```sql
CREATE TABLE live_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    accuracy DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    is_sharing BOOLEAN DEFAULT true,
    share_with TEXT[] DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### 1. Database Setup
Run the SQL migration script to create the necessary tables:
- The `live_locations` table stores real-time location data
- Row Level Security (RLS) policies ensure users can only see locations shared with them
- Automatic timestamp updates on location changes

### 2. Environment Variables
Ensure your Supabase environment variables are configured:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Browser Permissions
The live location feature requires:
- Geolocation API access (user must grant location permission)
- HTTPS connection for production (geolocation requires secure context)

## How It Works

### Location Sharing Flow
1. User clicks "Start Sharing Location" in the LiveLocationPanel
2. Browser requests location permission (if not already granted)
3. User selects which contacts to share location with
4. Location updates are sent to the server every 30 seconds
5. Other users who are shared with can see the live location on the map

### Real-time Updates
- Location updates every 30 seconds when sharing is active
- Live locations from others are fetched every 60 seconds
- Map markers show live locations with pulsing indicators
- Accuracy, speed, and timestamp information is displayed

### Privacy Controls
- Users control exactly who can see their location
- Sharing can be stopped at any time
- Locations are automatically cleaned up after 24 hours of inactivity
- No location data is stored when not actively sharing

## UI Features

### LiveLocationPanel Features
- **Permission Management**: Request and check location permissions
- **Sharing Controls**: Start/stop sharing with selected contacts
- **Current Location Display**: Shows coordinates, accuracy, speed
- **Live Locations List**: View locations from contacts who are sharing
- **Real-time Updates**: Automatic refresh of location data

### Map Integration
- Live location markers with pulsing animation
- Different marker styles for your location vs others' locations
- Popup information showing location details and quick actions
- Real-time marker position updates

## Technical Details

### Geolocation API Usage
```javascript
navigator.geolocation.watchPosition(
  (position) => {
    // Handle location update
  },
  (error) => {
    // Handle location error
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 30000
  }
);
```

### Data Flow
1. **Client**: Geolocation API → useLiveLocation hook
2. **Hook**: Location data → API route (/api/live-locations)
3. **API**: Supabase database storage
4. **Map**: Real-time marker updates from live location data

### Security Considerations
- Row Level Security (RLS) on database tables
- Location sharing permissions managed per contact
- Automatic cleanup of old location data
- No location tracking when sharing is disabled

## Usage Examples

### Starting Location Sharing
1. Open the LiveLocationPanel in the right sidebar
2. Grant location permission when prompted
3. Click "Start Sharing Location"
4. Select contacts to share with
5. Click "Start Sharing"

### Viewing Live Locations
- Live locations appear automatically in the LiveLocationPanel
- Markers show on the map with pulsing green indicators
- Click markers for detailed location information

### Managing Sharing
- Use "Manage Sharing" to update who can see your location
- "Stop Sharing" immediately stops location updates
- Sharing status is clearly indicated in the UI

## Troubleshooting

### Common Issues
1. **Location Permission Denied**: User must manually grant permission in browser settings
2. **Inaccurate Location**: GPS accuracy depends on device and environment
3. **No Live Locations Showing**: Check if contacts are actively sharing
4. **Database Errors**: Verify Supabase connection and table setup

### Browser Compatibility
- Requires modern browser with Geolocation API support
- HTTPS required for production deployment
- Works best on mobile devices with GPS capability

## Future Enhancements

Potential improvements to consider:
- Push notifications for location updates
- Geofencing and location-based alerts
- Location history and tracking
- Battery optimization for mobile devices
- Offline location caching
- Location sharing time limits
- Emergency location broadcasting
