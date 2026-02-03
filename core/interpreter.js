/**
 * TRS-80 Color Computer Extended BASIC Interpreter
 *
 * Executes BASIC programs by walking the AST and maintaining
 * program state including variables, arrays, DATA pointer, etc.
 */

const { Lexer } = require('./lexer');
const { Parser, NodeType } = require('./parser');
const { Memory } = require('./memory');
const { Graphics } = require('../graphics/graphics');
const { Sound } = require('../sound/sound');

class Interpreter {
  constructor(options = {}) {
    this.memory = new Memory();
    this.graphics = new Graphics(this.memory);
    this.sound = new Sound();

    // Program storage
    this.program = new Map(); // lineNumber -> AST line
    this.sortedLineNumbers = [];
    this.lineNumberIndex = new Map(); // lineNumber -> index in sortedLineNumbers (O(1) lookup)

    // Execution state
    this.variables = new Map();
    this.arrays = new Map();
    this.userFunctions = new Map();
    this.forStack = [];
    this.gosubStack = [];
    this.dataPointer = { lineIndex: 0, valueIndex: 0 };
    this.dataValues = [];
    this.running = false;
    this.stopped = false;
    this.currentLineNumber = 0;
    this.nextLineIndex = 0;

    // I/O
    this.inputBuffer = '';
    this.inputCallback = options.inputCallback || null;
    this.outputCallback = options.outputCallback || ((text) => process.stdout.write(text));
    this.keyBuffer = [];

    // Random number generator state
    this.rndSeed = Date.now();

    // Timer
    this.startTime = Date.now();
    this.timerInterval = null;

    // Execution limits (for public hosting safety)
    this.maxInstructions = options.maxInstructions || 10000000; // 10 million instructions default
    this.maxProgramSize = options.maxProgramSize || 65536; // 64KB like real CoCo
    this.maxStringLength = options.maxStringLength || 32768; // 32KB max string
    this.maxMemory = options.maxMemory || 1048576; // 1MB total memory budget
    this.instructionCount = 0;
    this.memoryUsed = 0;
  }

  // Output text
  output(text) {
    if (this.outputCallback) {
      this.outputCallback(text);
    }
    this.graphics.printString(text);
  }

  // Get input from user
  async getInput(prompt = '') {
    if (prompt) {
      this.output(prompt);
    }
    this.output('? ');

    if (this.inputCallback) {
      return await this.inputCallback();
    }

    // Fallback for Node.js
    return new Promise((resolve) => {
      if (typeof process !== 'undefined' && process.stdin) {
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question('', (answer) => {
          rl.close();
          resolve(answer);
        });
      } else {
        resolve('');
      }
    });
  }

  // Load a BASIC program from text
  load(sourceCode) {
    // Check program size limit
    if (sourceCode.length > this.maxProgramSize) {
      throw new Error('PROGRAM TOO LARGE');
    }

    this.program.clear();
    this.sortedLineNumbers = [];

    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // Collect DATA statements and store lines
    this.dataValues = [];

    for (const line of ast.lines) {
      if (line.lineNumber !== null) {
        this.program.set(line.lineNumber, line);

        // Extract DATA values
        for (const stmt of line.statements) {
          if (stmt && stmt.type === NodeType.DATA) {
            for (const value of stmt.values) {
              this.dataValues.push(value);
            }
          }
        }
      }
    }

    this.sortedLineNumbers = Array.from(this.program.keys()).sort((a, b) => a - b);
    // Build index Map for O(1) GOTO/GOSUB lookups
    this.lineNumberIndex.clear();
    for (let i = 0; i < this.sortedLineNumbers.length; i++) {
      this.lineNumberIndex.set(this.sortedLineNumbers[i], i);
    }
    this.reset();
  }

  // Reset interpreter state
  reset() {
    this.variables.clear();
    this.arrays.clear();
    this.forStack = [];
    this.gosubStack = [];
    this.dataPointer = { lineIndex: 0, valueIndex: 0 };
    this.running = false;
    this.stopped = false;
    this.currentLineNumber = 0;
    this.nextLineIndex = 0;
    this.instructionCount = 0;
    this.memoryUsed = 0;
    this.graphics.cls();
    this.sound.reset();
    this.startTime = Date.now();
  }

