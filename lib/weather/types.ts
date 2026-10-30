export type GeoPlace = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
};

export type HourlyForecastPoint = {
  time: string;
  cloudCover: number | null;
  humidity: number | null;
  visibilityMeters: number | null;
  temperatureC: number | null;
};

export type WeatherForecast = {
  latitude: number;
  longitude: number;
  timezone: string;
  retrievedAt: string;
  hourly: HourlyForecastPoint[];
  source: "Open-Meteo";
  attribution: string;
};
