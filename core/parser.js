/**
 * TRS-80 Color Computer Extended BASIC Parser
 *
 * Converts token stream into an Abstract Syntax Tree (AST).
 * Handles the syntax of line-numbered BASIC programs.
 */

const { TokenType } = require('./tokens');

// AST Node Types
const NodeType = {
  PROGRAM: 'PROGRAM',
  LINE: 'LINE',
  STATEMENT: 'STATEMENT',
  BINARY_OP: 'BINARY_OP',
  UNARY_OP: 'UNARY_OP',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  VARIABLE: 'VARIABLE',
  ARRAY_ACCESS: 'ARRAY_ACCESS',
  FUNCTION_CALL: 'FUNCTION_CALL',
  ASSIGNMENT: 'ASSIGNMENT',
  PRINT: 'PRINT',
  INPUT: 'INPUT',
  IF: 'IF',
  FOR: 'FOR',
  NEXT: 'NEXT',
  GOTO: 'GOTO',
  GOSUB: 'GOSUB',
  RETURN: 'RETURN',
  ON_GOTO: 'ON_GOTO',
  ON_GOSUB: 'ON_GOSUB',
  END: 'END',
  STOP: 'STOP',
  REM: 'REM',
  DIM: 'DIM',
  DATA: 'DATA',
  READ: 'READ',
  RESTORE: 'RESTORE',
  DEF_FN: 'DEF_FN',
  POKE: 'POKE',
  CLS: 'CLS',
  LOCATE: 'LOCATE',
  COLOR: 'COLOR',
  SCREEN: 'SCREEN',
  PMODE: 'PMODE',
  PCLS: 'PCLS',
  PSET: 'PSET',
  PRESET: 'PRESET',
  LINE_DRAW: 'LINE_DRAW',
  CIRCLE: 'CIRCLE',
  PAINT: 'PAINT',
  DRAW: 'DRAW',
  GET: 'GET',
  PUT: 'PUT',
  PCOPY: 'PCOPY',
  SOUND: 'SOUND',
  PLAY: 'PLAY',
  CLEAR: 'CLEAR',
};

