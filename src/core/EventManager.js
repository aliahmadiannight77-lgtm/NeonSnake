
export default class EventManager {
  constructor() {
    this.events = new Map();
  }

  on(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Event callback must be a function.');
    }

    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }

    this.events.get(eventName).add(callback);

    return () => this.off(eventName, callback);
  }

  once(eventName, callback) {
    const unsubscribe = this.on(eventName, (...args) => {
      unsubscribe();
      callback(...args);
    });

    return unsubscribe;
  }

  off(eventName, callback) {
    const listeners = this.events.get(eventName);
    if (!listeners) return;

    listeners.delete(callback);

    if (listeners.size === 0) {
      this.events.delete(eventName);
    }
  }

  emit(eventName, payload) {
    const listeners = this.events.get(eventName);
    if (!listeners) return;

    for (const listener of [...listeners]) {
      listener(payload);
    }
  }

  clear(eventName) {
    if (eventName) {
      this.events.delete(eventName);
    } else {
      this.events.clear();
    }
  }
}
