
/**
 * NeonSnake - Helper Utilities
 * توابع عمومی و قابل استفاده مجدد
 */

export const Helpers = {
  /**
   * محدود کردن عدد به یک بازه مشخص
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * تولید عدد صحیح تصادفی بین min و max
   */
  randomInt(min, max) {
    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      throw new TypeError('min و max باید عدد صحیح باشند.');
    }

    if (max < min) {
      throw new RangeError('max نباید کوچک‌تر از min باشد.');
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * انتخاب یک عضو تصادفی از آرایه
   */
  randomItem(array) {
    if (!Array.isArray(array)) {
      throw new TypeError('ورودی باید آرایه باشد.');
    }

    if (array.length === 0) return null;

    return array[this.randomInt(0, array.length - 1)];
  },

  /**
   * ایجاد شناسه یکتا
   */
  generateId(prefix = 'id') {
    const randomPart =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return `${prefix}-${randomPart}`;
  },

  /**
   * بررسی عدد معتبر
   */
  isNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  },

  /**
   * بررسی عدد صحیح مثبت یا صفر
   */
  isNonNegativeInteger(value) {
    return Number.isSafeInteger(value) && value >= 0;
  },

  /**
   * تبدیل مقدار به عدد با مقدار پیش‌فرض
   */
  toNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
  },

  /**
   * ایجاد تأخیر قابل انتظار با Promise
   */
  sleep(milliseconds) {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
      throw new RangeError('مدت زمان باید عددی مثبت یا صفر باشد.');
    }

    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  },

  /**
   * دریافت زمان فعلی
   */
  now() {
    return Date.now();
  },

  /**
   * تبدیل زمان به فرمت خوانا
   */
  formatTime(milliseconds) {
    const totalSeconds = Math.max(
      0,
      Math.floor(milliseconds / 1000)
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },

  /**
   * بررسی وجود عنصر در DOM
   */
  getElement(id, required = false) {
    const element = document.getElementById(id);

    if (!element && required) {
      throw new Error(`عنصر DOM با شناسه "${id}" پیدا نشد.`);
    }

    return element;
  },

  /**
   * دریافت چند عنصر با Selector
   */
  getElements(selector, parent = document) {
    if (typeof selector !== 'string' || !selector.trim()) {
      throw new TypeError('Selector معتبر نیست.');
    }

    return Array.from(parent.querySelectorAll(selector));
  },

  /**
   * تغییر متن یک عنصر
   */
  setText(id, value) {
    const element = this.getElement(id);

    if (!element) return false;

    element.textContent = String(value);
    return true;
  },

  /**
   * نمایش یا مخفی کردن عنصر
   */
  setVisible(elementOrId, visible) {
    const element =
      typeof elementOrId === 'string'
        ? this.getElement(elementOrId)
        : elementOrId;

    if (!element) return false;

    element.hidden = !Boolean(visible);

    return true;
  },

  /**
   * افزودن کلاس به عنصر
   */
  addClass(element, ...classes) {
    if (!(element instanceof Element)) return false;

    element.classList.add(...classes);
    return true;
  },

  /**
   * حذف کلاس از عنصر
   */
  removeClass(element, ...classes) {
    if (!(element instanceof Element)) return false;

    element.classList.remove(...classes);
    return true;
  },

  /**
   * تبدیل مقدار به آرایه
   */
  toArray(value) {
    if (Array.isArray(value)) return [...value];

    if (value === null || value === undefined) return [];

    return [value];
  },

  /**
   * حذف اعضای تکراری آرایه
   */
  unique(array) {
    if (!Array.isArray(array)) {
      throw new TypeError('ورودی باید آرایه باشد.');
    }

    return [...new Set(array)];
  },

  /**
   * کپی امن یک داده ساده و قابل Clone
   */
  clone(value) {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
  },

  /**
   * بررسی نوع Plain Object
   */
  isPlainObject(value) {
    if (value === null || typeof value !== 'object') {
      return false;
    }

    const prototype = Object.getPrototypeOf(value);

    return (
      prototype === Object.prototype ||
      prototype === null
    );
  },

  /**
   * ادغام عمیق آبجکت‌های ساده
   */
  deepMerge(target, source) {
    if (!this.isPlainObject(target) || !this.isPlainObject(source)) {
      throw new TypeError('هر دو ورودی باید آبجکت ساده باشند.');
    }

    const result = { ...target };

    for (const [key, value] of Object.entries(source)) {
      if (
        this.isPlainObject(value) &&
        this.isPlainObject(result[key])
      ) {
        result[key] = this.deepMerge(result[key], value);
      } else {
        result[key] = this.clone(value);
      }
    }

    return result;
  },

  /**
   * محاسبه درصد پیشرفت
   */
  percentage(current, total) {
    if (
      !Number.isFinite(current) ||
      !Number.isFinite(total) ||
      total <= 0
    ) {
      return 0;
    }

    return this.clamp((current / total) * 100, 0, 100);
  },

  /**
   * تبدیل درجه به رادیان
   */
  toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  },

  /**
   * محاسبه فاصله اقلیدسی بین دو نقطه
   */
  distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  },

  /**
   * بررسی برخورد دو مستطیل
   */
  rectanglesIntersect(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  },

  /**
   * اجرای تابع فقط یک بار
   */
  once(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('ورودی باید تابع باشد.');
    }

    let called = false;
    let result;

    return (...args) => {
      if (called) return result;

      called = true;
      result = callback(...args);

      return result;
    };
  },

  /**
   * محدودسازی تعداد اجرای تابع در بازه زمانی
   */
  throttle(callback, delay = 100) {
    if (typeof callback !== 'function') {
      throw new TypeError('ورودی باید تابع باشد.');
    }

    let lastExecution = 0;
    let timeoutId = null;

    return (...args) => {
      const remaining = delay - (Date.now() - lastExecution);

      if (remaining <= 0) {
        clearTimeout(timeoutId);
        timeoutId = null;
        lastExecution = Date.now();
        callback(...args);
        return;
      }

      if (timeoutId === null) {
        timeoutId = setTimeout(() => {
          lastExecution = Date.now();
          timeoutId = null;
          callback(...args);
        }, remaining);
      }
    };
  }
};

export default Helpers;
