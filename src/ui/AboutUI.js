
export default class AboutUI {
  constructor({
    containerSelector = '#about-container',
    appName = 'NeonSnake',
    version = '1.0.0'
  } = {}) {
    this.container = document.querySelector(containerSelector);
    this.appName = appName;
    this.version = version;

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('About container not found.');
      return;
    }

    this.render();
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="about-panel">
        <div class="about-panel__hero">
          <div class="about-panel__logo">
            <span>🐍</span>
          </div>

          <h2>${this.appName}</h2>
          <p>تجربه‌ای متفاوت از بازی کلاسیک مار</p>

          <span class="about-panel__version">
            Version ${this.version}
          </span>
        </div>

        <div class="about-panel__description">
          <h3>درباره بازی</h3>

          <p>
            NeonSnake یک بازی مار با طراحی نئونی و فضای
            سایبرپانکی است که تجربه‌ای مدرن از یک بازی کلاسیک
            ارائه می‌دهد.
          </p>
        </div>

        <div class="about-panel__features">
          <h3>ویژگی‌های بازی</h3>

          <ul>
            <li>🎮 گیم‌پلی کلاسیک با طراحی مدرن</li>
            <li>🐍 اسکین‌های متنوع و قابل انتخاب</li>
            <li>🏆 سیستم دستاوردها و پیشرفت</li>
            <li>🛒 فروشگاه و سیستم اقتصادی</li>
            <li>🌍 پشتیبانی از ۹ زبان</li>
            <li>📱 رابط کاربری واکنش‌گرا</li>
            <li>🎵 افکت‌های صوتی و تصویری</li>
          </ul>
        </div>

        <div class="about-panel__credits">
          <h3>اطلاعات نسخه</h3>

          <div>
            <span>نام پروژه</span>
            <strong>${this.appName}</strong>
          </div>

          <div>
            <span>نسخه</span>
            <strong>${this.version}</strong>
          </div>

          <div>
            <span>وضعیت</span>
            <strong>در حال توسعه</strong>
          </div>
        </div>

        <footer class="about-panel__footer">
          <p>ساخته‌شده با JavaScript و Canvas</p>
          <p>© ${new Date().getFullYear()} NeonSnake</p>
        </footer>
      </section>
    `;
  }

  refresh() {
    this.render();
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
  }
}
