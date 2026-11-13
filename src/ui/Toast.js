
export default class Toast {
  constructor(options = {}) {
    this.container = null;
    this.maxVisible = options.maxVisible ?? 4;
    this.defaultDuration = options.duration ?? 2800;
    this.items = new Set();

    this.createContainer();
  }

  createContainer() {
    if (typeof document === "undefined") return;

    this.container = document.querySelector("#toast-container");

    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className = "toast-container";
      this.container.setAttribute("aria-live", "polite");
      this.container.setAttribute("aria-atomic", "false");
      document.body.appendChild(this.container);
    }
  }

  show(message, options = {}) {
    if (!this.container) return null;

    while (this.items.size >= this.maxVisible) {
      const oldest = this.items.values().next().value;
      this.dismiss(oldest);
    }

    const type = options.type ?? "info";
    const duration = Math.max(
      0,
      options.duration ?? this.defaultDuration
    );

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const content = document.createElement("span");
    content.className = "toast__message";
    content.textContent = String(message);

    const closeButton = document.createElement("button");
    closeButton.className = "toast__close";
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "بستن اعلان");

    closeButton.addEventListener("click", () => {
      this.dismiss(toast);
    });

    toast.append(content, closeButton);
    this.container.appendChild(toast);
    this.items.add(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    if (duration > 0) {
      toast._timeout = window.setTimeout(() => {
        this.dismiss(toast);
      }, duration);
    }

    return toast;
  }

  success(message, options = {}) {
    return this.show(message, { ...options, type: "success" });
  }

  error(message, options = {}) {
    return this.show(message, { ...options, type: "error" });
  }

  warning(message, options = {}) {
    return this.show(message, { ...options, type: "warning" });
  }

  info(message, options = {}) {
    return this.show(message, { ...options, type: "info" });
  }

  dismiss(toast) {
    if (!toast || !this.items.has(toast)) return;

    window.clearTimeout(toast._timeout);
    this.items.delete(toast);
    toast.classList.remove("is-visible");

    const remove = () => toast.remove();
    toast.addEventListener("transitionend", remove, { once: true });

    window.setTimeout(remove, 350);
  }

  clear() {
    for (const toast of [...this.items]) {
      this.dismiss(toast);
    }
  }

  destroy() {
    this.clear();
    this.container?.remove();
    this.container = null;
  }
}
