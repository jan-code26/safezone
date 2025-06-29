import { NextResponse } from 'next/server';

// Define the Alert interface (consistent with InfoPanel.tsx)
interface Alert {
  id: string | number;
  type: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  radius: number; // in km
  issued: string;
  expires: string;
  source: string;
}

const mockAlerts: Alert[] = [
  {
    id: "mock-1",
    type: "weather",
    severity: "high",
    title: "Severe Thunderstorm Warning",
    description: "Damaging winds up to 70mph and large hail expected.",
    location: "Brooklyn, NY",
    coordinates: { lat: 40.6892, lng: -74.0445 },
    radius: 10,
    issued: new Date().toISOString(),
    expires: new Date(Date.now() + 3600000).toISOString(), // Expires in 1 hour
    source: "National Weather Service"
  },
  // Enhanced Mock Traffic Incidents
  {
    id: "mock-traffic-1",
    type: "traffic",
    severity: "medium",
    title: "Accident on Brooklyn Bridge",
    description: "Multi-vehicle collision on Brooklyn Bridge, eastbound. Expect major delays. Emergency services on scene.",
    location: "Brooklyn Bridge, New York, NY",
    coordinates: { lat: 40.7061, lng: -73.9969 }, // Brooklyn Bridge approximate
    radius: 3, // km
    issued: new Date(Date.now() - 900000).toISOString(), // Issued 15 mins ago
    expires: new Date(Date.now() + 3600000 * 2).toISOString(), // Expires in 2 hours
    source: "Local Traffic Authority"
  },
  {
    id: "mock-traffic-2",
    type: "traffic",
    severity: "low",
    title: "Road Closure - Main St",
    description: "Main Street closed between 1st Ave and 3rd Ave due to a local event. Detours in place.",
    location: "Main Street, Anytown, USA",
    coordinates: { lat: 34.0522, lng: -118.2437 }, // Generic Anytown coordinates
    radius: 2, // km
    issued: new Date(Date.now() - 7200000).toISOString(), // Issued 2 hours ago
    expires: new Date(Date.now() + 3600000 * 4).toISOString(), // Expires in 4 hours
    source: "Anytown Police Department"
  },
  {
    id: "mock-traffic-3",
    type: "traffic",
    severity: "high",
    title: "Major Highway Standstill - I-5 North",
    description: "Complete standstill on I-5 Northbound near exit 167 due to overturned truck. Avoid area if possible. Expected clearance in 3+ hours.",
    location: "I-5 Northbound, Seattle, WA",
    coordinates: { lat: 47.6205, lng: -122.3493 }, // Near Seattle Center, for example
    radius: 10, // km
    issued: new Date(Date.now() - 300000).toISOString(), // Issued 5 mins ago
    expires: new Date(Date.now() + 3600000 * 3.5).toISOString(), // Expires in 3.5 hours
    source: "State DOT"
  },
  {
    id: "mock-emergency-1", // Renamed from mock-3 to be more specific
    type: "emergency", // This can cover general emergencies, or be more specific
    severity: "low",
    title: "Power Outage Reported",
    description: "Scattered power outages affecting approximately 1,200 customers in Lower Manhattan.",
    location: "Lower Manhattan, New York, NY",
    coordinates: { lat: 40.7282, lng: -73.7949 },
    radius: 8, // km
    issued: new Date(Date.now() - 3600000).toISOString(), // Issued 1 hour ago
    expires: new Date(Date.now() + 7200000).toISOString(), // Expires in 2 hours
    source: "Con Edison"
  },
  // Enhanced Political Unrest / Other Safety Events
  {
    id: "mock-unrest-1",
    type: "safety", // Using a general 'safety' type, could also be 'political_unrest'
    severity: "medium",
    title: "Planned Protest - City Hall",
    description: "A large demonstration is planned for City Hall plaza today from 2 PM to 5 PM. Expect road closures and increased police presence in the area.",
    location: "City Hall, MajorCity, USA",
    coordinates: { lat: 39.9526, lng: -75.1652 }, // Example: Philadelphia City Hall
    radius: 2, // km
    issued: new Date(Date.now() - 24 * 3600000).toISOString(), // Issued 1 day ago
    expires: new Date(Date.now() + 6 * 3600000).toISOString(), // Valid for the next 6 hours (assuming current time is before/during event)
    source: "City Police Advisory"
  },
  {
    id: "mock-safety-1",
    type: "safety",
    severity: "high",
    title: "Industrial Fire - Evacuation Order",
    description: "Large fire at industrial complex in the West Port area. Smoke plume visible. Evacuation ordered for a 5km radius. Follow emergency personnel instructions.",
    location: "West Port Industrial Area",
    coordinates: { lat: 33.7339, lng: -118.2830 }, // Example: Near Port of Long Beach
    radius: 7, // km (evacuation radius + buffer for alert)
    issued: new Date(Date.now() - 600000).toISOString(), // Issued 10 mins ago
    expires: new Date(Date.now() + 12 * 3600000).toISOString(), // Expected to be active for 12 hours
    source: "County Emergency Services"
  },
  {
    id: "mock-unrest-2",
    type: "safety",
    severity: "low",
    title: "Election Polling Station Congestion",
    description: "High voter turnout reported at downtown polling stations. Expect longer than usual wait times. Consider off-peak hours if possible.",
    location: "Downtown Polling Centers",
    coordinates: { lat: 40.7580, lng: -73.9855 }, // Example: Times Square area (generic downtown)
    radius: 3, // km, covering a general downtown area
    issued: new Date(Date.now() - 3600000 * 2).toISOString(), // Issued 2 hours ago (during polling day)
    expires: new Date(Date.now() + 3600000 * 4).toISOString(), // Valid for next 4 hours (until polls close)
    source: "Board of Elections Update"
  }
];

