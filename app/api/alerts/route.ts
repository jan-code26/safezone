import { NextResponse } from 'next/server';

interface Alert {
  id: number;
  type: "weather" | "traffic" | "emergency";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  radius: number;
  issued: string;
  expires: string;
  source: string;
}
// Mock data for alerts
const mockAlerts = [
  {
    id: 1,
    type: "weather",
    severity: "high",
    title: "Severe Thunderstorm Warning",
    description: "Damaging winds up to 70mph and large hail expected",
    location: "Brooklyn, NY",
    coordinates: { lat: 40.6892, lng: -74.0445 },
    radius: 10, // km
    issued: new Date().toISOString(),
    expires: new Date(Date.now() + 3600000).toISOString(),
    source: "National Weather Service"
  },
  {
    id: 2,
    type: "traffic",
    severity: "medium", 
    title: "Major Traffic Incident",
    description: "Multi-vehicle accident blocking lanes on I-95",
    location: "I-95 Northbound",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    radius: 5,
    issued: new Date(Date.now() - 1800000).toISOString(),
    expires: new Date(Date.now() + 1800000).toISOString(),
    source: "NYC DOT"
  },
  {
    id: 3,
    type: "emergency",
    severity: "low",
    title: "Power Outage",
    description: "Scattered power outages affecting 1,200 customers",
    location: "Lower Manhattan",
    coordinates: { lat: 40.7282, lng: -73.7949 },
    radius: 8,
    issued: new Date(Date.now() - 3600000).toISOString(),
    expires: new Date(Date.now() + 7200000).toISOString(),
    source: "Con Edison"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = parseFloat(searchParams.get('radius') || '50');

  if (lat && lng) {
    // Filter alerts by location (simplified distance calculation)
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    
  const nearbyAlerts = mockAlerts.filter(alert => {
    const distance = getHaversineDistance(userLat, userLng, alert.coordinates.lat, alert.coordinates.lng);
    return distance <= radius;
  });

  return NextResponse.json({ success: true, data: nearbyAlerts });

  function getHaversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  }

  return NextResponse.json({ success: true, data: mockAlerts });
}
