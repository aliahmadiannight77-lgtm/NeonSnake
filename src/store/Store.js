
import Economy from './Economy.js';
import Inventory from './Inventory.js';
import SnakeShop from './SnakeShop.js';
import LegendaryShop from './LegendaryShop.js';
import DiamondShop from './DiamondShop.js';

export default class Store {
  constructor({
    coins = 0,
    diamonds = 0,
    ownedSnakes = ['classic'],
    selectedSnake = 'classic',
    onBalanceChange = () => {}
  } = {}) {
    this.economy = new Economy({
      coins,
      diamonds,
      onChange: onBalanceChange
    });

    this.inventory = new Inventory({
      ownedSnakes,
      selectedSnake
    });

    this.snakeShop = new SnakeShop({
      economy: this.economy,
      inventory: this.inventory
    });

    this.legendaryShop = new LegendaryShop({
      economy: this.economy,
      inventory: this.inventory
    });

    this.diamondShop = new DiamondShop({
      economy: this.economy
    });
  }

  getBalance() {
    return this.economy.getBalance();
  }

  getInventory() {
    return this.inventory.export();
  }

  getSelectedSnake() {
    const id = this.inventory.getSelectedSnake();

    return (
      this.snakeShop.getSnake(id) ||
      this.legendaryShop.getSnake(id)
    );
  }

  buyRegularSnake(id) {
    return this.snakeShop.buy(id);
  }

  buyLegendarySnake(id) {
    return this.legendaryShop.buy(id);
  }

  equipSnake(id) {
    const regular = this.snakeShop.getSnake(id);

    if (regular) {
      return this.snakeShop.equip(id);
    }

    return this.legendaryShop.equip(id);
  }

  exchangeCoins(coins) {
    return this.diamondShop.exchange(coins);
  }

  exchangeAllCoins() {
    return this.diamondShop.exchangeAll();
  }

  addCoins(amount) {
    return this.economy.addCoins(amount);
  }

  addDiamonds(amount) {
    return this.economy.addDiamonds(amount);
  }

  export() {
    return {
      economy: this.economy.getBalance(),
      inventory: this.inventory.export()
    };
  }

  import(data = {}) {
    if (!data.economy || !data.inventory) {
      return false;
    }

    const balanceUpdated = this.economy.setBalance({
      coins: data.economy.coins,
      diamonds: data.economy.diamonds
    });

    if (!balanceUpdated) return false;

    return this.inventory.import(data.inventory);
  }
}
