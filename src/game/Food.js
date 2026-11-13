
export default class Food {
  constructor({
    columns = 20,
    rows = 20,
    random = Math.random
  } = {}) {
    this.columns = columns;
    this.rows = rows;
    this.random = random;

    this.position = null;
    this.type = 'normal';
    this.value = 10;

    this.spawn();
  }

  randomPosition() {
    return {
      x: Math.floor(this.random() * this.columns),
      y: Math.floor(this.random() * this.rows)
    };
  }

  spawn(snake = null) {
    const available = [];

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        if (!snake || !snake.occupies(x, y)) {
          available.push({ x, y });
        }
      }
    }

    if (available.length === 0) {
      this.position = null;
      return null;
    }

    const index = Math.floor(
      this.random() * available.length
    );

    this.position = available[index];

    this.type = 'normal';
    this.value = 10;

    return { ...this.position };
  }

  isAt(x, y) {
    return Boolean(
      this.position &&
      this.position.x === x &&
      this.position.y === y
    );
  }

  collect(snake = null) {
    if (!this.position) return null;

    const collected = {
      ...this.position,
      type: this.type,
      value: this.value
    };

    this.spawn(snake);

    return collected;
  }

  setBoardSize(columns, rows) {
    if (
      !Number.isInteger(columns) ||
      !Number.isInteger(rows) ||
      columns < 2 ||
      rows < 2
    ) {
      throw new RangeError('Invalid board dimensions.');
    }

    this.columns = columns;
    this.rows = rows;
    this.position = null;
  }
}
