
const KEY_DIRECTIONS = {
  ArrowUp: 'up',
  KeyW: 'up',

  ArrowDown: 'down',
  KeyS: 'down',

  ArrowLeft: 'left',
  KeyA: 'left',

  ArrowRight: 'right',
  KeyD: 'right'
};

export default class Controls {
  constructor({
    snake,
    onPause = () => {},
    onStart = () => {},
    target = document,
    mobileSelector = '[data-direction]'
  } = {}) {
    if (!snake) {
      throw new TypeError('Controls requires a snake instance.');
    }

    this.snake = snake;
    this.onPause = onPause;
    this.onStart = onStart;
    this.target = target;
    this.mobileSelector = mobileSelector;

    this.enabled = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMobileClick = this.handleMobileClick.bind(this);
  }

  enable() {
    if (this.enabled) return;

    this.enabled = true;

    this.target.addEventListener(
      'keydown',
      this.handleKeyDown
    );

    document.querySelectorAll(this.mobileSelector).forEach(button => {
      button.addEventListener(
        'click',
        this.handleMobileClick
      );
    });
  }

  disable() {
    if (!this.enabled) return;

    this.enabled = false;

    this.target.removeEventListener(
      'keydown',
      this.handleKeyDown
    );

    document.querySelectorAll(this.mobileSelector).forEach(button => {
      button.removeEventListener(
        'click',
        this.handleMobileClick
      );
    });
  }

  handleKeyDown(event) {
    const direction = KEY_DIRECTIONS[event.code];

    if (direction) {
      event.preventDefault();
      this.changeDirection(direction);
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      this.onStart();
      return;
    }

    if (event.code === 'Escape' || event.code === 'KeyP') {
      event.preventDefault();
      this.onPause();
    }
  }

  handleMobileClick(event) {
    const button = event.currentTarget;
    const direction = button.dataset.direction;

    if (direction) {
      this.changeDirection(direction);
    }
  }

  changeDirection(direction) {
    this.snake.setDirection(direction);
  }

  setSnake(snake) {
    if (!snake) {
      throw new TypeError('A valid snake instance is required.');
    }

    this.snake = snake;
  }

  destroy() {
    this.disable();
  }
}
