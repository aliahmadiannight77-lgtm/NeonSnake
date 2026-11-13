
import GAME_CONFIG from '../data/config.js';

export default class Progression {
  constructor({
    level = GAME_CONFIG.progression.startingLevel,
    experience = 0,
    totalExperience = 0,
    onLevelUp = () => {}
  } = {}) {
    this.level = Math.max(1, Math.floor(level));
    this.experience = Math.max(0, Math.floor(experience));
    this.totalExperience = Math.max(
      0,
      Math.floor(totalExperience)
    );

    this.onLevelUp = onLevelUp;
    this.experiencePerLevel =
      GAME_CONFIG.progression.experiencePerLevel;
  }

  getRequiredExperience() {
    return this.experiencePerLevel * this.level;
  }

  getProgress() {
    const required = this.getRequiredExperience();

    return {
      level: this.level,
      experience: this.experience,
      totalExperience: this.totalExperience,
      requiredExperience: required,
      remainingExperience: Math.max(
        0,
        required - this.experience
      ),
      percentage: Math.min(
        100,
        (this.experience / required) * 100
      )
    };
  }

  addExperience(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return {
        success: false,
        levelsGained: 0
      };
    }

    this.experience += amount;
    this.totalExperience += amount;

    let levelsGained = 0;

    while (
      this.experience >= this.getRequiredExperience()
    ) {
      this.experience -= this.getRequiredExperience();
      this.level++;
      levelsGained++;

      this.onLevelUp({
        level: this.level,
        totalExperience: this.totalExperience
      });
    }

    return {
      success: true,
      levelsGained,
      ...this.getProgress()
    };
  }

  reset() {
    this.level = 1;
    this.experience = 0;
    this.totalExperience = 0;
  }

  export() {
    return {
      level: this.level,
      experience: this.experience,
      totalExperience: this.totalExperience
    };
  }

  import(data = {}) {
    const values = [
      data.level,
      data.experience,
      data.totalExperience
    ];

    if (
      !values.every(Number.isSafeInteger) ||
      data.level < 1 ||
      data.experience < 0 ||
      data.totalExperience < 0
    ) {
      return false;
    }

    this.level = data.level;
    this.experience = data.experience;
    this.totalExperience = data.totalExperience;

    return true;
  }
}
