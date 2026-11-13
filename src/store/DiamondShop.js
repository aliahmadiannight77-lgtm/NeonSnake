
import DIAMOND_PACKS from '../data/diamond-packs.js';
import GAME_CONFIG from '../data/config.js';

export default class DiamondShop {
  constructor({ economy } = {}) {
    if (!economy) {
      throw new TypeError('DiamondShop requires economy.');
    }

    this.economy = economy;
    this.packs = DIAMOND_PACKS;
    this.exchangeRate = GAME_CONFIG.economy.coinsPerDiamond;
  }

  getPacks() {
    return this.packs.map(pack => ({
      ...pack,
      affordable: this.economy.getBalance().coins >= pack.coins
    }));
  }

  getPack(packId) {
    return this.packs.find(
      pack => pack.id === packId
    ) ?? null;
  }

  exchange(coins) {
    return this.economy.exchangeCoinsForDiamonds(coins);
  }

  exchangeAll() {
    const balance = this.economy.getBalance();
    const coins = Math.floor(
      balance.coins / this.exchangeRate
    ) * this.exchangeRate;

    if (coins === 0) {
      return {
        success: false,
        reason: 'insufficient-coins'
      };
    }

    return this.exchange(coins);
  }

  getExchangeRate() {
    return this.exchangeRate;
  }

  getBalance() {
    return this.economy.getBalance();
  }
}
