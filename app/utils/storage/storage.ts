import { MMKV } from 'react-native-mmkv';

export class StorageAdapter {
  private storage: MMKV;

  constructor() {
    this.storage = new MMKV();
  }

  /**
   * Gets an item from storage
   *
   * @param key The key to fetch
   * @returns Promise resolving to the value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return this.storage.getString(key) ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Sets an item in storage
   *
   * @param key The key to store under
   * @param value The string value to store
   * @returns Promise resolving to true on success, false on failure
   */
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      this.storage.set(key, value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes an item from storage
   *
   * @param key The key to remove
   * @returns Promise resolving to true on success, false on failure
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      this.storage.delete(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to store JSON objects
   *
   * @param key The key to store under
   * @param value The value to store
   * @returns Promise resolving to true on success, false on failure
   */
  async setObject<T>(key: string, value: T): Promise<boolean> {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  }

  /**
   * Helper method to retrieve and parse JSON objects
   *
   * @param key The key to fetch
   * @returns Promise resolving to the parsed object or null if not found
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}

export const storage = new StorageAdapter();
