
import i18n, { LANGUAGES, t } from '../i18n/index.js';

const SELECTOR_ID = 'languageSelector';
const TRIGGER_ID = 'languageSelectorTrigger';

class LanguageSelector {
  constructor(options = {}) {
    this.options = {
      container: options.container ?? document.body,
      trigger: options.trigger ?? null,
      onChange: options.onChange ?? null
    };

    this.isOpen = false;
    this.searchQuery = '';
    this.root = null;
    this.trigger = null;
    this.unsubscribe = null;

    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  init() {
    if (this.root) return this;

    this.trigger = this.resolveTrigger();
    this.createPanel();
    this.bindEvents();
    this.renderLanguages();
    this.updateTrigger();

    this.unsubscribe = i18n.subscribe(() => {
      this.renderLanguages();
      this.updateTrigger();
    });

    return this;
  }

  resolveTrigger() {
    if (this.options.trigger instanceof HTMLElement) {
      return this.options.trigger;
    }

    const existing = document.getElementById(TRIGGER_ID);
    if (existing) return existing;

    const button = document.createElement('button');
    button.id = TRIGGER_ID;
    button.type = 'button';
    button.className = 'language-trigger';
    button.setAttribute('aria-label', 'Select language');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');

    button.innerHTML = `
      <span class="language-trigger__flag"></span>
      <span class="language-trigger__name"></span>
      <span class="language-trigger__arrow" aria-hidden="true">⌄</span>
    `;

    this.options.container.appendChild(button);
    return button;
  }

  createPanel() {
    this.root = document.createElement('section');
    this.root.id = SELECTOR_ID;
    this.root.className = 'language-panel';
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'false');
    this.root.setAttribute('aria-labelledby', 'languagePanelTitle');

    this.root.innerHTML = `
      <div class="language-panel__backdrop"></div>

      <div class="language-panel__content">
        <header class="language-panel__header">
          <div>
            <span class="language-panel__eyebrow">NEONSNAKE / LANGUAGE</span>
            <h2 id="languagePanelTitle" class="language-panel__title">
              ${this.escapeHTML(t('language.title'))}
            </h2>
            <p class="language-panel__subtitle">
              ${this.escapeHTML(t('language.subtitle'))}
            </p>
          </div>

          <button
            type="button"
            class="language-panel__close"
            data-action="close"
            aria-label="${this.escapeHTML(t('common.close'))}"
          >×</button>
        </header>

        <div class="language-panel__current">
          <span class="language-panel__current-label">
            ${this.escapeHTML(t('language.current'))}
          </span>
          <span class="language-panel__current-value" data-current-language></span>
        </div>

        <label class="language-panel__search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            class="language-panel__search-input"
            placeholder="${this.escapeHTML(t('language.searchPlaceholder'))}"
            autocomplete="off"
            aria-label="${this.escapeHTML(t('common.search'))}"
          />
        </label>

        <div
          class="language-panel__list"
          data-language-list
          role="listbox"
          aria-label="${this.escapeHTML(t('language.title'))}"
        ></div>

        <p class="language-panel__notice">
          <span aria-hidden="true">ⓘ</span>
          ${this.escapeHTML(t('language.directionNotice'))}
        </p>
      </div>
    `;

    this.options.container.appendChild(this.root);
  }

