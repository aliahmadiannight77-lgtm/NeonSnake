
import GAME_CONFIG from '../data/config.js';

export default class Economy {
  constructor({
    coins = GAME_CONFIG.economy.startingCoins,
    diamonds = GAME_CONFIG.economy.startingDiamonds,
    onChange = () => {}
  } = {}) {
    this.coins = Math.max(0, Math.floor(coins));
    this.diamonds = Math.max(0, Math.floor(diamonds));
    this.onChange = onChange;
  }

  getBalance() {
    return {
      coins: this.coins,
      diamonds: this.diamonds
    };
  }

  notify(type, amount) {
    this.onChange({
      type,
      amount,
      ...this.getBalance()
    });
  }

  addCoins(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return false;
    }

    this.coins += amount;
    this.notify('coins-added', amount);
    return true;
  }

  addDiamonds(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return false;
    }

    this.diamonds += amount;
    this.notify('diamonds-added', amount);
    return true;
  }

  spendCoins(amount) {
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      this.coins < amount
    ) {
      return false;
    }

    this.coins -= amount;
    this.notify('coins-spent', amount);
    return true;
  }

  spendDiamonds(amount) {
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      this.diamonds < amount
    ) {
      return false;
    }

    this.diamonds -= amount;
    this.notify('diamonds-spent', amount);
    return true;
  }

  exchangeCoinsForDiamonds(coins) {
    const rate = GAME_CONFIG.economy.coinsPerDiamond;

    if (
      !Number.isSafeInteger(coins) ||
      coins <= 0 ||
      coins % rate !== 0
    ) {
      return {
        success: false,
        reason: 'invalid-amount'
      };
    }

    const diamonds = coins / rate;

    if (!this.spendCoins(coins)) {
      return {
        success: false,
        reason: 'insufficient-coins'
      };
    }

    this.addDiamonds(diamonds);

    return {
      success: true,
      coins,
      diamonds
    };
  }

  setBalance({ coins, diamonds }) {
    if (
      !Number.isSafeInteger(coins) ||
      !Number.isSafeInteger(diamonds) ||
      coins < 0 ||
      diamonds < 0
    ) {
      return false;
    }

    this.coins = coins;
    this.diamonds = diamonds;
    this.notify('balance-updated', 0);

    return true;
  }
}
