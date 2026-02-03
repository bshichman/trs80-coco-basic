/**
 * TRS-80 Color Computer Unified Display
 *
 * Authentic CoCo display that renders both text and graphics modes
 * on a single canvas using the pixel-accurate ROM font.
 */

import { COCO_FONT, CHAR_WIDTH, CHAR_HEIGHT, TEXT_COLS, TEXT_ROWS, SCREEN_WIDTH, SCREEN_HEIGHT } from './coco-font.js';

/**
 * CoCo color palette - authentic MC6847 VDG colors
 * The original CoCo used a P1 (green) phosphor monitor, giving everything
 * a distinctive green tint. Color artifacts were possible on NTSC TVs.
 */
export const COCO_PALETTE = {
  // Text mode colors
  green: '#0FD00F',       // Classic P1 phosphor green
  black: '#001100',       // Very dark green (not pure black for CRT feel)
  orange: '#FF6600',      // CoCo's orange for titles/accents

  // Graphics mode color sets (CSS approximations of MC6847 output)
  colors: [
    '#000000',  // 0: Black
    '#00FF00',  // 1: Green
    '#FFFF00',  // 2: Yellow
    '#0000FF',  // 3: Blue
    '#FF0000',  // 4: Red
    '#FFFFFF',  // 5: Buff/White
    '#00FFFF',  // 6: Cyan
    '#FF00FF',  // 7: Magenta
    '#FF8000',  // 8: Orange
  ],

  // Artifact colors (for PMODE 4 on NTSC)
  artifactSet1: ['#000000', '#FF5500', '#00AAFF', '#FFFFFF'],
  artifactSet2: ['#000000', '#00AAFF', '#FF5500', '#FFFFFF'],
};

/**
 * Get the phosphor color for the CoCo green screen
 * This defines the exact green shade and any glow effects.
 *
 * The original CoCo used a P1 phosphor which was more yellow-green.
 * Modern emulators often use brighter pure green for visibility.
 *
 * @returns {object} Color configuration
 */
export function getPhosphorColor() {
  return {
    // Main text color - slightly yellow-green like authentic P1 phosphor
    foreground: '#33FF33',
    // Screen background - very dark with slight green tint for CRT feel
    background: '#001408',
    // Glow color for optional bloom effect (semi-transparent)
    glow: 'rgba(50, 255, 50, 0.15)',
    // Whether to apply scanline effect
    scanlines: true,
    // Scanline opacity (0-1)
    scanlineOpacity: 0.08,
  };
}

/**
 * CoCoDisplay - Unified display controller
 * Renders 32×16 text grid or 256×192 graphics on a single canvas
 */
export class CoCoDisplay {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Text screen buffer (32 cols × 16 rows)
    this.textScreen = [];
    for (let i = 0; i < TEXT_ROWS; i++) {
      this.textScreen[i] = new Array(TEXT_COLS).fill(32); // ASCII space
    }

    // Cursor position
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.cursorVisible = true;
    this.cursorBlinkState = true;
    this.cursorBlinkInterval = null;

    // Display mode: 0 = text, 1 = graphics
    this.mode = 0;

    // Graphics buffer (for PMODE graphics)
    this.graphicsBuffer = new Uint8Array(SCREEN_WIDTH * SCREEN_HEIGHT);
    this.graphicsWidth = SCREEN_WIDTH;
    this.graphicsHeight = SCREEN_HEIGHT;
    this.foregroundColor = 1;
    this.backgroundColor = 0;

    // Color configuration
    this.phosphor = getPhosphorColor();

    // Calculate scale for canvas
    this.updateScale();

    // Key buffer for INKEY$
    this.keyBuffer = [];

    // Input state for INPUT command
    this.inputMode = false;
    this.inputBuffer = '';
    this.inputPrompt = '';
    this.inputResolve = null;