  bindEvents() {
    this.trigger.addEventListener('click', () => this.toggle());

    this.root.addEventListener('click', event => {
      const closeButton = event.target.closest('[data-action="close"]');
      const backdrop = event.target.classList.contains(
        'language-panel__backdrop'
      );

      if (closeButton || backdrop) {
        this.close();
        return;
      }

      const languageButton = event.target.closest('[data-language-code]');
      if (languageButton) {
        this.selectLanguage(languageButton.dataset.languageCode);
      }
    });

    const searchInput = this.root.querySelector(
      '.language-panel__search-input'
    );

    searchInput.addEventListener('input', event => {
      this.searchQuery = event.target.value.trim().toLocaleLowerCase();
      this.renderLanguages();
    });

    document.addEventListener('click', this.handleDocumentClick);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  handleDocumentClick(event) {
    if (!this.isOpen) return;

    if (
      this.root.contains(event.target) ||
      this.trigger.contains(event.target)
    ) {
      return;
    }

    this.close();
  }

  handleKeyDown(event) {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      this.close();
      this.trigger.focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const buttons = [
        ...this.root.querySelectorAll('[data-language-code]')
      ];

      if (!buttons.length) return;

      const currentIndex = buttons.indexOf(document.activeElement);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + direction + buttons.length) % buttons.length;

      event.preventDefault();
      buttons[nextIndex].focus();
    }
  }

  renderLanguages() {
    if (!this.root) return;

    const list = this.root.querySelector('[data-language-list]');
    const currentLanguage = i18n.getLanguage();

    const filteredLanguages = LANGUAGES.filter(language => {
      const searchableText = [
        language.code,
        language.name,
        language.nativeName
      ].join(' ').toLocaleLowerCase();

      return searchableText.includes(this.searchQuery);
    });

    list.replaceChildren();

    if (filteredLanguages.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'language-panel__empty';
      empty.textContent = t('language.noResults');
      list.appendChild(empty);
      this.updateCurrentLanguage();
      return;
    }

    const fragment = document.createDocumentFragment();

    filteredLanguages.forEach(language => {
      const isActive = language.code === currentLanguage;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'language-option';
      button.dataset.languageCode = language.code;
      button.dataset.active = String(isActive);
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(isActive));

      if (isActive) button.classList.add('is-active');

      const flag = document.createElement('span');
      flag.className = 'language-option__flag';
      flag.textContent = language.flag;
      flag.setAttribute('aria-hidden', 'true');

      const names = document.createElement('span');
      names.className = 'language-option__names';

      const nativeName = document.createElement('span');
      nativeName.className = 'language-option__native';
      nativeName.textContent = language.nativeName;

      const englishName = document.createElement('span');
      englishName.className = 'language-option__english';
      englishName.textContent = language.name;

      names.append(nativeName, englishName);

      const code = document.createElement('span');
      code.className = 'language-option__code';
      code.textContent = language.code.toUpperCase();

      const indicator = document.createElement('span');
      indicator.className = 'language-option__indicator';
      indicator.textContent = isActive ? '✓' : '';

      button.append(flag, names, code, indicator);
      fragment.appendChild(button);
    });

    list.appendChild(fragment);
    this.updateCurrentLanguage();
  }

  updateCurrentLanguage() {
    if (!this.root) return;

    const language = i18n.getLanguageInfo();
    const current = this.root.querySelector('[data-current-language]');

    if (current) {
      current.textContent = `${language.flag} ${language.nativeName}`;
    }
  }

  updateTrigger() {
    if (!this.trigger) return;

    const language = i18n.getLanguageInfo();

    const flag = this.trigger.querySelector('.language-trigger__flag');
    const name = this.trigger.querySelector('.language-trigger__name');

    if (flag) flag.textContent = language.flag;
    if (name) name.textContent = language.nativeName;

    this.trigger.setAttribute(
      'aria-label',
      `${t('language.current')}: ${language.nativeName}`
    );
  }

  selectLanguage(code) {
    const changed = i18n.setLanguage(code);

    this.searchQuery = '';

    const searchInput = this.root.querySelector(
      '.language-panel__search-input'
    );

    searchInput.value = '';

    this.renderLanguages();
    this.updateTrigger();
    this.close();

    if (changed && typeof this.options.onChange === 'function') {
      this.options.onChange(code, i18n.getDirection());
    }

    if (changed) {
      window.dispatchEvent(new CustomEvent('neonsnake:toast', {
        detail: {
          type: 'success',
          message: t('language.changeSuccess')
        }
      }));
    }
  }

  open() {
    if (this.isOpen || !this.root) return;

    this.isOpen = true;
    this.root.hidden = false;
    this.root.classList.remove('is-closing');

    requestAnimationFrame(() => {
      this.root.classList.add('is-open');

      const searchInput = this.root.querySelector(
        '.language-panel__search-input'
      );

      searchInput?.focus();
    });

    this.trigger.setAttribute('aria-expanded', 'true');
    this.renderLanguages();
  }

  close() {
    if (!this.isOpen || !this.root) return;

    this.isOpen = false;
    this.root.classList.remove('is-open');
    this.root.classList.add('is-closing');
    this.trigger.setAttribute('aria-expanded', 'false');

    window.setTimeout(() => {
      if (!this.isOpen) {
        this.root.hidden = true;
        this.root.classList.remove('is-closing');
      }
    }, 220);
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  destroy() {
    document.removeEventListener('click', this.handleDocumentClick);
    document.removeEventListener('keydown', this.handleKeyDown);

    this.unsubscribe?.();
    this.unsubscribe = null;

    this.root?.remove();

    if (this.trigger?.id === TRIGGER_ID) {
      this.trigger.remove();
    }

    this.root = null;
    this.trigger = null;
    this.isOpen = false;
  }
}

export default LanguageSelector;
