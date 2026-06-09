import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../storage/asyncStorage';
import { ApodResponse, Asteroid, SavedLocation, UserSettings } from '../types';

export interface AppStateContextType {
  favoritesApod: ApodResponse[];
  favoritesAsteroids: Asteroid[];
  favoritesLocations: SavedLocation[];
  settings: UserSettings;
  
  toggleFavoriteApod: (apod: ApodResponse) => void;
  isFavoriteApod: (date: string) => boolean;
  
  toggleFavoriteAsteroid: (asteroid: Asteroid) => void;
  isFavoriteAsteroid: (id: string) => boolean;
  
  toggleFavoriteLocation: (location: SavedLocation) => void;
  isFavoriteLocation: (name: string) => boolean;
  
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  clearCache: () => Promise<void>;
  isLoadingState: boolean;
}

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

const KEYS = {
  APOD: '@space_app_fav_apod',
  ASTEROIDS: '@space_app_fav_asteroids',
  LOCATIONS: '@space_app_fav_locations',
  SETTINGS: '@space_app_settings',
};

const DEFAULT_SETTINGS: UserSettings = {
  isDarkMode: true,
  useMetric: true,
  nasaApiKey: 'kygtdfmYhvlSr7ot0vNtPBcUb359AK6AZkgQbaxt',
  openWeatherApiKey: '8bf5aff5b8b1bfad836156b152a19ba1',
};

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [favoritesApod, setFavoritesApod] = useState<ApodResponse[]>([]);
  const [favoritesAsteroids, setFavoritesAsteroids] = useState<Asteroid[]>([]);
  const [favoritesLocations, setFavoritesLocations] = useState<SavedLocation[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoadingState, setIsLoadingState] = useState<boolean>(true);

  // Load all data on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const apods = await storage.get<ApodResponse[]>(KEYS.APOD);
        const asteroids = await storage.get<Asteroid[]>(KEYS.ASTEROIDS);
        const locations = await storage.get<SavedLocation[]>(KEYS.LOCATIONS);
        const savedSettings = await storage.get<UserSettings>(KEYS.SETTINGS);

        if (apods) setFavoritesApod(apods);
        if (asteroids) setFavoritesAsteroids(asteroids);
        if (locations) setFavoritesLocations(locations);
        if (savedSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
        }
      } catch (error) {
        console.error('Failed to load global state:', error);
      } finally {
        setIsLoadingState(false);
      }
    };
    loadState();
  }, []);

  // Sync APOD favorites
  const toggleFavoriteApod = async (apod: ApodResponse) => {
    const index = favoritesApod.findIndex(item => item.date === apod.date);
    let updated: ApodResponse[];
    if (index >= 0) {
      updated = favoritesApod.filter(item => item.date !== apod.date);
    } else {
      updated = [...favoritesApod, apod];
    }
    setFavoritesApod(updated);
    await storage.set(KEYS.APOD, updated);
  };

  const isFavoriteApod = (date: string) => {
    return favoritesApod.some(item => item.date === date);
  };

  // Sync Asteroid favorites
  const toggleFavoriteAsteroid = async (asteroid: Asteroid) => {
    const index = favoritesAsteroids.findIndex(item => item.id === asteroid.id);
    let updated: Asteroid[];
    if (index >= 0) {
      updated = favoritesAsteroids.filter(item => item.id !== asteroid.id);
    } else {
      updated = [...favoritesAsteroids, asteroid];
    }
    setFavoritesAsteroids(updated);
    await storage.set(KEYS.ASTEROIDS, updated);
  };

  const isFavoriteAsteroid = (id: string) => {
    return favoritesAsteroids.some(item => item.id === id);
  };

  // Sync Saved Locations
  const toggleFavoriteLocation = async (location: SavedLocation) => {
    const index = favoritesLocations.findIndex(
      item => item.name.toLowerCase() === location.name.toLowerCase()
    );
    let updated: SavedLocation[];
    if (index >= 0) {
      updated = favoritesLocations.filter(
        item => item.name.toLowerCase() !== location.name.toLowerCase()
      );
    } else {
      updated = [...favoritesLocations, location];
    }
    setFavoritesLocations(updated);
    await storage.set(KEYS.LOCATIONS, updated);
  };

  const isFavoriteLocation = (name: string) => {
    return favoritesLocations.some(
      item => item.name.toLowerCase() === name.toLowerCase()
    );
  };

  // Update Settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await storage.set(KEYS.SETTINGS, updated);
  };

  // Clear cache and reset state
  const clearCache = async () => {
    await storage.clearAll();
    setFavoritesApod([]);
    setFavoritesAsteroids([]);
    setFavoritesLocations([]);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AppStateContext.Provider
      value={{
        favoritesApod,
        favoritesAsteroids,
        favoritesLocations,
        settings,
        toggleFavoriteApod,
        isFavoriteApod,
        toggleFavoriteAsteroid,
        isFavoriteAsteroid,
        toggleFavoriteLocation,
        isFavoriteLocation,
        updateSettings,
        clearCache,
        isLoadingState,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};