async function fetchEarthquakeData(): Promise<Alert[]> {
  try {
    // Fetch significant earthquakes in the last 30 days
    const response = await fetch('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=4.5&orderby=time&limit=10');
    if (!response.ok) {
      console.error("Failed to fetch earthquake data from USGS:", response.statusText);
      return [];
    }
    const data = await response.json();
    return data.features.map((feature: any): Alert => {
      const [lng, lat, depth] = feature.geometry.coordinates;
      const magnitude = feature.properties.mag;
      let severity: 'low' | 'medium' | 'high';
      if (magnitude >= 6.5) {
        severity = 'high';
      } else if (magnitude >= 5.5) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
      return {
        id: feature.id,
        type: "earthquake",
        severity: severity,
        title: `M ${magnitude} Earthquake: ${feature.properties.place}`,
        description: feature.properties.title || `Magnitude ${magnitude} earthquake reported near ${feature.properties.place}. Depth: ${depth} km.`,
        location: feature.properties.place,
        coordinates: { lat, lng },
        radius: Math.max(50, magnitude * 20), // Estimate affected radius based on magnitude
        issued: new Date(feature.properties.time).toISOString(),
        // USGS data doesn't typically have an 'expires' field for earthquakes in this feed.
        // We can set a default or calculate based on aftershock likelihood if needed.
        // For now, let's make it expire after a few days for display purposes.
        expires: new Date(feature.properties.time + 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: "USGS Earthquake Hazards Program"
      };
    });
  } catch (error) {
    console.error("Error fetching or transforming earthquake data:", error);
    return [];
  }
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const radiusParam = searchParams.get('radius');

  let allAlerts: Alert[] = [...mockAlerts];

  try {
    const earthquakeAlerts = await fetchEarthquakeData();
    allAlerts = [...allAlerts, ...earthquakeAlerts];
  } catch (error) {
    console.error("Error fetching external alert data:", error);
    // Continue with mock alerts if external fetch fails
  }


  if (latParam && lngParam && radiusParam) {
    const userLat = parseFloat(latParam);
    const userLng = parseFloat(lngParam);
    const radius = parseFloat(radiusParam);

    const nearbyAlerts = allAlerts.filter(alert => {
      // Simple distance calculation (Haversine could be more accurate but this is fine for now)
      // degrees to km (approx)
      const R = 6371; // Radius of the earth in km
      const dLat = (alert.coordinates.lat - userLat) * Math.PI / 180;
      const dLng = (alert.coordinates.lng - userLng) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLat * Math.PI / 180) * Math.cos(alert.coordinates.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c; // Distance in km

      return distance <= (alert.radius + radius); // Check if user's radius overlaps with alert's radius
    });

    return NextResponse.json({ success: true, data: nearbyAlerts });
  }

  // If no location/radius provided, return all alerts (includes mock and fetched)
  return NextResponse.json({ success: true, data: allAlerts });
}
