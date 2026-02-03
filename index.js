/**
 * TRS-80 Color Computer Extended BASIC Emulator
 *
 * Main entry point for the emulator.
 * Provides both a command-line interface and exports for web use.
 *
 * Usage (Node.js):
 *   node index.js [program.bas]
 *
 * Usage (Web):
 *   const { CoCoEmulator } = require('./index');
 *   const emulator = new CoCoEmulator();
 *   emulator.loadProgram('10 PRINT "HELLO"\n20 GOTO 10');
 *   emulator.run();
 */

const { Interpreter } = require('./core/interpreter');
const { Lexer } = require('./core/lexer');
const { Parser } = require('./core/parser');
const { Memory } = require('./core/memory');
const { Graphics } = require('./graphics/graphics');
const { Sound } = require('./sound/sound');

class CoCoEmulator {
  constructor(options = {}) {
    this.interpreter = new Interpreter({
      inputCallback: options.inputCallback,
      outputCallback: options.outputCallback,
      maxInstructions: options.maxInstructions,
      maxProgramSize: options.maxProgramSize,
      maxStringLength: options.maxStringLength,
      maxMemory: options.maxMemory
    });

    this.programText = '';
    this.directMode = true;

    // Event handlers
    this.onOutput = options.onOutput || null;
    this.onInput = options.onInput || null;
    this.onGraphicsUpdate = options.onGraphicsUpdate || null;
    this.onError = options.onError || null;

    // Setup output callback
    if (this.onOutput) {
      this.interpreter.outputCallback = (text) => this.onOutput(text);
    }
  }

  /**
   * Load a BASIC program from text
   */
  loadProgram(source) {
    this.programText = source;
    try {
      this.interpreter.load(source);
      return { success: true };
    } catch (error) {
      const result = { success: false, error: error.message };
      if (this.onError) this.onError(error.message);
      return result;
    }
  }

  /**
   * Run the loaded program
   */
  async run(startLine = null) {
    this.directMode = false;
    try {
      await this.interpreter.run(startLine);
      return { success: true };
    } catch (error) {
      const result = { success: false, error: error.message };
      if (this.onError) this.onError(error.message);
      return result;
    }
  }

  /**
   * Execute a direct mode command
   */
  async execute(command) {
    try {
      // Check for system commands
      const upper = command.trim().toUpperCase();

      if (upper === 'RUN') {
        return await this.run();
      }

      if (upper === 'NEW') {
        this.interpreter.program.clear();
        this.interpreter.sortedLineNumbers = [];
        this.interpreter.reset();
        return { success: true, output: '' };
      }

      if (upper === 'LIST' || upper.startsWith('LIST ')) {
        const parts = upper.split(' ');
        let start = null, end = null;
        if (parts.length > 1) {
          const range = parts[1].split('-');
          start = parseInt(range[0]) || null;
          end = parseInt(range[1]) || start;
        }
        const output = this.interpreter.list(start, end);
        return { success: true, output };
      }

      if (upper === 'CLEAR') {
        this.interpreter.reset();
        return { success: true, output: '' };
      }

      // Check if it's a line number (program entry)
      const lineMatch = command.match(/^(\d+)\s*(.*)/);
      if (lineMatch) {
        const lineNumber = parseInt(lineMatch[1]);
        const lineContent = lineMatch[2];

        if (lineContent.trim() === '') {
          // Delete line
          this.interpreter.program.delete(lineNumber);
          this.interpreter.sortedLineNumbers = Array.from(
            this.interpreter.program.keys()
          ).sort((a, b) => a - b);
        } else {
          // Add/update line
          const fullLine = command;
          const lexer = new Lexer(fullLine);
          const tokens = lexer.tokenize();
          const parser = new Parser(tokens);
          const ast = parser.parse();

          if (ast.lines.length > 0 && ast.lines[0].lineNumber !== null) {
            this.interpreter.program.set(lineNumber, ast.lines[0]);
            this.interpreter.sortedLineNumbers = Array.from(
              this.interpreter.program.keys()
            ).sort((a, b) => a - b);

            // Update DATA values
            this.updateDataValues();
          }
        }
        return { success: true, output: '' };
      }

      // Execute as direct mode statement
      const lexer = new Lexer(command);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();

      if (ast.lines.length > 0) {
        await this.interpreter.executeLine(ast.lines[0]);
      }

      return { success: true, output: '' };
    } catch (error) {
      const result = { success: false, error: `?${error.message}` };
      if (this.onError) this.onError(error.message);
      return result;
    }
  }

