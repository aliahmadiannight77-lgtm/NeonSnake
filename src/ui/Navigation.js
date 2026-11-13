
export default class Navigation {
  constructor(options = {}) {
    this.activePage = options.initialPage ?? "home";
    this.pages = new Map();
    this.buttons = new Map();
    this.listeners = new Set();

    this.pageSelector = options.pageSelector ?? "[data-page]";
    this.buttonSelector = options.buttonSelector ?? "[data-navigate]";

    this.handleClick = this.handleClick.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);

    this.initialize();
  }

  initialize() {
    if (typeof document === "undefined") return;

    document.querySelectorAll(this.pageSelector).forEach(page => {
      const name = page.dataset.page;
      if (name) this.pages.set(name, page);
    });

    document.querySelectorAll(this.buttonSelector).forEach(button => {
      const name = button.dataset.navigate;
      if (name) this.buttons.set(button, name);
    });

    document.addEventListener("click", this.handleClick);
    document.addEventListener("keydown", this.handleKeydown);

    this.show(this.activePage, false);
  }

  handleClick(event) {
    const button = event.target.closest(this.buttonSelector);
    if (!button || button.disabled) return;

    const page = button.dataset.navigate;
    if (page) this.show(page);
  }

  handleKeydown(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "Escape") {
      this.emit("escape", { page: this.activePage });
    }
  }

  show(pageName, notify = true) {
    if (!this.pages.has(pageName)) {
      return false;
    }

    const previousPage = this.activePage;
    this.activePage = pageName;

    for (const [name, element] of this.pages) {
      const active = name === pageName;

      element.hidden = !active;
      element.classList.toggle("is-active", active);
      element.setAttribute("aria-hidden", String(!active));
    }

    for (const [button, name] of this.buttons) {
      const active = name === pageName;

      button.classList.toggle("is-active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    }

    if (notify && previousPage !== pageName) {
      this.emit("change", {
        page: pageName,
        previousPage
      });
    }

    return true;
  }

  registerPage(name, element) {
    if (!name || !element) return false;

    this.pages.set(name, element);
    return true;
  }

  subscribe(callback) {
    if (typeof callback !== "function") {
      return () => {};
    }

    this.listeners.add(callback);

    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(event, data) {
    for (const callback of this.listeners) {
      try {
        callback(event, data);
      } catch (error) {
        console.error("Navigation listener error:", error);
      }
    }
  }

  getCurrentPage() {
    return this.activePage;
  }

  destroy() {
    document.removeEventListener("click", this.handleClick);
    document.removeEventListener("keydown", this.handleKeydown);

    this.listeners.clear();
    this.pages.clear();
    this.buttons.clear();
  }
}
