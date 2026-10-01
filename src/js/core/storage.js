/**
 * NextGen Core - Storage Helper
 * Resilient wrapper around localStorage and sessionStorage with fallback.
 */

class StorageManager {
  constructor(storageType = 'localStorage') {
    this.storage = window[storageType];
    this.memoryFallback = new Map();
  }

  isAvailable() {
    try {
      const testKey = '__nexgen_storage_test__';
      this.storage.setItem(testKey, testKey);
      this.storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  get(key, defaultValue = null) {
    if (this.isAvailable()) {
      try {
        const item = this.storage.getItem(key);
        if (item === null || item === undefined) return defaultValue;
        try {
          return JSON.parse(item);
        } catch {
          return item; // Value was saved as raw string
        }
      } catch (e) {
        console.warn(`[Storage] Failed to retrieve key "${key}".`, e);
        return defaultValue;
      }
    }
    return this.memoryFallback.has(key) ? this.memoryFallback.get(key) : defaultValue;
  }

  set(key, value) {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    if (this.isAvailable()) {
      try {
        this.storage.setItem(key, serialized);
        return true;
      } catch (e) {
        console.error(`[Storage] Quota exceeded or error saving key "${key}".`, e);
      }
    }
    this.memoryFallback.set(key, value);
    return false;
  }

  remove(key) {
    if (this.isAvailable()) {
      this.storage.removeItem(key);
    }
    this.memoryFallback.delete(key);
  }

  clear() {
    if (this.isAvailable()) {
      this.storage.clear();
    }
    this.memoryFallback.clear();
  }
}

export const appStorage = new StorageManager('localStorage');
export const sessionAppStorage = new StorageManager('sessionStorage');