  /**
   * Update DATA values from program
   */
  updateDataValues() {
    const { NodeType } = require('./core/parser');
    this.interpreter.dataValues = [];

    for (const lineNum of this.interpreter.sortedLineNumbers) {
      const line = this.interpreter.program.get(lineNum);
      for (const stmt of line.statements) {
        if (stmt && stmt.type === NodeType.DATA) {
          for (const value of stmt.values) {
            this.interpreter.dataValues.push(value);
          }
        }
      }
    }
  }

  /**
   * Stop program execution
   */
  stop() {
    this.interpreter.running = false;
    this.interpreter.stopped = true;
  }

  /**
   * Continue execution after STOP
   */
  async cont() {
    if (this.interpreter.stopped) {
      this.interpreter.stopped = false;
      this.interpreter.running = true;
      // Continue from current position
      while (this.interpreter.running &&
             this.interpreter.nextLineIndex < this.interpreter.sortedLineNumbers.length) {
        const lineNumber = this.interpreter.sortedLineNumbers[this.interpreter.nextLineIndex];
        const line = this.interpreter.program.get(lineNumber);
        this.interpreter.currentLineNumber = lineNumber;
        this.interpreter.nextLineIndex++;
        await this.interpreter.executeLine(line);
      }
    }
  }

  /**
   * Send keypress to emulator
   */
  keyPress(key) {
    this.interpreter.keyPress(key);
  }

  /**
   * Get the graphics system
   */
  getGraphics() {
    return this.interpreter.getGraphics();
  }

  /**
   * Get the sound system
   */
  getSound() {
    return this.interpreter.getSound();
  }

  /**
   * Get the memory system
   */
  getMemory() {
    return this.interpreter.getMemory();
  }

  /**
   * Set the canvas for graphics output
   */
  setCanvas(canvas) {
    this.interpreter.getGraphics().setCanvas(canvas);
  }

  /**
   * Get current program as text
   */
  getProgram() {
    return this.interpreter.list();
  }

  /**
   * Get variable value
   */
  getVariable(name) {
    return this.interpreter.variables.get(name.toUpperCase());
  }

  /**
   * Set variable value
   */
  setVariable(name, value) {
    this.interpreter.variables.set(name.toUpperCase(), value);
  }
}

// Command-line interface
async function main() {
  const fs = require('fs');
  const readline = require('readline');

  console.log('TRS-80 COLOR COMPUTER EXTENDED BASIC');
  console.log('COPYRIGHT (C) 1983 BY TANDY');
  console.log('EMULATOR BY CLAUDE');
  console.log('');

  const emulator = new CoCoEmulator({
    outputCallback: (text) => process.stdout.write(text)
  });

  // Check for program file argument
  if (process.argv.length > 2) {
    const filename = process.argv[2];
    try {
      const program = fs.readFileSync(filename, 'utf-8');
      emulator.loadProgram(program);
      console.log(`LOADED: ${filename}`);

      if (process.argv.includes('--run')) {
        await emulator.run();
        process.exit(0);
      }
    } catch (err) {
      console.log(`?FILE NOT FOUND: ${filename}`);
    }
  }

  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Setup input callback for INPUT statement
  emulator.interpreter.inputCallback = () => {
    return new Promise((resolve) => {
      rl.question('', (answer) => {
        resolve(answer);
      });
    });
  };

  const prompt = () => {
    rl.question('OK\n', async (line) => {
      if (line.toUpperCase() === 'QUIT' || line.toUpperCase() === 'EXIT') {
        rl.close();
        process.exit(0);
      }

      const result = await emulator.execute(line);
      if (!result.success) {
        console.log(result.error);
      } else if (result.output) {
        console.log(result.output);
      }

      prompt();
    });
  };

  prompt();
}

// Run CLI if this is the main module
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  CoCoEmulator,
  Interpreter,
  Lexer,
  Parser,
  Memory,
  Graphics,
  Sound
};