  // Run the program
  async run(startLine = null) {
    if (this.sortedLineNumbers.length === 0) {
      this.output('?NO PROGRAM\n');
      return;
    }

    this.running = true;
    this.stopped = false;

    if (startLine !== null) {
      const lineIndex = this.lineNumberIndex.get(startLine);
      if (lineIndex === undefined) {
        this.output(`?UNDEFINED LINE ${startLine}\n`);
        return;
      }
      this.nextLineIndex = lineIndex;
    } else {
      this.nextLineIndex = 0;
    }

    // Start timer
    this.startTimer();

    try {
      while (this.running && this.nextLineIndex < this.sortedLineNumbers.length) {
        // Check instruction limit
        this.instructionCount++;
        if (this.instructionCount > this.maxInstructions) {
          throw new Error('EXECUTION LIMIT EXCEEDED');
        }

        const lineNumber = this.sortedLineNumbers[this.nextLineIndex];
        const line = this.program.get(lineNumber);
        this.currentLineNumber = lineNumber;
        this.nextLineIndex++;

        await this.executeLine(line);

        // Small delay to prevent blocking
        if (this.nextLineIndex % 100 === 0) {
          await this.delay(0);
        }
      }
    } catch (error) {
      this.output(`?${error.message} IN ${this.currentLineNumber}\n`);
    } finally {
      this.running = false;
      this.stopTimer();
    }
  }

  // Execute a single line
  async executeLine(line) {
    for (const stmt of line.statements) {
      if (!this.running || this.stopped) break;
      if (stmt) {
        await this.executeStatement(stmt);
      }
    }
  }

  // Execute a statement
  async executeStatement(stmt) {
    switch (stmt.type) {
      case NodeType.REM:
        // Comments - do nothing
        break;

      case NodeType.ASSIGNMENT:
        await this.executeAssignment(stmt);
        break;

      case NodeType.PRINT:
        await this.executePrint(stmt);
        break;

      case NodeType.INPUT:
        await this.executeInput(stmt);
        break;

      case NodeType.IF:
        await this.executeIf(stmt);
        break;

      case NodeType.FOR:
        await this.executeFor(stmt);
        break;

      case NodeType.NEXT:
        await this.executeNext(stmt);
        break;

      case NodeType.GOTO:
        this.executeGoto(stmt);
        break;

      case NodeType.GOSUB:
        this.executeGosub(stmt);
        break;

      case NodeType.RETURN:
        this.executeReturn();
        break;

      case NodeType.ON_GOTO:
        this.executeOnGoto(stmt);
        break;

      case NodeType.ON_GOSUB:
        this.executeOnGosub(stmt);
        break;

      case NodeType.END:
        this.running = false;
        break;

      case NodeType.STOP:
        this.stopped = true;
        this.output(`BREAK IN ${this.currentLineNumber}\n`);
        break;

      case NodeType.DIM:
        this.executeDim(stmt);
        break;

      case NodeType.DATA:
        // DATA is processed during load
        break;

      case NodeType.READ:
        this.executeRead(stmt);
        break;

      case NodeType.RESTORE:
        this.executeRestore(stmt);
        break;

      case NodeType.DEF_FN:
        this.executeDefFn(stmt);
        break;

      case NodeType.POKE:
        this.executePoke(stmt);
        break;

      case NodeType.CLS:
        this.executeCls(stmt);
        break;

      case NodeType.LOCATE:
        this.executeLocate(stmt);
        break;

      case NodeType.COLOR:
        await this.executeColor(stmt);
        break;

      case NodeType.SCREEN:
        this.executeScreen(stmt);
        break;

      case NodeType.PMODE:
        this.executePmode(stmt);
        break;

      case NodeType.PCLS:
        this.executePcls(stmt);
        break;

      case NodeType.PSET:
        await this.executePset(stmt);
        break;

      case NodeType.LINE_DRAW:
        await this.executeLineDraw(stmt);
        break;

      case NodeType.CIRCLE:
        await this.executeCircle(stmt);
        break;

      case NodeType.PAINT:
        await this.executePaint(stmt);
        break;

      case NodeType.DRAW:
        await this.executeDraw(stmt);
        break;

      case NodeType.SOUND:
        await this.executeSound(stmt);
        break;

      case NodeType.PLAY:
        await this.executePlay(stmt);
        break;

      case NodeType.CLEAR:
        this.executeClear(stmt);
        break;

      default:
        // Unknown statement type
        break;
    }
  }

