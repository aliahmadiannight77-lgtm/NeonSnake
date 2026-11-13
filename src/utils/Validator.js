
/**
 * NeonSnake - Validation System
 * اعتبارسنجی داده‌ها و ورودی‌های بازی
 */

const Validator = {
  /**
   * بررسی مقدار عددی محدود و معتبر
   */
  isFiniteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  },

  /**
   * بررسی عدد صحیح در محدوده
   */
  isIntegerInRange(value, min, max) {
    return (
      Number.isSafeInteger(value) &&
      Number.isSafeInteger(min) &&
      Number.isSafeInteger(max) &&
      min <= max &&
      value >= min &&
      value <= max
    );
  },

  /**
   * بررسی رشته غیرخالی
   */
  isNonEmptyString(value, maxLength = 200) {
    return (
      typeof value === 'string' &&
      value.trim().length > 0 &&
      value.length <= maxLength
    );
  },

  /**
   * بررسی شناسه
   */
  isValidId(value) {
    return (
      typeof value === 'string' &&
      /^[a-zA-Z0-9_-]{1,100}$/.test(value)
    );
  },

  /**
   * بررسی رنگ CSS
   */
  isValidColor(value) {
    if (typeof value !== 'string') return false;

    const color = value.trim();

    if (
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function'
    ) {
      return CSS.supports('color', color);
    }

    return (
      /^#[0-9a-fA-F]{3,8}$/.test(color) ||
      /^rgba?\([\d\s.,%]+\)$/.test(color) ||
      /^hsla?\([\d\s.,%deg]+\)$/.test(color) ||
      /^[a-zA-Z]{1,30}$/.test(color)
    );
  },

  /**
   * بررسی جهت حرکت مار
   */
  isValidDirection(direction) {
    return ['up', 'down', 'left', 'right'].includes(direction);
  },

  /**
   * بررسی مختصات معتبر
   */
  isValidPosition(position, width, height) {
    if (
      !position ||
      typeof position !== 'object' ||
      !this.isFiniteNumber(position.x) ||
      !this.isFiniteNumber(position.y)
    ) {
      return false;
    }

    return (
      Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0 &&
      position.x >= 0 &&
      position.y >= 0 &&
      position.x < width &&
      position.y < height
    );
  },

  /**
   * بررسی آرایه‌ای از مختصات
   */
  isValidPositions(positions, width, height) {
    return (
      Array.isArray(positions) &&
      positions.length > 0 &&
      positions.every(position =>
        this.isValidPosition(position, width, height)
      )
    );
  },

  /**
   * بررسی اطلاعات اسکین معمولی
   */
  isValidSnakeSkin(skin) {
    if (!skin || typeof skin !== 'object') return false;

    return (
      this.isValidId(skin.id) &&
      this.isNonEmptyString(skin.name) &&
      this.isFiniteNumber(skin.price) &&
      Number.isSafeInteger(skin.price) &&
      skin.price >= 0 &&
      this.isValidColor(skin.color)
    );
  },

  /**
   * بررسی اطلاعات اسکین افسانه‌ای
   */
  isValidLegendarySkin(skin) {
    if (!this.isValidSnakeSkin(skin)) return false;

    return (
      Number.isSafeInteger(skin.diamondPrice) &&
      skin.diamondPrice >= 0
    );
  },

  /**
   * بررسی بسته الماس
   */
  isValidDiamondPack(pack) {
    if (!pack || typeof pack !== 'object') return false;

    return (
      this.isValidId(pack.id) &&
      this.isNonEmptyString(pack.name) &&
      Number.isSafeInteger(pack.diamonds) &&
      pack.diamonds > 0 &&
      Number.isSafeInteger(pack.price) &&
      pack.price > 0
    );
  },

  /**
   * بررسی موجودی کیف پول
   */
  isValidWallet(wallet) {
    if (!wallet || typeof wallet !== 'object') return false;

    return (
      Number.isSafeInteger(wallet.coins) &&
      wallet.coins >= 0 &&
      Number.isSafeInteger(wallet.diamonds) &&
      wallet.diamonds >= 0
    );
  },

  /**
   * بررسی آمار بازیکن
   */
  isValidPlayerStats(stats) {
    if (!stats || typeof stats !== 'object') return false;

    const fields = [
      'score',
      'highScore',
      'gamesPlayed',
      'foodsEaten'
    ];

    return fields.every(field =>
      Number.isSafeInteger(stats[field]) &&
      stats[field] >= 0
    );
  },

  /**
   * بررسی تنظیمات بازی
   */
  isValidSettings(settings) {
    if (!settings || typeof settings !== 'object') return false;

    return (
      typeof settings.soundEnabled === 'boolean' &&
      typeof settings.musicEnabled === 'boolean' &&
      typeof settings.showParticles === 'boolean' &&
      Number.isFinite(settings.volume) &&
      settings.volume >= 0 &&
      settings.volume <= 1 &&
      Number.isFinite(settings.speed) &&
      settings.speed > 0
    );
  },

  /**
   * بررسی داده‌های ذخیره‌شده
   */
  isValidSaveData(data) {
    if (!data || typeof data !== 'object') return false;

    return (
      Number.isSafeInteger(data.version) &&
      data.version >= 1 &&
      this.isValidWallet(data.wallet) &&
      this.isValidPlayerStats(data.stats) &&
      this.isNonEmptyString(data.selectedSkinId) &&
      Array.isArray(data.ownedSkins) &&
      data.ownedSkins.every(id => this.isValidId(id)) &&
      Array.isArray(data.ownedLegendarySkins) &&
      data.ownedLegendarySkins.every(id => this.isValidId(id)) &&
      this.isValidSettings(data.settings)
    );
  },

  /**
   * بررسی نوع داده مورد انتظار
   */
  hasType(value, type) {
    if (type === 'array') return Array.isArray(value);

    if (type === 'null') return value === null;

    return typeof value === type;
  },

  /**
   * اعتبارسنجی یک شیء با Schema ساده
   *
   * نمونه:
   * {
   *   name: { type: 'string', required: true },
   *   price: { type: 'number', required: true }
   * }
   */
  validateSchema(data, schema) {
    const errors = [];

    if (
      data === null ||
      typeof data !== 'object' ||
      Array.isArray(data)
    ) {
      return {
        valid: false,
        errors: ['داده ورودی باید یک آبجکت باشد.']
      };
    }

    if (
      schema === null ||
      typeof schema !== 'object' ||
      Array.isArray(schema)
    ) {
      return {
        valid: false,
        errors: ['Schema معتبر نیست.']
      };
    }

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if (value === undefined || value === null) {
        if (rules.required) {
          errors.push(`فیلد "${field}" الزامی است.`);
        }

        continue;
      }

      if (!this.hasType(value, rules.type)) {
        errors.push(`نوع داده فیلد "${field}" معتبر نیست.`);
        continue;
      }

      if (
        typeof value === 'number' &&
        !Number.isFinite(value)
      ) {
        errors.push(`مقدار فیلد "${field}" باید عدد معتبر باشد.`);
        continue;
      }

      if (
        typeof value === 'string' &&
        rules.maxLength !== undefined &&
        value.length > rules.maxLength
      ) {
        errors.push(`طول فیلد "${field}" بیش از حد مجاز است.`);
      }

      if (
        typeof value === 'number' &&
        rules.min !== undefined &&
        value < rules.min
      ) {
        errors.push(`مقدار فیلد "${field}" کمتر از حد مجاز است.`);
      }

      if (
        typeof value === 'number' &&
        rules.max !== undefined &&
        value > rules.max
      ) {
        errors.push(`مقدار فیلد "${field}" بیشتر از حد مجاز است.`);
      }

      if (
        typeof rules.validate === 'function' &&
        !rules.validate(value)
      ) {
        errors.push(`مقدار فیلد "${field}" معتبر نیست.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

export { Validator };
export default Validator;
