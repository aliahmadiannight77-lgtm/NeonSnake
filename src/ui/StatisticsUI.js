
export default class StatisticsUI {
  constructor({
    profile = null,
    progression = null,
    achievements = null,
    store = null,
    containerSelector = '#statistics-container'
  } = {}) {
    this.profile = profile;
    this.progression = progression;
    this.achievements = achievements;
    this.store = store;
    this.container = document.querySelector(containerSelector);

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('Statistics container not found.');
      return;
    }

    this.render();
  }

  getNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0
      ? Math.floor(number)
      : 0;
  }

  getProfileStats() {
    if (this.profile && typeof this.profile.getStats === 'function') {
      return this.profile.getStats();
    }

    if (this.profile && typeof this.profile.getPlayerData === 'function') {
      return this.profile.getPlayerData();
    }

    return {};
  }

  getProgressionStats() {
    if (!this.progression) return {};

    return {
      level: this.progression.level ?? 1,
      experience: this.progression.experience ?? 0,
      totalExperience: this.progression.totalExperience ?? 0,
      progress: typeof this.progression.getProgress === 'function'
        ? this.progression.getProgress()
        : null
    };
  }

  getAchievementStats() {
    if (!this.achievements) {
      return { unlocked: 0, total: 0 };
    }

    if (typeof this.achievements.getCounts === 'function') {
      return this.achievements.getCounts();
    }

    if (typeof this.achievements.getAll === 'function') {
      const all = this.achievements.getAll();

      return {
        unlocked: all.filter(item =>
          Boolean(item.unlocked ?? item.isUnlocked)
        ).length,
        total: all.length
      };
    }

    return { unlocked: 0, total: 0 };
  }

  getEconomyStats() {
    if (!this.store) {
      return { coins: 0, diamonds: 0 };
    }

    const balance = this.store.economy?.getBalance?.() || {};

    return {
      coins: this.getNumber(balance.coins),
      diamonds: this.getNumber(balance.diamonds)
    };
  }

  getStats() {
    const profile = this.getProfileStats();
    const progression = this.getProgressionStats();
    const achievements = this.getAchievementStats();
    const economy = this.getEconomyStats();

    return {
      gamesPlayed: this.getNumber(profile.gamesPlayed),
      totalScore: this.getNumber(profile.totalScore),
      bestScore: this.getNumber(profile.bestScore),
      averageScore: this.getNumber(profile.averageScore),
      totalFood: this.getNumber(profile.totalFood),
      totalCoinsEarned: this.getNumber(profile.totalCoinsEarned),
      level: this.getNumber(progression.level) || 1,
      experience: this.getNumber(progression.experience),
      totalExperience: this.getNumber(progression.totalExperience),
      achievementsUnlocked: this.getNumber(achievements.unlocked),
      achievementsTotal: this.getNumber(achievements.total),
      coins: economy.coins,
      diamonds: economy.diamonds
    };
  }

  formatNumber(value) {
    return new Intl.NumberFormat().format(value);
  }

  createCard(title, value, icon, description = '') {
    return `
      <article class="statistics-card">
        <div class="statistics-card__icon" aria-hidden="true">
          ${icon}
        </div>

        <div class="statistics-card__content">
          <span class="statistics-card__title">
            ${title}
          </span>

          <strong class="statistics-card__value">
            ${this.formatNumber(value)}
          </strong>

          ${description
            ? `<small class="statistics-card__description">${description}</small>`
            : ''
          }
        </div>
      </article>
    `;
  }

  render() {
    if (!this.container) return;

    const stats = this.getStats();

    const achievementPercentage = stats.achievementsTotal
      ? Math.round(
          stats.achievementsUnlocked /
          stats.achievementsTotal * 100
        )
      : 0;

    this.container.innerHTML = `
      <section class="statistics-panel">
        <header class="statistics-panel__header">
          <div>
            <h2>آمار بازی</h2>
            <p>گزارش عملکرد و پیشرفت شما در NeonSnake</p>
          </div>
        </header>

        <div class="statistics-grid">
          ${this.createCard(
            'تعداد بازی‌ها',
            stats.gamesPlayed,
            '🎮'
          )}

          ${this.createCard(
            'مجموع امتیاز',
            stats.totalScore,
            '⭐'
          )}

          ${this.createCard(
            'بالاترین امتیاز',
            stats.bestScore,
            '🏆'
          )}

          ${this.createCard(
            'میانگین امتیاز',
            stats.averageScore,
            '📊'
          )}

          ${this.createCard(
            'غذاهای جمع‌آوری‌شده',
            stats.totalFood,
            '🍎'
          )}

          ${this.createCard(
            'مجموع سکه‌های کسب‌شده',
            stats.totalCoinsEarned,
            '🪙'
          )}

          ${this.createCard(
            'سطح فعلی',
            stats.level,
            '⚡'
          )}

          ${this.createCard(
            'مجموع تجربه',
            stats.totalExperience,
            '✨'
          )}

          ${this.createCard(
            'سکه‌های فعلی',
            stats.coins,
            '💰'
          )}

          ${this.createCard(
            'الماس‌های فعلی',
            stats.diamonds,
            '💎'
          )}
        </div>

        <section class="statistics-achievements">
          <div class="statistics-achievements__header">
            <h3>پیشرفت دستاوردها</h3>

            <strong>
              ${stats.achievementsUnlocked}/${stats.achievementsTotal}
            </strong>
          </div>

          <div
            class="statistics-achievements__track"
            role="progressbar"
            aria-valuenow="${achievementPercentage}"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="statistics-achievements__bar"
              style="width: ${achievementPercentage}%"
            ></div>
          </div>

          <span>${achievementPercentage}% تکمیل شده</span>
        </section>
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
