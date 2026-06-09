import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../storage/asyncStorage';
import { UserSettings } from '../types';
import { API_KEYS } from '../config/apiKeys';

const DEFAULT_NASA_KEY = API_KEYS.NASA_API_KEY;
const DEFAULT_OPENWEATHER_KEY = API_KEYS.OPENWEATHER_API_KEY;
const SETTINGS_STORAGE_KEY = '@space_app_settings';

// Create base Axios instances
export const nasaClient: AxiosInstance = axios.create({
  baseURL: 'https://api.nasa.gov',
  timeout: 15000,
});

export const openWeatherClient: AxiosInstance = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
});

export const airQualityClient: AxiosInstance = axios.create({
  baseURL: 'https://air-quality-api.open-meteo.com/v1',
  timeout: 10000,
});

export const geocodingClient: AxiosInstance = axios.create({
  baseURL: 'https://geocoding-api.open-meteo.com/v1',
  timeout: 10000,
});

// Interceptor for NASA API Key Injection
nasaClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const userSettings = await storage.get<UserSettings>(SETTINGS_STORAGE_KEY);
      const apiKey = userSettings?.nasaApiKey || DEFAULT_NASA_KEY;
      config.params = {
        api_key: apiKey,
        ...config.params,
      };
    } catch {
      config.params = {
        api_key: DEFAULT_NASA_KEY,
        ...config.params,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for OpenWeather API Key Injection
openWeatherClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const userSettings = await storage.get<UserSettings>(SETTINGS_STORAGE_KEY);
      const apiKey = userSettings?.openWeatherApiKey || DEFAULT_OPENWEATHER_KEY;
      config.params = {
        appid: apiKey,
        ...config.params,
      };
    } catch {
      config.params = {
        appid: DEFAULT_OPENWEATHER_KEY,
        ...config.params,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response error handler helper
const handleResponseError = (error: any, serviceName: string) => {
  let message = 'Ocorreu um erro na conexão.';
  if (error.response) {
    // Server responded with non-2xx status
    console.error(`[${serviceName} Error Response]`, error.response.status, error.response.data);
    message = error.response.data?.error?.message || `Erro no servidor (${error.response.status}).`;
  } else if (error.request) {
    // Request made but no response received
    console.error(`[${serviceName} Error Request]`, error.request);
    message = 'Sem resposta do servidor. Verifique sua conexão.';
  } else {
    // Other error
    console.error(`[${serviceName} Error Setting Up]`, error.message);
    message = error.message;
  }
  return Promise.reject(new Error(message));
};

// Response Interceptors for Error Handling
nasaClient.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, 'NASA API')
);

openWeatherClient.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, 'OpenWeather API')
);

airQualityClient.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, 'Air Quality API')
);

geocodingClient.interceptors.response.use(
  (response) => response,
  (error) => handleResponseError(error, 'Geocoding API')
);
