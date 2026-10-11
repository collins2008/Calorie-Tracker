import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Storage abstraction layer for persistent key-value data.
 * - On Native (Android/iOS): Uses Capacitor Preferences (backed by Android SharedPreferences),
 *   completely independent of WebView cache/IndexedDB pressure.
 * - On Web (PWA): Falls back to localStorage.
 */
export const storage = {
  isNative: Capacitor.isNativePlatform(),

  async get(key: string): Promise<string | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        const { value } = await Preferences.get({ key });
        return value;
      }
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    } catch (err) {
      console.warn(`[storage] Failed to get key "${key}":`, err);
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.set({ key, value });
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.error(`[storage] Failed to set key "${key}":`, err);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.remove({ key });
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.error(`[storage] Failed to remove key "${key}":`, err);
    }
  },

  async clear(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Preferences.clear();
      }
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
      }
    } catch (err) {
      console.error('[storage] Failed to clear storage:', err);
    }
  },

  async getJSON<T = any>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async setJSON(key: string, value: any): Promise<void> {
    await this.set(key, JSON.stringify(value));
  }
};
