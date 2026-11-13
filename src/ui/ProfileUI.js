
const PROFILE_STORAGE_KEY = 'neonsnake:profile';

const DEFAULT_PROFILE = {
  gamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  totalFood: 0,
  totalCoinsEarned: 0,
  createdAt: null,
  lastPlayedAt: null
};

export default class ProfileUI {
  constructor({
    store = null,
    progression = null,
    achievements = null,
    containerSelector = '#profile-container'
  } = {}) {
    this.store = store;
    this.progression = progression;
    this.achievements = achievements;
    this.container = document.querySelector(containerSelector);

    this.profile = this.load();
    this.initialized = false;

    this.init();
  }

  load() {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);

      if (!saved) {
        return {
          ...DEFAULT_PROFILE,
          createdAt: Date.now()
        };
      }

      const parsed = JSON.parse(saved);

      return {
        ...DEFAULT_PROFILE,
        ...parsed
      };
    } catch (error) {
      console.error('Failed to load profile:', error);

      return {
        ...DEFAULT_PROFILE,
        createdAt: Date.now()
      };
    }
  }

  save() {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify(this.profile)
      );

      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }

  init() {
    if (!this.container || this.initialized) return;

    this.initialized = true;
    this.render();
  }

  recordGame({
    score = 0,
    food = 0,
    coins = 0
  } = {}) {
    const safeScore = this.toNonNegativeNumber(score);
    const safeFood = this.toNonNegativeNumber(food);
    const safeCoins = this.toNonNegativeNumber(coins);

    this.profile.gamesPlayed += 1;
    this.profile.totalScore += safeScore;
    this.profile.bestScore = Math.max(
      this.profile.bestScore,
      safeScore
    );
    this.profile.totalFood += safeFood;
    this.profile.totalCoinsEarned += safeCoins;
    this.profile.lastPlayedAt = Date.now();

    this.save();
    this.render();

    return this.getPlayerData();
  }

  toNonNegativeNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
      return 0;
    }

    return Math.floor(number);
  }

  getPlayerData() {
    return { ...this.profile };
  }

  getAverageScore() {
    if (this.profile.gamesPlayed === 0) return 0;

    return Math.floor(
      this.profile.totalScore / this.profile.gamesPlayed
    );
  }

  getPlayTime() {
    if (!this.profile.createdAt) return 0;

    return Math.max(
      0,
      Date.now() - this.profile.createdAt
    );
  }

  getStats() {
    return {
      ...this.profile,
      averageScore: this.getAverageScore(),
      playTime: this.getPlayTime()
    };
  }

  formatNumber(value) {
    return new Intl.NumberFormat().format(value);
  }

  createStatCard(label, value, icon) {
    return `
      <article class="profile-stat-card">
        <div class="profile-stat-card__icon" aria-hidden="true">
          ${icon}
        </div>

        <div class="profile-stat-card__content">
          <span class="profile-stat-card__label">
            ${label}
          </span>

          <strong class="profile-stat-card__value">
            ${this.formatNumber(value)}
          </strong>
        </div>
      </article>
    `;
  }

  render() {
    if (!this.container) return;

    const stats = this.getStats();

    this.container.innerHTML = `
      <section class="profile-panel">
        <header class="profile-panel__header">
          <div>
            <h2>پروفایل بازیکن</h2>
            <p>آمار و عملکرد شما در NeonSnake</p>
          </div>
        </header>

        <div class="profile-stats">
          ${this.createStatCard(
            'بازی‌های انجام‌شده',
            stats.gamesPlayed,
            '🎮'
          )}

          ${this.createStatCard(
            'مجموع امتیاز',
            stats.totalScore,
            '⭐'
          )}

          ${this.createStatCard(
            'بهترین امتیاز',
            stats.bestScore,
            '🏆'
          )}

          ${this.createStatCard(
            'میانگین امتیاز',
            stats.averageScore,
            '📊'
          )}

          ${this.createStatCard(
            'غذاهای جمع‌آوری‌شده',
            stats.totalFood,
            '🍎'
          )}

          ${this.createStatCard(
            'سکه‌های به‌دست‌آمده',
            stats.totalCoinsEarned,
            '🪙'
          )}
        </div>
      </section>
    `;
  }

  reset() {
    this.profile = {
      ...DEFAULT_PROFILE,
      createdAt: Date.now()
    };

    this.save();
    this.render();

    return this.getPlayerData();
  }

  destroy() {
    this.initialized = false;

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
  }
}
