import config from "../config";

const BASE_URL = "http://api.weatherapi.com/v1/current.json";

export const getWeatherUrl = (city: string) => {
  const params = new URLSearchParams({
    key: config.WEATHER_API_KEY as string,
    q: city,
    aqi: "no" // We don't need air quality data for now
  });
  
  return `${BASE_URL}?${params.toString()}`;
};