  // Execute assignment
  async executeAssignment(stmt) {
    const value = await this.evaluate(stmt.value);

    if (stmt.indices) {
      // Array assignment
      const indices = [];
      for (const idx of stmt.indices) {
        indices.push(Math.floor(await this.evaluate(idx)));
      }
      this.setArrayValue(stmt.name, indices, value);
    } else {
      // Simple variable
      this.variables.set(stmt.name, value);
    }
  }

  // Execute PRINT
  async executePrint(stmt) {
    let output = '';
    let col = this.graphics.textCol;

    for (const item of stmt.items) {
      if (item.type === 'expr') {
        const value = await this.evaluate(item.value);
        if (typeof value === 'number') {
          // Numbers have leading space for sign
          output += (value >= 0 ? ' ' : '') + value + ' ';
          col += output.length;
        } else {
          output += String(value);
          col += String(value).length;
        }
      } else if (item.type === 'tab') {
        // Tab to next 8-column zone
        const spaces = 8 - (col % 8);
        output += ' '.repeat(spaces);
        col += spaces;
      } else if (item.type === 'tabTo') {
        const pos = Math.floor(await this.evaluate(item.position));
        if (pos > col) {
          output += ' '.repeat(pos - col);
          col = pos;
        }
      }
    }

    if (stmt.newline) {
      output += '\n';
    }

    this.output(output);
  }

  // Execute INPUT
  async executeInput(stmt) {
    const prompt = stmt.prompt || '';
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const input = await this.getInput(prompt);
      const parts = input.split(',').map(s => s.trim());
      let valid = true;

      for (let i = 0; i < stmt.variables.length; i++) {
        const varInfo = stmt.variables[i];
        let value = parts[i] || '';

        // Determine if numeric or string variable
        if (varInfo.name.endsWith('$')) {
          // String variable - always valid
          if (varInfo.indices) {
            const indices = [];
            for (const idx of varInfo.indices) {
              indices.push(Math.floor(await this.evaluate(idx)));
            }
            this.setArrayValue(varInfo.name, indices, value);
          } else {
            this.variables.set(varInfo.name, value);
          }
        } else {
          // Numeric variable - validate input
          const trimmed = value.trim();
          if (trimmed === '') {
            // Empty input defaults to 0
            value = 0;
          } else {
            const numValue = parseFloat(trimmed);
            if (isNaN(numValue)) {
              this.output('?REDO FROM START\n');
              valid = false;
              break;
            }
            value = numValue;
          }

          if (valid) {
            if (varInfo.indices) {
              const indices = [];
              for (const idx of varInfo.indices) {
                indices.push(Math.floor(await this.evaluate(idx)));
              }
              this.setArrayValue(varInfo.name, indices, value);
            } else {
              this.variables.set(varInfo.name, value);
            }
          }
        }
      }

      if (valid) return;
      retryCount++;
    }

