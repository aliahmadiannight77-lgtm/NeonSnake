
import './styles/main.css';

const APP_CONFIG = {
  name: 'NeonSnake',
  version: '1.0.0',
  language: 'fa',
  direction: 'rtl'
};

class NeonSnakeApp {
  constructor(config) {
    this.config = config;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      this.validateDOM();
      this.bindGlobalEvents();

      this.initialized = true;

      console.info(
        `[${this.config.name}] v${this.config.version} initialized.`
      );
    } catch (error) {
      console.error('NeonSnake initialization failed:', error);
      this.showFatalError();
    }
  }

  validateDOM() {
    const requiredElements = [
      'gameCanvas',
      'coinBalance',
      'diamondBalance',
      'startGame',
      'pauseGame',
      'restartGame',
      'gameOverlay',
      'modalBackdrop',
      'toastContainer'
    ];

    const missingElements = requiredElements.filter(
      id => !document.getElementById(id)
    );

    if (missingElements.length > 0) {
      throw new Error(
        `Missing required DOM elements: ${missingElements.join(', ')}`
      );
    }
  }

  bindGlobalEvents() {
    window.addEventListener('error', event => {
      console.error('[NeonSnake] Runtime error:', event.error);
    });

    window.addEventListener('unhandledrejection', event => {
      console.error('[NeonSnake] Unhandled promise rejection:', event.reason);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        window.dispatchEvent(
          new CustomEvent('neonsnake:visibility-hidden')
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('neonsnake:visibility-visible')
        );
      }
    });
  }

  showFatalError() {
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');

    if (overlay) overlay.hidden = false;
    if (title) title.textContent = 'خطا در راه‌اندازی بازی';
    if (message) {
      message.textContent =
        'لطفاً صفحه را دوباره بارگذاری کنید.';
    }
  }
}

const app = new NeonSnakeApp(APP_CONFIG);

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

export default app;
