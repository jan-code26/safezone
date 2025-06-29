import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  
  if (!lat || !lng) {
    return NextResponse.json({ success: false, error: "Latitude and longitude required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Weather API key not configured" }, { status: 500 });
    }

    // Using OpenWeatherMap API - you can replace with other providers
    const baseUrl = 'https://api.openweathermap.org/data/2.5';
    
    // Fetch current weather
    const currentWeatherResponse = await fetch(
      `${baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );
    
    if (!currentWeatherResponse.ok) {
      throw new Error('Failed to fetch current weather');
    }
    
    const currentWeather = await currentWeatherResponse.json();
    
    // Fetch forecast
    const forecastResponse = await fetch(
      `${baseUrl}/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&cnt=8`
    );
    
    const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
    
    // Transform data to match your application's format
    const weatherData = {
      location: { 
        lat: parseFloat(lat), 
        lng: parseFloat(lng),
        name: currentWeather.name
      },
      current: {
        temperature: Math.round(currentWeather.main.temp),
        condition: currentWeather.weather[0].main,
        description: currentWeather.weather[0].description,
        windSpeed: Math.round(currentWeather.wind.speed * 3.6), // Convert m/s to km/h
        humidity: currentWeather.main.humidity,
        pressure: currentWeather.main.pressure,
        visibility: currentWeather.visibility / 1000, // Convert to km
        icon: currentWeather.weather[0].icon
      },
      alerts: [], // Weather alerts would need a separate API call or service
      forecast: forecastData?.list?.slice(0, 6).map((item: any) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        temp: Math.round(item.main.temp),
        condition: item.weather[0].main,
        description: item.weather[0].description,
        icon: item.weather[0].icon
      })) || []
    };

    return NextResponse.json({ success: true, data: weatherData });
  } catch (error) {
    console.error("Weather API fetch error:", error);
    // Return mock weather data as fallback
    const mockWeatherData = {
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        name: "Fallback Location (Weather API Error)"
      },
      current: {
        temperature: 20, // °C
        condition: "Partly Cloudy",
        description: "partly cloudy with a chance of showers",
        windSpeed: 15, // km/h
        humidity: 60, // %
        pressure: 1012, // hPa
        visibility: 10, // km
        icon: "02d" // Example icon code
      },
      alerts: [
        {
          id: "fallback-weather-alert-1",
          type: "weather_api_status",
          title: "Real-time Weather Unavailable",
          description: "Currently displaying cached or mock weather data due to an issue fetching live updates. Please try again later.",
          severity: "low", // Or 'warning' if you have such a severity
          areas: ["Current Location"],
          expires: new Date(Date.now() + 3600000).toISOString(), // Expires in 1 hour
          source: "System"
        }
      ],
      forecast: [
        { time: "12:00 PM", temp: 22, condition: "Sunny", description: "clear sky", icon: "01d" },
        { time: "03:00 PM", temp: 23, condition: "Sunny", description: "clear sky", icon: "01d" },
        { time: "06:00 PM", temp: 21, condition: "Clouds", description: "few clouds", icon: "02d" },
        { time: "09:00 PM", temp: 18, condition: "Clear", description: "clear sky", icon: "01n" },
        { time: "12:00 AM", temp: 16, condition: "Clear", description: "clear sky", icon: "01n" },
        { time: "03:00 AM", temp: 15, condition: "Clear", description: "clear sky", icon: "01n" },
      ]
    };
    return NextResponse.json({
      success: true, // Still success:true because we are providing fallback data
      data: mockWeatherData,
      fallback: true, // Indicate that this is fallback data
      error: "Failed to fetch live weather data, serving fallback."
    }, { status: 200 }); // Return 200 as we are successfully providing data (fallback)
  }
}
