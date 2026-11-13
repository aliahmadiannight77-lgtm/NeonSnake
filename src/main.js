
import './styles/main.css';

import LanguageSelector from './ui/LanguageSelector.js';
import i18n, { t } from './i18n/index.js';

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
    this.languageSelector = null;
    this.unsubscribeLanguage = null;
  }

  async init() {
    if (this.initialized) return;

    try {
      this.validateDOM();
      this.bindGlobalEvents();
      this.initializeLanguageSystem();
      this.initialized = true;

      console.info(
        `[${this.config.name}] v${this.config.version} initialized.`
      );
    } catch (error) {
      console.error('[NeonSnake] Initialization failed:', error);
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

  initializeLanguageSystem() {
    this.createLanguageTrigger();

    this.languageSelector = new LanguageSelector({
      container: document.body,
      trigger: document.getElementById('languageSelectorTrigger'),

      onChange: (language, direction) => {
        this.applyLanguage(language, direction);

        window.dispatchEvent(
          new CustomEvent('neonsnake:language-updated', {
            detail: { language, direction }
          })
        );
      }
    });

    this.languageSelector.init();

    this.unsubscribeLanguage = i18n.subscribe(
      (language, direction) => {
        this.applyLanguage(language, direction);
      }
    );

    this.applyLanguage(
      i18n.getLanguage(),
      i18n.getDirection()
    );
  }

  createLanguageTrigger() {
    if (document.getElementById('languageSelectorTrigger')) {
      return;
    }

    const trigger = document.createElement('button');

    trigger.id = 'languageSelectorTrigger';
    trigger.type = 'button';
    trigger.className = 'language-trigger';

    trigger.setAttribute('aria-label', 'Select language');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.innerHTML = `
      <span class="language-trigger__flag" aria-hidden="true"></span>
      <span class="language-trigger__name"></span>
      <span class="language-trigger__arrow" aria-hidden="true">⌄</span>
    `;

    const topbar = document.querySelector('.topbar');

    if (topbar) {
      const actions = topbar.querySelector(
        '.topbar__actions, .topbar-actions'
      );

      if (actions) {
        actions.prepend(trigger);
      } else {
        topbar.appendChild(trigger);
      }
    } else {
      document.body.appendChild(trigger);
    }
  }

  applyLanguage(language, direction) {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;

    document.documentElement.dataset.language = language;

    this.translateDocument();

    this.updateLanguageSpecificElements(language, direction);
  }

  translateDocument() {
    // Translate elements with data-i18n.
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;

      if (!key) return;

      const translatedText = t(key);

      if (typeof translatedText === 'string') {
        element.textContent = translatedText;
      }
    });

    // Translate placeholders.
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.dataset.i18nPlaceholder;

      if (key) {
        element.setAttribute('placeholder', t(key));
      }
    });

    // Translate accessibility labels.
    document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
      const key = element.dataset.i18nAriaLabel;

      if (key) {
        element.setAttribute('aria-label', t(key));
      }
    });

    // Translate title attributes.
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.dataset.i18nTitle;

      if (key) {
        element.setAttribute('title', t(key));
      }
    });

    // Update the page title.
    document.title = `NeonSnake | ${t('common.gameName')}`;
  }

  updateLanguageSpecificElements(language, direction) {
    const canvas = document.getElementById('gameCanvas');

    if (canvas) {
      canvas.setAttribute('aria-label', t('game.title'));
    }

    // Keep game movement directions independent of text direction.
    document.querySelectorAll('[data-direction]').forEach(button => {
      button.setAttribute('dir', 'ltr');
    });

    // Notify other modules that depend on language or direction.
    document.dispatchEvent(
      new CustomEvent('neonsnake:direction-changed', {
        detail: {
          language,
          direction,
          isRTL: direction === 'rtl'
        }
      })
    );
  }

  bindGlobalEvents() {
    window.addEventListener('error', event => {
      console.error('[NeonSnake] Runtime error:', event.error);
    });

    window.addEventListener('unhandledrejection', event => {
      console.error(
        '[NeonSnake] Unhandled promise rejection:',
        event.reason
      );
    });

    document.addEventListener('visibilitychange', () => {
      const eventName = document.hidden
        ? 'neonsnake:visibility-hidden'
        : 'neonsnake:visibility-visible';

      window.dispatchEvent(new CustomEvent(eventName));
    });

    window.addEventListener('neonsnake:language-changed', event => {
      const { language, direction } = event.detail ?? {};

      if (language && direction) {
        this.applyLanguage(language, direction);
      }
    });
  }

  showFatalError() {
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');

    if (overlay) {
      overlay.hidden = false;
    }

    if (title) {
      title.textContent = 'خطا در راه‌اندازی بازی';
    }

    if (message) {
      message.textContent = 'لطفاً صفحه را دوباره بارگذاری کنید.';
    }
  }

  destroy() {
    this.languageSelector?.destroy();
    this.languageSelector = null;

    this.unsubscribeLanguage?.();
    this.unsubscribeLanguage = null;

    this.initialized = false;
  }
}

const app = new NeonSnakeApp(APP_CONFIG);

function startApplication() {
  app.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApplication, {
    once: true
  });
} else {
  startApplication();
}

export default app;
