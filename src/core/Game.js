
import StateManager from './StateManager.js';
import EventManager from './EventManager.js';
import GameLoop from './GameLoop.js';

export default class Game {
  constructor({ update, render, fps = 60 } = {}) {
    if (typeof update !== 'function') {
      throw new TypeError('Game requires an update function.');
    }

    if (typeof render !== 'function') {
      throw new TypeError('Game requires a render function.');
    }

    this.state = new StateManager({
      status: 'ready',
      score: 0,
      bestScore: 0,
      level: 1,
      foodCollected: 0
    });

    this.events = new EventManager();

    this.loop = new GameLoop(
      (delta) => {
        if (this.state.get('status') === 'playing') {
          update(delta, this);
        }
      },
      (interpolation) => {
        render(interpolation, this);
      },
      fps
    );
  }

  start() {
    const status = this.state.get('status');

    if (status === 'playing') return;

    this.state.set('status', 'playing');
    this.loop.start();
    this.events.emit('game:start');
  }

  pause() {
    if (this.state.get('status') !== 'playing') return;

    this.loop.stop();
    this.state.set('status', 'paused');
    this.events.emit('game:pause');
  }

  resume() {
    if (this.state.get('status') !== 'paused') return;

    this.start();
    this.events.emit('game:resume');
  }

  end() {
    this.loop.stop();
    this.state.set('status', 'gameover');
    this.events.emit('game:over', this.state.getState());
  }

  restart() {
    this.loop.stop();

    this.state.reset({
      status: 'ready',
      score: 0,
      bestScore: this.state.get('bestScore'),
      level: 1,
      foodCollected: 0
    });

    this.events.emit('game:restart');
  }

  addScore(points = 10) {
    if (!Number.isFinite(points) || points < 0) return;

    const score = this.state.get('score') + points;

    this.state.update({
      score,
      bestScore: Math.max(
        score,
        this.state.get('bestScore')
      )
    });

    this.events.emit('score:update', score);
  }

  destroy() {
    this.loop.stop();
    this.events.clear();
  }
}
