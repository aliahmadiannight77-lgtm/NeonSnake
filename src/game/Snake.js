
const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export default class Snake {
  constructor({
    x = 10,
    y = 10,
    length = 3,
    direction = 'right'
  } = {}) {
    this.direction = direction;
    this.nextDirection = direction;
    this.growAmount = 0;

    this.body = Array.from({ length }, (_, index) => ({
      x: x - index,
      y
    }));

    this.alive = true;
  }

  get head() {
    return this.body[0];
  }

  get tail() {
    return this.body[this.body.length - 1];
  }

  get length() {
    return this.body.length;
  }

  getDirectionVector(direction = this.direction) {
    return DIRECTIONS[direction];
  }

  setDirection(direction) {
    if (!DIRECTIONS[direction]) return false;

    const current = DIRECTIONS[this.direction];
    const next = DIRECTIONS[direction];

    // Prevent reversing directly into the snake's own body.
    if (current.x + next.x === 0 &&
        current.y + next.y === 0) {
      return false;
    }

    this.nextDirection = direction;
    return true;
  }

  move() {
    if (!this.alive) return this.head;

    this.direction = this.nextDirection;

    const vector = this.getDirectionVector();

    const newHead = {
      x: this.head.x + vector.x,
      y: this.head.y + vector.y
    };

    this.body.unshift(newHead);

    if (this.growAmount > 0) {
      this.growAmount--;
    } else {
      this.body.pop();
    }

    return newHead;
  }

  grow(amount = 1) {
    if (!Number.isInteger(amount) || amount < 1) return;

    this.growAmount += amount;
  }

  reset({
    x = 10,
    y = 10,
    length = 3,
    direction = 'right'
  } = {}) {
    this.direction = direction;
    this.nextDirection = direction;
    this.growAmount = 0;
    this.alive = true;

    this.body = Array.from({ length }, (_, index) => ({
      x: x - index,
      y
    }));
  }

  kill() {
    this.alive = false;
  }

  occupies(x, y) {
    return this.body.some(
      segment => segment.x === x && segment.y === y
    );
  }

  getBody() {
    return this.body.map(segment => ({ ...segment }));
  }
}

export { DIRECTIONS };
