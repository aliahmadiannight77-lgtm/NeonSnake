
const GAME_CONFIG = Object.freeze({
  app: {
    name: 'NeonSnake',
    version: '1.0.0'
  },

  board: {
    columns: 20,
    rows: 20,
    width: 600,
    height: 600
  },

  gameplay: {
    initialSnakeLength: 3,
    initialDirection: 'right',
    baseSpeed: 7,
    maxSpeed: 13,
    speedAcceleration: 0.15,
    pointsPerFood: 10,
    coinsPerFood: 5,
    foodsPerLevel: 5
  },

  economy: {
    startingCoins: 0,
    startingDiamonds: 0,
    coinsPerDiamond: 50
  },

  progression: {
    startingLevel: 1,
    experiencePerFood: 10,
    experiencePerLevel: 100
  },

  storage: {
    prefix: 'neonsnake:',
    version: 1
  },

  controls: {
    keyboard: true,
    touch: true
  },

  effects: {
    particles: true,
    glow: true,
    animations: true
  }
});

export default GAME_CONFIG;
export { GAME_CONFIG };
