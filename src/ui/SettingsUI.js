
export default class SettingsUI {
  constructor(options = {}) {
    this.storageKey = options.storageKey ?? "neonsnake:settings";

    this.settings = {
      sound: true,
      volume: 35,
      effects: true,
      particles: true,
      grid: true,
      vibration: true,
      controls: "both",
      language: "fa"
    };

    this.listeners = new Map();

    this.load();
    this.bind();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.storageKey);

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return;
      }

      const allowed = {
        sound: value => typeof value === "boolean",
        volume: value =>
          Number.isFinite(value) && value >= 0 && value <= 100,
        effects: value => typeof value === "boolean",
        particles: value => typeof value === "boolean",
        grid: value => typeof value === "boolean",
        vibration: value => typeof value === "boolean",
        controls: value => ["keyboard", "touch", "both"].includes(value),
        language: value =>
          ["fa", "en", "de", "ar", "fr", "es", "tr", "ru", "zh"].includes(value)
      };

      for (const [key, validator] of Object.entries(allowed)) {
        if (
          Object.hasOwn(parsed, key) &&
          validator(parsed[key])
        ) {
          this.settings[key] = parsed[key];
        }
      }
    } catch (error) {
      console.warn("Could not load settings:", error);
    }
  }

  save() {
    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.settings)
      );

      return true;
    } catch (error) {
      console.warn("Could not save settings:", error);
      return false;
    }
  }

  bind() {
    if (typeof document === "undefined") return;

    document.querySelectorAll("[data-setting]").forEach(element => {
      const key = element.dataset.setting;

      if (!Object.hasOwn(this.settings, key)) return;

      this.updateElement(element, key);

      const eventName =
        element.type === "checkbox" || element.type === "range"
          ? "input"
          : "change";

      element.addEventListener(eventName, () => {
        this.handleChange(element, key);
      });
    });
  }

  updateElement(element, key) {
    const value = this.settings[key];

    if (element.type === "checkbox") {
      element.checked = value;
    } else {
      element.value = String(value);
    }
  }

  handleChange(element, key) {
    let value;

    if (element.type === "checkbox") {
      value = element.checked;
    } else if (element.type === "range") {
      value = Number(element.value);
    } else {
      value = element.value;
    }

    if (!this.set(key, value)) {
      this.updateElement(element, key);
    }
  }

  set(key, value) {
    const validators = {
      sound: v => typeof v === "boolean",
      volume: v => Number.isFinite(v) && v >= 0 && v <= 100,
      effects: v => typeof v === "boolean",
      particles: v => typeof v === "boolean",
      grid: v => typeof v === "boolean",
      vibration: v => typeof v === "boolean",
      controls: v => ["keyboard", "touch", "both"].includes(v),
      language: v =>
        ["fa", "en", "de", "ar", "fr", "es", "tr", "ru", "zh"].includes(v)
    };

    if (!validators[key] || !validators[key](value)) {
      return false;
    }

    const previousValue = this.settings[key];

    if (previousValue === value) return true;

    this.settings[key] = value;
    this.save();

    this.notify(key, value, previousValue);

    return true;
  }

  get(key) {
    return this.settings[key];
  }

  getAll() {
    return { ...this.settings };
  }

  subscribe(key, callback) {
    if (typeof callback !== "function") {
      return () => {};
    }

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    const callbacks = this.listeners.get(key);
    callbacks.add(callback);

    return () => {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        this.listeners.delete(key);
      }
    };
  }

  notify(key, value, previousValue) {
    const callbacks = this.listeners.get(key);

    if (!callbacks) return;

    for (const callback of callbacks) {
      try {
        callback(value, previousValue);
      } catch (error) {
        console.error(`Settings listener error (${key}):`, error);
      }
    }
  }

  reset() {
    const defaults = {
      sound: true,
      volume: 35,
      effects: true,
      particles: true,
      grid: true,
      vibration: true,
      controls: "both",
      language: "fa"
    };

    for (const [key, value] of Object.entries(defaults)) {
      this.set(key, value);
    }

    document.querySelectorAll("[data-setting]").forEach(element => {
      const key = element.dataset.setting;

      if (Object.hasOwn(this.settings, key)) {
        this.updateElement(element, key);
      }
    });
  }

  destroy() {
    this.listeners.clear();
  }
}
