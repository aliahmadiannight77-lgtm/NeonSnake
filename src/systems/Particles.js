
export default class Particles {
  constructor(options = {}) {
    this.maxParticles = options.maxParticles ?? 180;
    this.particles = [];
    this.enabled = options.enabled ?? true;
    this.gravity = options.gravity ?? 0;
  }

  emit(x, y, options = {}) {
    if (!this.enabled) return;

    const count = Math.min(
      options.count ?? 12,
      this.maxParticles - this.particles.length
    );

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (options.speed ?? 2) * (0.4 + Math.random());

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: (options.size ?? 3) * (0.5 + Math.random()),
        life: options.life ?? 0.7,
        maxLife: options.life ?? 0.7,
        color: options.color ?? "#00f5ff",
        alpha: 1
      });
    }
  }

  update(deltaSeconds) {
    if (!this.enabled) return;

    const delta = Math.min(Math.max(deltaSeconds, 0), 0.05);

    for (const particle of this.particles) {
      particle.vy += this.gravity * delta;
      particle.x += particle.vx * delta * 60;
      particle.y += particle.vy * delta * 60;
      particle.life -= delta;
      particle.alpha = Math.max(0, particle.life / particle.maxLife);
    }

    this.particles = this.particles.filter(
      particle => particle.life > 0
    );
  }

  render(ctx) {
    if (!this.enabled || !ctx) return;

    ctx.save();

    for (const particle of this.particles) {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(
        particle.x,
        particle.y,
        particle.size * particle.alpha,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) this.clear();
  }

  getCount() {
    return this.particles.length;
  }
}
