// app/components/weather/WeatherPanel.tsx
'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  location: {
    lat: number;
    lng: number;
    name?: string;
  };
  current: {
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    pressure?: number;
    visibility?: number;
    icon?: string;
  };
  forecast: Array<{
    time: string;
    temp: number;
    condition: string;
    description: string;
    icon?: string;
  }>;
  alerts: Array<any>;
}

export default function WeatherPanel() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Get user location first (you might want to pass lat/lng as props instead)
        if (!navigator.geolocation) {
          throw new Error('Geolocation is not supported');
        }
        
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        const { latitude, longitude } = position.coords;
        const response = await fetch(`/api/weather?lat=${latitude}&lng=${longitude}`);
        
        if (!response.ok) throw new Error('Failed to fetch weather');
        
        const result = await response.json();
        if (result.success) {
          setWeatherData(result.data);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-gray-600">Loading weather...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 h-full flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Weather Information</h2>
      
      {weatherData && (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">
              {weatherData.current.temperature}°C
            </div>
            <div className="text-blue-600 capitalize">{weatherData.current.description}</div>
            <div className="text-sm text-blue-500">
              {weatherData.location.name || `${weatherData.location.lat.toFixed(2)}, ${weatherData.location.lng.toFixed(2)}`}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Humidity</div>
              <div className="font-semibold">{weatherData.current.humidity}%</div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-600">Wind</div>
              <div className="font-semibold">{weatherData.current.windSpeed} km/h</div>
            </div>
          </div>
          
          {weatherData.current.pressure && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">Pressure</div>
                <div className="font-semibold">{weatherData.current.pressure} hPa</div>
              </div>
              {weatherData.current.visibility && (
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-gray-600">Visibility</div>
                  <div className="font-semibold">{weatherData.current.visibility} km</div>
                </div>
              )}
            </div>
          )}
          
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-2">Forecast</h3>
              <div className="space-y-1">
                {weatherData.forecast.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                    <span>{item.time}</span>
                    <span className="capitalize">{item.condition}</span>
                    <span className="font-semibold">{item.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
