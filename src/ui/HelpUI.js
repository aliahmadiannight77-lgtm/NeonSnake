
export default class HelpUI {
  constructor({
    containerSelector = '#help-container'
  } = {}) {
    this.container = document.querySelector(containerSelector);

    this.sections = [
      {
        icon: '🎮',
        title: 'شروع بازی',
        content: 'برای شروع بازی، دکمه شروع را انتخاب کن. مار به‌صورت خودکار حرکت می‌کند.'
      },
      {
        icon: '🍎',
        title: 'جمع‌آوری غذا',
        content: 'غذاها را جمع‌آوری کن تا امتیاز، سکه و تجربه به دست بیاوری.'
      },
      {
        icon: '⚠️',
        title: 'برخوردها',
        content: 'برخورد مار با دیوار یا بدن خودش باعث پایان بازی می‌شود.'
      },
      {
        icon: '⚡',
        title: 'افزایش سرعت',
        content: 'با افزایش سطح، سرعت حرکت مار نیز افزایش پیدا می‌کند.'
      },
      {
        icon: '🛒',
        title: 'فروشگاه',
        content: 'با سکه‌ها و الماس‌های خود می‌توانی اسکین‌های مختلف مار را تهیه و انتخاب کنی.'
      },
      {
        icon: '🏆',
        title: 'دستاوردها',
        content: 'با انجام چالش‌ها و رسیدن به اهداف مختلف، دستاوردهای جدید آزاد کن.'
      }
    ];

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('Help container not found.');
      return;
    }

    this.render();
  }

  escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  renderControls() {
    return `
      <section class="help-controls">
        <h3>کنترل‌های بازی</h3>

        <div class="help-controls__grid">
          <article class="help-control-card">
            <div class="help-control-card__keys">
              <kbd>↑</kbd>
              <kbd>↓</kbd>
              <kbd>←</kbd>
              <kbd>→</kbd>
            </div>
            <p>حرکت با کلیدهای جهت‌دار</p>
          </article>

          <article class="help-control-card">
            <div class="help-control-card__keys">
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd>
            </div>
            <p>حرکت با کلیدهای WASD</p>
          </article>

          <article class="help-control-card">
            <div class="help-control-card__keys">
              <kbd>Space</kbd>
            </div>
            <p>شروع بازی</p>
          </article>

          <article class="help-control-card">
            <div class="help-control-card__keys">
              <kbd>Esc</kbd>
              <kbd>P</kbd>
            </div>
            <p>توقف یا ادامه بازی</p>
          </article>
        </div>

        <div class="help-touch">
          <h3>کنترل لمسی</h3>
          <p>
            در موبایل می‌توانی با دکمه‌های جهت‌دار روی صفحه،
            مسیر حرکت مار را تغییر بدهی.
          </p>
        </div>
      </section>
    `;
  }

  renderScoring() {
    return `
      <section class="help-scoring">
        <h3>سیستم امتیازدهی</h3>

        <div class="help-scoring__item">
          <span>🍎</span>
          <div>
            <strong>جمع‌آوری غذا</strong>
            <p>هر غذا ۱۰ امتیاز و ۵ سکه به همراه دارد.</p>
          </div>
        </div>

        <div class="help-scoring__item">
          <span>✨</span>
          <div>
            <strong>تجربه</strong>
            <p>با جمع‌آوری غذا تجربه کسب می‌کنی و سطح تو افزایش پیدا می‌کند.</p>
          </div>
        </div>

        <div class="help-scoring__item">
          <span>🏆</span>
          <div>
            <strong>دستاوردها</strong>
            <p>با تکمیل اهداف بازی می‌توانی دستاوردهای جدید آزاد کنی.</p>
          </div>
        </div>
      </section>
    `;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <section class="help-panel">
        <header class="help-panel__header">
          <span class="help-panel__icon">📖</span>
          <div>
            <h2>راهنمای NeonSnake</h2>
            <p>هر چیزی که برای شروع بازی نیاز داری.</p>
          </div>
        </header>

        <div class="help-sections">
          ${this.sections.map(section => `
            <article class="help-section">
              <span class="help-section__icon">
                ${section.icon}
              </span>

              <div>
                <h3>${this.escapeHTML(section.title)}</h3>
                <p>${this.escapeHTML(section.content)}</p>
              </div>
            </article>
          `).join('')}
        </div>

        ${this.renderControls()}
        ${this.renderScoring()}

        <footer class="help-panel__footer">
          <p>موفق باشی! رکورد جدیدی ثبت کن.</p>
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