    throw new Error('INPUT ERROR');
  }

  // Execute IF
  async executeIf(stmt) {
    const condition = await this.evaluate(stmt.condition);

    if (condition) {
      for (const s of stmt.thenBranch) {
        if (!this.running) break;
        await this.executeStatement(s);
      }
    } else if (stmt.elseBranch) {
      for (const s of stmt.elseBranch) {
        if (!this.running) break;
        await this.executeStatement(s);
      }
    }
  }

  // Execute FOR
  async executeFor(stmt) {
    const start = await this.evaluate(stmt.start);
    const end = await this.evaluate(stmt.end);
    const step = stmt.step ? await this.evaluate(stmt.step) : 1;

    this.variables.set(stmt.variable, start);

    // Push FOR info onto stack
    this.forStack.push({
      variable: stmt.variable,
      end,
      step,
      lineIndex: this.nextLineIndex,
      lineNumber: this.currentLineNumber
    });
  }

  // Execute NEXT
  async executeNext(stmt) {
    if (this.forStack.length === 0) {
      throw new Error('NEXT WITHOUT FOR');
    }

    // Find matching FOR
    let forInfo;
    if (stmt.variables.length > 0) {
      // Find specific variable
      for (let i = this.forStack.length - 1; i >= 0; i--) {
        if (this.forStack[i].variable === stmt.variables[0]) {
          forInfo = this.forStack[i];
          // Pop all FORs after this one
          this.forStack.length = i + 1;
          break;
        }
      }
      if (!forInfo) {
        throw new Error('NEXT WITHOUT FOR');
      }
    } else {
      forInfo = this.forStack[this.forStack.length - 1];
    }

    // Increment variable
    let value = this.variables.get(forInfo.variable);
    value += forInfo.step;
    this.variables.set(forInfo.variable, value);

    // Check loop condition
    const done = forInfo.step >= 0
      ? value > forInfo.end
      : value < forInfo.end;

    if (done) {
      // Loop finished
      this.forStack.pop();
    } else {
      // Continue loop
      this.nextLineIndex = forInfo.lineIndex;
    }
  }

  // Execute GOTO
  executeGoto(stmt) {
    const lineIndex = this.lineNumberIndex.get(stmt.lineNumber);
    if (lineIndex === undefined) {
      throw new Error(`UNDEFINED LINE ${stmt.lineNumber}`);
    }
    this.nextLineIndex = lineIndex;
  }

  // Execute GOSUB
  executeGosub(stmt) {
    this.gosubStack.push({
      lineIndex: this.nextLineIndex,
      lineNumber: this.currentLineNumber
    });
    const lineIndex = this.lineNumberIndex.get(stmt.lineNumber);
    if (lineIndex === undefined) {
      throw new Error(`UNDEFINED LINE ${stmt.lineNumber}`);
    }
    this.nextLineIndex = lineIndex;
  }

  // Execute RETURN
  executeReturn() {
    if (this.gosubStack.length === 0) {
      throw new Error('RETURN WITHOUT GOSUB');
    }
    const info = this.gosubStack.pop();
    this.nextLineIndex = info.lineIndex;
  }

  // Execute ON...GOTO
  executeOnGoto(stmt) {
    const index = Math.floor(this.evaluateSync(stmt.expression));
    if (index >= 1 && index <= stmt.lineNumbers.length) {
      const lineNumber = stmt.lineNumbers[index - 1];
      const lineIndex = this.lineNumberIndex.get(lineNumber);
      if (lineIndex === undefined) {
        throw new Error(`UNDEFINED LINE ${lineNumber}`);
      }
      this.nextLineIndex = lineIndex;
    }
  }

  // Execute ON...GOSUB
  executeOnGosub(stmt) {
    const index = Math.floor(this.evaluateSync(stmt.expression));
    if (index >= 1 && index <= stmt.lineNumbers.length) {
      this.gosubStack.push({
        lineIndex: this.nextLineIndex,
        lineNumber: this.currentLineNumber
      });
      const lineNumber = stmt.lineNumbers[index - 1];
      const lineIndex = this.lineNumberIndex.get(lineNumber);
      if (lineIndex === undefined) {
        throw new Error(`UNDEFINED LINE ${lineNumber}`);
      }
      this.nextLineIndex = lineIndex;
    }
  }

  // Execute DIM
  executeDim(stmt) {
    for (const arr of stmt.arrays) {
      const dimensions = arr.dimensions.map(d => Math.floor(this.evaluateSync(d)) + 1);
      this.createArray(arr.name, dimensions);
    }
  }

  // Create array
  createArray(name, dimensions) {
    // Limit array dimensions for safety (max 32KB elements, similar to CoCo memory limits)
    const MAX_ARRAY_ELEMENTS = 32768;
    const MAX_DIMENSION_SIZE = 32767;

    for (const dim of dimensions) {
      if (dim < 1 || dim > MAX_DIMENSION_SIZE) {
        throw new Error('ILLEGAL FUNCTION CALL');
      }
    }

    const size = dimensions.reduce((a, b) => a * b, 1);
    if (size > MAX_ARRAY_ELEMENTS) {
      throw new Error('OUT OF MEMORY');
    }

    // Check total memory budget (8 bytes per numeric element estimate)
    const memoryNeeded = size * 8;
    if (this.memoryUsed + memoryNeeded > this.maxMemory) {
      throw new Error('OUT OF MEMORY');
    }
    this.memoryUsed += memoryNeeded;

    const defaultValue = name.endsWith('$') ? '' : 0;
    const data = new Array(size).fill(defaultValue);
    this.arrays.set(name, { dimensions, data });
  }

  // Get array value
  getArrayValue(name, indices) {
    let arr = this.arrays.get(name);
    if (!arr) {
      // Auto-dimension with default size 10
      const dimensions = indices.map(() => 11);
      this.createArray(name, dimensions);
      arr = this.arrays.get(name);
    }

    const index = this.calculateArrayIndex(arr.dimensions, indices);
    return arr.data[index];
  }

  // Set array value
  setArrayValue(name, indices, value) {
    let arr = this.arrays.get(name);
    if (!arr) {
      const dimensions = indices.map(() => 11);
      this.createArray(name, dimensions);
      arr = this.arrays.get(name);
    }

    const index = this.calculateArrayIndex(arr.dimensions, indices);
    arr.data[index] = value;
  }

  // Calculate linear index from multi-dimensional indices
  calculateArrayIndex(dimensions, indices) {
    let index = 0;
    let multiplier = 1;
    for (let i = dimensions.length - 1; i >= 0; i--) {
      if (indices[i] < 0 || indices[i] >= dimensions[i]) {
        throw new Error('SUBSCRIPT OUT OF RANGE');
      }
      index += indices[i] * multiplier;
      multiplier *= dimensions[i];
    }
    return index;
  }

  // Execute READ
  executeRead(stmt) {
    for (const varInfo of stmt.variables) {
      if (this.dataPointer.valueIndex >= this.dataValues.length) {
        throw new Error('OUT OF DATA');
      }

      const dataValue = this.dataValues[this.dataPointer.valueIndex];
      this.dataPointer.valueIndex++;

      let value = dataValue.type === 'number' ? dataValue.value : dataValue.value;

      // Convert if needed
      if (!varInfo.name.endsWith('$') && dataValue.type === 'string') {
        value = parseFloat(value) || 0;
      }

      if (varInfo.indices) {
        const indices = varInfo.indices.map(idx => Math.floor(this.evaluateSync(idx)));
        this.setArrayValue(varInfo.name, indices, value);
      } else {
        this.variables.set(varInfo.name, value);
      }
    }
  }

  // Execute RESTORE
  executeRestore(stmt) {
    if (stmt.lineNumber !== null) {
      // Find DATA statements starting from line
      let found = false;
      let valueIndex = 0;

      for (const lineNum of this.sortedLineNumbers) {
        if (lineNum >= stmt.lineNumber) {
          found = true;
        }
        if (!found) {
          const line = this.program.get(lineNum);
          for (const s of line.statements) {
            if (s && s.type === NodeType.DATA) {
              valueIndex += s.values.length;
            }
          }
        } else {
          break;
        }
      }

      this.dataPointer.valueIndex = valueIndex;
    } else {
      this.dataPointer.valueIndex = 0;
    }
  }

  // Execute DEF FN
  executeDefFn(stmt) {
    this.userFunctions.set(stmt.name, {
      param: stmt.param,
      body: stmt.body
    });
  }

  // Execute POKE
  executePoke(stmt) {
    const address = Math.floor(this.evaluateSync(stmt.address));
    const value = Math.floor(this.evaluateSync(stmt.value));
    this.memory.poke(address, value);
  }

  // Execute CLS
  executeCls(stmt) {
    const color = stmt.color !== null ? Math.floor(this.evaluateSync(stmt.color)) : null;
    this.graphics.cls(color);
  }

  // Execute LOCATE
  executeLocate(stmt) {
    const row = Math.floor(this.evaluateSync(stmt.row));
    const col = Math.floor(this.evaluateSync(stmt.col));
    this.graphics.locate(row, col);
  }

  // Execute COLOR
  async executeColor(stmt) {
    const fg = Math.floor(await this.evaluate(stmt.foreground));
    const bg = stmt.background !== null ? Math.floor(await this.evaluate(stmt.background)) : null;
    this.graphics.setColor(fg, bg);
  }

  // Execute SCREEN
  executeScreen(stmt) {
    const type = Math.floor(this.evaluateSync(stmt.type));
    const colorSet = stmt.colorSet !== null ? Math.floor(this.evaluateSync(stmt.colorSet)) : 0;
    this.graphics.setScreen(type, colorSet);
  }

  // Execute PMODE
  executePmode(stmt) {
    const mode = Math.floor(this.evaluateSync(stmt.mode));
    const page = Math.floor(this.evaluateSync(stmt.startPage));
    this.graphics.setPMode(mode, page);
  }

  // Execute PCLS
  executePcls(stmt) {
    const color = stmt.color !== null ? Math.floor(this.evaluateSync(stmt.color)) : null;
    this.graphics.pcls(color);
  }

  // Execute PSET
  async executePset(stmt) {
    const x = Math.floor(await this.evaluate(stmt.x));
    const y = Math.floor(await this.evaluate(stmt.y));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;

    if (stmt.preset) {
      this.graphics.preset(x, y);
    } else {
      this.graphics.pset(x, y, color);
    }
  }

  // Execute LINE (graphics)
  async executeLineDraw(stmt) {
    const x1 = stmt.x1 !== null ? Math.floor(await this.evaluate(stmt.x1)) : null;
    const y1 = stmt.y1 !== null ? Math.floor(await this.evaluate(stmt.y1)) : null;
    const x2 = Math.floor(await this.evaluate(stmt.x2));
    const y2 = Math.floor(await this.evaluate(stmt.y2));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;

    this.graphics.line(x1, y1, x2, y2, color, stmt.box, stmt.fill);
  }

  // Execute CIRCLE
  async executeCircle(stmt) {
    const x = Math.floor(await this.evaluate(stmt.x));
    const y = Math.floor(await this.evaluate(stmt.y));
    const radius = Math.floor(await this.evaluate(stmt.radius));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;
    const ratio = stmt.ratio !== null ? await this.evaluate(stmt.ratio) : 1;
    const startAngle = stmt.startAngle !== null ? await this.evaluate(stmt.startAngle) : null;
    const endAngle = stmt.endAngle !== null ? await this.evaluate(stmt.endAngle) : null;

    this.graphics.circle(x, y, radius, color, ratio, startAngle, endAngle);
  }

  // Execute PAINT
  async executePaint(stmt) {
    const x = Math.floor(await this.evaluate(stmt.x));
    const y = Math.floor(await this.evaluate(stmt.y));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;
    const border = stmt.borderColor !== null ? Math.floor(await this.evaluate(stmt.borderColor)) : null;

    this.graphics.paint(x, y, color, border);
  }

  // Execute DRAW
  async executeDraw(stmt) {
    const commands = String(await this.evaluate(stmt.commands));
    this.graphics.draw(commands);
  }

  // Execute SOUND
  async executeSound(stmt) {
    const frequency = Math.floor(await this.evaluate(stmt.frequency));
    const duration = Math.floor(await this.evaluate(stmt.duration));
    await this.sound.sound(frequency, duration);
  }

  // Execute PLAY
  async executePlay(stmt) {
    const music = String(await this.evaluate(stmt.music));
    await this.sound.play(music);
  }

  // Execute CLEAR
  executeClear(stmt) {
    this.variables.clear();
    this.arrays.clear();
    this.forStack = [];
    this.gosubStack = [];
  }

  // Evaluate expression (async)
  async evaluate(node) {
    return this.evaluateNode(node);
  }

  // Evaluate expression (sync)
  evaluateSync(node) {
    return this.evaluateNode(node);
  }

  // Main evaluation function
  evaluateNode(node) {
    if (!node) return 0;

    switch (node.type) {
      case NodeType.NUMBER:
        return node.value;

      case NodeType.STRING:
        return node.value;

      case NodeType.VARIABLE:
        return this.variables.get(node.name) ?? (node.name.endsWith('$') ? '' : 0);

      case NodeType.ARRAY_ACCESS:
        const indices = node.indices.map(idx => Math.floor(this.evaluateNode(idx)));
        return this.getArrayValue(node.name, indices);

      case NodeType.BINARY_OP:
        return this.evaluateBinaryOp(node);

      case NodeType.UNARY_OP:
        return this.evaluateUnaryOp(node);

      case NodeType.FUNCTION_CALL:
        return this.evaluateFunction(node);

      default:
        return 0;
    }
  }

  // Evaluate binary operation
  evaluateBinaryOp(node) {
    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);

    switch (node.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          const result = String(left) + String(right);
          if (result.length > this.maxStringLength) {
            throw new Error('STRING TOO LONG');
          }
          return result;
        }
        return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/':
        if (right === 0) throw new Error('DIVISION BY ZERO');
        return left / right;
      case '^': return Math.pow(left, right);
      case '=': return left === right ? -1 : 0;
      case '<>': return left !== right ? -1 : 0;
      case '<': return left < right ? -1 : 0;
      case '>': return left > right ? -1 : 0;
      case '<=': return left <= right ? -1 : 0;
      case '>=': return left >= right ? -1 : 0;
      case 'AND': return (left !== 0 && right !== 0) ? -1 : 0;
      case 'OR': return (left !== 0 || right !== 0) ? -1 : 0;
      default: return 0;
    }
  }

  // Evaluate unary operation
  evaluateUnaryOp(node) {
    const operand = this.evaluateNode(node.operand);

    switch (node.operator) {
      case '-': return -operand;
      case 'NOT': return operand === 0 ? -1 : 0;
      default: return operand;
    }
  }

  // Evaluate function call
  evaluateFunction(node) {
    const args = node.args.map(arg => this.evaluateNode(arg));

    // User-defined functions
    if (node.userDefined) {
      const fn = this.userFunctions.get(node.name.substring(2)); // Remove 'FN'
      if (!fn) throw new Error(`UNDEFINED FUNCTION ${node.name}`);

      // Temporarily set parameter value
      const oldValue = this.variables.get(fn.param);
      this.variables.set(fn.param, args[0]);
      const result = this.evaluateNode(fn.body);
      if (oldValue !== undefined) {
        this.variables.set(fn.param, oldValue);
      } else {
        this.variables.delete(fn.param);
      }
      return result;
    }

    // Built-in functions
    switch (node.name) {
      // Math functions
      case 'ABS': return Math.abs(args[0]);
      case 'SGN': return args[0] > 0 ? 1 : (args[0] < 0 ? -1 : 0);
      case 'INT': return Math.floor(args[0]);
      case 'FIX': return Math.trunc(args[0]);
      case 'SQR':
        if (args[0] < 0) throw new Error('ILLEGAL FUNCTION CALL');
        return Math.sqrt(args[0]);
      case 'LOG':
        if (args[0] <= 0) throw new Error('ILLEGAL FUNCTION CALL');
        return Math.log(args[0]);
      case 'EXP':
        const expResult = Math.exp(args[0]);
        if (!isFinite(expResult)) throw new Error('OVERFLOW');
        return expResult;
      case 'SIN': return Math.sin(args[0]);
      case 'COS': return Math.cos(args[0]);
      case 'TAN': return Math.tan(args[0]);
      case 'ATN': return Math.atan(args[0]);
      case 'RND': {
        // CoCo-style RND
        if (args.length === 0 || args[0] === 0) {
          return this.random();
        } else if (args[0] < 0) {
          this.rndSeed = Math.abs(Math.floor(args[0]));
          return this.random();
        } else {
          // RND(n) returns integer from 1 to n
          const n = Math.floor(args[0]);
          if (n < 1) return this.random(); // Fallback for values like 0.5
          return Math.floor(this.random() * n) + 1;
        }
      }

      // String functions
      case 'LEN': return String(args[0]).length;
      case 'LEFT$': {
        if (args[1] === undefined || args[1] < 0 || !isFinite(args[1])) {
          throw new Error('ILLEGAL FUNCTION CALL');
        }
        return String(args[0]).substring(0, Math.floor(args[1]));
      }
      case 'RIGHT$': {
        if (args[1] === undefined || args[1] < 0 || !isFinite(args[1])) {
          throw new Error('ILLEGAL FUNCTION CALL');
        }
        const n = Math.floor(args[1]);
        return n === 0 ? '' : String(args[0]).slice(-n);
      }
      case 'MID$': {
        if (args[1] === undefined || args[1] < 1 || !isFinite(args[1])) {
          throw new Error('ILLEGAL FUNCTION CALL');
        }
        const str = String(args[0]);
        const start = Math.floor(args[1]) - 1;
        const len = args.length > 2 ? Math.floor(args[2]) : str.length;
        if (args.length > 2 && (len < 0 || !isFinite(len))) {
          throw new Error('ILLEGAL FUNCTION CALL');
        }
        return str.substring(start, start + len);
      }
      case 'CHR$': {
        const code = Math.floor(args[0]);
        if (code < 0 || code > 255) throw new Error('ILLEGAL FUNCTION CALL');
        return String.fromCharCode(code);
      }
      case 'ASC': return args[0].length > 0 ? args[0].charCodeAt(0) : 0;
      case 'STR$': return String(args[0]);
      case 'VAL': return parseFloat(args[0]) || 0;
      case 'STRING$': {
        const count = Math.floor(args[0]);
        if (count < 0 || count > 255) throw new Error('ILLEGAL FUNCTION CALL');
        const char = typeof args[1] === 'number' ? String.fromCharCode(args[1] & 0xFF) : args[1].charAt(0);
        return char.repeat(count);
      }
      case 'INSTR':
        if (args.length === 2) {
          return String(args[0]).indexOf(String(args[1])) + 1;
        } else {
          return String(args[1]).indexOf(String(args[2]), args[0] - 1) + 1;
        }
      case 'INKEY$':
        if (this.keyBuffer.length > 0) {
          return this.keyBuffer.shift();
        }
        return '';

      // Memory functions
      case 'PEEK': return this.memory.peek(Math.floor(args[0]));
      case 'POINT':
        return this.graphics.point(Math.floor(args[0]), Math.floor(args[1]));

      // System functions
      case 'TIMER': return Math.floor((Date.now() - this.startTime) / 16.67) & 0xFFFF;
      case 'MEM': return this.memory.getFreeMemory();
      case 'POS': return this.graphics.textCol;

      default:
        throw new Error(`UNKNOWN FUNCTION ${node.name}`);
    }
  }

  // Random number generator (0-1)
  random() {
    // Linear congruential generator (similar to CoCo)
    this.rndSeed = (this.rndSeed * 1103515245 + 12345) & 0x7FFFFFFF;
    return this.rndSeed / 0x7FFFFFFF;
  }

  // Add key to buffer
  keyPress(key) {
    this.keyBuffer.push(key);
  }

  // Helper delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Start timer updates
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.memory.incrementTimer();
    }, 16.67); // ~60 Hz
  }

  // Stop timer updates
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // List program
  list(startLine = null, endLine = null) {
    let output = '';

    for (const lineNum of this.sortedLineNumbers) {
      if (startLine !== null && lineNum < startLine) continue;
      if (endLine !== null && lineNum > endLine) break;

      const line = this.program.get(lineNum);
      output += `${lineNum} ${this.lineToString(line)}\n`;
    }

    return output;
  }

  // Convert line to string
  lineToString(line) {
    return line.statements.map(stmt => this.statementToString(stmt)).join(':');
  }

  // Convert statement to string (reverse parsing)
  statementToString(stmt) {
    if (!stmt) return '';

    switch (stmt.type) {
      case NodeType.REM:
        return `REM ${stmt.comment}`;
      case NodeType.PRINT:
        return 'PRINT ' + stmt.items.map(i =>
          i.type === 'expr' ? this.exprToString(i.value) : (i.type === 'tab' ? ',' : '')
        ).join(';') + (stmt.newline ? '' : ';');
      case NodeType.GOTO:
        return `GOTO ${stmt.lineNumber}`;
      case NodeType.GOSUB:
        return `GOSUB ${stmt.lineNumber}`;
      case NodeType.RETURN:
        return 'RETURN';
      case NodeType.END:
        return 'END';
      // Add more as needed
      default:
        return stmt.type;
    }
  }

  // Convert expression to string
  exprToString(node) {
    if (!node) return '';
    switch (node.type) {
      case NodeType.NUMBER:
        return String(node.value);
      case NodeType.STRING:
        return `"${node.value}"`;
      case NodeType.VARIABLE:
        return node.name;
      case NodeType.BINARY_OP:
        return `(${this.exprToString(node.left)} ${node.operator} ${this.exprToString(node.right)})`;
      default:
        return '';
    }
  }

  // Get the graphics instance
  getGraphics() {
    return this.graphics;
  }

  // Get the sound instance
  getSound() {
    return this.sound;
  }

  // Get the memory instance
  getMemory() {
    return this.memory;
  }
}

module.exports = { Interpreter };
