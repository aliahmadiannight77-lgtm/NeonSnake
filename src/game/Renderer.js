
export default class Renderer {
  constructor(canvas, {
    columns = 20,
    rows = 20,
    background = '#080d18',
    gridColor = 'rgba(100, 180, 255, 0.07)',
    snakeColor = '#00f5d4',
    headColor = '#8affef',
    foodColor = '#ff3d81',
    showGrid = true
  } = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new TypeError('Renderer requires a canvas element.');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    if (!this.ctx) {
      throw new Error('Canvas 2D context is unavailable.');
    }

    this.columns = columns;
    this.rows = rows;

    this.background = background;
    this.gridColor = gridColor;
    this.snakeColor = snakeColor;
    this.headColor = headColor;
    this.foodColor = foodColor;
    this.showGrid = showGrid;

    this.cellWidth = canvas.width / columns;
    this.cellHeight = canvas.height / rows;
  }

  resize(columns = this.columns, rows = this.rows) {
    this.columns = columns;
    this.rows = rows;

    this.cellWidth = this.canvas.width / columns;
    this.cellHeight = this.canvas.height / rows;
  }

  clear() {
    const ctx = this.ctx;

    ctx.fillStyle = this.background;
    ctx.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
  }

  drawGrid() {
    if (!this.showGrid) return;

    const ctx = this.ctx;

    ctx.strokeStyle = this.gridColor;
    ctx.lineWidth = 1;

    ctx.beginPath();

    for (let x = 0; x <= this.columns; x++) {
      const position = x * this.cellWidth;

      ctx.moveTo(position, 0);
      ctx.lineTo(position, this.canvas.height);
    }

    for (let y = 0; y <= this.rows; y++) {
      const position = y * this.cellHeight;

      ctx.moveTo(0, position);
      ctx.lineTo(this.canvas.width, position);
    }

    ctx.stroke();
  }

  drawRoundedCell(x, y, color, inset = 2, radius = 5) {
    const ctx = this.ctx;

    const left = x * this.cellWidth + inset;
    const top = y * this.cellHeight + inset;

    const width = this.cellWidth - inset * 2;
    const height = this.cellHeight - inset * 2;

    ctx.fillStyle = color;
    ctx.beginPath();

    ctx.roundRect(
      left,
      top,
      width,
      height,
      radius
    );

    ctx.fill();
  }

  drawSnake(snake) {
    if (!snake || !snake.body.length) return;

    const ctx = this.ctx;

    snake.body.forEach((segment, index) => {
      const isHead = index === 0;

      ctx.save();

      ctx.shadowColor = isHead
        ? this.headColor
        : this.snakeColor;

      ctx.shadowBlur = isHead ? 18 : 9;

      this.drawRoundedCell(
        segment.x,
        segment.y,
        isHead ? this.headColor : this.snakeColor,
        isHead ? 1.5 : 2.5,
        isHead ? 7 : 5
      );

      ctx.restore();
    });

    this.drawEyes(snake);
  }

  drawEyes(snake) {
    if (!snake?.head) return;

    const ctx = this.ctx;
    const head = snake.head;

    const centerX = (head.x + 0.5) * this.cellWidth;
    const centerY = (head.y + 0.5) * this.cellHeight;

    const direction = snake.direction;

    const eyeOffset = this.cellWidth * 0.18;
    const eyeRadius = Math.max(1.5, this.cellWidth * 0.055);

    let positions;

    if (direction === 'up' || direction === 'down') {
      const offsetY = direction === 'up'
        ? -eyeOffset
        : eyeOffset;

      positions = [
        [centerX - eyeOffset, centerY + offsetY],
        [centerX + eyeOffset, centerY + offsetY]
      ];
    } else {
      const offsetX = direction === 'left'
        ? -eyeOffset
        : eyeOffset;

      positions = [
        [centerX + offsetX, centerY - eyeOffset],
        [centerX + offsetX, centerY + eyeOffset]
      ];
    }

    ctx.fillStyle = '#07111c';

    for (const [x, y] of positions) {
      ctx.beginPath();
      ctx.arc(x, y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFood(food, time = 0) {
    if (!food?.position) return;

    const ctx = this.ctx;
    const { x, y } = food.position;

    const centerX = (x + 0.5) * this.cellWidth;
    const centerY = (y + 0.5) * this.cellHeight;

    const pulse = 1 + Math.sin(time / 180) * 0.12;
    const radius = Math.min(
      this.cellWidth,
      this.cellHeight
    ) * 0.29 * pulse;

    ctx.save();

    ctx.shadowColor = this.foodColor;
    ctx.shadowBlur = 20;

    ctx.fillStyle = this.foodColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  render({ snake, food, time = 0 } = {}) {
    this.clear();
    this.drawGrid();
    this.drawFood(food, time);
    this.drawSnake(snake);
  }

  setSnakeColors({
    body,
    head
  } = {}) {
    if (body) this.snakeColor = body;
    if (head) this.headColor = head;
  }

  setFoodColor(color) {
    if (color) this.foodColor = color;
  }

  setGridVisibility(visible) {
    this.showGrid = Boolean(visible);
  }
}
