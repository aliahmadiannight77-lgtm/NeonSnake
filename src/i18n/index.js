import fa from './locales/fa.js';
import en from './locales/en.js';
import de from './locales/de.js';
import ar from './locales/ar.js';
import fr from './locales/fr.js';
import es from './locales/es.js';
import tr from './locales/tr.js';
import ru from './locales/ru.js';
import zh from './locales/zh.js';

export const LANGUAGE_STORAGE_KEY = 'neonsnake:language';

export const LANGUAGES = Object.freeze([
  { code: 'fa', name: 'فارسی', nativeName: 'فارسی', flag: '🇮🇷', direction: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', direction: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', direction: 'ltr' }
]);

const TRANSLATIONS = Object.freeze({
  fa,
  en,
  de,
  ar,
  fr,
  es,
  tr,
  ru,
  zh
});

const DEFAULT_LANGUAGE = 'fa';

function getSavedLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return LANGUAGES.some(language => language.code === saved)
      ? saved
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function getLanguageInfo(code) {
  return LANGUAGES.find(language => language.code === code)
    ?? LANGUAGES[0];
}

function getNestedValue(object, path) {
  return path.split('.').reduce((current, key) => {
    if (current === null || current === undefined) return undefined;
    return current[key];
  }, object);
}

function interpolate(value, params = {}) {
  if (typeof value !== 'string') return value;

  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

class I18n {
  constructor() {
    this.language = getSavedLanguage();
    this.listeners = new Set();

    this.applyDocumentSettings();
  }

  getLanguage() {
    return this.language;
  }

  getLanguageInfo() {
    return getLanguageInfo(this.language);
  }

  getAvailableLanguages() {
    return LANGUAGES;
  }

  getDirection() {
    return this.getLanguageInfo().direction;
  }

  translate(key, params = {}) {
    const current = getNestedValue(TRANSLATIONS[this.language], key);

    if (current !== undefined && current !== null) {
      return interpolate(current, params);
    }

    const fallback = getNestedValue(TRANSLATIONS.en, key);

    if (fallback !== undefined && fallback !== null) {
      return interpolate(fallback, params);
    }

    return key;
  }

  setLanguage(code) {
    const language = LANGUAGES.find(item => item.code === code);

    if (!language) {
      throw new Error(`Unsupported language: ${code}`);
    }

    if (this.language === code) return false;

    this.language = code;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    } catch (error) {
      console.warn('[NeonSnake] Could not save language preference:', error);
    }

    this.applyDocumentSettings();
    this.notifyListeners();

    window.dispatchEvent(new CustomEvent('neonsnake:language-changed', {
      detail: {
        language: code,
        direction: language.direction
      }
    }));

    return true;
  }

  applyDocumentSettings() {
    const language = this.getLanguageInfo();

    document.documentElement.lang = language.code;
    document.documentElement.dir = language.direction;
    document.documentElement.dataset.language = language.code;
  }

  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Language subscriber must be a function.');
    }

    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners() {
    for (const callback of this.listeners) {
      try {
        callback(this.language, this.getDirection());
      } catch (error) {
        console.error('[NeonSnake] Language listener error:', error);
      }
    }
  }
}

export const i18n = new I18n();

export const t = (key, params) => i18n.translate(key, params);

export const setLanguage = code => i18n.setLanguage(code);

export const getLanguage = () => i18n.getLanguage();

export const getDirection = () => i18n.getDirection();

export const getLanguages = () => i18n.getAvailableLanguages();

export default i18n;