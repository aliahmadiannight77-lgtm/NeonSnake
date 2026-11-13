
export default class Modal {
  constructor() {
    this.overlay = null;
    this.dialog = null;
    this.titleElement = null;
    this.messageElement = null;
    this.confirmButton = null;
    this.cancelButton = null;
    this.previousFocus = null;
    this.resolvePromise = null;
    this.onConfirm = null;
    this.isOpen = false;
    this.isBusy = false;

    this.createElements();
  }

  createElements() {
    if (typeof document === "undefined") return;

    this.overlay = document.createElement("div");
    this.overlay.className = "modal-overlay";
    this.overlay.setAttribute("aria-hidden", "true");

    this.dialog = document.createElement("section");
    this.dialog.className = "modal";
    this.dialog.setAttribute("role", "dialog");
    this.dialog.setAttribute("aria-modal", "true");
    this.dialog.setAttribute("aria-labelledby", "modal-title");
    this.dialog.tabIndex = -1;

    const header = document.createElement("div");
    header.className = "modal__header";

    this.titleElement = document.createElement("h2");
    this.titleElement.id = "modal-title";
    this.titleElement.className = "modal__title";

    const closeButton = document.createElement("button");
    closeButton.className = "modal__close";
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "بستن پنجره");
    closeButton.addEventListener("click", () => this.close(false));

    header.append(this.titleElement, closeButton);

    this.messageElement = document.createElement("div");
    this.messageElement.className = "modal__message";

    const actions = document.createElement("div");
    actions.className = "modal__actions";

    this.cancelButton = document.createElement("button");
    this.cancelButton.className = "modal__button modal__button--cancel";
    this.cancelButton.type = "button";
    this.cancelButton.addEventListener("click", () => this.close(false));

    this.confirmButton = document.createElement("button");
    this.confirmButton.className = "modal__button modal__button--confirm";
    this.confirmButton.type = "button";
    this.confirmButton.addEventListener("click", () => this.confirm());

    actions.append(this.cancelButton, this.confirmButton);
    this.dialog.append(header, this.messageElement, actions);
    this.overlay.appendChild(this.dialog);

    this.overlay.addEventListener("click", event => {
      if (event.target === this.overlay) {
        this.close(false);
      }
    });

    this.handleKeydown = event => {
      if (!this.isOpen) return;

      if (event.key === "Escape" && !this.isBusy) {
        this.close(false);
      }

      if (event.key === "Tab") {
        this.keepFocusInside(event);
      }
    };

    document.body.appendChild(this.overlay);
  }

  open(options = {}) {
    if (!this.overlay) {
      return Promise.resolve(false);
    }

    if (this.isOpen) {
      this.close(false);
    }

    this.previousFocus = document.activeElement;
    this.titleElement.textContent = options.title ?? "تأیید";
    this.messageElement.textContent = options.message ?? "";
    this.confirmButton.textContent = options.confirmText ?? "تأیید";
    this.cancelButton.textContent = options.cancelText ?? "انصراف";

    this.cancelButton.hidden = options.showCancel === false;
    this.onConfirm = options.onConfirm ?? null;
    this.isBusy = false;
    this.isOpen = true;

    this.overlay.classList.add("is-open");
    this.overlay.setAttribute("aria-hidden", "false");

    document.addEventListener("keydown", this.handleKeydown);

    requestAnimationFrame(() => {
      this.dialog?.focus();
    });

    return new Promise(resolve => {
      this.resolvePromise = resolve;
    });
  }

  async confirm() {
    if (!this.isOpen || this.isBusy) return;

    this.isBusy = true;
    this.confirmButton.disabled = true;

    try {
      const result = await this.onConfirm?.();

      if (result === false) {
        this.isBusy = false;
        this.confirmButton.disabled = false;
        return;
      }

      this.close(true);
    } catch (error) {
      console.error("Modal confirmation failed:", error);
      this.isBusy = false;
      this.confirmButton.disabled = false;
    }
  }

  keepFocusInside(event) {
    const focusable = this.dialog.querySelectorAll(
      'button:not([disabled]):not([hidden]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const elements = [...focusable];

    if (elements.length === 0) {
      event.preventDefault();
      this.dialog.focus();
      return;
    }

    const first = elements[0];
    const last = elements[elements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  close(result = false) {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.isBusy = false;
    this.confirmButton.disabled = false;

    this.overlay.classList.remove("is-open");
    this.overlay.setAttribute("aria-hidden", "true");

    document.removeEventListener("keydown", this.handleKeydown);

    const resolve = this.resolvePromise;
    this.resolvePromise = null;

    resolve?.(result);
    this.previousFocus?.focus?.();
    this.previousFocus = null;
    this.onConfirm = null;
  }

  async confirmAction(options = {}) {
    return this.open({
      title: options.title ?? "تأیید عملیات",
      message: options.message ?? "آیا از انجام این عملیات مطمئن هستید؟",
      confirmText: options.confirmText ?? "بله، ادامه بده",
      cancelText: options.cancelText ?? "انصراف",
      onConfirm: options.onConfirm
    });
  }

  alert(title, message, options = {}) {
    return this.open({
      title,
      message,
      confirmText: options.confirmText ?? "متوجه شدم",
      showCancel: false
    });
  }

  destroy() {
    if (this.isOpen) {
      this.close(false);
    }

    this.overlay?.remove();

    this.overlay = null;
    this.dialog = null;
    this.titleElement = null;
    this.messageElement = null;
    this.confirmButton = null;
    this.cancelButton = null;
  }
}
