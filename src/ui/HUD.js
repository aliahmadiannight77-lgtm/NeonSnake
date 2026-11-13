
export default class HUD {
  constructor(options = {}) {
    this.elements = {
      score: document.querySelector("#score"),
      bestScore: document.querySelector("#best-score"),
      level: document.querySelector("#level"),
      coins: document.querySelector("#coins"),
      diamonds: document.querySelector("#diamonds"),
      status: document.querySelector("#game-status"),
      progress: document.querySelector("#level-progress")
    };

    this.onStatusChange = options.onStatusChange ?? null;
  }

  setText(element, value) {
    if (element) {
      element.textContent = String(value);
    }
  }

  update(data = {}) {
    if (data.score !== undefined) {
      this.setText(this.elements.score, data.score);
    }

    if (data.bestScore !== undefined) {
      this.setText(this.elements.bestScore, data.bestScore);
    }

    if (data.level !== undefined) {
      this.setText(this.elements.level, data.level);
    }

    if (data.coins !== undefined) {
      this.setText(this.elements.coins, data.coins);
    }

    if (data.diamonds !== undefined) {
      this.setText(this.elements.diamonds, data.diamonds);
    }

    if (data.progress !== undefined && this.elements.progress) {
      const progress = Math.min(100, Math.max(0, Number(data.progress) || 0));

      this.elements.progress.style.width = `${progress}%`;
      this.elements.progress.setAttribute("aria-valuenow", String(progress));
    }
  }

  setStatus(status, message = "") {
    const element = this.elements.status;
    if (!element) return;

    element.dataset.status = status;
    element.textContent = message || status;

    this.onStatusChange?.(status, message);
  }

  showReady() {
    this.setStatus("ready", "آماده شروع");
  }

  showPlaying() {
    this.setStatus("playing", "در حال بازی");
  }

  showPaused() {
    this.setStatus("paused", "بازی متوقف شده");
  }

  showGameOver() {
    this.setStatus("game-over", "پایان بازی");
  }

  reset() {
    this.update({
      score: 0,
      level: 1,
      progress: 0
    });

    this.showReady();
  }

  destroy() {
    this.elements = {};
    this.onStatusChange = null;
  }
}
