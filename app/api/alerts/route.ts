import { NextResponse } from 'next/server';

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
      const distance = Math.sqrt(
        Math.pow(alert.coordinates.lat - userLat, 2) + 
        Math.pow(alert.coordinates.lng - userLng, 2)
      ) * 111; // Rough km conversion
      
      return distance <= radius;
    });

    return NextResponse.json({ success: true, data: nearbyAlerts });
  }

  return NextResponse.json({ success: true, data: mockAlerts });
}
