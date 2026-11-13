
/**
 * NeonSnake - Storage System
 * Persistent Local Storage Manager
 */

const STORAGE_CONFIG = Object.freeze({
  prefix: 'neonsnake:',
  version: 1,
  keys: {
    save: 'player-save',
    backup: 'player-backup',
    settings: 'settings'
  }
});

class Storage {
  constructor() {
    this.available = this.checkAvailability();
    this.listeners = new Set();
    this.boundStorageHandler = this.handleStorageEvent.bind(this);

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.boundStorageHandler);
    }
  }

  /**
   * بررسی دسترسی به LocalStorage
   */
  checkAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }

      const testKey = `${STORAGE_CONFIG.prefix}test`;

      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * ساخت کلید نهایی
   */
  getKey(key) {
    if (
      typeof key !== 'string' ||
      !/^[a-zA-Z0-9_-]+$/.test(key)
    ) {
      throw new TypeError('Storage key نامعتبر است.');
    }

    return `${STORAGE_CONFIG.prefix}${key}`;
  }

  /**
   * بررسی دسترسی قبل از عملیات
   */
  ensureAvailable() {
    if (!this.available) {
      throw new Error('LocalStorage در دسترس نیست.');
    }
  }

  /**
   * ذخیره داده
   */
  set(key, value) {
    this.ensureAvailable();

    const storageKey = this.getKey(key);

    let serialized;

    try {
      serialized = JSON.stringify(value);

      if (serialized === undefined) {
        throw new TypeError('داده قابل ذخیره‌سازی نیست.');
      }

      window.localStorage.setItem(storageKey, serialized);

      this.emit({
        type: 'set',
        key,
        value
      });

      return true;
    } catch (error) {
      console.error('[Storage] Save failed:', error);

      throw new Error(
        error?.name === 'QuotaExceededError'
          ? 'فضای ذخیره‌سازی مرورگر کافی نیست.'
          : 'ذخیره اطلاعات با خطا مواجه شد.'
      );
    }
  }

  /**
   * خواندن داده
   */
  get(key, fallback = null) {
    this.ensureAvailable();

    const storageKey = this.getKey(key);
    const rawValue = window.localStorage.getItem(storageKey);

    if (rawValue === null) {
      return fallback;
    }

    try {
      return JSON.parse(rawValue);
    } catch (error) {
      console.error('[Storage] Invalid stored data:', error);

      return fallback;
    }
  }

  /**
   * بررسی وجود کلید
   */
  has(key) {
    this.ensureAvailable();

    return window.localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * حذف یک داده
   */
  remove(key) {
    this.ensureAvailable();

    window.localStorage.removeItem(this.getKey(key));

    this.emit({
      type: 'remove',
      key
    });

    return true;
  }

  /**
   * پاک‌سازی تمام اطلاعات متعلق به NeonSnake
   */
  clearAll() {
    this.ensureAvailable();

    const keysToRemove = [];

    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);

      if (key?.startsWith(STORAGE_CONFIG.prefix)) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }

    this.emit({
      type: 'clear'
    });

    return keysToRemove.length;
  }

  /**
   * ذخیره اطلاعات اصلی بازیکن
   */
  saveGame(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new TypeError('اطلاعات بازی باید یک آبجکت معتبر باشد.');
    }

    const payload = {
      version: STORAGE_CONFIG.version,
      savedAt: Date.now(),
      data
    };

    this.set(STORAGE_CONFIG.keys.save, payload);

    return payload.savedAt;
  }

  /**
   * بازیابی اطلاعات اصلی بازیکن
   */
  loadGame() {
    const payload = this.get(STORAGE_CONFIG.keys.save);

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    if (
      !Number.isSafeInteger(payload.version) ||
      !payload.data ||
      typeof payload.data !== 'object' ||
      Array.isArray(payload.data)
    ) {
      console.warn('[Storage] Invalid save structure.');

      return null;
    }

    if (payload.version > STORAGE_CONFIG.version) {
      console.warn('[Storage] Save belongs to a newer game version.');

      return null;
    }

    return {
      version: payload.version,
      savedAt: payload.savedAt,
      data: payload.data
    };
  }

  /**
   * ایجاد نسخه پشتیبان
   */
  createBackup() {
    const currentSave = this.get(STORAGE_CONFIG.keys.save);

    if (currentSave === null) {
      return false;
    }

    const backup = {
      version: STORAGE_CONFIG.version,
      createdAt: Date.now(),
      save: currentSave
    };

    this.set(STORAGE_CONFIG.keys.backup, backup);

    return true;
  }

  /**
   * بازیابی نسخه پشتیبان
   */
  restoreBackup() {
    const backup = this.get(STORAGE_CONFIG.keys.backup);

    if (
      !backup ||
      backup.version !== STORAGE_CONFIG.version ||
      !backup.save
    ) {
      return false;
    }

    this.set(STORAGE_CONFIG.keys.save, backup.save);

    this.emit({
      type: 'restore'
    });

    return true;
  }

  /**
   * ذخیره تنظیمات
   */
  saveSettings(settings) {
    if (
      !settings ||
      typeof settings !== 'object' ||
      Array.isArray(settings)
    ) {
      throw new TypeError('تنظیمات معتبر نیستند.');
    }

    this.set(STORAGE_CONFIG.keys.settings, settings);

    return true;
  }

  /**
   * دریافت تنظیمات
   */
  loadSettings(defaultSettings = {}) {
    const savedSettings = this.get(
      STORAGE_CONFIG.keys.settings,
      null
    );

    if (
      !savedSettings ||
      typeof savedSettings !== 'object' ||
      Array.isArray(savedSettings)
    ) {
      return { ...defaultSettings };
    }

    return {
      ...defaultSettings,
      ...savedSettings
    };
  }

  /**
   * دریافت حجم تقریبی داده‌های بازی
   */
  getStorageUsage() {
    this.ensureAvailable();

    let totalBytes = 0;

    for (let index = 0; index < window.localStorage.length; index++) {
      const key = window.localStorage.key(index);

      if (key?.startsWith(STORAGE_CONFIG.prefix)) {
        const value = window.localStorage.getItem(key) ?? '';

        totalBytes += (key.length + value.length) * 2;
      }
    }

    return {
      bytes: totalBytes,
      kilobytes: Number((totalBytes / 1024).toFixed(2)),
      megabytes: Number((totalBytes / (1024 * 1024)).toFixed(4))
    };
  }

  /**
   * ثبت Listener برای تغییرات ذخیره‌سازی
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Listener باید تابع باشد.');
    }

    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * انتشار رویداد داخلی
   */
  emit(event) {
    for (const callback of this.listeners) {
      try {
        callback(event);
      } catch (error) {
        console.error('[Storage] Listener error:', error);
      }
    }
  }

  /**
   * دریافت تغییرات از تب‌های دیگر مرورگر
   */
  handleStorageEvent(event) {
    if (
      !event.key ||
      !event.key.startsWith(STORAGE_CONFIG.prefix)
    ) {
      return;
    }

    this.emit({
      type: 'external-change',
      key: event.key.slice(STORAGE_CONFIG.prefix.length),
      newValue: event.newValue,
      oldValue: event.oldValue
    });
  }

  /**
   * آزادسازی منابع
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'storage',
        this.boundStorageHandler
      );
    }

    this.listeners.clear();
  }
}

const storage = new Storage();

export { Storage, STORAGE_CONFIG };
export default storage;
