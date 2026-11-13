
export default class AchievementsUI {
  constructor({
    achievements,
    containerSelector = '#achievements-container'
  } = {}) {
    this.achievements = achievements;
    this.container = document.querySelector(containerSelector);

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('Achievements container not found.');
      return;
    }

    this.render();
  }

  getAchievements() {
    if (!this.achievements) return [];

    if (typeof this.achievements.getAll === 'function') {
      return this.achievements.getAll();
    }

    return [];
  }

  getRewardText(reward) {
    if (!reward) return 'بدون جایزه';

    if (typeof reward === 'string') return reward;

    const parts = [];

    if (reward.coins) {
      parts.push(`${reward.coins} سکه`);
    }

    if (reward.diamonds) {
      parts.push(`${reward.diamonds} الماس`);
    }

    if (reward.experience || reward.xp) {
      parts.push(`${reward.experience || reward.xp} XP`);
    }

    return parts.length ? parts.join(' + ') : 'بدون جایزه';
  }

  escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  render() {
    if (!this.container) return;

    const achievements = this.getAchievements();

    if (!achievements.length) {
      this.container.innerHTML = `
        <section class="achievements-panel">
          <h2>دستاوردها</h2>
          <p>هنوز دستاوردی برای نمایش وجود ندارد.</p>
        </section>
      `;
      return;
    }

    const unlockedCount = achievements.filter(item =>
      Boolean(item.unlocked ?? item.isUnlocked)
    ).length;

    const percentage = Math.round(
      (unlockedCount / achievements.length) * 100
    );

    this.container.innerHTML = `
      <section class="achievements-panel">
        <header class="achievements-panel__header">
          <div>
            <h2>دستاوردها</h2>
            <p>چالش‌ها را کامل کن و جوایز خودت را بگیر.</p>
          </div>

          <div class="achievements-progress">
            <strong>${unlockedCount}/${achievements.length}</strong>
            <span>تکمیل‌شده</span>
          </div>
        </header>

        <div class="achievements-progress__track">
          <div
            class="achievements-progress__bar"
            style="width: ${percentage}%"
          ></div>
        </div>

        <div class="achievements-grid">
          ${achievements.map((item, index) => {
            const unlocked = Boolean(
              item.unlocked ?? item.isUnlocked
            );

            const name = this.escapeHTML(
              item.name || item.title || `دستاورد ${index + 1}`
            );

            const description = this.escapeHTML(
              item.description || 'توضیحی ثبت نشده است.'
            );

            const reward = this.escapeHTML(
              this.getRewardText(item.reward)
            );

            return `
              <article class="
                achievement-card
                ${unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked'}
              ">
                <div class="achievement-card__icon">
                  ${unlocked ? '🏆' : '🔒'}
                </div>

                <div class="achievement-card__content">
                  <h3>${name}</h3>
                  <p>${description}</p>
                  <span class="achievement-card__reward">
                    جایزه: ${reward}
                  </span>
                </div>

                <span class="achievement-card__status">
                  ${unlocked ? 'باز شده' : 'قفل شده'}
                </span>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }

  refresh() {
    this.render();
  }

  getProgress() {
    const achievements = this.getAchievements();

    if (!achievements.length) {
      return {
        unlocked: 0,
        total: 0,
        percentage: 0
      };
    }

    const unlocked = achievements.filter(item =>
      Boolean(item.unlocked ?? item.isUnlocked)
    ).length;

    return {
      unlocked,
      total: achievements.length,
      percentage: Math.round(
        (unlocked / achievements.length) * 100
      )
    };
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
  }
}
