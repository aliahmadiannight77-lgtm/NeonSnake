
import LEGENDARY_SNAKES from '../data/legendary.js';

export default class LegendaryShop {
  constructor({ economy, inventory } = {}) {
    if (!economy || !inventory) {
      throw new TypeError(
        'LegendaryShop requires economy and inventory.'
      );
    }

    this.economy = economy;
    this.inventory = inventory;
    this.snakes = LEGENDARY_SNAKES;
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

    if (!this.economy.spendDiamonds(snake.price)) {
      return { success: false, reason: 'insufficient-diamonds' };
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
