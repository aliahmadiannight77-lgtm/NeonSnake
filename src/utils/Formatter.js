
/**
 * NeonSnake - Formatter Utilities
 * قالب‌بندی اطلاعات نمایشی بازی
 */

const Formatter = {
  /**
   * تبدیل عدد به رشته با جداکننده هزارگان
   */
  number(value, options = {}) {
    const {
      locale = 'fa-IR',
      maximumFractionDigits = 0
    } = options;

    const number = Number(value);

    if (!Number.isFinite(number)) return '۰';

    return new Intl.NumberFormat(locale, {
      maximumFractionDigits,
      useGrouping: true
    }).format(number);
  },

  /**
   * نمایش عدد با ارقام لاتین
   */
  latinNumber(value, maximumFractionDigits = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) return '0';

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits,
      useGrouping: true
    }).format(number);
  },

  /**
   * نمایش موجودی سکه
   */
  coins(value) {
    return `${this.number(value)} سکه`;
  },

  /**
   * نمایش موجودی الماس
   */
  diamonds(value) {
    return `${this.number(value)} الماس`;
  },

  /**
   * نمایش قیمت
   */
  price(value, currency = 'coin') {
    const formatted = this.number(value);

    const currencies = {
      coin: 'سکه',
      diamond: 'الماس',
      coins: 'سکه',
      diamonds: 'الماس'
    };

    return `${formatted} ${currencies[currency] ?? currency}`;
  },

  /**
   * نمایش امتیاز
   */
  score(value) {
    return this.number(value);
  },

  /**
   * تبدیل میلی‌ثانیه به زمان MM:SS
   */
  time(milliseconds) {
    const totalSeconds = Math.max(
      0,
      Math.floor(Number(milliseconds) / 1000) || 0
    );

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },

  /**
   * نمایش زمان به شکل خوانا
   */
  duration(milliseconds) {
    const totalSeconds = Math.max(
      0,
      Math.floor(Number(milliseconds) / 1000) || 0
    );

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${this.number(hours)} ساعت و ${this.number(minutes)} دقیقه`;
    }

    if (minutes > 0) {
      return `${this.number(minutes)} دقیقه و ${this.number(seconds)} ثانیه`;
    }

    return `${this.number(seconds)} ثانیه`;
  },

  /**
   * نمایش درصد
   */
  percentage(value, maximumFractionDigits = 0) {
    const number = Number(value);

    if (!Number.isFinite(number)) return '۰٪';

    const safeValue = Math.min(100, Math.max(0, number));

    return `${this.number(safeValue, {
      maximumFractionDigits
    })}٪`;
  },

  /**
   * نمایش تاریخ
   */
  date(value, options = {}) {
    const date = value instanceof Date
      ? value
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'تاریخ نامعتبر';
    }

    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }).format(date);
  },

  /**
   * نمایش تاریخ و ساعت
   */
  dateTime(value) {
    const date = value instanceof Date
      ? value
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'تاریخ نامعتبر';
    }

    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * نمایش اعداد بزرگ به شکل خلاصه
   */
  compact(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) return '۰';

    return new Intl.NumberFormat('fa-IR', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(number);
  },

  /**
   * تبدیل بایت به حجم قابل خواندن
   */
  fileSize(bytes) {
    const value = Number(bytes);

    if (!Number.isFinite(value) || value < 0) {
      return 'حجم نامعتبر';
    }

    if (value === 0) return '۰ بایت';

    const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
    const index = Math.min(
      Math.floor(Math.log(value) / Math.log(1024)),
      units.length - 1
    );

    const size = value / Math.pow(1024, index);

    return `${this.number(size, {
      maximumFractionDigits: 2
    })} ${units[index]}`;
  },

  /**
   * کوتاه کردن متن طولانی
   */
  truncate(value, maxLength = 30, suffix = '...') {
    const text = String(value ?? '');

    if (!Number.isSafeInteger(maxLength) || maxLength < 0) {
      throw new RangeError('maxLength باید عدد صحیح نامنفی باشد.');
    }

    if (text.length <= maxLength) return text;

    if (maxLength <= suffix.length) {
      return suffix.slice(0, maxLength);
    }

    return text.slice(0, maxLength - suffix.length) + suffix;
  },

  /**
   * تبدیل اولین حرف هر کلمه به حروف بزرگ انگلیسی
   */
  capitalize(value) {
    return String(value ?? '').replace(
      /\b[a-z]/g,
      character => character.toUpperCase()
    );
  },

  /**
   * تبدیل رشته به حالت اسلاگ
   */
  slug(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '');
  },

  /**
   * نمایش پیام وضعیت
   */
  status(value) {
    const statuses = {
      ready: 'آماده',
      playing: 'در حال بازی',
      paused: 'متوقف',
      gameover: 'پایان بازی',
      loading: 'در حال بارگذاری',
      purchased: 'خریداری شده',
      locked: 'قفل شده',
      owned: 'متعلق به شما'
    };

    return statuses[value] ?? 'نامشخص';
  },

  /**
   * نمایش عدد ترتیبی
   */
  ordinal(value) {
    const number = Number(value);

    if (!Number.isSafeInteger(number) || number < 1) {
      return 'نامعتبر';
    }

    return `${this.number(number)}ام`;
  },

  /**
   * نمایش اختلاف امتیاز
   */
  scoreDifference(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) return '۰';

    if (number > 0) {
      return `+${this.number(number)}`;
    }

    return this.number(number);
  }
};

export { Formatter };
export default Formatter;
