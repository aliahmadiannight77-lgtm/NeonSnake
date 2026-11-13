
export default class Effects {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true;
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.flashDuration = 0;
    this.flashColor = "#ffffff";
    this.flashAlpha = 0;
  }

  shake(intensity = 8, duration = 0.25) {
    if (!this.enabled) return;

    this.shakeIntensity = Math.max(0, intensity);
    this.shakeDuration = Math.max(0, duration);
  }

  flash(color = "#ffffff", duration = 0.15) {
    if (!this.enabled) return;

    this.flashColor = color;
    this.flashDuration = Math.max(0, duration);
    this.flashAlpha = 0.35;
  }

  update(deltaSeconds) {
    const delta = Math.min(Math.max(deltaSeconds, 0), 0.05);

    this.shakeDuration = Math.max(0, this.shakeDuration - delta);
    this.flashDuration = Math.max(0, this.flashDuration - delta);

    if (this.flashDuration === 0) {
      this.flashAlpha = 0;
    } else {
      this.flashAlpha = Math.min(
        0.35,
        this.flashDuration * 2.3
      );
    }
  }

  applyShake(ctx) {
    if (!this.enabled || !ctx || this.shakeDuration <= 0) return;

    const strength =
      this.shakeIntensity *
      Math.min(1, this.shakeDuration / 0.25);

    const x = (Math.random() - 0.5) * strength;
    const y = (Math.random() - 0.5) * strength;

    ctx.translate(x, y);
  }

  renderFlash(ctx, width, height) {
    if (
      !this.enabled ||
      !ctx ||
      this.flashAlpha <= 0
    ) return;

    ctx.save();
    ctx.globalAlpha = this.flashAlpha;
    ctx.fillStyle = this.flashColor;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);

    if (!this.enabled) {
      this.shakeDuration = 0;
      this.flashDuration = 0;
      this.flashAlpha = 0;
    }
  }

  reset() {
    this.shakeDuration = 0;
    this.shakeIntensity = 0;
    this.flashDuration = 0;
    this.flashAlpha = 0;
  }
}
