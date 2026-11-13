
export default class AudioSettingsUI {
  constructor({
    audio = null,
    settings = null,
    containerSelector = '#audio-settings-container'
  } = {}) {
    this.audio = audio;
    this.settings = settings;
    this.container = document.querySelector(containerSelector);

    this.state = {
      enabled: true,
      volume: 35,
      effects: true
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);

    this.init();
  }

  init() {
    this.loadSettings();

    if (!this.container) {
      console.warn('Audio settings container not found.');
      return;
    }

    this.container.addEventListener('input', this.handleChange);
    this.container.addEventListener('change', this.handleChange);
    this.container.addEventListener('click', this.handleClick);

    this.render();
  }

  loadSettings() {
    if (this.settings && typeof this.settings.getAll === 'function') {
      const saved = this.settings.getAll();

      this.state.enabled = saved.sound !== false;
      this.state.volume = this.normalizeVolume(saved.volume ?? 35);
      this.state.effects = saved.effects !== false;
    }
  }

  normalizeVolume(value) {
    const volume = Number(value);

    if (!Number.isFinite(volume)) return 35;

    return Math.max(0, Math.min(100, volume));
  }

  handleChange(event) {
    const target = event.target;

    if (!target.dataset.audioSetting) return;

    const setting = target.dataset.audioSetting;

    if (setting === 'volume') {
      this.setVolume(target.value);
    }

    if (setting === 'enabled') {
      this.setEnabled(target.checked);
    }

    if (setting === 'effects') {
      this.setEffects(target.checked);
    }
  }

  handleClick(event) {
    const button = event.target.closest('[data-audio-action]');

    if (!button || !this.container.contains(button)) return;

    if (button.dataset.audioAction === 'test') {
      this.testSound();
    }

    if (button.dataset.audioAction === 'reset') {
      this.reset();
    }
  }

  setEnabled(enabled) {
    this.state.enabled = Boolean(enabled);

    this.applySettings();
    this.render();

    return this.state.enabled;
  }

  setVolume(volume) {
    this.state.volume = this.normalizeVolume(volume);

    this.applySettings();
    this.render();

    return this.state.volume;
  }

  setEffects(enabled) {
    this.state.effects = Boolean(enabled);

    this.applySettings();
    this.render();

    return this.state.effects;
  }

  applySettings() {
    if (this.audio) {
      this.audio.setEnabled?.(
        this.state.enabled && this.state.effects
      );

      this.audio.setVolume?.(this.state.volume / 100);
    }

    if (this.settings && typeof this.settings.set === 'function') {
      this.settings.set('sound', this.state.enabled);
      this.settings.set('volume', this.state.volume);
      this.settings.set('effects', this.state.effects);
    }
  }

  async testSound() {
    if (!this.audio || !this.state.enabled || !this.state.effects) {
      return false;
    }

    try {
      await this.audio.resume?.();
      this.audio.playClick?.();

      return true;
    } catch (error) {
      console.error('Audio test failed:', error);
      return false;
    }
  }

  reset() {
    this.state = {
      enabled: true,
      volume: 35,
      effects: true
    };

    this.applySettings();
    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="audio-settings">
        <header class="audio-settings__header">
          <div>
            <h2>تنظیمات صدا</h2>
            <p>تجربه صوتی بازی را شخصی‌سازی کن.</p>
          </div>

          <span class="audio-settings__icon">🔊</span>
        </header>

        <div class="audio-setting">
          <div>
            <strong>فعال‌سازی صدا</strong>
            <p>روشن یا خاموش کردن صدای بازی</p>
          </div>

          <input
            type="checkbox"
            data-audio-setting="enabled"
            aria-label="فعال‌سازی صدا"
            ${this.state.enabled ? 'checked' : ''}
          >
        </div>

        <div class="audio-setting">
          <div>
            <strong>بلندی صدا</strong>
            <p>میزان صدای افکت‌ها</p>
          </div>

          <strong>${this.state.volume}%</strong>
        </div>

        <input
          class="audio-settings__slider"
          type="range"
          min="0"
          max="100"
          step="1"
          value="${this.state.volume}"
          data-audio-setting="volume"
          aria-label="بلندی صدا"
          ${this.state.enabled ? '' : 'disabled'}
        >

        <div class="audio-setting">
          <div>
            <strong>افکت‌های صوتی</strong>
            <p>صدای جمع‌آوری غذا و رویدادها</p>
          </div>

          <input
            type="checkbox"
            data-audio-setting="effects"
            aria-label="افکت‌های صوتی"
            ${this.state.effects ? 'checked' : ''}
            ${this.state.enabled ? '' : 'disabled'}
          >
        </div>

        <footer class="audio-settings__actions">
          <button type="button" data-audio-action="test">
            تست صدا
          </button>

          <button type="button" data-audio-action="reset">
            بازنشانی
          </button>
        </footer>
      </section>
    `;
  }

  destroy() {
    if (this.container) {
      this.container.removeEventListener('input', this.handleChange);
      this.container.removeEventListener('change', this.handleChange);
      this.container.removeEventListener('click', this.handleClick);
      this.container.innerHTML = '';
    }

    this.container = null;
  }
}
