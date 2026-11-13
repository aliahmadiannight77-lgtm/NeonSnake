
export default class Audio {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.volume = Math.min(1, Math.max(0, options.volume ?? 0.35));
    this.context = null;
    this.masterGain = null;
  }

  async initialize() {
    if (this.context) return true;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return false;

    try {
      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.context.destination);

      return true;
    } catch {
      this.context = null;
      this.masterGain = null;
      return false;
    }
  }

  async resume() {
    if (!this.enabled) return false;

    const initialized = await this.initialize();
    if (!initialized) return false;

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    return this.context.state === "running";
  }

  playTone({
    frequency = 440,
    duration = 0.12,
    type = "sine",
    volume = 0.5,
    endFrequency = null
  } = {}) {
    if (!this.enabled || !this.context || !this.masterGain) {
      return;
    }

    if (this.context.state !== "running") return;

    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const now = this.context.currentTime;
    const end = now + Math.max(0.02, duration);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    if (endFrequency !== null) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, endFrequency),
        end
      );
    }

    gain.gain.setValueAtTime(
      Math.max(0.001, volume),
      now
    );
    gain.gain.exponentialRampToValueAtTime(0.001, end);

    oscillator.connect(gain);
    gain.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(end);
  }

  playEat() {
    this.playTone({
      frequency: 520,
      endFrequency: 880,
      duration: 0.1,
      type: "sine",
      volume: 0.35
    });
  }

  playLevelUp() {
    this.playTone({
      frequency: 440,
      endFrequency: 880,
      duration: 0.25,
      type: "triangle",
      volume: 0.4
    });

    if (this.context?.state === "running") {
      setTimeout(() => {
        this.playTone({
          frequency: 880,
          endFrequency: 1320,
          duration: 0.2,
          type: "triangle",
          volume: 0.35
        });
      }, 130);
    }
  }

  playGameOver() {
    this.playTone({
      frequency: 420,
      endFrequency: 110,
      duration: 0.45,
      type: "sawtooth",
      volume: 0.3
    });
  }

  playClick() {
    this.playTone({
      frequency: 700,
      duration: 0.045,
      type: "square",
      volume: 0.12
    });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
  }

  setVolume(volume) {
    this.volume = Math.min(1, Math.max(0, Number(volume) || 0));

    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.02
      );
    }
  }

  async destroy() {
    if (this.context) {
      await this.context.close();
    }

    this.context = null;
    this.masterGain = null;
  }
}
