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
    return NextResponse.json({ success: false, error: "Failed to fetch weather data" }, { status: 500 });
  }
}
