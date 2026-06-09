// TypeScript definitions for APIs and Navigation parameters

// --- NASA API Interfaces ---

export interface ApodResponse {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
}

export interface EstimatedDiameter {
  kilometers: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
  meters: {
    estimated_diameter_min: number;
    estimated_diameter_max: number;
  };
}

export interface CloseApproachData {
  close_approach_date: string;
  close_approach_date_full: string;
  epoch_date_close_approach: number;
  relative_velocity: {
    kilometers_per_second: string;
    kilometers_per_hour: string;
    miles_per_hour: string;
  };
  miss_distance: {
    astronomical: string;
    lunar: string;
    kilometers: string;
    miles: string;
  };
  orbiting_body: string;
}

export interface Asteroid {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: EstimatedDiameter;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: CloseApproachData[];
  is_sentry_object: boolean;
}

export interface EpicResponse {
  identifier: string;
  caption: string;
  image: string;
  date: string; // "YYYY-MM-DD HH:MM:SS"
}

// --- Climate / Weather API Interfaces ---

export interface AirQualityData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  hourly: {
    time: string[];
    pm2_5: number[];
    pm10: number[];
    carbon_monoxide: number[];
    nitrogen_dioxide: number[];
    ozone: number[];
  };
  hourly_units: {
    pm2_5: string;
    pm10: string;
    carbon_monoxide: string;
    nitrogen_dioxide: string;
    ozone: string;
  };
}

export interface WeatherData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  timezone: number;
  name: string;
}

export interface CityInfo {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}

// --- App State & Persistent Storage ---

export interface SavedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  aqiScore?: number; // Calculated air quality status
}

export interface UserSettings {
  isDarkMode: boolean;
  useMetric: boolean; // true = km/celsius, false = miles/fahrenheit
  nasaApiKey: string;
  openWeatherApiKey: string;
}

export interface AppState {
  favoritesApod: ApodResponse[];
  favoritesAsteroids: Asteroid[];
  favoritesLocations: SavedLocation[];
  settings: UserSettings;
}

// --- React Navigation Parameters ---

export type RootStackParamList = {
  MainTabs: undefined;
  Detail: {
    type: 'apod' | 'asteroid' | 'climate';
    data: any; // Dynamic details payload
  };
};

export type TabParamList = {
  Home: undefined;
  Listagens: undefined;
  Favoritos: undefined;
  Configuracoes: undefined;
};
