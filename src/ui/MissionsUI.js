
export default class MissionsUI {
  constructor({
    missions = [],
    missionManager = null,
    containerSelector = '#missions-container'
  } = {}) {
    this.missions = missions;
    this.missionManager = missionManager;
    this.container = document.querySelector(containerSelector);

    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('Missions container not found.');
      return;
    }

    this.render();
  }

  getMissions() {
    if (this.missionManager) {
      if (typeof this.missionManager.getAll === 'function') {
        return this.missionManager.getAll();
      }

      if (Array.isArray(this.missionManager.missions)) {
        return this.missionManager.missions;
      }
    }

    return Array.isArray(this.missions) ? this.missions : [];
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

  getProgress(mission) {
    const current = Math.max(
      0,
      Number(mission.progress ?? mission.current ?? 0) || 0
    );

    const target = Math.max(
      1,
      Number(mission.target ?? mission.goal ?? 1) || 1
    );

    const percentage = Math.min(
      100,
      Math.round((current / target) * 100)
    );

    return { current, target, percentage };
  }

  isCompleted(mission) {
    if (typeof mission.completed === 'boolean') {
      return mission.completed;
    }

    if (typeof mission.isCompleted === 'boolean') {
      return mission.isCompleted;
    }

    const { current, target } = this.getProgress(mission);

    return current >= target;
  }

  getReward(mission) {
    const reward = mission.reward;

    if (!reward) return 'بدون جایزه';

    if (typeof reward === 'string') {
      return this.escapeHTML(reward);
    }

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

    return parts.length
      ? this.escapeHTML(parts.join(' + '))
      : 'بدون جایزه';
  }

  createMissionCard(mission, index) {
    const progress = this.getProgress(mission);
    const completed = this.isCompleted(mission);

    const title = this.escapeHTML(
      mission.title || mission.name || `مأموریت ${index + 1}`
    );

    const description = this.escapeHTML(
      mission.description || 'توضیحی برای این مأموریت ثبت نشده است.'
    );

    const status = completed ? 'تکمیل‌شده' : 'در حال انجام';

    return `
      <article class="
        mission-card
        ${completed ? 'mission-card--completed' : ''}
      ">
        <div class="mission-card__header">
          <div class="mission-card__icon">
            ${completed ? '🏆' : '🎯'}
          </div>

          <span class="mission-card__status">
            ${status}
          </span>
        </div>

        <div class="mission-card__content">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>

        <div class="mission-card__progress-info">
          <span>پیشرفت</span>
          <strong>
            ${progress.current} / ${progress.target}
          </strong>
        </div>

        <div
          class="mission-card__progress-track"
          role="progressbar"
          aria-valuenow="${progress.percentage}"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            class="mission-card__progress-bar"
            style="width: ${progress.percentage}%"
          ></div>
        </div>

        <div class="mission-card__footer">
          <span>جایزه: ${this.getReward(mission)}</span>
          <span>${progress.percentage}%</span>
        </div>
      </article>
    `;
  }

  render() {
    if (!this.container) return;

    const missions = this.getMissions();

    if (!missions.length) {
      this.container.innerHTML = `
        <section class="missions-panel">
          <header class="missions-panel__header">
            <h2>مأموریت‌ها</h2>
          </header>

          <div class="missions-empty">
            <span>🎯</span>
            <p>در حال حاضر مأموریتی برای نمایش وجود ندارد.</p>
          </div>
        </section>
      `;

      return;
    }

    const completedCount = missions.filter(
      mission => this.isCompleted(mission)
    ).length;

    const percentage = Math.round(
      (completedCount / missions.length) * 100
    );

    this.container.innerHTML = `
      <section class="missions-panel">
        <header class="missions-panel__header">
          <div>
            <h2>مأموریت‌ها</h2>
            <p>چالش‌ها را انجام بده و جایزه بگیر!</p>
          </div>

          <div class="missions-panel__summary">
            <strong>${completedCount}/${missions.length}</strong>
            <span>تکمیل‌شده</span>
          </div>
        </header>

        <div class="missions-panel__progress">
          <div class="missions-panel__progress-track">
            <div
              class="missions-panel__progress-bar"
              style="width: ${percentage}%"
            ></div>
          </div>

          <span>${percentage}% پیشرفت کلی</span>
        </div>

        <div class="missions-grid">
          ${missions.map((mission, index) =>
            this.createMissionCard(mission, index)
          ).join('')}
        </div>
      </section>
    `;
  }

  refresh() {
    this.render();
  }

  getSummary() {
    const missions = this.getMissions();

    const completed = missions.filter(
      mission => this.isCompleted(mission)
    ).length;

    return {
      total: missions.length,
      completed,
      remaining: missions.length - completed,
      percentage: missions.length
        ? Math.round((completed / missions.length) * 100)
        : 0
    };
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
  }
}
