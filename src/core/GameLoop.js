
export default class GameLoop {
  constructor(update, render, fps = 60) {
    this.update = update;
    this.render = render;
    this.fps = fps;
    this.frameDuration = 1000 / fps;

    this.running = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.animationId = null;

    this.frame = this.frame.bind(this);
  }

  start() {
    if (this.running) return;

    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;

    this.animationId = requestAnimationFrame(this.frame);
  }

  frame(currentTime) {
    if (!this.running) return;

    const delta = Math.min(
      currentTime - this.lastTime,
      250
    );

    this.lastTime = currentTime;
    this.accumulator += delta;

    while (this.accumulator >= this.frameDuration) {
      this.update(this.frameDuration / 1000);
      this.accumulator -= this.frameDuration;
    }

    this.render(
      this.accumulator / this.frameDuration
    );

    this.animationId = requestAnimationFrame(this.frame);
  }

  stop() {
    this.running = false;

    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  setFPS(fps) {
    if (!Number.isFinite(fps) || fps <= 0) {
      throw new RangeError('FPS must be a positive number.');
    }

    this.fps = fps;
    this.frameDuration = 1000 / fps;
  }
}
