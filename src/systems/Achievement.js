
const ACHIEVEMENTS = [
  {
    id: 'first-game',
    title: 'First Steps',
    description: 'Play your first game.',
    condition: stats => stats.totalGames >= 1,
    reward: { coins: 25 }
  },
  {
    id: 'first-food',
    title: 'First Bite',
    description: 'Collect your first food.',
    condition: stats => stats.totalFood >= 1,
    reward: { coins: 25 }
  },
  {
    id: 'food-collector',
    title: 'Food Collector',
    description: 'Collect 50 food items.',
    condition: stats => stats.totalFood >= 50,
    reward: { coins: 100 }
  },
  {
    id: 'score-100',
    title: 'Century',
    description: 'Reach a score of 100.',
    condition: stats => stats.highestScore >= 100,
    reward: { coins: 50 }
  },
  {
    id: 'score-500',
    title: 'High Scorer',
    description: 'Reach a score of 500.',
    condition: stats => stats.highestScore >= 500,
    reward: { coins: 150 }
  },
  {
    id: 'score-1000',
    title: 'Neon Master',
    description: 'Reach a score of 1000.',
    condition: stats => stats.highestScore >= 1000,
    reward: { diamonds: 5 }
  },
  {
    id: 'level-5',
    title: 'Rising Star',
    description: 'Reach level 5.',
    condition: stats => stats.level >= 5,
    reward: { coins: 100 }
  },
  {
    id: 'level-10',
    title: 'Elite Player',
    description: 'Reach level 10.',
    condition: stats => stats.level >= 10,
    reward: { diamonds: 10 }
  },
  {
    id: 'games-25',
    title: 'Dedicated Player',
    description: 'Play 25 games.',
    condition: stats => stats.totalGames >= 25,
    reward: { coins: 200 }
  },
  {
    id: 'games-100',
    title: 'Snake Veteran',
    description: 'Play 100 games.',
    condition: stats => stats.totalGames >= 100,
    reward: { diamonds: 15 }
  }
];

export default class Achievement {
  constructor({
    unlocked = [],
    onUnlock = () => {}
  } = {}) {
    this.unlocked = new Set(unlocked);
    this.onUnlock = onUnlock;
    this.achievements = ACHIEVEMENTS;
  }

  getAll(stats = {}) {
    return this.achievements.map(achievement => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      reward: { ...achievement.reward },
      unlocked: this.unlocked.has(achievement.id),
      progress: this.getProgressValue(
        achievement,
        stats
      )
    }));
  }

  getProgressValue(achievement, stats) {
    const requirements = {
      'first-game': ['totalGames', 1],
      'first-food': ['totalFood', 1],
      'food-collector': ['totalFood', 50],
      'score-100': ['highestScore', 100],
      'score-500': ['highestScore', 500],
      'score-1000': ['highestScore', 1000],
      'level-5': ['level', 5],
      'level-10': ['level', 10],
      'games-25': ['totalGames', 25],
      'games-100': ['totalGames', 100]
    };

    const [key, target] = requirements[achievement.id] ?? [];
    if (!key) return 0;

    return Math.min(
      100,
      Math.floor(((stats[key] ?? 0) / target) * 100)
    );
  }

  check(stats = {}) {
    const newlyUnlocked = [];

    for (const achievement of this.achievements) {
      if (this.unlocked.has(achievement.id)) continue;

      if (achievement.condition(stats)) {
        this.unlocked.add(achievement.id);

        const result = {
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          reward: { ...achievement.reward }
        };

        newlyUnlocked.push(result);
        this.onUnlock(result);
      }
    }

    return newlyUnlocked;
  }

  isUnlocked(id) {
    return this.unlocked.has(id);
  }

  getUnlockedCount() {
    return this.unlocked.size;
  }

  getTotalCount() {
    return this.achievements.length;
  }

  export() {
    return [...this.unlocked];
  }

  import(data) {
    if (!Array.isArray(data)) return false;

    const validIds = data.filter(id =>
      this.achievements.some(item => item.id === id)
    );

    this.unlocked = new Set(validIds);
    return true;
  }
}

export { ACHIEVEMENTS };
