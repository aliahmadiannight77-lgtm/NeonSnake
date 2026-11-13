
export default class StateManager {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = new Set();
  }

  getState() {
    return { ...this.state };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    const previous = this.state[key];

    if (Object.is(previous, value)) return;

    this.state[key] = value;
    this.notify({ key, value, previous });
  }

  update(values = {}) {
    const changes = {};

    for (const [key, value] of Object.entries(values)) {
      if (!Object.is(this.state[key], value)) {
        changes[key] = {
          previous: this.state[key],
          value
        };

        this.state[key] = value;
      }
    }

    if (Object.keys(changes).length) {
      this.notify(changes);
    }
  }

  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Listener must be a function.');
    }

    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(changes) {
    for (const listener of this.listeners) {
      listener(this.getState(), changes);
    }
  }

  reset(initialState = {}) {
    this.state = { ...initialState };
    this.notify({ reset: true });
  }
}
