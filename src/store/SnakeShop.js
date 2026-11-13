
import REGULAR_SNAKES from '../data/snakes.js';

export default class SnakeShop {
  constructor({ economy, inventory } = {}) {
    if (!economy || !inventory) {
      throw new TypeError(
        'SnakeShop requires economy and inventory.'
      );
    }

    this.economy = economy;
    this.inventory = inventory;
    this.snakes = REGULAR_SNAKES;
  }

  getSnakes() {
    return this.snakes.map(snake => ({
      ...snake,
      owned: this.inventory.owns(snake.id),
      selected: this.inventory.getSelectedSnake() === snake.id
    }));
  }

  getSnake(snakeId) {
    return this.snakes.find(
      snake => snake.id === snakeId
    ) ?? null;
  }

  buy(snakeId) {
    const snake = this.getSnake(snakeId);

    if (!snake) {
      return { success: false, reason: 'not-found' };
    }

    if (this.inventory.owns(snakeId)) {
      return { success: false, reason: 'already-owned' };
    }

    if (!this.economy.spendCoins(snake.price)) {
      return { success: false, reason: 'insufficient-coins' };
    }

    this.inventory.addSnake(snakeId);

    return {
      success: true,
      snake,
      balance: this.economy.getBalance()
    };
  }

  equip(snakeId) {
    const snake = this.getSnake(snakeId);

    if (!snake) {
      return { success: false, reason: 'not-found' };
    }

    if (!this.inventory.selectSnake(snakeId)) {
      return { success: false, reason: 'not-owned' };
    }

    return {
      success: true,
      snake
    };
  }
}
