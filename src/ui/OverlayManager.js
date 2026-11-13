
export default class OverlayManager {
  constructor({
    closeOnBackdrop = true,
    closeOnEscape = true,
    lockBodyScroll = true
  } = {}) {
    this.overlays = new Map();
    this.activeOverlay = null;

    this.options = {
      closeOnBackdrop,
      closeOnEscape,
      lockBodyScroll
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    document.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeydown);
  }

  register(name, elementOrSelector, options = {}) {
    if (!name || typeof name !== 'string') {
      throw new TypeError('Overlay name must be a string.');
    }

    const element = typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;

    if (!(element instanceof HTMLElement)) {
      throw new Error(`Overlay element not found: ${name}`);
    }

    this.overlays.set(name, {
      element,
      closeOnBackdrop: options.closeOnBackdrop ?? this.options.closeOnBackdrop,
      closeOnEscape: options.closeOnEscape ?? this.options.closeOnEscape,
      onOpen: options.onOpen || null,
      onClose: options.onClose || null
    });

    element.hidden = true;
    element.setAttribute('aria-hidden', 'true');

    return true;
  }

  open(name) {
    const overlay = this.overlays.get(name);

    if (!overlay) {
      console.warn(`Overlay "${name}" is not registered.`);
      return false;
    }

    if (this.activeOverlay === name) return true;

    if (this.activeOverlay) {
      this.close(this.activeOverlay);
    }

    overlay.element.hidden = false;
    overlay.element.classList.add('is-visible');
    overlay.element.setAttribute('aria-hidden', 'false');

    this.activeOverlay = name;

    if (this.options.lockBodyScroll) {
      document.body.classList.add('has-open-overlay');
    }

    if (typeof overlay.onOpen === 'function') {
      overlay.onOpen();
    }

    const focusable = overlay.element.querySelector(
      'button:not([disabled]), input:not([disabled]), [tabindex="0"]'
    );

    focusable?.focus();

    return true;
  }

  close(name = this.activeOverlay) {
    if (!name) return false;

    const overlay = this.overlays.get(name);

    if (!overlay) return false;

    overlay.element.hidden = true;
    overlay.element.classList.remove('is-visible');
    overlay.element.setAttribute('aria-hidden', 'true');

    if (this.activeOverlay === name) {
      this.activeOverlay = null;
    }

    if (!this.activeOverlay && this.options.lockBodyScroll) {
      document.body.classList.remove('has-open-overlay');
    }

    if (typeof overlay.onClose === 'function') {
      overlay.onClose();
    }

    return true;
  }

  closeAll() {
    for (const name of this.overlays.keys()) {
      this.close(name);
    }
  }

  toggle(name) {
    if (this.activeOverlay === name) {
      return this.close(name);
    }

    return this.open(name);
  }

  handleClick(event) {
    const openTrigger = event.target.closest('[data-overlay-open]');

    if (openTrigger) {
      this.open(openTrigger.dataset.overlayOpen);
      return;
    }

    const closeTrigger = event.target.closest('[data-overlay-close]');

    if (closeTrigger) {
      this.close(closeTrigger.dataset.overlayClose || this.activeOverlay);
      return;
    }

    if (!this.activeOverlay) return;

    const overlay = this.overlays.get(this.activeOverlay);

    if (
      overlay?.closeOnBackdrop &&
      event.target === overlay.element
    ) {
      this.close(this.activeOverlay);
    }
  }

  handleKeydown(event) {
    if (event.key !== 'Escape' || !this.activeOverlay) return;

    const overlay = this.overlays.get(this.activeOverlay);

    if (overlay?.closeOnEscape) {
      this.close(this.activeOverlay);
    }
  }

  isOpen(name) {
    return this.activeOverlay === name;
  }

  getActiveOverlay() {
    return this.activeOverlay;
  }

  unregister(name) {
    const overlay = this.overlays.get(name);

    if (!overlay) return false;

    if (this.activeOverlay === name) {
      this.close(name);
    }

    this.overlays.delete(name);

    return true;
  }

  destroy() {
    this.closeAll();

    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeydown);

    this.overlays.clear();
    this.activeOverlay = null;
  }
}
