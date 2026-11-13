
import { REGULAR_SNAKES } from "../data/snakes.js";
import { LEGENDARY_SNAKES } from "../data/legendary.js";

export default class ShopUI {
  constructor(options = {}) {
    this.store = options.store;
    this.container = document.querySelector(
      options.containerSelector ?? "#shop-container"
    );

    this.toast = options.toast ?? null;
    this.activeCategory = "regular";
    this.currencyElements = {
      coins: document.querySelector("#coins"),
      diamonds: document.querySelector("#diamonds")
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleCategoryClick = this.handleCategoryClick.bind(this);

    this.initialize();
  }

  initialize() {
    if (!this.container || !this.store) return;

    this.container.addEventListener("click", this.handleClick);

    document.querySelectorAll("[data-shop-category]").forEach(button => {
      button.addEventListener("click", this.handleCategoryClick);
    });

    this.render();
  }

  handleCategoryClick(event) {
    const button = event.target.closest("[data-shop-category]");
    if (!button) return;

    const category = button.dataset.shopCategory;

    if (!["regular", "legendary"].includes(category)) return;

    this.activeCategory = category;

    document.querySelectorAll("[data-shop-category]").forEach(item => {
      const active = item.dataset.shopCategory === category;

      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });

    this.render();
  }

  handleClick(event) {
    const button = event.target.closest("[data-skin-action]");
    if (!button || button.disabled) return;

    const action = button.dataset.skinAction;
    const skinId = button.dataset.skinId;
    const category = button.dataset.skinCategory;

    if (!skinId || !["buy", "equip"].includes(action)) return;

    if (category === "regular") {
      this.handleRegularAction(action, skinId);
    } else if (category === "legendary") {
      this.handleLegendaryAction(action, skinId);
    }
  }

  handleRegularAction(action, skinId) {
    const result = action === "buy"
      ? this.store.buyRegular(skinId)
      : this.store.equip(skinId);

    this.handleResult(result, action);
  }

  handleLegendaryAction(action, skinId) {
    const result = action === "buy"
      ? this.store.buyLegendary(skinId)
      : this.store.equip(skinId);

    this.handleResult(result, action);
  }

  handleResult(result, action) {
    if (result?.success) {
      this.toast?.success(
        action === "buy" ? "اسکین با موفقیت خریداری شد." : "اسکین انتخاب شد."
      );
    } else {
      const messages = {
        insufficient_funds: "موجودی کافی نیست.",
        already_owned: "این اسکین را قبلاً خریده‌ای.",
        not_found: "اسکین موردنظر پیدا نشد.",
        not_owned: "ابتدا باید اسکین را خریداری کنی."
      };

      this.toast?.error(
        messages[result?.reason] ?? "عملیات انجام نشد."
      );
    }

    this.render();
  }

  getItems() {
    return this.activeCategory === "regular"
      ? REGULAR_SNAKES
      : LEGENDARY_SNAKES;
  }

  getItemState(item) {
    const owned = this.store.inventory.owns(item.id);
    const selected = this.store.inventory.selectedSnake === item.id;

    return { owned, selected };
  }

  createCard(item) {
    const { owned, selected } = this.getItemState(item);

    const currency = item.currency === "diamonds"
      ? "الماس"
      : "سکه";

    const price = Number(item.price).toLocaleString("en-US");

    let buttonText = `خرید · ${price} ${currency}`;
    let action = "buy";
    let disabled = false;

    if (selected) {
      buttonText = "انتخاب شده";
      action = "equip";
      disabled = true;
    } else if (owned) {
      buttonText = "انتخاب اسکین";
      action = "equip";
    }

    const card = document.createElement("article");
    card.className = `skin-card rarity-${item.rarity ?? "common"}`;
    card.dataset.skinId = item.id;

    const preview = document.createElement("div");
    preview.className = "skin-card__preview";

    const snake = document.createElement("div");
    snake.className = "skin-card__snake";

    const colors = item.colors ?? {};
    const primary = colors.head ?? colors.body ?? "#00f5ff";
    const secondary = colors.body ?? primary;

    snake.style.setProperty("--skin-primary", primary);
    snake.style.setProperty("--skin-secondary", secondary);

    preview.appendChild(snake);

    const name = document.createElement("h3");
    name.className = "skin-card__name";
    name.textContent = item.name;

    const description = document.createElement("p");
    description.className = "skin-card__description";
    description.textContent = item.description ?? "";

    const rarity = document.createElement("span");
    rarity.className = "skin-card__rarity";
    rarity.textContent = item.rarity ?? "common";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "skin-card__action";
    button.textContent = buttonText;
    button.disabled = disabled;
    button.dataset.skinAction = action;
    button.dataset.skinId = item.id;
    button.dataset.skinCategory = this.activeCategory;

    card.append(preview, name, description, rarity, button);

    return card;
  }

  render() {
    if (!this.container || !this.store) return;

    const fragment = document.createDocumentFragment();

    for (const item of this.getItems()) {
      fragment.appendChild(this.createCard(item));
    }

    this.container.replaceChildren(fragment);
    this.updateCurrency();
  }

  updateCurrency() {
    const balance = this.store.economy.getBalance();

    if (this.currencyElements.coins) {
      this.currencyElements.coins.textContent =
        Number(balance.coins).toLocaleString("en-US");
    }

    if (this.currencyElements.diamonds) {
      this.currencyElements.diamonds.textContent =
        Number(balance.diamonds).toLocaleString("en-US");
    }
  }

  refresh() {
    this.render();
  }

  destroy() {
    this.container?.removeEventListener("click", this.handleClick);

    document.querySelectorAll("[data-shop-category]").forEach(button => {
      button.removeEventListener("click", this.handleCategoryClick);
    });

    this.container = null;
    this.store = null;
  }
}