class ASTNode {
  constructor(type, props = {}) {
    this.type = type;
    Object.assign(this, props);
  }
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
    this.currentLine = 0;
  }

  error(message) {
    const token = this.peek();
    throw new Error(`Parser error at line ${token.line}, column ${token.column}: ${message}`);
  }

  peek(offset = 0) {
    const pos = this.pos + offset;
    if (pos >= this.tokens.length) return this.tokens[this.tokens.length - 1];
    return this.tokens[pos];
  }

  advance() {
    const token = this.tokens[this.pos];
    this.pos++;
    return token;
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        return this.advance();
      }
    }
    return null;
  }

  check(type) {
    return this.peek().type === type;
  }

  expect(type, message) {
    if (this.check(type)) {
      return this.advance();
    }
    this.error(message || `Expected ${type}, got ${this.peek().type}`);
  }

  isAtEnd() {
    return this.check(TokenType.EOF);
  }

  skipNewlines() {
    while (this.match(TokenType.NEWLINE)) {
      // Skip
    }
  }

  parse() {
    const lines = [];

    this.skipNewlines();

    while (!this.isAtEnd()) {
      const line = this.parseLine();
      if (line) lines.push(line);
      this.skipNewlines();
    }

    return new ASTNode(NodeType.PROGRAM, { lines });
  }

  parseLine() {
    // A line starts with a line number
    if (!this.check(TokenType.NUMBER)) {
      // Direct mode - no line number
      const statements = this.parseStatements();
      return new ASTNode(NodeType.LINE, { lineNumber: null, statements });
    }

    const lineNumber = this.advance().value;
    this.currentLine = lineNumber;
    const statements = this.parseStatements();

    return new ASTNode(NodeType.LINE, { lineNumber, statements });
  }

  parseStatements() {
    const statements = [];

    while (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);

      // Statements can be separated by colons
      if (!this.match(TokenType.COLON)) {
        break;
      }
    }

    return statements;
  }

  parseStatement() {
    const token = this.peek();

    switch (token.type) {
      case TokenType.REM:
        return this.parseRem();
      case TokenType.LET:
        this.advance();
        return this.parseAssignment();
      case TokenType.PRINT:
        return this.parsePrint();
      case TokenType.INPUT:
        return this.parseInput();
      case TokenType.IF:
        return this.parseIf();
      case TokenType.FOR:
        return this.parseFor();
      case TokenType.NEXT:
        return this.parseNext();
      case TokenType.GOTO:
        return this.parseGoto();
      case TokenType.GOSUB:
        return this.parseGosub();
      case TokenType.RETURN:
        this.advance();
        return new ASTNode(NodeType.RETURN);
      case TokenType.ON:
        return this.parseOn();
      case TokenType.END:
        this.advance();
        return new ASTNode(NodeType.END);
      case TokenType.STOP:
        this.advance();
        return new ASTNode(NodeType.STOP);
      case TokenType.DIM:
        return this.parseDim();
      case TokenType.DATA:
        return this.parseData();
      case TokenType.READ:
        return this.parseRead();
      case TokenType.RESTORE:
        return this.parseRestore();
      case TokenType.DEF:
        return this.parseDefFn();
      case TokenType.POKE:
        return this.parsePoke();
      case TokenType.CLS:
        return this.parseCls();
      case TokenType.LOCATE:
        return this.parseLocate();
      case TokenType.COLOR:
        return this.parseColor();
      case TokenType.SCREEN:
        return this.parseScreen();
      case TokenType.PMODE:
        return this.parsePmode();
      case TokenType.PCLS:
        return this.parsePcls();
      case TokenType.PSET:
        return this.parsePset(false);
      case TokenType.PRESET:
        return this.parsePset(true);
      case TokenType.LINE:
        return this.parseLineDraw();
      case TokenType.CIRCLE:
        return this.parseCircle();
      case TokenType.PAINT:
        return this.parsePaint();
      case TokenType.DRAW:
        return this.parseDraw();
      case TokenType.GET:
        return this.parseGet();
      case TokenType.PUT:
        return this.parsePut();
      case TokenType.PCOPY:
        return this.parsePcopy();
      case TokenType.SOUND:
        return this.parseSound();
      case TokenType.PLAY:
        return this.parsePlay();
      case TokenType.CLEAR:
        return this.parseClear();
      case TokenType.IDENTIFIER:
        return this.parseAssignment();
      default:
        // Skip unknown tokens
        this.advance();
        return null;
    }
  }

  parseRem() {
    const token = this.advance();
    return new ASTNode(NodeType.REM, { comment: token.value });
  }

  parseAssignment() {
    const name = this.expect(TokenType.IDENTIFIER, 'Expected variable name');
    let indices = null;

    // Check for array access
    if (this.match(TokenType.LPAREN)) {
      indices = [];
      do {
        indices.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
      this.expect(TokenType.RPAREN, 'Expected )');
    }

    this.expect(TokenType.EQUALS, 'Expected = in assignment');
    const value = this.parseExpression();

    return new ASTNode(NodeType.ASSIGNMENT, {
      name: name.value,
      indices,
      value
    });
  }

  parsePrint() {
    this.advance(); // consume PRINT

    const items = [];
    let newline = true;

    while (!this.check(TokenType.NEWLINE) && !this.check(TokenType.COLON) && !this.isAtEnd()) {
      // Check for TAB or semicolon/comma
      if (this.match(TokenType.SEMICOLON)) {
        newline = false;
        continue;
      }
      if (this.match(TokenType.COMMA)) {
        items.push({ type: 'tab' });
        newline = false;
        continue;
      }

      // TAB function
      if (this.check(TokenType.TAB)) {
        this.advance();
        this.expect(TokenType.LPAREN, 'Expected ( after TAB');
        const pos = this.parseExpression();
        this.expect(TokenType.RPAREN, 'Expected )');
        items.push({ type: 'tabTo', position: pos });
        newline = true;
        continue;
      }

      items.push({ type: 'expr', value: this.parseExpression() });
      newline = true;
    }

    return new ASTNode(NodeType.PRINT, { items, newline });
  }

  parseInput() {
    this.advance(); // consume INPUT

    let prompt = null;
    const variables = [];

    // Check for optional prompt string
    if (this.check(TokenType.STRING)) {
      prompt = this.advance().value;
      // Expect semicolon after prompt
      this.match(TokenType.SEMICOLON) || this.match(TokenType.COMMA);
    }

    // Parse variable list
    do {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected variable name');
      let indices = null;

      if (this.match(TokenType.LPAREN)) {
        indices = [];
        do {
          indices.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
        this.expect(TokenType.RPAREN, 'Expected )');
      }

      variables.push({ name: name.value, indices });
    } while (this.match(TokenType.COMMA));

    return new ASTNode(NodeType.INPUT, { prompt, variables });
  }

  parseIf() {
    this.advance(); // consume IF

    const condition = this.parseExpression();
    this.expect(TokenType.THEN, 'Expected THEN after IF condition');

    let thenBranch;
    let elseBranch = null;

    // THEN can be followed by a line number (GOTO) or statements
    if (this.check(TokenType.NUMBER)) {
      const lineNum = this.advance().value;
      thenBranch = [new ASTNode(NodeType.GOTO, { lineNumber: lineNum })];
    } else {
      thenBranch = this.parseStatements();
    }

    // Check for ELSE
    if (this.match(TokenType.ELSE)) {
      if (this.check(TokenType.NUMBER)) {
        const lineNum = this.advance().value;
        elseBranch = [new ASTNode(NodeType.GOTO, { lineNumber: lineNum })];
      } else {
        elseBranch = this.parseStatements();
      }
    }

    return new ASTNode(NodeType.IF, { condition, thenBranch, elseBranch });
  }

  parseFor() {
    this.advance(); // consume FOR

    const variable = this.expect(TokenType.IDENTIFIER, 'Expected variable name').value;
    this.expect(TokenType.EQUALS, 'Expected = in FOR');
    const start = this.parseExpression();
    this.expect(TokenType.TO, 'Expected TO in FOR');
    const end = this.parseExpression();

    let step = null;
    if (this.match(TokenType.STEP)) {
      step = this.parseExpression();
    }

    return new ASTNode(NodeType.FOR, { variable, start, end, step });
  }

  parseNext() {
    this.advance(); // consume NEXT

    const variables = [];
    if (this.check(TokenType.IDENTIFIER)) {
      do {
        variables.push(this.advance().value);
      } while (this.match(TokenType.COMMA));
    }

    return new ASTNode(NodeType.NEXT, { variables });
  }

  parseGoto() {
    this.advance(); // consume GOTO

    // Handle GO TO as two tokens
    if (this.check(TokenType.TO)) {
      this.advance();
    }

    const lineNumber = this.expect(TokenType.NUMBER, 'Expected line number').value;
    return new ASTNode(NodeType.GOTO, { lineNumber });
  }

  parseGosub() {
    this.advance(); // consume GOSUB
    const lineNumber = this.expect(TokenType.NUMBER, 'Expected line number').value;
    return new ASTNode(NodeType.GOSUB, { lineNumber });
  }

  parseOn() {
    this.advance(); // consume ON
    const expression = this.parseExpression();

    if (this.match(TokenType.GOTO)) {
      const lineNumbers = this.parseNumberList();
      return new ASTNode(NodeType.ON_GOTO, { expression, lineNumbers });
    } else if (this.match(TokenType.GOSUB)) {
      const lineNumbers = this.parseNumberList();
      return new ASTNode(NodeType.ON_GOSUB, { expression, lineNumbers });
    }

    this.error('Expected GOTO or GOSUB after ON expression');
  }

  parseNumberList() {
    const numbers = [];
    do {
      numbers.push(this.expect(TokenType.NUMBER, 'Expected line number').value);
    } while (this.match(TokenType.COMMA));
    return numbers;
  }

  parseDim() {
    this.advance(); // consume DIM

    const arrays = [];
    do {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected array name').value;
      this.expect(TokenType.LPAREN, 'Expected (');
      const dimensions = [];
      do {
        dimensions.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
      this.expect(TokenType.RPAREN, 'Expected )');
      arrays.push({ name, dimensions });
    } while (this.match(TokenType.COMMA));

    return new ASTNode(NodeType.DIM, { arrays });
  }

  parseData() {
    this.advance(); // consume DATA

    const values = [];
    do {
      if (this.check(TokenType.STRING)) {
        values.push({ type: 'string', value: this.advance().value });
      } else if (this.check(TokenType.NUMBER)) {
        values.push({ type: 'number', value: this.advance().value });
      } else if (this.check(TokenType.MINUS)) {
        this.advance();
        const num = this.expect(TokenType.NUMBER, 'Expected number');
        values.push({ type: 'number', value: -num.value });
      } else if (this.check(TokenType.IDENTIFIER)) {
        // Unquoted string data
        values.push({ type: 'string', value: this.advance().value });
      } else {
        break;
      }
    } while (this.match(TokenType.COMMA));

    return new ASTNode(NodeType.DATA, { values });
  }

  parseRead() {
    this.advance(); // consume READ

    const variables = [];
    do {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected variable name').value;
      let indices = null;

      if (this.match(TokenType.LPAREN)) {
        indices = [];
        do {
          indices.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
        this.expect(TokenType.RPAREN, 'Expected )');
      }

      variables.push({ name, indices });
    } while (this.match(TokenType.COMMA));

    return new ASTNode(NodeType.READ, { variables });
  }

  parseRestore() {
    this.advance(); // consume RESTORE
    let lineNumber = null;
    if (this.check(TokenType.NUMBER)) {
      lineNumber = this.advance().value;
    }
    return new ASTNode(NodeType.RESTORE, { lineNumber });
  }

  parseDefFn() {
    this.advance(); // consume DEF
    this.expect(TokenType.FN, 'Expected FN');

    const name = this.expect(TokenType.IDENTIFIER, 'Expected function name').value;
    this.expect(TokenType.LPAREN, 'Expected (');
    const param = this.expect(TokenType.IDENTIFIER, 'Expected parameter').value;
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.EQUALS, 'Expected =');
    const body = this.parseExpression();

    return new ASTNode(NodeType.DEF_FN, { name, param, body });
  }

  parsePoke() {
    this.advance(); // consume POKE
    const address = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma in POKE');
    const value = this.parseExpression();
    return new ASTNode(NodeType.POKE, { address, value });
  }

  parseCls() {
    this.advance(); // consume CLS
    let color = null;
    if (this.check(TokenType.NUMBER) || this.check(TokenType.IDENTIFIER) || this.check(TokenType.LPAREN)) {
      color = this.parseExpression();
    }
    return new ASTNode(NodeType.CLS, { color });
  }

  parseLocate() {
    this.advance(); // consume LOCATE
    const row = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const col = this.parseExpression();
    return new ASTNode(NodeType.LOCATE, { row, col });
  }

  parseColor() {
    this.advance(); // consume COLOR
    const foreground = this.parseExpression();
    let background = null;
    if (this.match(TokenType.COMMA)) {
      background = this.parseExpression();
    }
    return new ASTNode(NodeType.COLOR, { foreground, background });
  }

  parseScreen() {
    this.advance(); // consume SCREEN
    const type = this.parseExpression();
    let colorSet = null;
    if (this.match(TokenType.COMMA)) {
      colorSet = this.parseExpression();
    }
    return new ASTNode(NodeType.SCREEN, { type, colorSet });
  }

  parsePmode() {
    this.advance(); // consume PMODE
    const mode = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const startPage = this.parseExpression();
    return new ASTNode(NodeType.PMODE, { mode, startPage });
  }

  parsePcls() {
    this.advance(); // consume PCLS
    let color = null;
    if (this.check(TokenType.NUMBER) || this.check(TokenType.IDENTIFIER) || this.check(TokenType.LPAREN)) {
      color = this.parseExpression();
    }
    return new ASTNode(NodeType.PCLS, { color });
  }

  parsePset(isPreset) {
    this.advance(); // consume PSET or PRESET
    this.expect(TokenType.LPAREN, 'Expected (');
    const x = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');

    let color = null;
    if (this.match(TokenType.COMMA)) {
      color = this.parseExpression();
    }

    return new ASTNode(NodeType.PSET, { x, y, color, preset: isPreset });
  }

  parseLineDraw() {
    this.advance(); // consume LINE

    let x1 = null, y1 = null;

    // LINE can start with coordinates or with -
    if (this.check(TokenType.LPAREN)) {
      this.advance();
      x1 = this.parseExpression();
      this.expect(TokenType.COMMA, 'Expected comma');
      y1 = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected )');
    }

    this.expect(TokenType.MINUS, 'Expected - in LINE');
    this.expect(TokenType.LPAREN, 'Expected (');
    const x2 = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y2 = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');

    let color = null;
    let box = false;
    let fill = false;

    if (this.match(TokenType.COMMA)) {
      // Parse color expression (optional - may be empty before next comma)
      if (!this.check(TokenType.COMMA) && !this.check(TokenType.PSET) && !this.check(TokenType.PRESET)) {
        color = this.parseExpression();
      }

      // Check for PSET or PRESET mode
      if (this.check(TokenType.PSET) || this.check(TokenType.PRESET)) {
        this.advance();
      }

      if (this.match(TokenType.COMMA)) {
        // Box or BoxFill - handle as IDENTIFIER since B/BF aren't keywords
        if (this.check(TokenType.IDENTIFIER)) {
          const id = this.peek().value;
          if (id === 'BF') {
            box = true;
            fill = true;
            this.advance();
          } else if (id === 'B') {
            box = true;
            this.advance();
          }
        }
      }
    }

    return new ASTNode(NodeType.LINE_DRAW, { x1, y1, x2, y2, color, box, fill });
  }

  parseCircle() {
    this.advance(); // consume CIRCLE
    this.expect(TokenType.LPAREN, 'Expected (');
    const x = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.COMMA, 'Expected comma');
    const radius = this.parseExpression();

    let color = null;
    let ratio = null;
    let startAngle = null;
    let endAngle = null;

    if (this.match(TokenType.COMMA)) {
      if (!this.check(TokenType.COMMA)) {
        color = this.parseExpression();
      }
      if (this.match(TokenType.COMMA)) {
        if (!this.check(TokenType.COMMA)) {
          ratio = this.parseExpression();
        }
        if (this.match(TokenType.COMMA)) {
          startAngle = this.parseExpression();
          if (this.match(TokenType.COMMA)) {
            endAngle = this.parseExpression();
          }
        }
      }
    }

    return new ASTNode(NodeType.CIRCLE, { x, y, radius, color, ratio, startAngle, endAngle });
  }

  parsePaint() {
    this.advance(); // consume PAINT
    this.expect(TokenType.LPAREN, 'Expected (');
    const x = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');

    let color = null;
    let borderColor = null;

    if (this.match(TokenType.COMMA)) {
      color = this.parseExpression();
      if (this.match(TokenType.COMMA)) {
        borderColor = this.parseExpression();
      }
    }

    return new ASTNode(NodeType.PAINT, { x, y, color, borderColor });
  }

  parseDraw() {
    this.advance(); // consume DRAW
    const commands = this.parseExpression();
    return new ASTNode(NodeType.DRAW, { commands });
  }

  parseGet() {
    this.advance(); // consume GET
    this.expect(TokenType.LPAREN, 'Expected (');
    const x1 = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y1 = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.MINUS, 'Expected -');
    this.expect(TokenType.LPAREN, 'Expected (');
    const x2 = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y2 = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.COMMA, 'Expected comma');
    const arrayName = this.expect(TokenType.IDENTIFIER, 'Expected array name').value;

    let mode = null;
    if (this.match(TokenType.COMMA)) {
      mode = this.advance().value;
    }

    return new ASTNode(NodeType.GET, { x1, y1, x2, y2, arrayName, mode });
  }

  parsePut() {
    this.advance(); // consume PUT
    this.expect(TokenType.LPAREN, 'Expected (');
    const x1 = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y1 = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.MINUS, 'Expected -');
    this.expect(TokenType.LPAREN, 'Expected (');
    const x2 = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y2 = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.COMMA, 'Expected comma');
    const arrayName = this.expect(TokenType.IDENTIFIER, 'Expected array name').value;

    let mode = null;
    if (this.match(TokenType.COMMA)) {
      mode = this.advance().value;
    }

    return new ASTNode(NodeType.PUT, { x1, y1, x2, y2, arrayName, mode });
  }

  parsePcopy() {
    this.advance(); // consume PCOPY
    const source = this.parseExpression();
    this.expect(TokenType.TO, 'Expected TO');
    const dest = this.parseExpression();
    return new ASTNode(NodeType.PCOPY, { source, dest });
  }

  parseSound() {
    this.advance(); // consume SOUND
    const frequency = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const duration = this.parseExpression();
    return new ASTNode(NodeType.SOUND, { frequency, duration });
  }

  parsePlay() {
    this.advance(); // consume PLAY
    const music = this.parseExpression();
    return new ASTNode(NodeType.PLAY, { music });
  }

  parseClear() {
    this.advance(); // consume CLEAR
    let stringSpace = null;
    let highestAddr = null;

    if (this.check(TokenType.NUMBER)) {
      stringSpace = this.parseExpression();
      if (this.match(TokenType.COMMA)) {
        highestAddr = this.parseExpression();
      }
    }

    return new ASTNode(NodeType.CLEAR, { stringSpace, highestAddr });
  }

  // Expression parsing with precedence climbing
  parseExpression() {
    return this.parseOr();
  }

  parseOr() {
    let left = this.parseAnd();

    while (this.match(TokenType.OR)) {
      const right = this.parseAnd();
      left = new ASTNode(NodeType.BINARY_OP, { operator: 'OR', left, right });
    }

    return left;
  }

  parseAnd() {
    let left = this.parseNot();

    while (this.match(TokenType.AND)) {
      const right = this.parseNot();
      left = new ASTNode(NodeType.BINARY_OP, { operator: 'AND', left, right });
    }

    return left;
  }

  parseNot() {
    if (this.match(TokenType.NOT)) {
      const operand = this.parseNot();
      return new ASTNode(NodeType.UNARY_OP, { operator: 'NOT', operand });
    }

    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseAddSub();

    while (true) {
      let operator = null;

      if (this.match(TokenType.EQUALS)) operator = '=';
      else if (this.match(TokenType.NOT_EQUALS)) operator = '<>';
      else if (this.match(TokenType.LESS_THAN)) operator = '<';
      else if (this.match(TokenType.GREATER_THAN)) operator = '>';
      else if (this.match(TokenType.LESS_EQUAL)) operator = '<=';
      else if (this.match(TokenType.GREATER_EQUAL)) operator = '>=';
      else break;

      const right = this.parseAddSub();
      left = new ASTNode(NodeType.BINARY_OP, { operator, left, right });
    }

    return left;
  }

  parseAddSub() {
    let left = this.parseMulDiv();

    while (true) {
      let operator = null;

      if (this.match(TokenType.PLUS)) operator = '+';
      else if (this.match(TokenType.MINUS)) operator = '-';
      else break;

      const right = this.parseMulDiv();
      left = new ASTNode(NodeType.BINARY_OP, { operator, left, right });
    }

    return left;
  }

  parseMulDiv() {
    let left = this.parsePower();

    while (true) {
      let operator = null;

      if (this.match(TokenType.MULTIPLY)) operator = '*';
      else if (this.match(TokenType.DIVIDE)) operator = '/';
      else break;

      const right = this.parsePower();
      left = new ASTNode(NodeType.BINARY_OP, { operator, left, right });
    }

    return left;
  }

  parsePower() {
    let left = this.parseUnary();

    while (this.match(TokenType.POWER)) {
      const right = this.parseUnary();
      left = new ASTNode(NodeType.BINARY_OP, { operator: '^', left, right });
    }

    return left;
  }

  parseUnary() {
    if (this.match(TokenType.MINUS)) {
      const operand = this.parseUnary();
      return new ASTNode(NodeType.UNARY_OP, { operator: '-', operand });
    }
    if (this.match(TokenType.PLUS)) {
      return this.parseUnary();
    }

    return this.parsePrimary();
  }

  parsePrimary() {
    // Number literal
    if (this.check(TokenType.NUMBER)) {
      return new ASTNode(NodeType.NUMBER, { value: this.advance().value });
    }

    // String literal
    if (this.check(TokenType.STRING)) {
      return new ASTNode(NodeType.STRING, { value: this.advance().value });
    }

    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected )');
      return expr;
    }

    // Built-in functions
    return this.parseFunctionOrVariable();
  }

  parseFunctionOrVariable() {
    const token = this.peek();

    // Check for built-in functions
    const functionTypes = [
      TokenType.ABS, TokenType.SGN, TokenType.INT, TokenType.SQR,
      TokenType.LOG, TokenType.EXP, TokenType.SIN, TokenType.COS,
      TokenType.TAN, TokenType.ATN, TokenType.RND, TokenType.FIX,
      TokenType.LEN, TokenType.VAL, TokenType.ASC, TokenType.PEEK,
      TokenType.POINT, TokenType.POS, TokenType.TIMER, TokenType.MEM,
      TokenType.INSTR,
      // String functions
      TokenType.LEFT$, TokenType.RIGHT$, TokenType.MID$,
      TokenType.CHR$, TokenType.STR$, TokenType.STRING$, TokenType.INKEY$,
    ];

    if (functionTypes.includes(token.type)) {
      const funcName = this.advance().value;

      // INKEY$ doesn't require parentheses
      if (token.type === TokenType.INKEY$) {
        return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [] });
      }

      // RND can be used without arguments
      if (token.type === TokenType.RND) {
        if (this.match(TokenType.LPAREN)) {
          const arg = this.parseExpression();
          this.expect(TokenType.RPAREN, 'Expected )');
          return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [arg] });
        }
        return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [] });
      }

      // TIMER and MEM don't require arguments
      if (token.type === TokenType.TIMER || token.type === TokenType.MEM) {
        return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [] });
      }

      this.expect(TokenType.LPAREN, `Expected ( after ${funcName}`);
      const args = [];
      if (!this.check(TokenType.RPAREN)) {
        do {
          args.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
      }
      this.expect(TokenType.RPAREN, 'Expected )');

      return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args });
    }

    // User-defined function (FN)
    if (this.match(TokenType.FN)) {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected function name').value;
      this.expect(TokenType.LPAREN, 'Expected (');
      const arg = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected )');
      return new ASTNode(NodeType.FUNCTION_CALL, { name: 'FN' + name, args: [arg], userDefined: true });
    }

    // Variable or array access
    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value;

      if (this.match(TokenType.LPAREN)) {
        // Array access or function call
        const args = [];
        if (!this.check(TokenType.RPAREN)) {
          do {
            args.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
        }
        this.expect(TokenType.RPAREN, 'Expected )');

        return new ASTNode(NodeType.ARRAY_ACCESS, { name, indices: args });
      }

      return new ASTNode(NodeType.VARIABLE, { name });
    }

    this.error(`Unexpected token: ${token.type}`);
  }
}

module.exports = { Parser, NodeType, ASTNode };
