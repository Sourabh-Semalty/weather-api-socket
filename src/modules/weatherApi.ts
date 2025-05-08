import axios from 'axios';
import { getWeatherUrl } from '../utils/weather';

interface WeatherstackResponse {
  current: {
    temperature: number;
    weather_descriptions: string[];
    humidity: number;
    wind_speed: number;
    weather_icons: string[];
  };
  location: {
    name: string;
  };
}

export const fetchWeather = async (query: string) => {
  try {
    const response = await axios.get<WeatherstackResponse>(getWeatherUrl(query));
    const data = response.data;

    // Check if the response data is valid
    if (!data || !data.location || !data.current) {
      throw new Error('Invalid weather data received from API');
    }

    // Validate required fields before accessing them
    if (!data.location.name || 
        typeof data.current.temperature === 'undefined' ||
        !data.current.weather_descriptions?.[0] ||
        !data.current.weather_icons?.[0]) {
      throw new Error('Missing required weather data fields');
    }

    return {
      name: data.location.name,
      main: {
        temp: data.current.temperature,
        humidity: data.current.humidity || 0
      },
      weather: [{
        description: data.current.weather_descriptions[0],
        icon: data.current.weather_icons[0]
      }],
      wind: {
        speed: data.current.wind_speed || 0
      }
    };
  } catch (err: any) {
    console.error('Error fetching weather:', err.message);
    throw new Error(`Failed to fetch weather data: ${err.message}`);
  }
};
