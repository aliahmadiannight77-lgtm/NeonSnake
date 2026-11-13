
export default class Physics {
  constructor({
    baseSpeed = 7,
    maxSpeed = 13,
    acceleration = 0.15
  } = {}) {
    this.baseSpeed = baseSpeed;
    this.maxSpeed = maxSpeed;
    this.acceleration = acceleration;

    this.speed = baseSpeed;
    this.elapsed = 0;
  }

  get interval() {
    return 1000 / this.speed;
  }

  update(deltaSeconds, level = 1) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      return false;
    }

    this.elapsed += deltaSeconds * 1000;

    const targetSpeed = Math.min(
      this.maxSpeed,
      this.baseSpeed +
        Math.max(0, level - 1) * this.acceleration
    );

    this.speed = targetSpeed;

    if (this.elapsed >= this.interval) {
      this.elapsed %= this.interval;
      return true;
    }

    return false;
  }

  setSpeed(speed) {
    if (!Number.isFinite(speed) || speed <= 0) {
      throw new RangeError('Speed must be a positive number.');
    }

    this.speed = Math.min(speed, this.maxSpeed);
  }

  reset() {
    this.speed = this.baseSpeed;
    this.elapsed = 0;
  }
}
