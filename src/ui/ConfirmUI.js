
export default class ConfirmUI {
  constructor({
    overlaySelector = '#confirm-overlay'
  } = {}) {
    this.overlay = document.querySelector(overlaySelector);
    this.pendingResolver = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.init();
  }

  init() {
    if (!this.overlay) {
      this.createOverlay();
    }

    if (!this.overlay) return;

    this.overlay.addEventListener('click', this.handleClick);
    document.addEventListener('keydown', this.handleKeydown);
  }

  createOverlay() {
    const overlay = document.createElement('div');

    overlay.id = 'confirm-overlay';
    overlay.className = 'confirm-overlay';
    overlay.hidden = true;

    overlay.innerHTML = `
      <section
        class="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <button
          type="button"
          class="confirm-dialog__close"
          data-confirm-action="cancel"
          aria-label="بستن"
        >
          ×
        </button>

        <div class="confirm-dialog__icon">⚠️</div>

        <h2 id="confirm-title"></h2>
        <p id="confirm-message"></p>

        <div class="confirm-dialog__actions">
          <button
            type="button"
            data-confirm-action="cancel"
            class="confirm-dialog__button confirm-dialog__button--cancel"
          >
            انصراف
          </button>

          <button
            type="button"
            data-confirm-action="confirm"
            class="confirm-dialog__button confirm-dialog__button--confirm"
          >
            تأیید
          </button>
        </div>
      </section>
    `;

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  confirm({
    title = 'تأیید عملیات',
    message = 'آیا از انجام این عملیات مطمئن هستید؟',
    confirmText = 'تأیید',
    cancelText = 'انصراف',
    danger = false
  } = {}) {
    if (!this.overlay) {
      return Promise.resolve(false);
    }

    if (this.pendingResolver) {
      this.close(false);
    }

    const titleElement = this.overlay.querySelector('#confirm-title');
    const messageElement = this.overlay.querySelector('#confirm-message');
    const confirmButton = this.overlay.querySelector(
      '[data-confirm-action="confirm"]'
    );
    const cancelButton = this.overlay.querySelector(
      '[data-confirm-action="cancel"]'
    );

    titleElement.textContent = title;
    messageElement.textContent = message;
    confirmButton.textContent = confirmText;
    cancelButton.textContent = cancelText;

    confirmButton.classList.toggle(
      'confirm-dialog__button--danger',
      Boolean(danger)
    );

    this.overlay.hidden = false;
    this.overlay.classList.add('is-visible');

    document.body.classList.add('has-confirm-dialog');

    confirmButton.focus();

    return new Promise(resolve => {
      this.pendingResolver = resolve;
    });
  }

  handleClick(event) {
    if (!this.overlay) return;

    const actionButton = event.target.closest(
      '[data-confirm-action]'
    );

    if (actionButton && this.overlay.contains(actionButton)) {
      const action = actionButton.dataset.confirmAction;

      this.close(action === 'confirm');
      return;
    }

    if (event.target === this.overlay) {
      this.close(false);
    }
  }

  handleKeydown(event) {
    if (!this.overlay || this.overlay.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close(false);
    }

    if (event.key === 'Tab') {
      const focusable = [
        ...this.overlay.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled])'
        )
      ];

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  close(result = false) {
    if (!this.overlay) return;

    this.overlay.hidden = true;
    this.overlay.classList.remove('is-visible');

    document.body.classList.remove('has-confirm-dialog');

    if (this.pendingResolver) {
      const resolve = this.pendingResolver;
      this.pendingResolver = null;
      resolve(Boolean(result));
    }
  }

  async confirmAction(options, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function.');
    }

    const accepted = await this.confirm(options);

    if (!accepted) return false;

    return callback();
  }

  destroy() {
    this.close(false);

    if (this.overlay) {
      this.overlay.removeEventListener('click', this.handleClick);
    }

    document.removeEventListener('keydown', this.handleKeydown);

    if (this.overlay?.id === 'confirm-overlay') {
      this.overlay.remove();
    }

    this.overlay = null;
  }
}
