/**
 * TRS-80 Color Computer Graphics System
 *
 * Emulates the CoCo's Video Display Generator (VDG) and
 * Extended Color BASIC graphics commands.
 *
 * Graphics Modes:
 * - Text mode: 32x16 or 64x32 characters
 * - Semigraphics: SG4, SG6, SG8, SG12, SG24
 * - Graphics: CG1-CG6, RG1-RG6
 *
 * PMODE modes (Extended BASIC):
 * - PMODE 0: 128x96, 2 colors
 * - PMODE 1: 128x96, 4 colors
 * - PMODE 2: 128x192, 2 colors
 * - PMODE 3: 128x192, 4 colors
 * - PMODE 4: 256x192, 2 colors
 */

class Graphics {
  constructor(memory) {
    this.memory = memory;

    // Screen dimensions
    this.textCols = 32;
    this.textRows = 16;

    // Graphics state
    this.pmode = 0;
    this.screenType = 0; // 0 = text, 1 = graphics
    this.colorSet = 0;
    this.foregroundColor = 1;
    this.backgroundColor = 0;
    this.graphicsPage = 1; // 1-4 for PMODE

    // PMODE configurations
    this.pmodeConfigs = {
      0: { width: 128, height: 96, colors: 2, bytesPerRow: 16 },
      1: { width: 128, height: 96, colors: 4, bytesPerRow: 32 },
      2: { width: 128, height: 192, colors: 2, bytesPerRow: 16 },
      3: { width: 128, height: 192, colors: 4, bytesPerRow: 32 },
      4: { width: 256, height: 192, colors: 2, bytesPerRow: 32 },
    };

    // Color palettes (CSS colors approximating CoCo colors)
    this.colorPalettes = {
      // Color set 0
      0: {
        0: ['#00FF00', '#000000'], // Green/Black (2-color)
        1: ['#00FF00', '#FFFF00', '#0000FF', '#FF0000'], // 4-color
      },
      // Color set 1
      1: {
        0: ['#FFFFFF', '#000000'], // White/Black (2-color)
        1: ['#FFFFFF', '#00FFFF', '#FF00FF', '#FF8000'], // 4-color (buff, cyan, magenta, orange)
      },
    };

    // CoCo color values (RGB approximations)
    this.cocoColors = [
      '#000000', // 0 - Black
      '#00FF00', // 1 - Green
      '#FFFF00', // 2 - Yellow
      '#0000FF', // 3 - Blue
      '#FF0000', // 4 - Red
      '#FFFFFF', // 5 - Buff (White)
      '#00FFFF', // 6 - Cyan
      '#FF00FF', // 7 - Magenta
      '#FF8000', // 8 - Orange
    ];

    // Graphics buffer (virtual framebuffer)
    this.initGraphicsBuffer();

    // Current drawing position
    this.cursorX = 0;
    this.cursorY = 0;

    // Text cursor position
    this.textRow = 0;
    this.textCol = 0;

    // DRAW command state
    this.drawAngle = 0;
    this.drawScale = 4;

    // Canvas reference (set by UI)
    this.canvas = null;
    this.ctx = null;

    // Text screen buffer
    this.textScreen = [];
    for (let i = 0; i < this.textRows; i++) {
      this.textScreen[i] = new Array(this.textCols).fill(' ');
    }
  }

  initGraphicsBuffer() {
    // Maximum resolution buffer (256x192)
    this.width = 256;
    this.height = 192;
    this.buffer = new Uint8Array(this.width * this.height);
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.render();
  }

  // SCREEN command
  setScreen(type, colorSet = 0) {
    this.screenType = type;
    this.colorSet = colorSet;
    this.render();
  }

  // PMODE command
  setPMode(mode, startPage) {
    this.pmode = mode;
    this.graphicsPage = startPage;

    const config = this.pmodeConfigs[mode];
    if (config) {
      this.pmodeWidth = config.width;
      this.pmodeHeight = config.height;
      this.pmodeColors = config.colors;
    }
  }

  // COLOR command
  setColor(foreground, background = null) {
    this.foregroundColor = foreground;
    if (background !== null) {
      this.backgroundColor = background;
    }
  }

  // CLS command - clear text screen
  cls(color = null) {
    if (color !== null) {
      this.backgroundColor = color;
    }

    // Clear text buffer
    for (let i = 0; i < this.textRows; i++) {
      this.textScreen[i] = new Array(this.textCols).fill(' ');
    }

    // Reset cursor
    this.textRow = 0;
    this.textCol = 0;

    this.render();
  }

  // PCLS command - clear graphics screen
  pcls(color = null) {
    const c = color !== null ? color : this.backgroundColor;
    this.buffer.fill(c);
    this.render();
  }

