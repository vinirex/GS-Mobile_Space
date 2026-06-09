import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  /**
   * Save a string or object to AsyncStorage
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`AsyncStorage error saving key "${key}":`, error);
    }
  },

  /**
   * Get parsed JSON or string value from AsyncStorage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`AsyncStorage error getting key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove key from AsyncStorage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage error removing key "${key}":`, error);
    }
  },

  /**
   * Clear all app-specific storage keys
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith('@space_app_'));
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
      }
    } catch (error) {
      console.error('AsyncStorage error during clearAll:', error);
    }
  }
};
