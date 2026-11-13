
export default class Collision {
  static withWall(position, columns, rows) {
    return (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= columns ||
      position.y >= rows
    );
  }

  static withSelf(snake, ignoreTail = false) {
    if (!snake || snake.body.length < 2) {
      return false;
    }

    const head = snake.head;

    const body = ignoreTail
      ? snake.body.slice(1, -1)
      : snake.body.slice(1);

    return body.some(
      segment =>
        segment.x === head.x &&
        segment.y === head.y
    );
  }

  static withFood(snake, food) {
    if (!snake || !food || !food.position) {
      return false;
    }

    return (
      snake.head.x === food.position.x &&
      snake.head.y === food.position.y
    );
  }

  static check({
    snake,
    food,
    columns,
    rows,
    ignoreTail = false
  }) {
    if (!snake || !snake.head) {
      return {
        wall: false,
        self: false,
        food: false,
        gameOver: false
      };
    }

    const wall = this.withWall(
      snake.head,
      columns,
      rows
    );

    const self = this.withSelf(
      snake,
      ignoreTail
    );

    const ateFood = this.withFood(snake, food);

    return {
      wall,
      self,
      food: ateFood,
      gameOver: wall || self
    };
  }
}