  // PSET command - set a pixel
  pset(x, y, color = null) {
    const c = color !== null ? color : this.foregroundColor;
    x = Math.floor(x);
    y = Math.floor(y);

    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.buffer[y * this.width + x] = c;
    }
  }

  // PRESET command - reset a pixel (set to background)
  preset(x, y) {
    this.pset(x, y, this.backgroundColor);
  }

  // POINT command - get pixel color
  point(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.buffer[y * this.width + x];
    }
    return -1;
  }

  // LINE command - draw a line
  line(x1, y1, x2, y2, color = null, box = false, fill = false) {
    const c = color !== null ? color : this.foregroundColor;

    // Use current position if x1, y1 not specified
    if (x1 === null) x1 = this.cursorX;
    if (y1 === null) y1 = this.cursorY;

    x1 = Math.floor(x1);
    y1 = Math.floor(y1);
    x2 = Math.floor(x2);
    y2 = Math.floor(y2);

    if (box) {
      // Draw rectangle
      if (fill) {
        // Filled rectangle
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            this.pset(x, y, c);
          }
        }
      } else {
        // Box outline
        this.drawLine(x1, y1, x2, y1, c);
        this.drawLine(x2, y1, x2, y2, c);
        this.drawLine(x2, y2, x1, y2, c);
        this.drawLine(x1, y2, x1, y1, c);
      }
    } else {
      // Regular line
      this.drawLine(x1, y1, x2, y2, c);
    }

    // Update cursor position
    this.cursorX = x2;
    this.cursorY = y2;

    this.render();
  }

  // Bresenham's line algorithm
  drawLine(x1, y1, x2, y2, color) {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      this.pset(x1, y1, color);

      if (x1 === x2 && y1 === y2) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x1 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y1 += sy;
      }
    }
  }

  // CIRCLE command
  circle(x, y, radius, color = null, ratio = 1, startAngle = null, endAngle = null) {
    const c = color !== null ? color : this.foregroundColor;
    x = Math.floor(x);
    y = Math.floor(y);
    radius = Math.floor(radius);

    if (startAngle !== null && endAngle !== null) {
      // Draw arc
      this.drawArc(x, y, radius, c, ratio, startAngle, endAngle);
    } else {
      // Draw full circle/ellipse
      this.drawEllipse(x, y, radius, Math.floor(radius * ratio), c);
    }

    this.render();
  }

  // Midpoint circle algorithm
  drawEllipse(cx, cy, rx, ry, color) {
    let x = 0;
    let y = ry;
    let rx2 = rx * rx;
    let ry2 = ry * ry;
    let twoRx2 = 2 * rx2;
    let twoRy2 = 2 * ry2;
    let p;
    let px = 0;
    let py = twoRx2 * y;

    // Plot initial points
    this.plotEllipsePoints(cx, cy, x, y, color);

    // Region 1
    p = Math.round(ry2 - (rx2 * ry) + (0.25 * rx2));
    while (px < py) {
      x++;
      px += twoRy2;
      if (p < 0) {
        p += ry2 + px;
      } else {
        y--;
        py -= twoRx2;
        p += ry2 + px - py;
      }
      this.plotEllipsePoints(cx, cy, x, y, color);
    }

    // Region 2
    p = Math.round(ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2);
    while (y > 0) {
      y--;
      py -= twoRx2;
      if (p > 0) {
        p += rx2 - py;
      } else {
        x++;
        px += twoRy2;
        p += rx2 - py + px;
      }
      this.plotEllipsePoints(cx, cy, x, y, color);
    }
  }

  plotEllipsePoints(cx, cy, x, y, color) {
    this.pset(cx + x, cy + y, color);
    this.pset(cx - x, cy + y, color);
    this.pset(cx + x, cy - y, color);
    this.pset(cx - x, cy - y, color);
  }

  // Draw arc
  drawArc(cx, cy, radius, color, ratio, startAngle, endAngle) {
    const steps = Math.max(36, radius * 2);
    const start = startAngle * Math.PI / 180;
    const end = endAngle * Math.PI / 180;
    const step = (end - start) / steps;

    for (let angle = start; angle <= end; angle += step) {
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * ratio * Math.sin(angle);
      this.pset(Math.floor(x), Math.floor(y), color);
    }
  }

  // PAINT command - flood fill
  paint(x, y, color = null, borderColor = null) {
    const fillColor = color !== null ? color : this.foregroundColor;
    const border = borderColor !== null ? borderColor : fillColor;

    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }

    const targetColor = this.buffer[y * this.width + x];

    // Don't fill if already the fill color or if it's the border
    if (targetColor === fillColor || targetColor === border) {
      return;
    }

    // Flood fill using queue with iteration limit for safety
    const MAX_FILL_PIXELS = 50000;
    const queue = [[x, y]];
    const visited = new Set();
    let iterations = 0;

    while (queue.length > 0 && iterations < MAX_FILL_PIXELS) {
      iterations++;
      const [px, py] = queue.shift();
      const key = `${px},${py}`;

      if (visited.has(key)) continue;
      if (px < 0 || px >= this.width || py < 0 || py >= this.height) continue;

      const currentColor = this.buffer[py * this.width + px];
      if (currentColor === fillColor || currentColor === border) continue;

      visited.add(key);
      this.buffer[py * this.width + px] = fillColor;

      queue.push([px + 1, py]);
      queue.push([px - 1, py]);
      queue.push([px, py + 1]);
      queue.push([px, py - 1]);
    }

    this.render();
  }

  // DRAW command - turtle graphics
  draw(commands) {
    if (typeof commands !== 'string') return;

    let i = 0;
    let x = this.cursorX;
    let y = this.cursorY;
    let penDown = true;
    let returnAfterMove = false; // N prefix flag
    let scale = this.drawScale;
    let angle = this.drawAngle;
    const color = this.foregroundColor;

    while (i < commands.length) {
      const cmd = commands[i].toUpperCase();
      i++;

      // Skip spaces
      while (i < commands.length && commands[i] === ' ') i++;

      // Read optional number
      let numStr = '';
      while (i < commands.length && /[0-9]/.test(commands[i])) {
        numStr += commands[i];
        i++;
      }
      const num = numStr ? parseInt(numStr) : 1;

      let dx = 0, dy = 0;

      switch (cmd) {
        case 'U': dy = -num * scale; break;
        case 'D': dy = num * scale; break;
        case 'L': dx = -num * scale; break;
        case 'R': dx = num * scale; break;
        case 'E': dx = num * scale; dy = -num * scale; break;
        case 'F': dx = num * scale; dy = num * scale; break;
        case 'G': dx = -num * scale; dy = num * scale; break;
        case 'H': dx = -num * scale; dy = -num * scale; break;
        case 'M':
          // Move to position
          let relative = false;
          if (i < commands.length && (commands[i] === '+' || commands[i] === '-')) {
            relative = true;
          }
          // Read X coordinate
          let xStr = '';
          if (i < commands.length && commands[i] === '-') {
            xStr += '-';
            i++;
          } else if (i < commands.length && commands[i] === '+') {
            i++;
          }
          while (i < commands.length && /[0-9]/.test(commands[i])) {
            xStr += commands[i];
            i++;
          }
          // Skip comma
          if (i < commands.length && commands[i] === ',') i++;
          // Read Y coordinate
          let yStr = '';
          if (i < commands.length && commands[i] === '-') {
            yStr += '-';
            i++;
          } else if (i < commands.length && commands[i] === '+') {
            i++;
          }
          while (i < commands.length && /[0-9]/.test(commands[i])) {
            yStr += commands[i];
            i++;
          }
          const mx = parseInt(xStr) || 0;
          const my = parseInt(yStr) || 0;
          if (relative) {
            dx = mx * scale;
            dy = my * scale;
          } else {
            const savedX = x, savedY = y;
            if (penDown) {
              this.drawLine(Math.floor(x), Math.floor(y), mx, my, color);
            }
            x = mx;
            y = my;
            if (returnAfterMove) {
              x = savedX;
              y = savedY;
              returnAfterMove = false;
            }
            penDown = true;
            continue;
          }
          break;
        case 'B':
          // Move without drawing (prefix)
          penDown = false;
          continue;
        case 'N':
          // Draw and return to original position (prefix)
          returnAfterMove = true;
          continue;
        case 'A':
          // Set angle (0-3, each = 90 degrees)
          angle = (num % 4) * 90;
          this.drawAngle = angle;
          continue;
        case 'S':
          // Set scale
          scale = num;
          this.drawScale = scale;
          continue;
        case 'C':
          // Set color
          this.foregroundColor = num;
          continue;
        default:
          continue;
      }

      // Apply angle rotation
      if (angle !== 0) {
        const rad = angle * Math.PI / 180;
        const newDx = dx * Math.cos(rad) - dy * Math.sin(rad);
        const newDy = dx * Math.sin(rad) + dy * Math.cos(rad);
        dx = newDx;
        dy = newDy;
      }

      const savedX = x, savedY = y;
      const newX = x + dx;
      const newY = y + dy;

      if (penDown) {
        this.drawLine(Math.floor(x), Math.floor(y), Math.floor(newX), Math.floor(newY), color);
      }

      x = newX;
      y = newY;

      // If N prefix was set, return to original position
      if (returnAfterMove) {
        x = savedX;
        y = savedY;
        returnAfterMove = false;
      }

      penDown = true;
    }

    this.cursorX = x;
    this.cursorY = y;
    this.render();
  }

  // GET/PUT for sprites
  getRegion(x1, y1, x2, y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const data = new Uint8Array(width * height + 2);
    data[0] = width;
    data[1] = height;

    let idx = 2;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        data[idx++] = this.point(x, y);
      }
    }

    return data;
  }

  putRegion(x1, y1, data, mode = 'PSET') {
    if (!data || data.length < 3) return;

    const width = data[0];
    const height = data[1];

    let idx = 2;
    for (let dy = 0; dy < height; dy++) {
      for (let dx = 0; dx < width; dx++) {
        const color = data[idx++];
        const x = x1 + dx;
        const y = y1 + dy;

        switch (mode.toUpperCase()) {
          case 'PSET':
            this.pset(x, y, color);
            break;
          case 'PRESET':
            this.pset(x, y, this.backgroundColor);
            break;
          case 'AND':
            this.pset(x, y, this.point(x, y) & color);
            break;
          case 'OR':
            this.pset(x, y, this.point(x, y) | color);
            break;
          case 'NOT':
            this.pset(x, y, ~color & 0x0F);
            break;
        }
      }
    }

    this.render();
  }

  // PCOPY - copy graphics pages
  pcopy(source, dest) {
    const pageSize = this.pmodeConfigs[this.pmode]?.bytesPerRow * this.height || 0x600;
    const sourceStart = 0x0600 + (source - 1) * pageSize;
    const destStart = 0x0600 + (dest - 1) * pageSize;

    for (let i = 0; i < pageSize; i++) {
      this.memory.poke(destStart + i, this.memory.peek(sourceStart + i));
    }
  }

  // LOCATE - position text cursor
  locate(row, col) {
    this.textRow = Math.max(0, Math.min(row, this.textRows - 1));
    this.textCol = Math.max(0, Math.min(col, this.textCols - 1));
  }

  // Print character at current position
  printChar(char) {
    if (char === '\n') {
      this.textCol = 0;
      this.textRow++;
      if (this.textRow >= this.textRows) {
        this.scrollUp();
        this.textRow = this.textRows - 1;
      }
      return;
    }

    if (this.textCol >= this.textCols) {
      this.textCol = 0;
      this.textRow++;
      if (this.textRow >= this.textRows) {
        this.scrollUp();
        this.textRow = this.textRows - 1;
      }
    }

    this.textScreen[this.textRow][this.textCol] = char;
    this.textCol++;
  }

  // Print string
  printString(str) {
    for (const char of str) {
      this.printChar(char);
    }
    this.render();
  }

  // Scroll screen up
  scrollUp() {
    for (let i = 0; i < this.textRows - 1; i++) {
      this.textScreen[i] = [...this.textScreen[i + 1]];
    }
    this.textScreen[this.textRows - 1] = new Array(this.textCols).fill(' ');
  }

  // Get text at position
  getTextAt(row, col) {
    if (row >= 0 && row < this.textRows && col >= 0 && col < this.textCols) {
      return this.textScreen[row][col];
    }
    return ' ';
  }

  // Render to canvas
  render() {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    if (this.screenType === 0) {
      // Text mode
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const charWidth = canvasWidth / this.textCols;
      const charHeight = canvasHeight / this.textRows;

      ctx.fillStyle = '#00FF00';
      ctx.font = `${Math.floor(charHeight * 0.9)}px monospace`;
      ctx.textBaseline = 'top';

      for (let row = 0; row < this.textRows; row++) {
        for (let col = 0; col < this.textCols; col++) {
          const char = this.textScreen[row][col];
          if (char !== ' ') {
            ctx.fillText(char, col * charWidth, row * charHeight);
          }
        }
      }
    } else {
      // Graphics mode
      const config = this.pmodeConfigs[this.pmode] || { width: 256, height: 192 };
      const scaleX = canvasWidth / config.width;
      const scaleY = canvasHeight / config.height;

      ctx.fillStyle = this.cocoColors[this.backgroundColor] || '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw pixels
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          const color = this.buffer[y * this.width + x];
          if (color !== this.backgroundColor) {
            ctx.fillStyle = this.cocoColors[color] || '#FFFFFF';
            ctx.fillRect(
              Math.floor(x * scaleX),
              Math.floor(y * scaleY),
              Math.ceil(scaleX),
              Math.ceil(scaleY)
            );
          }
        }
      }
    }
  }

  // Get screen as text (for console output)
  getTextScreen() {
    return this.textScreen.map(row => row.join('')).join('\n');
  }

  // Get graphics buffer for export
  getBuffer() {
    return this.buffer;
  }
}

module.exports = { Graphics };