    // Start cursor blink
    this.startCursorBlink();
  }

  /**
   * Update scale factors based on canvas size
   */
  updateScale() {
    // Text mode: 32×16 characters, each 8×12 pixels = 256×192 native
    // Scale to fit canvas while maintaining aspect ratio
    this.scaleX = this.canvas.width / SCREEN_WIDTH;
    this.scaleY = this.canvas.height / SCREEN_HEIGHT;
    this.charWidth = CHAR_WIDTH * this.scaleX;
    this.charHeight = CHAR_HEIGHT * this.scaleY;
  }

  /**
   * Start the cursor blink timer
   */
  startCursorBlink() {
    if (this.cursorBlinkInterval) return;
    this.cursorBlinkInterval = setInterval(() => {
      this.cursorBlinkState = !this.cursorBlinkState;
      if (this.mode === 0) {
        this.render();
      }
    }, 500); // 500ms blink rate
  }

  /**
   * Stop the cursor blink timer
   */
  stopCursorBlink() {
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
      this.cursorBlinkInterval = null;
    }
  }

  /**
   * Clear the text screen
   * @param {number} charCode - Character to fill with (default: space)
   */
  cls(charCode = 32) {
    for (let row = 0; row < TEXT_ROWS; row++) {
      for (let col = 0; col < TEXT_COLS; col++) {
        this.textScreen[row][col] = charCode;
      }
    }
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.render();
  }

  /**
   * Clear the graphics buffer
   * @param {number} color - Color to fill with (default: background)
   */
  pcls(color = null) {
    const c = color !== null ? color : this.backgroundColor;
    this.graphicsBuffer.fill(c);
    this.render();
  }

  /**
   * Set cursor position
   * @param {number} row - Row (0-15)
   * @param {number} col - Column (0-31)
   */
  locate(row, col) {
    this.cursorRow = Math.max(0, Math.min(row, TEXT_ROWS - 1));
    this.cursorCol = Math.max(0, Math.min(col, TEXT_COLS - 1));
  }

  /**
   * Print a single character at cursor position
   * @param {number|string} char - ASCII code or single character
   */
  printChar(char) {
    const code = typeof char === 'string' ? char.charCodeAt(0) : char;

    // Handle newline
    if (code === 10 || code === 13) {
      this.cursorCol = 0;
      this.cursorRow++;
      if (this.cursorRow >= TEXT_ROWS) {
        this.scrollUp();
        this.cursorRow = TEXT_ROWS - 1;
      }
      return;
    }

    // Handle backspace
    if (code === 8) {
      if (this.cursorCol > 0) {
        this.cursorCol--;
        this.textScreen[this.cursorRow][this.cursorCol] = 32;
      }
      return;
    }

    // Wrap if at end of line
    if (this.cursorCol >= TEXT_COLS) {
      this.cursorCol = 0;
      this.cursorRow++;
      if (this.cursorRow >= TEXT_ROWS) {
        this.scrollUp();
        this.cursorRow = TEXT_ROWS - 1;
      }
    }

    // Store character in buffer
    this.textScreen[this.cursorRow][this.cursorCol] = code;
    this.cursorCol++;
  }

  /**
   * Print a string at cursor position
   * @param {string} str - String to print
   */
  print(str) {
    for (let i = 0; i < str.length; i++) {
      this.printChar(str[i]);
    }
    this.render();
  }

  /**
   * Print a string and move to next line
   * @param {string} str - String to print
   */
  println(str = '') {
    this.print(str);
    this.printChar('\n');
  }

  /**
   * Scroll the text screen up by one line
   */
  scrollUp() {
    // Move all rows up
    for (let row = 0; row < TEXT_ROWS - 1; row++) {
      for (let col = 0; col < TEXT_COLS; col++) {
        this.textScreen[row][col] = this.textScreen[row + 1][col];
      }
    }
    // Clear bottom row
    for (let col = 0; col < TEXT_COLS; col++) {
      this.textScreen[TEXT_ROWS - 1][col] = 32;
    }
  }

  /**
   * Set display mode
   * @param {number} mode - 0 for text, 1 for graphics
   */
  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  /**
   * Get the text content of the screen as a string
   * @returns {string} Screen contents
   */
  getTextScreen() {
    let result = '';
    for (let row = 0; row < TEXT_ROWS; row++) {
      let line = '';
      for (let col = 0; col < TEXT_COLS; col++) {
        line += String.fromCharCode(this.textScreen[row][col]);
      }
      result += line.trimEnd() + '\n';
    }
    return result;
  }

  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    // Add to key buffer for INKEY$
    if (event.key.length === 1) {
      this.keyBuffer.push(event.key.toUpperCase());
    } else if (event.key === 'Enter') {
      this.keyBuffer.push('\r');
    } else if (event.key === 'Backspace') {
      this.keyBuffer.push('\b');
    }

    // If in input mode, handle specially
    if (this.inputMode) {
      event.preventDefault();
      this.handleInputKey(event);
    }
  }

  /**
   * Handle key during INPUT command
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleInputKey(event) {
    if (event.key === 'Enter') {
      // Submit input
      this.inputMode = false;
      this.printChar('\n');
      this.render();
      if (this.inputResolve) {
        this.inputResolve(this.inputBuffer);
        this.inputResolve = null;
      }
    } else if (event.key === 'Backspace') {
      // Delete last character
      if (this.inputBuffer.length > 0) {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        this.printChar(8); // Backspace
        this.render();
      }
    } else if (event.key.length === 1) {
      // Add character
      const char = event.key.toUpperCase();
      this.inputBuffer += char;
      this.printChar(char);
      this.render();
    }
  }

  /**
   * Get a key from the buffer (for INKEY$)
   * @returns {string} Key character or empty string
   */
  getKey() {
    if (this.keyBuffer.length > 0) {
      return this.keyBuffer.shift();
    }
    return '';
  }

  /**
   * Wait for line input (for INPUT command)
   * @param {string} prompt - Prompt to display
   * @returns {Promise<string>} User input
   */
  async getInput(prompt = '') {
    if (prompt) {
      this.print(prompt);
    }
    this.print('? ');
    this.render();

    this.inputMode = true;
    this.inputBuffer = '';

    return new Promise((resolve) => {
      this.inputResolve = resolve;
    });
  }

  /**
   * Draw a single character on the canvas
   * @param {number} charCode - ASCII code
   * @param {number} screenX - X pixel position
   * @param {number} screenY - Y pixel position
   * @param {boolean} inverse - Draw inverse (for cursor)
   */
  drawCharacter(charCode, screenX, screenY, inverse = false) {
    const bitmap = COCO_FONT[charCode & 0x7F] || COCO_FONT[32];
    const fg = inverse ? this.phosphor.background : this.phosphor.foreground;
    const bg = inverse ? this.phosphor.foreground : null;

    if (bg) {
      this.ctx.fillStyle = bg;
      this.ctx.fillRect(screenX, screenY, this.charWidth, this.charHeight);
    }

    this.ctx.fillStyle = fg;
    for (let row = 0; row < CHAR_HEIGHT; row++) {
      const rowData = bitmap[row];
      for (let col = 0; col < CHAR_WIDTH; col++) {
        if (rowData & (0x80 >> col)) {
          this.ctx.fillRect(
            screenX + col * this.scaleX,
            screenY + row * this.scaleY,
            Math.ceil(this.scaleX),
            Math.ceil(this.scaleY)
          );
        }
      }
    }
  }

  /**
   * Render the display
   */
  render() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    if (this.mode === 0) {
      // Text mode
      ctx.fillStyle = this.phosphor.background;
      ctx.fillRect(0, 0, cw, ch);

      // Draw each character
      for (let row = 0; row < TEXT_ROWS; row++) {
        for (let col = 0; col < TEXT_COLS; col++) {
          const charCode = this.textScreen[row][col];
          const x = col * this.charWidth;
          const y = row * this.charHeight;

          // Check if this is the cursor position
          const isCursor = (row === this.cursorRow && col === this.cursorCol);
          const showCursor = isCursor && this.cursorVisible && this.cursorBlinkState;

          if (charCode !== 32 || showCursor) {
            this.drawCharacter(charCode, x, y, showCursor);
          }
        }
      }

      // Apply scanline effect
      if (this.phosphor.scanlines) {
        ctx.fillStyle = `rgba(0, 0, 0, ${this.phosphor.scanlineOpacity})`;
        for (let y = 0; y < ch; y += 2) {
          ctx.fillRect(0, y, cw, 1);
        }
      }
    } else {
      // Graphics mode - render pixel buffer
      const scaleX = cw / this.graphicsWidth;
      const scaleY = ch / this.graphicsHeight;

      ctx.fillStyle = COCO_PALETTE.colors[this.backgroundColor] || '#000000';
      ctx.fillRect(0, 0, cw, ch);

      for (let y = 0; y < this.graphicsHeight; y++) {
        for (let x = 0; x < this.graphicsWidth; x++) {
          const color = this.graphicsBuffer[y * this.graphicsWidth + x];
          if (color !== this.backgroundColor) {
            ctx.fillStyle = COCO_PALETTE.colors[color] || '#FFFFFF';
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

  /**
   * Graphics: Set a pixel
   */
  pset(x, y, color = null) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < this.graphicsWidth && y >= 0 && y < this.graphicsHeight) {
      this.graphicsBuffer[y * this.graphicsWidth + x] = color !== null ? color : this.foregroundColor;
    }
  }

  /**
   * Graphics: Clear a pixel
   */
  preset(x, y) {
    this.pset(x, y, this.backgroundColor);
  }

  /**
   * Graphics: Get pixel color
   */
  point(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x >= 0 && x < this.graphicsWidth && y >= 0 && y < this.graphicsHeight) {
      return this.graphicsBuffer[y * this.graphicsWidth + x];
    }
    return -1;
  }
}

export default CoCoDisplay;
