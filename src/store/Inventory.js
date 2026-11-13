
export default class Inventory {
  constructor({
    ownedSnakes = ['classic'],
    selectedSnake = 'classic'
  } = {}) {
    this.ownedSnakes = new Set(ownedSnakes);
    this.ownedSnakes.add('classic');

    this.selectedSnake = this.ownedSnakes.has(selectedSnake)
      ? selectedSnake
      : 'classic';
  }

  owns(snakeId) {
    return this.ownedSnakes.has(snakeId);
  }

  addSnake(snakeId) {
    if (!snakeId || this.owns(snakeId)) {
      return false;
    }

    this.ownedSnakes.add(snakeId);
    return true;
  }

  selectSnake(snakeId) {
    if (!this.owns(snakeId)) {
      return false;
    }

    this.selectedSnake = snakeId;
    return true;
  }

  getSelectedSnake() {
    return this.selectedSnake;
  }

  getOwnedSnakes() {
    return [...this.ownedSnakes];
  }

  export() {
    return {
      ownedSnakes: this.getOwnedSnakes(),
      selectedSnake: this.selectedSnake
    };
  }

  import(data = {}) {
    if (!Array.isArray(data.ownedSnakes)) {
      return false;
    }

    const validIds = data.ownedSnakes.filter(
      id => typeof id === 'string' && id.length > 0
    );

    this.ownedSnakes = new Set(validIds);
    this.ownedSnakes.add('classic');

    this.selectedSnake = this.ownedSnakes.has(data.selectedSnake)
      ? data.selectedSnake
      : 'classic';

    return true;
  }
}
