/**
 * TRS-80 Color Computer Extended BASIC Emulator - Browser Bundle
 *
 * Self-contained browser version of the emulator.
 * All modules bundled into a single ES module file.
 */

// ============================================================================
// TOKENS
// ============================================================================

const TokenType = {
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  PLUS: 'PLUS',
  MINUS: 'MINUS',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  POWER: 'POWER',
  EQUALS: 'EQUALS',
  NOT_EQUALS: 'NOT_EQUALS',
  LESS_THAN: 'LESS_THAN',
  GREATER_THAN: 'GREATER_THAN',
  LESS_EQUAL: 'LESS_EQUAL',
  GREATER_EQUAL: 'GREATER_EQUAL',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  SEMICOLON: 'SEMICOLON',
  COLON: 'COLON',
  DOLLAR: 'DOLLAR',
  REM: 'REM',
  LET: 'LET',
  PRINT: 'PRINT',
  INPUT: 'INPUT',
  IF: 'IF',
  THEN: 'THEN',
  ELSE: 'ELSE',
  FOR: 'FOR',
  TO: 'TO',
  STEP: 'STEP',
  NEXT: 'NEXT',
  GOTO: 'GOTO',
  GOSUB: 'GOSUB',
  RETURN: 'RETURN',
  ON: 'ON',
  END: 'END',
  STOP: 'STOP',
  RUN: 'RUN',
  LIST: 'LIST',
  NEW: 'NEW',
  CONT: 'CONT',
  DATA: 'DATA',
  READ: 'READ',
  RESTORE: 'RESTORE',
  DIM: 'DIM',
  PEEK: 'PEEK',
  POKE: 'POKE',
  DEF: 'DEF',
  FN: 'FN',
  USR: 'USR',
  'LEFT$': 'LEFT$',
  'RIGHT$': 'RIGHT$',
  'MID$': 'MID$',
  LEN: 'LEN',
  'CHR$': 'CHR$',
  ASC: 'ASC',
  'STR$': 'STR$',
  VAL: 'VAL',
  'STRING$': 'STRING$',
  'INKEY$': 'INKEY$',
  INSTR: 'INSTR',
  ABS: 'ABS',
  SGN: 'SGN',
  INT: 'INT',
  SQR: 'SQR',
  LOG: 'LOG',
  EXP: 'EXP',
  SIN: 'SIN',
  COS: 'COS',
  TAN: 'TAN',
  ATN: 'ATN',
  RND: 'RND',
  FIX: 'FIX',
  CLS: 'CLS',
  SCREEN: 'SCREEN',
  PMODE: 'PMODE',
  PCLS: 'PCLS',
  COLOR: 'COLOR',
  PSET: 'PSET',
  PRESET: 'PRESET',
  LINE: 'LINE',
  CIRCLE: 'CIRCLE',
  PAINT: 'PAINT',
  GET: 'GET',
  PUT: 'PUT',
  DRAW: 'DRAW',
  PCOPY: 'PCOPY',
  LOCATE: 'LOCATE',
  SOUND: 'SOUND',
  PLAY: 'PLAY',
  AUDIO: 'AUDIO',
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  CLOAD: 'CLOAD',
  CSAVE: 'CSAVE',
  CLEAR: 'CLEAR',
  SET: 'SET',
  RESET: 'RESET',
  POINT: 'POINT',
  TAB: 'TAB',
  POS: 'POS',
  TIMER: 'TIMER',
  MEM: 'MEM',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
};

const KEYWORDS = {
  'REM': TokenType.REM, 'LET': TokenType.LET, 'PRINT': TokenType.PRINT,
  '?': TokenType.PRINT, 'INPUT': TokenType.INPUT, 'IF': TokenType.IF,
  'THEN': TokenType.THEN, 'ELSE': TokenType.ELSE, 'FOR': TokenType.FOR,
  'TO': TokenType.TO, 'STEP': TokenType.STEP, 'NEXT': TokenType.NEXT,
  'GOTO': TokenType.GOTO, 'GO': TokenType.GOTO, 'GOSUB': TokenType.GOSUB,
  'RETURN': TokenType.RETURN, 'ON': TokenType.ON, 'END': TokenType.END,
  'STOP': TokenType.STOP, 'RUN': TokenType.RUN, 'LIST': TokenType.LIST,
  'NEW': TokenType.NEW, 'CONT': TokenType.CONT, 'DATA': TokenType.DATA,
  'READ': TokenType.READ, 'RESTORE': TokenType.RESTORE, 'DIM': TokenType.DIM,
  'PEEK': TokenType.PEEK, 'POKE': TokenType.POKE, 'DEF': TokenType.DEF,
  'FN': TokenType.FN, 'USR': TokenType.USR, 'LEFT$': TokenType['LEFT$'],
  'RIGHT$': TokenType['RIGHT$'], 'MID$': TokenType['MID$'], 'LEN': TokenType.LEN,
  'CHR$': TokenType['CHR$'], 'ASC': TokenType.ASC, 'STR$': TokenType['STR$'],
  'VAL': TokenType.VAL, 'STRING$': TokenType['STRING$'], 'INKEY$': TokenType['INKEY$'],
  'INSTR': TokenType.INSTR, 'ABS': TokenType.ABS, 'SGN': TokenType.SGN,
  'INT': TokenType.INT, 'SQR': TokenType.SQR, 'LOG': TokenType.LOG,
  'EXP': TokenType.EXP, 'SIN': TokenType.SIN, 'COS': TokenType.COS,
  'TAN': TokenType.TAN, 'ATN': TokenType.ATN, 'RND': TokenType.RND,
  'FIX': TokenType.FIX, 'CLS': TokenType.CLS, 'SCREEN': TokenType.SCREEN,
  'PMODE': TokenType.PMODE, 'PCLS': TokenType.PCLS, 'COLOR': TokenType.COLOR,
  'PSET': TokenType.PSET, 'PRESET': TokenType.PRESET, 'LINE': TokenType.LINE,
  'CIRCLE': TokenType.CIRCLE, 'PAINT': TokenType.PAINT, 'GET': TokenType.GET,
  'PUT': TokenType.PUT, 'DRAW': TokenType.DRAW, 'PCOPY': TokenType.PCOPY,
  'LOCATE': TokenType.LOCATE, 'SOUND': TokenType.SOUND, 'PLAY': TokenType.PLAY,
  'AUDIO': TokenType.AUDIO, 'OPEN': TokenType.OPEN, 'CLOSE': TokenType.CLOSE,
  'CLOAD': TokenType.CLOAD, 'CSAVE': TokenType.CSAVE, 'CLEAR': TokenType.CLEAR,
  'SET': TokenType.SET, 'RESET': TokenType.RESET, 'POINT': TokenType.POINT,
  'TAB': TokenType.TAB, 'POS': TokenType.POS, 'TIMER': TokenType.TIMER,
  'MEM': TokenType.MEM, 'AND': TokenType.AND, 'OR': TokenType.OR,
  'NOT': TokenType.NOT,
};

class Token {
  constructor(type, value, line = 0, column = 0) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

// ============================================================================
// LEXER
// ============================================================================

class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.column = 1;
    this.tokens = [];
  }

  error(message) {
    throw new Error(`Lexer error at line ${this.line}, column ${this.column}: ${message}`);
  }

  peek(offset = 0) {
    const pos = this.pos + offset;
    if (pos >= this.source.length) return null;
    return this.source[pos];
  }

  advance() {
    const char = this.source[this.pos];
    this.pos++;
    if (char === '\n') { this.line++; this.column = 1; } else { this.column++; }
    return char;
  }

  skipWhitespace() {
    while (this.peek() && this.peek() !== '\n' && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  isDigit(char) { return char && /[0-9]/.test(char); }
  isAlpha(char) { return char && /[A-Za-z]/.test(char); }
  isAlphaNumeric(char) { return char && /[A-Za-z0-9]/.test(char); }

  readNumber() {
    const startColumn = this.column;
    let value = '';
    while (this.isDigit(this.peek())) value += this.advance();
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += this.advance();
      while (this.isDigit(this.peek())) value += this.advance();
    }
    if (this.peek() && /[EeDd]/.test(this.peek())) {
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') value += this.advance();
      while (this.isDigit(this.peek())) value += this.advance();
    }
    return new Token(TokenType.NUMBER, parseFloat(value), this.line, startColumn);
  }

  readString() {
    const startColumn = this.column;
    this.advance();
    let value = '';
    while (this.peek() && this.peek() !== '"' && this.peek() !== '\n') {
      value += this.advance();
    }
    if (this.peek() !== '"') this.error('Unterminated string');
    this.advance();
    return new Token(TokenType.STRING, value, this.line, startColumn);
  }

  readIdentifierOrKeyword() {
    const startColumn = this.column;
    let value = '';
    while (this.isAlphaNumeric(this.peek())) value += this.advance();
    if (this.peek() === '$') value += this.advance();
    const upper = value.toUpperCase();
    if (KEYWORDS[upper]) return new Token(KEYWORDS[upper], upper, this.line, startColumn);
    return new Token(TokenType.IDENTIFIER, value.toUpperCase(), this.line, startColumn);
  }

  readRemark() {
    const startColumn = this.column;
    let value = '';
    this.advance(); this.advance(); this.advance();
    if (this.peek() === ' ') this.advance();
    while (this.peek() && this.peek() !== '\n') value += this.advance();
    return new Token(TokenType.REM, value, this.line, startColumn);
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;
      const char = this.peek();
      const startColumn = this.column;

      if (char === "'") {
        this.advance();
        let comment = '';
        while (this.peek() && this.peek() !== '\n') comment += this.advance();
        this.tokens.push(new Token(TokenType.REM, comment, this.line, startColumn));
        continue;
      }
      if (char === '\n') {
        this.tokens.push(new Token(TokenType.NEWLINE, '\n', this.line, startColumn));
        this.advance();
        continue;
      }
      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek(1)))) {
        this.tokens.push(this.readNumber());
        continue;
      }
      if (char === '"') {
        this.tokens.push(this.readString());
        continue;
      }
      if (this.isAlpha(char)) {
        if (char.toUpperCase() === 'R' && this.peek(1)?.toUpperCase() === 'E' &&
            this.peek(2)?.toUpperCase() === 'M' && !this.isAlphaNumeric(this.peek(3))) {
          this.tokens.push(this.readRemark());
          continue;
        }
        this.tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      switch (char) {
        case '+': this.tokens.push(new Token(TokenType.PLUS, '+', this.line, startColumn)); this.advance(); break;
        case '-': this.tokens.push(new Token(TokenType.MINUS, '-', this.line, startColumn)); this.advance(); break;
        case '*': this.tokens.push(new Token(TokenType.MULTIPLY, '*', this.line, startColumn)); this.advance(); break;
        case '/': this.tokens.push(new Token(TokenType.DIVIDE, '/', this.line, startColumn)); this.advance(); break;
        case '^': this.tokens.push(new Token(TokenType.POWER, '^', this.line, startColumn)); this.advance(); break;
        case '=': this.tokens.push(new Token(TokenType.EQUALS, '=', this.line, startColumn)); this.advance(); break;
        case '<':
          this.advance();
          if (this.peek() === '>') { this.advance(); this.tokens.push(new Token(TokenType.NOT_EQUALS, '<>', this.line, startColumn)); }
          else if (this.peek() === '=') { this.advance(); this.tokens.push(new Token(TokenType.LESS_EQUAL, '<=', this.line, startColumn)); }
          else { this.tokens.push(new Token(TokenType.LESS_THAN, '<', this.line, startColumn)); }
          break;
        case '>':
          this.advance();
          if (this.peek() === '=') { this.advance(); this.tokens.push(new Token(TokenType.GREATER_EQUAL, '>=', this.line, startColumn)); }
          else if (this.peek() === '<') { this.advance(); this.tokens.push(new Token(TokenType.NOT_EQUALS, '><', this.line, startColumn)); }
          else { this.tokens.push(new Token(TokenType.GREATER_THAN, '>', this.line, startColumn)); }
          break;
        case '(': this.tokens.push(new Token(TokenType.LPAREN, '(', this.line, startColumn)); this.advance(); break;
        case ')': this.tokens.push(new Token(TokenType.RPAREN, ')', this.line, startColumn)); this.advance(); break;
        case ',': this.tokens.push(new Token(TokenType.COMMA, ',', this.line, startColumn)); this.advance(); break;
        case ';': this.tokens.push(new Token(TokenType.SEMICOLON, ';', this.line, startColumn)); this.advance(); break;
        case ':': this.tokens.push(new Token(TokenType.COLON, ':', this.line, startColumn)); this.advance(); break;
        case '?': this.tokens.push(new Token(TokenType.PRINT, 'PRINT', this.line, startColumn)); this.advance(); break;
        case '#': this.advance(); break;
        case '@': this.advance(); break;
        default: this.error(`Unexpected character: ${char}`);
      }
    }
    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
    return this.tokens;
  }
}

// ============================================================================
// PARSER
// ============================================================================

const NodeType = {
  PROGRAM: 'PROGRAM', LINE: 'LINE', STATEMENT: 'STATEMENT', BINARY_OP: 'BINARY_OP',
  UNARY_OP: 'UNARY_OP', NUMBER: 'NUMBER', STRING: 'STRING', VARIABLE: 'VARIABLE',
  ARRAY_ACCESS: 'ARRAY_ACCESS', FUNCTION_CALL: 'FUNCTION_CALL', ASSIGNMENT: 'ASSIGNMENT',
  PRINT: 'PRINT', INPUT: 'INPUT', IF: 'IF', FOR: 'FOR', NEXT: 'NEXT', GOTO: 'GOTO',
  GOSUB: 'GOSUB', RETURN: 'RETURN', ON_GOTO: 'ON_GOTO', ON_GOSUB: 'ON_GOSUB',
  END: 'END', STOP: 'STOP', REM: 'REM', DIM: 'DIM', DATA: 'DATA', READ: 'READ',
  RESTORE: 'RESTORE', DEF_FN: 'DEF_FN', POKE: 'POKE', CLS: 'CLS', LOCATE: 'LOCATE',
  COLOR: 'COLOR', SCREEN: 'SCREEN', PMODE: 'PMODE', PCLS: 'PCLS', PSET: 'PSET',
  PRESET: 'PRESET', LINE_DRAW: 'LINE_DRAW', CIRCLE: 'CIRCLE', PAINT: 'PAINT',
  DRAW: 'DRAW', GET: 'GET', PUT: 'PUT', PCOPY: 'PCOPY', SOUND: 'SOUND', PLAY: 'PLAY',
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

  advance() { return this.tokens[this.pos++]; }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) return this.advance();
    }
    return null;
  }

  check(type) { return this.peek().type === type; }

  expect(type, message) {
    if (this.check(type)) return this.advance();
    this.error(message || `Expected ${type}, got ${this.peek().type}`);
  }

  isAtEnd() { return this.check(TokenType.EOF); }

  skipNewlines() { while (this.match(TokenType.NEWLINE)) {} }

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
    if (!this.check(TokenType.NUMBER)) {
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
      if (!this.match(TokenType.COLON)) break;
    }
    return statements;
  }

  parseStatement() {
    const token = this.peek();
    switch (token.type) {
      case TokenType.REM: return this.parseRem();
      case TokenType.LET: this.advance(); return this.parseAssignment();
      case TokenType.PRINT: return this.parsePrint();
      case TokenType.INPUT: return this.parseInput();
      case TokenType.IF: return this.parseIf();
      case TokenType.FOR: return this.parseFor();
      case TokenType.NEXT: return this.parseNext();
      case TokenType.GOTO: return this.parseGoto();
      case TokenType.GOSUB: return this.parseGosub();
      case TokenType.RETURN: this.advance(); return new ASTNode(NodeType.RETURN);
      case TokenType.ON: return this.parseOn();
      case TokenType.END: this.advance(); return new ASTNode(NodeType.END);
      case TokenType.STOP: this.advance(); return new ASTNode(NodeType.STOP);
      case TokenType.DIM: return this.parseDim();
      case TokenType.DATA: return this.parseData();
      case TokenType.READ: return this.parseRead();
      case TokenType.RESTORE: return this.parseRestore();
      case TokenType.DEF: return this.parseDefFn();
      case TokenType.POKE: return this.parsePoke();
      case TokenType.CLS: return this.parseCls();
      case TokenType.LOCATE: return this.parseLocate();
      case TokenType.COLOR: return this.parseColor();
      case TokenType.SCREEN: return this.parseScreen();
      case TokenType.PMODE: return this.parsePmode();
      case TokenType.PCLS: return this.parsePcls();
      case TokenType.PSET: return this.parsePset(false);
      case TokenType.PRESET: return this.parsePset(true);
      case TokenType.LINE: return this.parseLineDraw();
      case TokenType.CIRCLE: return this.parseCircle();
      case TokenType.PAINT: return this.parsePaint();
      case TokenType.DRAW: return this.parseDraw();
      case TokenType.SOUND: return this.parseSound();
      case TokenType.PLAY: return this.parsePlay();
      case TokenType.CLEAR: return this.parseClear();
      case TokenType.IDENTIFIER: return this.parseAssignment();
      default: this.advance(); return null;
    }
  }

  parseRem() { const token = this.advance(); return new ASTNode(NodeType.REM, { comment: token.value }); }

  parseAssignment() {
    const name = this.expect(TokenType.IDENTIFIER, 'Expected variable name');
    let indices = null;
    if (this.match(TokenType.LPAREN)) {
      indices = [];
      do { indices.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
      this.expect(TokenType.RPAREN, 'Expected )');
    }
    this.expect(TokenType.EQUALS, 'Expected = in assignment');
    const value = this.parseExpression();
    return new ASTNode(NodeType.ASSIGNMENT, { name: name.value, indices, value });
  }

  parsePrint() {
    this.advance();
    const items = [];
    let newline = true;
    while (!this.check(TokenType.NEWLINE) && !this.check(TokenType.COLON) && !this.isAtEnd()) {
      if (this.match(TokenType.SEMICOLON)) { newline = false; continue; }
      if (this.match(TokenType.COMMA)) { items.push({ type: 'tab' }); newline = false; continue; }
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
    this.advance();
    let prompt = null;
    const variables = [];
    if (this.check(TokenType.STRING)) {
      prompt = this.advance().value;
      this.match(TokenType.SEMICOLON) || this.match(TokenType.COMMA);
    }
    do {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected variable name');
      let indices = null;
      if (this.match(TokenType.LPAREN)) {
        indices = [];
        do { indices.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
        this.expect(TokenType.RPAREN, 'Expected )');
      }
      variables.push({ name: name.value, indices });
    } while (this.match(TokenType.COMMA));
    return new ASTNode(NodeType.INPUT, { prompt, variables });
  }

  parseIf() {
    this.advance();
    const condition = this.parseExpression();
    this.expect(TokenType.THEN, 'Expected THEN');
    let thenBranch, elseBranch = null;
    if (this.check(TokenType.NUMBER)) {
      thenBranch = [new ASTNode(NodeType.GOTO, { lineNumber: this.advance().value })];
    } else {
      thenBranch = this.parseStatements();
    }
    if (this.match(TokenType.ELSE)) {
      if (this.check(TokenType.NUMBER)) {
        elseBranch = [new ASTNode(NodeType.GOTO, { lineNumber: this.advance().value })];
      } else {
        elseBranch = this.parseStatements();
      }
    }
    return new ASTNode(NodeType.IF, { condition, thenBranch, elseBranch });
  }

  parseFor() {
    this.advance();
    const variable = this.expect(TokenType.IDENTIFIER, 'Expected variable').value;
    this.expect(TokenType.EQUALS, 'Expected =');
    const start = this.parseExpression();
    this.expect(TokenType.TO, 'Expected TO');
    const end = this.parseExpression();
    let step = null;
    if (this.match(TokenType.STEP)) step = this.parseExpression();
    return new ASTNode(NodeType.FOR, { variable, start, end, step });
  }

  parseNext() {
    this.advance();
    const variables = [];
    if (this.check(TokenType.IDENTIFIER)) {
      do { variables.push(this.advance().value); } while (this.match(TokenType.COMMA));
    }
    return new ASTNode(NodeType.NEXT, { variables });
  }

  parseGoto() {
    this.advance();
    if (this.check(TokenType.TO)) this.advance();
    const lineNumber = this.expect(TokenType.NUMBER, 'Expected line number').value;
    return new ASTNode(NodeType.GOTO, { lineNumber });
  }

  parseGosub() {
    this.advance();
    const lineNumber = this.expect(TokenType.NUMBER, 'Expected line number').value;
    return new ASTNode(NodeType.GOSUB, { lineNumber });
  }

  parseOn() {
    this.advance();
    const expression = this.parseExpression();
    if (this.match(TokenType.GOTO)) {
      return new ASTNode(NodeType.ON_GOTO, { expression, lineNumbers: this.parseNumberList() });
    } else if (this.match(TokenType.GOSUB)) {
      return new ASTNode(NodeType.ON_GOSUB, { expression, lineNumbers: this.parseNumberList() });
    }
    this.error('Expected GOTO or GOSUB');
  }

  parseNumberList() {
    const numbers = [];
    do { numbers.push(this.expect(TokenType.NUMBER, 'Expected line number').value); } while (this.match(TokenType.COMMA));
    return numbers;
  }

  parseDim() {
    this.advance();
    const arrays = [];
    do {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected array name').value;
      this.expect(TokenType.LPAREN, 'Expected (');
      const dimensions = [];
      do { dimensions.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
      this.expect(TokenType.RPAREN, 'Expected )');
      arrays.push({ name, dimensions });
    } while (this.match(TokenType.COMMA));
    return new ASTNode(NodeType.DIM, { arrays });
  }

  parseData() {
    this.advance();
    const values = [];
    do {
      if (this.check(TokenType.STRING)) values.push({ type: 'string', value: this.advance().value });
      else if (this.check(TokenType.NUMBER)) values.push({ type: 'number', value: this.advance().value });
      else if (this.check(TokenType.MINUS)) {
        this.advance();
        values.push({ type: 'number', value: -this.expect(TokenType.NUMBER, 'Expected number').value });
      }
      else if (this.check(TokenType.IDENTIFIER)) values.push({ type: 'string', value: this.advance().value });
      else break;
    } while (this.match(TokenType.COMMA));
    return new ASTNode(NodeType.DATA, { values });
  }

  parseRead() {
    this.advance();
    const variables = [];
    do {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected variable name').value;
      let indices = null;
      if (this.match(TokenType.LPAREN)) {
        indices = [];
        do { indices.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
        this.expect(TokenType.RPAREN, 'Expected )');
      }
      variables.push({ name, indices });
    } while (this.match(TokenType.COMMA));
    return new ASTNode(NodeType.READ, { variables });
  }

  parseRestore() {
    this.advance();
    let lineNumber = null;
    if (this.check(TokenType.NUMBER)) lineNumber = this.advance().value;
    return new ASTNode(NodeType.RESTORE, { lineNumber });
  }

  parseDefFn() {
    this.advance();
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
    this.advance();
    const address = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const value = this.parseExpression();
    return new ASTNode(NodeType.POKE, { address, value });
  }

  parseCls() {
    this.advance();
    let color = null;
    if (this.check(TokenType.NUMBER) || this.check(TokenType.IDENTIFIER) || this.check(TokenType.LPAREN)) {
      color = this.parseExpression();
    }
    return new ASTNode(NodeType.CLS, { color });
  }

  parseLocate() {
    this.advance();
    const row = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const col = this.parseExpression();
    return new ASTNode(NodeType.LOCATE, { row, col });
  }

  parseColor() {
    this.advance();
    const foreground = this.parseExpression();
    let background = null;
    if (this.match(TokenType.COMMA)) background = this.parseExpression();
    return new ASTNode(NodeType.COLOR, { foreground, background });
  }

  parseScreen() {
    this.advance();
    const screenMode = this.parseExpression();
    let colorSet = null;
    if (this.match(TokenType.COMMA)) colorSet = this.parseExpression();
    return new ASTNode(NodeType.SCREEN, { screenMode, colorSet });
  }

  parsePmode() {
    this.advance();
    const mode = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const startPage = this.parseExpression();
    return new ASTNode(NodeType.PMODE, { mode, startPage });
  }

  parsePcls() {
    this.advance();
    let color = null;
    if (this.check(TokenType.NUMBER) || this.check(TokenType.IDENTIFIER) || this.check(TokenType.LPAREN)) {
      color = this.parseExpression();
    }
    return new ASTNode(NodeType.PCLS, { color });
  }

  parsePset(isPreset) {
    this.advance();
    this.expect(TokenType.LPAREN, 'Expected (');
    const x = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    let color = null;
    if (this.match(TokenType.COMMA)) color = this.parseExpression();
    return new ASTNode(NodeType.PSET, { x, y, color, preset: isPreset });
  }

  parseLineDraw() {
    this.advance();
    let x1 = null, y1 = null;
    if (this.check(TokenType.LPAREN)) {
      this.advance();
      x1 = this.parseExpression();
      this.expect(TokenType.COMMA, 'Expected comma');
      y1 = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected )');
    }
    this.expect(TokenType.MINUS, 'Expected -');
    this.expect(TokenType.LPAREN, 'Expected (');
    const x2 = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y2 = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    let color = null, box = false, fill = false;
    if (this.match(TokenType.COMMA)) {
      if (!this.check(TokenType.COMMA) && !this.check(TokenType.PSET) && !this.check(TokenType.PRESET)) {
        color = this.parseExpression();
      }
      if (this.check(TokenType.PSET) || this.check(TokenType.PRESET)) this.advance();
      if (this.match(TokenType.COMMA)) {
        if (this.check(TokenType.IDENTIFIER)) {
          const id = this.peek().value;
          if (id === 'BF') { box = true; fill = true; this.advance(); }
          else if (id === 'B') { box = true; this.advance(); }
        }
      }
    }
    return new ASTNode(NodeType.LINE_DRAW, { x1, y1, x2, y2, color, box, fill });
  }

  parseCircle() {
    this.advance();
    this.expect(TokenType.LPAREN, 'Expected (');
    const x = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    this.expect(TokenType.COMMA, 'Expected comma');
    const radius = this.parseExpression();
    let color = null, ratio = null, startAngle = null, endAngle = null;
    if (this.match(TokenType.COMMA)) {
      if (!this.check(TokenType.COMMA)) color = this.parseExpression();
      if (this.match(TokenType.COMMA)) {
        if (!this.check(TokenType.COMMA)) ratio = this.parseExpression();
        if (this.match(TokenType.COMMA)) {
          startAngle = this.parseExpression();
          if (this.match(TokenType.COMMA)) endAngle = this.parseExpression();
        }
      }
    }
    return new ASTNode(NodeType.CIRCLE, { x, y, radius, color, ratio, startAngle, endAngle });
  }

  parsePaint() {
    this.advance();
    this.expect(TokenType.LPAREN, 'Expected (');
    const x = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const y = this.parseExpression();
    this.expect(TokenType.RPAREN, 'Expected )');
    let color = null, borderColor = null;
    if (this.match(TokenType.COMMA)) {
      color = this.parseExpression();
      if (this.match(TokenType.COMMA)) borderColor = this.parseExpression();
    }
    return new ASTNode(NodeType.PAINT, { x, y, color, borderColor });
  }

  parseDraw() { this.advance(); return new ASTNode(NodeType.DRAW, { commands: this.parseExpression() }); }

  parseSound() {
    this.advance();
    const frequency = this.parseExpression();
    this.expect(TokenType.COMMA, 'Expected comma');
    const duration = this.parseExpression();
    return new ASTNode(NodeType.SOUND, { frequency, duration });
  }

  parsePlay() { this.advance(); return new ASTNode(NodeType.PLAY, { music: this.parseExpression() }); }

  parseClear() {
    this.advance();
    let stringSpace = null, highestAddr = null;
    if (this.check(TokenType.NUMBER)) {
      stringSpace = this.parseExpression();
      if (this.match(TokenType.COMMA)) highestAddr = this.parseExpression();
    }
    return new ASTNode(NodeType.CLEAR, { stringSpace, highestAddr });
  }

  parseExpression() { return this.parseOr(); }

  parseOr() {
    let left = this.parseAnd();
    while (this.match(TokenType.OR)) {
      left = new ASTNode(NodeType.BINARY_OP, { operator: 'OR', left, right: this.parseAnd() });
    }
    return left;
  }

  parseAnd() {
    let left = this.parseNot();
    while (this.match(TokenType.AND)) {
      left = new ASTNode(NodeType.BINARY_OP, { operator: 'AND', left, right: this.parseNot() });
    }
    return left;
  }

  parseNot() {
    if (this.match(TokenType.NOT)) {
      return new ASTNode(NodeType.UNARY_OP, { operator: 'NOT', operand: this.parseNot() });
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
      left = new ASTNode(NodeType.BINARY_OP, { operator, left, right: this.parseAddSub() });
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
      left = new ASTNode(NodeType.BINARY_OP, { operator, left, right: this.parseMulDiv() });
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
      left = new ASTNode(NodeType.BINARY_OP, { operator, left, right: this.parsePower() });
    }
    return left;
  }

  parsePower() {
    let left = this.parseUnary();
    while (this.match(TokenType.POWER)) {
      left = new ASTNode(NodeType.BINARY_OP, { operator: '^', left, right: this.parseUnary() });
    }
    return left;
  }

  parseUnary() {
    if (this.match(TokenType.MINUS)) return new ASTNode(NodeType.UNARY_OP, { operator: '-', operand: this.parseUnary() });
    if (this.match(TokenType.PLUS)) return this.parseUnary();
    return this.parsePrimary();
  }

  parsePrimary() {
    if (this.check(TokenType.NUMBER)) return new ASTNode(NodeType.NUMBER, { value: this.advance().value });
    if (this.check(TokenType.STRING)) return new ASTNode(NodeType.STRING, { value: this.advance().value });
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected )');
      return expr;
    }
    return this.parseFunctionOrVariable();
  }

  parseFunctionOrVariable() {
    const token = this.peek();
    const functionTypes = [
      TokenType.ABS, TokenType.SGN, TokenType.INT, TokenType.SQR, TokenType.LOG,
      TokenType.EXP, TokenType.SIN, TokenType.COS, TokenType.TAN, TokenType.ATN,
      TokenType.RND, TokenType.FIX, TokenType.LEN, TokenType.VAL, TokenType.ASC,
      TokenType.PEEK, TokenType.POINT, TokenType.POS, TokenType.TIMER, TokenType.MEM,
      TokenType.INSTR, TokenType['LEFT$'], TokenType['RIGHT$'], TokenType['MID$'],
      TokenType['CHR$'], TokenType['STR$'], TokenType['STRING$'], TokenType['INKEY$'],
    ];

    if (functionTypes.includes(token.type)) {
      const funcName = this.advance().value;
      if (token.type === TokenType['INKEY$']) return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [] });
      if (token.type === TokenType.RND) {
        if (this.match(TokenType.LPAREN)) {
          const arg = this.parseExpression();
          this.expect(TokenType.RPAREN, 'Expected )');
          return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [arg] });
        }
        return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [] });
      }
      if (token.type === TokenType.TIMER || token.type === TokenType.MEM) {
        return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args: [] });
      }
      this.expect(TokenType.LPAREN, `Expected ( after ${funcName}`);
      const args = [];
      if (!this.check(TokenType.RPAREN)) {
        do { args.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
      }
      this.expect(TokenType.RPAREN, 'Expected )');
      return new ASTNode(NodeType.FUNCTION_CALL, { name: funcName, args });
    }

    if (this.match(TokenType.FN)) {
      const name = this.expect(TokenType.IDENTIFIER, 'Expected function name').value;
      this.expect(TokenType.LPAREN, 'Expected (');
      const arg = this.parseExpression();
      this.expect(TokenType.RPAREN, 'Expected )');
      return new ASTNode(NodeType.FUNCTION_CALL, { name: 'FN' + name, args: [arg], userDefined: true });
    }

    if (this.check(TokenType.IDENTIFIER)) {
      const name = this.advance().value;
      if (this.match(TokenType.LPAREN)) {
        const args = [];
        if (!this.check(TokenType.RPAREN)) {
          do { args.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
        }
        this.expect(TokenType.RPAREN, 'Expected )');
        return new ASTNode(NodeType.ARRAY_ACCESS, { name, indices: args });
      }
      return new ASTNode(NodeType.VARIABLE, { name });
    }
    this.error(`Unexpected token: ${token.type}`);
  }
}

// ============================================================================
// MEMORY
// ============================================================================

class Memory {
  constructor() {
    this.ram = new Uint8Array(65536);
    this.TEXT_SCREEN_START = 0x0400;
    this.TIMER = 0x0112;
    this.MEMSIZ = 0x0025;
    this.initSystemVariables();
  }

  initSystemVariables() {
    this.writeWord(this.MEMSIZ, 0x7FFF);
    for (let i = 0; i < 512; i++) this.ram[this.TEXT_SCREEN_START + i] = 0x60;
  }

  peek(address) { return this.ram[address & 0xFFFF]; }
  poke(address, value) { this.ram[address & 0xFFFF] = value & 0xFF; }
  readWord(address) { return (this.ram[address] << 8) | this.ram[address + 1]; }
  writeWord(address, value) { this.ram[address] = (value >> 8) & 0xFF; this.ram[address + 1] = value & 0xFF; }
  getTimer() { return this.readWord(this.TIMER); }
  setTimer(value) { this.writeWord(this.TIMER, value); }
  incrementTimer() { this.setTimer((this.getTimer() + 1) & 0xFFFF); }
  getFreeMemory() { return 32000; }
  reset() { this.ram.fill(0); this.initSystemVariables(); }
}

// ============================================================================
// GRAPHICS
// ============================================================================

class Graphics {
  constructor(memory) {
    this.memory = memory;
    this.textCols = 32;
    this.textRows = 16;
    this.pmode = 0;
    this.screenType = 0;
    this.colorSet = 0;
    this.foregroundColor = 1;
    this.backgroundColor = 0;
    this.width = 256;
    this.height = 192;
    this.buffer = new Uint8Array(this.width * this.height);
    this.cursorX = 0;
    this.cursorY = 0;
    this.textRow = 0;
    this.textCol = 0;
    this.canvas = null;
    this.ctx = null;
    this.textScreen = [];
    for (let i = 0; i < this.textRows; i++) this.textScreen[i] = new Array(this.textCols).fill(' ');
    this.cocoColors = ['#000000', '#00FF00', '#FFFF00', '#0000FF', '#FF0000', '#FFFFFF', '#00FFFF', '#FF00FF', '#FF8000'];
    this.pmodeConfigs = {
      0: { width: 128, height: 96, colors: 2 },
      1: { width: 128, height: 96, colors: 4 },
      2: { width: 128, height: 192, colors: 2 },
      3: { width: 128, height: 192, colors: 4 },
      4: { width: 256, height: 192, colors: 2 },
    };
  }

  setCanvas(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.render(); }
  setScreen(type, colorSet = 0) { this.screenType = type; this.colorSet = colorSet; this.render(); }
  setPMode(mode, page) { this.pmode = mode; const c = this.pmodeConfigs[mode]; if (c) { this.pmodeWidth = c.width; this.pmodeHeight = c.height; } }
  setColor(fg, bg = null) { this.foregroundColor = fg; if (bg !== null) this.backgroundColor = bg; }

  cls(color = null) {
    if (color !== null) this.backgroundColor = color;
    for (let i = 0; i < this.textRows; i++) this.textScreen[i] = new Array(this.textCols).fill(' ');
    this.textRow = 0; this.textCol = 0; this.render();
  }

  pcls(color = null) { this.buffer.fill(color !== null ? color : this.backgroundColor); this.render(); }

  pset(x, y, color = null) {
    x = Math.floor(x); y = Math.floor(y);
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.buffer[y * this.width + x] = color !== null ? color : this.foregroundColor;
    }
  }

  preset(x, y) { this.pset(x, y, this.backgroundColor); }

  point(x, y) {
    x = Math.floor(x); y = Math.floor(y);
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) return this.buffer[y * this.width + x];
    return -1;
  }

  line(x1, y1, x2, y2, color = null, box = false, fill = false) {
    const c = color !== null ? color : this.foregroundColor;
    if (x1 === null) x1 = this.cursorX;
    if (y1 === null) y1 = this.cursorY;
    x1 = Math.floor(x1); y1 = Math.floor(y1); x2 = Math.floor(x2); y2 = Math.floor(y2);
    if (box) {
      if (fill) {
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
          for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) this.pset(x, y, c);
      } else {
        this.drawLine(x1, y1, x2, y1, c); this.drawLine(x2, y1, x2, y2, c);
        this.drawLine(x2, y2, x1, y2, c); this.drawLine(x1, y2, x1, y1, c);
      }
    } else {
      this.drawLine(x1, y1, x2, y2, c);
    }
    this.cursorX = x2; this.cursorY = y2; this.render();
  }

  drawLine(x1, y1, x2, y2, color) {
    const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this.pset(x1, y1, color);
      if (x1 === x2 && y1 === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x1 += sx; }
      if (e2 < dx) { err += dx; y1 += sy; }
    }
  }

  circle(x, y, radius, color = null, ratio = 1) {
    const c = color !== null ? color : this.foregroundColor;
    x = Math.floor(x); y = Math.floor(y); radius = Math.floor(radius);
    const ry = Math.floor(radius * ratio);
    for (let angle = 0; angle < 360; angle += 2) {
      const rad = angle * Math.PI / 180;
      const px = x + Math.floor(radius * Math.cos(rad));
      const py = y + Math.floor(ry * Math.sin(rad));
      this.pset(px, py, c);
    }
    this.render();
  }

  paint(x, y, color = null, borderColor = null) {
    const fillColor = color !== null ? color : this.foregroundColor;
    const border = borderColor !== null ? borderColor : fillColor;
    x = Math.floor(x); y = Math.floor(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const targetColor = this.buffer[y * this.width + x];
    if (targetColor === fillColor || targetColor === border) return;
    const MAX_FILL_PIXELS = 50000;
    const queue = [[x, y]];
    const visited = new Set();
    let iterations = 0;
    while (queue.length > 0 && iterations < MAX_FILL_PIXELS) {
      iterations++;
      const [px, py] = queue.shift();
      const key = `${px},${py}`;
      if (visited.has(key) || px < 0 || px >= this.width || py < 0 || py >= this.height) continue;
      const curr = this.buffer[py * this.width + px];
      if (curr === fillColor || curr === border) continue;
      visited.add(key);
      this.buffer[py * this.width + px] = fillColor;
      queue.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    this.render();
  }

  draw(commands) {
    if (typeof commands !== 'string') return;
    let x = this.cursorX, y = this.cursorY, penDown = true, returnAfterMove = false, scale = 4;
    const color = this.foregroundColor;
    let i = 0;
    while (i < commands.length) {
      const cmd = commands[i].toUpperCase(); i++;
      let numStr = '';
      while (i < commands.length && /[0-9]/.test(commands[i])) numStr += commands[i++];
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
        case 'B': penDown = false; continue;
        case 'N': returnAfterMove = true; continue;
        case 'S': scale = num; continue;
        case 'C': this.foregroundColor = num; continue;
        default: continue;
      }
      const savedX = x, savedY = y;
      const newX = x + dx, newY = y + dy;
      if (penDown) this.drawLine(Math.floor(x), Math.floor(y), Math.floor(newX), Math.floor(newY), color);
      x = newX; y = newY;
      if (returnAfterMove) { x = savedX; y = savedY; returnAfterMove = false; }
      penDown = true;
    }
    this.cursorX = x; this.cursorY = y; this.render();
  }

  locate(row, col) {
    this.textRow = Math.max(0, Math.min(row, this.textRows - 1));
    this.textCol = Math.max(0, Math.min(col, this.textCols - 1));
  }

  printChar(char) {
    if (char === '\n') { this.textCol = 0; this.textRow++; if (this.textRow >= this.textRows) { this.scrollUp(); this.textRow = this.textRows - 1; } return; }
    if (this.textCol >= this.textCols) { this.textCol = 0; this.textRow++; if (this.textRow >= this.textRows) { this.scrollUp(); this.textRow = this.textRows - 1; } }
    this.textScreen[this.textRow][this.textCol] = char; this.textCol++;
  }

  printString(str) { for (const char of str) this.printChar(char); this.render(); }

  scrollUp() {
    for (let i = 0; i < this.textRows - 1; i++) this.textScreen[i] = [...this.textScreen[i + 1]];
    this.textScreen[this.textRows - 1] = new Array(this.textCols).fill(' ');
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx, cw = this.canvas.width, ch = this.canvas.height;
    if (this.screenType === 0) {
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, cw, ch);
      const charW = cw / this.textCols, charH = ch / this.textRows;
      ctx.fillStyle = '#00FF00'; ctx.font = `${Math.floor(charH * 0.9)}px monospace`; ctx.textBaseline = 'top';
      for (let row = 0; row < this.textRows; row++) {
        for (let col = 0; col < this.textCols; col++) {
          const char = this.textScreen[row][col];
          if (char !== ' ') ctx.fillText(char, col * charW, row * charH);
        }
      }
    } else {
      const config = this.pmodeConfigs[this.pmode] || { width: 256, height: 192 };
      const scaleX = cw / config.width, scaleY = ch / config.height;
      ctx.fillStyle = this.cocoColors[this.backgroundColor] || '#000000'; ctx.fillRect(0, 0, cw, ch);
      for (let y = 0; y < config.height; y++) {
        for (let x = 0; x < config.width; x++) {
          const color = this.buffer[y * this.width + x];
          if (color !== this.backgroundColor) {
            ctx.fillStyle = this.cocoColors[color] || '#FFFFFF';
            ctx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
          }
        }
      }
    }
  }

  getTextScreen() { return this.textScreen.map(row => row.join('')).join('\n'); }
}

// ============================================================================
// SOUND
// ============================================================================

class Sound {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isInitialized = false;
    this.tempo = 120;
    this.octave = 4;
    this.noteLength = 4;
    this.volume = 15;
    this.noteFrequencies = { 'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88 };
  }

  async init() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (e) { console.warn('Audio not available:', e); }
  }

  async sound(frequency, duration) {
    if (!this.isInitialized) await this.init();
    if (!this.audioContext) return;
    const hz = 110 * Math.pow(2, frequency / 36.4);
    await this.playTone(hz, duration / 60);
  }

  async playTone(frequency, duration) {
    if (!this.audioContext) return;
    return new Promise((resolve) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      gain.gain.setValueAtTime((this.volume / 15) * 0.3, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      osc.connect(gain); gain.connect(this.masterGain);
      osc.start(); osc.stop(this.audioContext.currentTime + duration);
      osc.onended = resolve;
    });
  }

  async play(musicString) {
    if (!this.isInitialized) await this.init();
    if (!this.audioContext || typeof musicString !== 'string') return;
    let i = 0;
    const str = musicString.toUpperCase();
    while (i < str.length) {
      const char = str[i++];
      if (char === ' ') continue;
      let numStr = '';
      while (i < str.length && /[0-9]/.test(str[i])) numStr += str[i++];
      const num = numStr ? parseInt(numStr) : null;
      if ('CDEFGAB'.includes(char)) {
        let accidental = 0;
        if (i < str.length && (str[i] === '#' || str[i] === '+')) { accidental = 1; i++; }
        else if (i < str.length && str[i] === '-') { accidental = -1; i++; }
        let noteName = char;
        if (accidental === 1) noteName += '#';
        let freq = this.noteFrequencies[noteName] || this.noteFrequencies[char];
        if (accidental === -1) freq *= Math.pow(2, -1/12);
        freq *= Math.pow(2, this.octave - 4);
        const duration = (60 / this.tempo) * (4 / (num || this.noteLength));
        await this.playTone(freq, duration * 0.9);
      } else if (char === 'O' && num !== null) { this.octave = Math.min(6, Math.max(1, num)); }
      else if (char === 'L' && num !== null) { this.noteLength = num; }
      else if (char === 'T' && num !== null) { this.tempo = num; }
      else if (char === 'P') { await new Promise(r => setTimeout(r, (60 / this.tempo) * (4 / (num || this.noteLength)) * 1000)); }
      else if (char === 'V' && num !== null) { this.volume = Math.min(15, Math.max(0, num)); }
      else if (char === '>') { if (this.octave < 6) this.octave++; }
      else if (char === '<') { if (this.octave > 1) this.octave--; }
    }
  }

  reset() { this.tempo = 120; this.octave = 4; this.noteLength = 4; this.volume = 15; }
}

// ============================================================================
// INTERPRETER
// ============================================================================

class Interpreter {
  constructor(options = {}) {
    this.memory = new Memory();
    this.graphics = new Graphics(this.memory);
    this.sound = new Sound();
    this.program = new Map();
    this.sourceLines = new Map();  // Store original source text for LIST
    this.sortedLineNumbers = [];
    this.lineNumberIndex = new Map();
    this.variables = new Map();
    this.arrays = new Map();
    this.userFunctions = new Map();
    this.forStack = [];
    this.gosubStack = [];
    this.dataPointer = { valueIndex: 0 };
    this.dataValues = [];
    this.running = false;
    this.stopped = false;
    this.currentLineNumber = 0;
    this.nextLineIndex = 0;
    this.inputCallback = options.inputCallback || null;
    this.outputCallback = options.outputCallback || ((t) => console.log(t));
    this.keyBuffer = [];
    this.rndSeed = Date.now();
    this.startTime = Date.now();
    // Security limits
    this.maxInstructions = options.maxInstructions || 10000000;
    this.maxProgramSize = options.maxProgramSize || 65536;
    this.maxStringLength = options.maxStringLength || 32768;
    this.maxMemory = options.maxMemory || 1048576;
    this.instructionCount = 0;
    this.memoryUsed = 0;
  }

  output(text) { if (this.outputCallback) this.outputCallback(text); this.graphics.printString(text); }

  async getInput(prompt = '') {
    if (prompt) this.output(prompt);
    this.output('? ');
    if (this.inputCallback) return await this.inputCallback();
    return '';
  }

  load(sourceCode) {
    if (sourceCode.length > this.maxProgramSize) {
      throw new Error('PROGRAM TOO LARGE');
    }
    this.program.clear();
    this.sourceLines.clear();
    this.sortedLineNumbers = [];

    // Store original source lines for LIST command
    const lines = sourceCode.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^(\d+)\s*(.*)/);
      if (match) {
        const lineNum = parseInt(match[1]);
        const lineContent = match[2];
        this.sourceLines.set(lineNum, lineContent);
      }
    }

    const lexer = new Lexer(sourceCode);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    this.dataValues = [];
    for (const line of ast.lines) {
      if (line.lineNumber !== null) {
        this.program.set(line.lineNumber, line);
        for (const stmt of line.statements) {
          if (stmt?.type === NodeType.DATA) {
            for (const value of stmt.values) this.dataValues.push(value);
          }
        }
      }
    }
    this.sortedLineNumbers = Array.from(this.program.keys()).sort((a, b) => a - b);
    this.lineNumberIndex.clear();
    for (let i = 0; i < this.sortedLineNumbers.length; i++) {
      this.lineNumberIndex.set(this.sortedLineNumbers[i], i);
    }
    this.reset();
  }

  reset() {
    this.variables.clear(); this.arrays.clear(); this.forStack = []; this.gosubStack = [];
    this.dataPointer = { valueIndex: 0 }; this.running = false; this.stopped = false;
    this.currentLineNumber = 0; this.nextLineIndex = 0; this.instructionCount = 0;
    this.memoryUsed = 0;
    this.graphics.cls(); this.sound.reset(); this.startTime = Date.now();
  }

  async run(startLine = null) {
    if (this.sortedLineNumbers.length === 0) { this.output('?NO PROGRAM\n'); return; }
    this.running = true; this.stopped = false;
    if (startLine !== null) {
      const idx = this.lineNumberIndex.get(startLine);
      if (idx === undefined) { this.output(`?UNDEFINED LINE ${startLine}\n`); return; }
      this.nextLineIndex = idx;
    } else {
      this.nextLineIndex = 0;
    }
    try {
      while (this.running && this.nextLineIndex < this.sortedLineNumbers.length) {
        this.instructionCount++;
        if (this.instructionCount > this.maxInstructions) {
          throw new Error('EXECUTION LIMIT EXCEEDED');
        }
        const lineNumber = this.sortedLineNumbers[this.nextLineIndex];
        const line = this.program.get(lineNumber);
        this.currentLineNumber = lineNumber;
        this.nextLineIndex++;
        await this.executeLine(line);
        if (this.nextLineIndex % 100 === 0) await new Promise(r => setTimeout(r, 0));
      }
    } catch (error) { this.output(`?${error.message} IN ${this.currentLineNumber}\n`); }
    this.running = false;
  }

  async executeLine(line) {
    for (const stmt of line.statements) {
      if (!this.running || this.stopped) break;
      if (stmt) await this.executeStatement(stmt);
    }
  }

  async executeStatement(stmt) {
    switch (stmt.type) {
      case NodeType.REM: break;
      case NodeType.ASSIGNMENT: await this.executeAssignment(stmt); break;
      case NodeType.PRINT: await this.executePrint(stmt); break;
      case NodeType.INPUT: await this.executeInput(stmt); break;
      case NodeType.IF: await this.executeIf(stmt); break;
      case NodeType.FOR: await this.executeFor(stmt); break;
      case NodeType.NEXT: await this.executeNext(stmt); break;
      case NodeType.GOTO: this.executeGoto(stmt); break;
      case NodeType.GOSUB: this.executeGosub(stmt); break;
      case NodeType.RETURN: this.executeReturn(); break;
      case NodeType.ON_GOTO: this.executeOnGoto(stmt); break;
      case NodeType.ON_GOSUB: this.executeOnGosub(stmt); break;
      case NodeType.END: this.running = false; break;
      case NodeType.STOP: this.stopped = true; this.output(`BREAK IN ${this.currentLineNumber}\n`); break;
      case NodeType.DIM: this.executeDim(stmt); break;
      case NodeType.READ: this.executeRead(stmt); break;
      case NodeType.RESTORE: this.executeRestore(stmt); break;
      case NodeType.DEF_FN: this.executeDefFn(stmt); break;
      case NodeType.POKE: this.executePoke(stmt); break;
      case NodeType.CLS: this.executeCls(stmt); break;
      case NodeType.LOCATE: this.executeLocate(stmt); break;
      case NodeType.COLOR: await this.executeColor(stmt); break;
      case NodeType.SCREEN: this.executeScreen(stmt); break;
      case NodeType.PMODE: this.executePmode(stmt); break;
      case NodeType.PCLS: await this.executePcls(stmt); break;
      case NodeType.PSET: await this.executePset(stmt); break;
      case NodeType.LINE_DRAW: await this.executeLineDraw(stmt); break;
      case NodeType.CIRCLE: await this.executeCircle(stmt); break;
      case NodeType.PAINT: await this.executePaint(stmt); break;
      case NodeType.DRAW: await this.executeDraw(stmt); break;
      case NodeType.SOUND: await this.executeSound(stmt); break;
      case NodeType.PLAY: await this.executePlay(stmt); break;
      case NodeType.CLEAR: this.executeClear(stmt); break;
    }
  }

  async executeAssignment(stmt) {
    const value = await this.evaluate(stmt.value);
    if (stmt.indices) {
      const indices = [];
      for (const idx of stmt.indices) indices.push(Math.floor(await this.evaluate(idx)));
      this.setArrayValue(stmt.name, indices, value);
    } else {
      this.variables.set(stmt.name, value);
    }
  }

  async executePrint(stmt) {
    let output = '', col = this.graphics.textCol;
    for (const item of stmt.items) {
      if (item.type === 'expr') {
        const value = await this.evaluate(item.value);
        if (typeof value === 'number') { output += (value >= 0 ? ' ' : '') + value + ' '; }
        else { output += String(value); }
        col += String(value).length;
      } else if (item.type === 'tab') {
        const spaces = 8 - (col % 8);
        output += ' '.repeat(spaces); col += spaces;
      } else if (item.type === 'tabTo') {
        const pos = Math.floor(await this.evaluate(item.position));
        if (pos > col) { output += ' '.repeat(pos - col); col = pos; }
      }
    }
    if (stmt.newline) output += '\n';
    this.output(output);
  }

  async executeInput(stmt) {
    const input = await this.getInput(stmt.prompt || '');
    const parts = input.split(',').map(s => s.trim());
    for (let i = 0; i < stmt.variables.length; i++) {
      const varInfo = stmt.variables[i];
      let value = parts[i] || '';
      if (varInfo.name.endsWith('$')) {
        if (varInfo.indices) {
          const indices = [];
          for (const idx of varInfo.indices) indices.push(Math.floor(await this.evaluate(idx)));
          this.setArrayValue(varInfo.name, indices, value);
        } else { this.variables.set(varInfo.name, value); }
      } else {
        const numValue = parseFloat(value) || 0;
        if (varInfo.indices) {
          const indices = [];
          for (const idx of varInfo.indices) indices.push(Math.floor(await this.evaluate(idx)));
          this.setArrayValue(varInfo.name, indices, numValue);
        } else { this.variables.set(varInfo.name, numValue); }
      }
    }
  }

  async executeIf(stmt) {
    const condition = await this.evaluate(stmt.condition);
    if (condition) {
      for (const s of stmt.thenBranch) { if (!this.running) break; await this.executeStatement(s); }
    } else if (stmt.elseBranch) {
      for (const s of stmt.elseBranch) { if (!this.running) break; await this.executeStatement(s); }
    }
  }

  async executeFor(stmt) {
    const start = await this.evaluate(stmt.start);
    const end = await this.evaluate(stmt.end);
    const step = stmt.step ? await this.evaluate(stmt.step) : 1;
    this.variables.set(stmt.variable, start);
    this.forStack.push({ variable: stmt.variable, end, step, lineIndex: this.nextLineIndex, lineNumber: this.currentLineNumber });
  }

  async executeNext(stmt) {
    if (this.forStack.length === 0) throw new Error('NEXT WITHOUT FOR');
    let forInfo;
    if (stmt.variables.length > 0) {
      for (let i = this.forStack.length - 1; i >= 0; i--) {
        if (this.forStack[i].variable === stmt.variables[0]) { forInfo = this.forStack[i]; this.forStack.length = i + 1; break; }
      }
      if (!forInfo) throw new Error('NEXT WITHOUT FOR');
    } else { forInfo = this.forStack[this.forStack.length - 1]; }
    let value = this.variables.get(forInfo.variable);
    value += forInfo.step;
    this.variables.set(forInfo.variable, value);
    const done = forInfo.step >= 0 ? value > forInfo.end : value < forInfo.end;
    if (done) { this.forStack.pop(); } else { this.nextLineIndex = forInfo.lineIndex; }
  }

  executeGoto(stmt) {
    const lineIndex = this.lineNumberIndex.get(stmt.lineNumber);
    if (lineIndex === undefined) throw new Error(`UNDEFINED LINE ${stmt.lineNumber}`);
    this.nextLineIndex = lineIndex;
  }

  executeGosub(stmt) {
    this.gosubStack.push({ lineIndex: this.nextLineIndex, lineNumber: this.currentLineNumber });
    const lineIndex = this.lineNumberIndex.get(stmt.lineNumber);
    if (lineIndex === undefined) throw new Error(`UNDEFINED LINE ${stmt.lineNumber}`);
    this.nextLineIndex = lineIndex;
  }

  executeReturn() {
    if (this.gosubStack.length === 0) throw new Error('RETURN WITHOUT GOSUB');
    this.nextLineIndex = this.gosubStack.pop().lineIndex;
  }

  executeOnGoto(stmt) {
    const index = Math.floor(this.evaluateSync(stmt.expression));
    if (index >= 1 && index <= stmt.lineNumbers.length) {
      const lineIndex = this.lineNumberIndex.get(stmt.lineNumbers[index - 1]);
      if (lineIndex === undefined) throw new Error(`UNDEFINED LINE ${stmt.lineNumbers[index - 1]}`);
      this.nextLineIndex = lineIndex;
    }
  }

  executeOnGosub(stmt) {
    const index = Math.floor(this.evaluateSync(stmt.expression));
    if (index >= 1 && index <= stmt.lineNumbers.length) {
      this.gosubStack.push({ lineIndex: this.nextLineIndex, lineNumber: this.currentLineNumber });
      const lineIndex = this.lineNumberIndex.get(stmt.lineNumbers[index - 1]);
      if (lineIndex === undefined) throw new Error(`UNDEFINED LINE ${stmt.lineNumbers[index - 1]}`);
      this.nextLineIndex = lineIndex;
    }
  }

  executeDim(stmt) {
    for (const arr of stmt.arrays) {
      const dimensions = arr.dimensions.map(d => Math.floor(this.evaluateSync(d)) + 1);
      this.createArray(arr.name, dimensions);
    }
  }

  createArray(name, dimensions) {
    const MAX_ARRAY_ELEMENTS = 32768;
    const MAX_DIMENSION_SIZE = 32767;
    for (const dim of dimensions) {
      if (dim < 1 || dim > MAX_DIMENSION_SIZE) throw new Error('ILLEGAL FUNCTION CALL');
    }
    const size = dimensions.reduce((a, b) => a * b, 1);
    if (size > MAX_ARRAY_ELEMENTS) throw new Error('OUT OF MEMORY');
    const memoryNeeded = size * 8;
    if (this.memoryUsed + memoryNeeded > this.maxMemory) throw new Error('OUT OF MEMORY');
    this.memoryUsed += memoryNeeded;
    const defaultValue = name.endsWith('$') ? '' : 0;
    this.arrays.set(name, { dimensions, data: new Array(size).fill(defaultValue) });
  }

  getArrayValue(name, indices) {
    let arr = this.arrays.get(name);
    if (!arr) { this.createArray(name, indices.map(() => 11)); arr = this.arrays.get(name); }
    return arr.data[this.calculateArrayIndex(arr.dimensions, indices)];
  }

  setArrayValue(name, indices, value) {
    let arr = this.arrays.get(name);
    if (!arr) { this.createArray(name, indices.map(() => 11)); arr = this.arrays.get(name); }
    arr.data[this.calculateArrayIndex(arr.dimensions, indices)] = value;
  }

  calculateArrayIndex(dimensions, indices) {
    let index = 0, multiplier = 1;
    for (let i = dimensions.length - 1; i >= 0; i--) {
      if (indices[i] < 0 || indices[i] >= dimensions[i]) throw new Error('SUBSCRIPT OUT OF RANGE');
      index += indices[i] * multiplier;
      multiplier *= dimensions[i];
    }
    return index;
  }

  executeRead(stmt) {
    for (const varInfo of stmt.variables) {
      if (this.dataPointer.valueIndex >= this.dataValues.length) throw new Error('OUT OF DATA');
      const dataValue = this.dataValues[this.dataPointer.valueIndex++];
      let value = dataValue.value;
      if (!varInfo.name.endsWith('$') && dataValue.type === 'string') value = parseFloat(value) || 0;
      if (varInfo.indices) {
        const indices = varInfo.indices.map(idx => Math.floor(this.evaluateSync(idx)));
        this.setArrayValue(varInfo.name, indices, value);
      } else { this.variables.set(varInfo.name, value); }
    }
  }

  executeRestore(stmt) { this.dataPointer.valueIndex = 0; }
  executeDefFn(stmt) { this.userFunctions.set(stmt.name, { param: stmt.param, body: stmt.body }); }
  executePoke(stmt) { this.memory.poke(Math.floor(this.evaluateSync(stmt.address)), Math.floor(this.evaluateSync(stmt.value))); }
  executeCls(stmt) { this.graphics.cls(stmt.color !== null ? Math.floor(this.evaluateSync(stmt.color)) : null); }
  executeLocate(stmt) { this.graphics.locate(Math.floor(this.evaluateSync(stmt.row)), Math.floor(this.evaluateSync(stmt.col))); }
  async executeColor(stmt) { this.graphics.setColor(Math.floor(await this.evaluate(stmt.foreground)), stmt.background !== null ? Math.floor(await this.evaluate(stmt.background)) : null); }
  executeScreen(stmt) { this.graphics.setScreen(Math.floor(this.evaluateSync(stmt.screenMode)), stmt.colorSet !== null ? Math.floor(this.evaluateSync(stmt.colorSet)) : 0); }
  executePmode(stmt) { this.graphics.setPMode(Math.floor(this.evaluateSync(stmt.mode)), Math.floor(this.evaluateSync(stmt.startPage))); }
  async executePcls(stmt) {
    this.graphics.pcls(stmt.color !== null ? Math.floor(this.evaluateSync(stmt.color)) : null);
    // No delay here - wait after drawing is complete, not after clearing
  }

  async executePset(stmt) {
    const x = Math.floor(await this.evaluate(stmt.x)), y = Math.floor(await this.evaluate(stmt.y));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;
    if (stmt.preset) this.graphics.preset(x, y); else this.graphics.pset(x, y, color);
  }

  async executeLineDraw(stmt) {
    const x1 = stmt.x1 !== null ? Math.floor(await this.evaluate(stmt.x1)) : null;
    const y1 = stmt.y1 !== null ? Math.floor(await this.evaluate(stmt.y1)) : null;
    const x2 = Math.floor(await this.evaluate(stmt.x2)), y2 = Math.floor(await this.evaluate(stmt.y2));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;
    this.graphics.line(x1, y1, x2, y2, color, stmt.box, stmt.fill);
  }

  async executeCircle(stmt) {
    const x = Math.floor(await this.evaluate(stmt.x)), y = Math.floor(await this.evaluate(stmt.y));
    const radius = Math.floor(await this.evaluate(stmt.radius));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;
    const ratio = stmt.ratio !== null ? await this.evaluate(stmt.ratio) : 1;
    this.graphics.circle(x, y, radius, color, ratio);
    // Delay after drawing to allow browser to paint - this is where the frame is visible
    if (this.graphics.screenType !== 0) {
      await new Promise(r => setTimeout(r, 16));
    }
  }

  async executePaint(stmt) {
    const x = Math.floor(await this.evaluate(stmt.x)), y = Math.floor(await this.evaluate(stmt.y));
    const color = stmt.color !== null ? Math.floor(await this.evaluate(stmt.color)) : null;
    const border = stmt.borderColor !== null ? Math.floor(await this.evaluate(stmt.borderColor)) : null;
    this.graphics.paint(x, y, color, border);
  }

  async executeDraw(stmt) { this.graphics.draw(String(await this.evaluate(stmt.commands))); }
  async executeSound(stmt) { await this.sound.sound(Math.floor(await this.evaluate(stmt.frequency)), Math.floor(await this.evaluate(stmt.duration))); }
  async executePlay(stmt) { await this.sound.play(String(await this.evaluate(stmt.music))); }
  executeClear(stmt) { this.variables.clear(); this.arrays.clear(); this.forStack = []; this.gosubStack = []; }

  async evaluate(node) { return this.evaluateNode(node); }
  evaluateSync(node) { return this.evaluateNode(node); }

  evaluateNode(node) {
    if (!node) return 0;
    switch (node.type) {
      case NodeType.NUMBER: return node.value;
      case NodeType.STRING: return node.value;
      case NodeType.VARIABLE: return this.variables.get(node.name) ?? (node.name.endsWith('$') ? '' : 0);
      case NodeType.ARRAY_ACCESS: return this.getArrayValue(node.name, node.indices.map(idx => Math.floor(this.evaluateNode(idx))));
      case NodeType.BINARY_OP: return this.evaluateBinaryOp(node);
      case NodeType.UNARY_OP: return this.evaluateUnaryOp(node);
      case NodeType.FUNCTION_CALL: return this.evaluateFunction(node);
      default: return 0;
    }
  }

  evaluateBinaryOp(node) {
    const left = this.evaluateNode(node.left), right = this.evaluateNode(node.right);
    switch (node.operator) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          const result = String(left) + String(right);
          if (result.length > this.maxStringLength) throw new Error('STRING TOO LONG');
          return result;
        }
        return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': if (right === 0) throw new Error('DIVISION BY ZERO'); return left / right;
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

  evaluateUnaryOp(node) {
    const operand = this.evaluateNode(node.operand);
    switch (node.operator) {
      case '-': return -operand;
      case 'NOT': return operand === 0 ? -1 : 0;
      default: return operand;
    }
  }

  evaluateFunction(node) {
    const args = node.args.map(arg => this.evaluateNode(arg));
    if (node.userDefined) {
      const fn = this.userFunctions.get(node.name.substring(2));
      if (!fn) throw new Error(`UNDEFINED FUNCTION ${node.name}`);
      const oldValue = this.variables.get(fn.param);
      this.variables.set(fn.param, args[0]);
      const result = this.evaluateNode(fn.body);
      if (oldValue !== undefined) this.variables.set(fn.param, oldValue); else this.variables.delete(fn.param);
      return result;
    }
    switch (node.name) {
      case 'ABS': return Math.abs(args[0]);
      case 'SGN': return args[0] > 0 ? 1 : (args[0] < 0 ? -1 : 0);
      case 'INT': return Math.floor(args[0]);
      case 'FIX': return Math.trunc(args[0]);
      case 'SQR': if (args[0] < 0) throw new Error('ILLEGAL FUNCTION CALL'); return Math.sqrt(args[0]);
      case 'LOG': if (args[0] <= 0) throw new Error('ILLEGAL FUNCTION CALL'); return Math.log(args[0]);
      case 'EXP': { const r = Math.exp(args[0]); if (!isFinite(r)) throw new Error('OVERFLOW'); return r; }
      case 'SIN': return Math.sin(args[0]);
      case 'COS': return Math.cos(args[0]);
      case 'TAN': return Math.tan(args[0]);
      case 'ATN': return Math.atan(args[0]);
      case 'RND': {
        if (args.length === 0 || args[0] === 0) return this.random();
        if (args[0] < 0) { this.rndSeed = Math.abs(Math.floor(args[0])); return this.random(); }
        const n = Math.floor(args[0]); if (n < 1) return this.random();
        return Math.floor(this.random() * n) + 1;
      }
      case 'LEN': return String(args[0]).length;
      case 'LEFT$': {
        if (args[1] === undefined || args[1] < 0 || !isFinite(args[1])) throw new Error('ILLEGAL FUNCTION CALL');
        return String(args[0]).substring(0, Math.floor(args[1]));
      }
      case 'RIGHT$': {
        if (args[1] === undefined || args[1] < 0 || !isFinite(args[1])) throw new Error('ILLEGAL FUNCTION CALL');
        const n = Math.floor(args[1]); return n === 0 ? '' : String(args[0]).slice(-n);
      }
      case 'MID$': {
        if (args[1] === undefined || args[1] < 1 || !isFinite(args[1])) throw new Error('ILLEGAL FUNCTION CALL');
        const str = String(args[0]); const start = Math.floor(args[1]) - 1;
        const len = args.length > 2 ? Math.floor(args[2]) : str.length;
        if (args.length > 2 && (len < 0 || !isFinite(len))) throw new Error('ILLEGAL FUNCTION CALL');
        return str.substring(start, start + len);
      }
      case 'CHR$': { const code = Math.floor(args[0]); if (code < 0 || code > 255) throw new Error('ILLEGAL FUNCTION CALL'); return String.fromCharCode(code); }
      case 'ASC': return args[0].length > 0 ? args[0].charCodeAt(0) : 0;
      case 'STR$': return String(args[0]);
      case 'VAL': return parseFloat(args[0]) || 0;
      case 'STRING$': { const count = Math.floor(args[0]); if (count < 0 || count > 255) throw new Error('ILLEGAL FUNCTION CALL'); return (typeof args[1] === 'number' ? String.fromCharCode(args[1] & 0xFF) : args[1].charAt(0)).repeat(count); }
      case 'INSTR': return args.length === 2 ? String(args[0]).indexOf(String(args[1])) + 1 : String(args[1]).indexOf(String(args[2]), args[0] - 1) + 1;
      case 'INKEY$': return this.keyBuffer.length > 0 ? this.keyBuffer.shift() : '';
      case 'PEEK': return this.memory.peek(Math.floor(args[0]));
      case 'POINT': return this.graphics.point(Math.floor(args[0]), Math.floor(args[1]));
      case 'TIMER': return Math.floor((Date.now() - this.startTime) / 16.67) & 0xFFFF;
      case 'MEM': return this.memory.getFreeMemory();
      case 'POS': return this.graphics.textCol;
      default: throw new Error(`UNKNOWN FUNCTION ${node.name}`);
    }
  }

  random() { this.rndSeed = (this.rndSeed * 1103515245 + 12345) & 0x7FFFFFFF; return this.rndSeed / 0x7FFFFFFF; }
  keyPress(key) { this.keyBuffer.push(key); }

  list(startLine = null, endLine = null) {
    let output = '';
    for (const lineNum of this.sortedLineNumbers) {
      if (startLine !== null && lineNum < startLine) continue;
      if (endLine !== null && lineNum > endLine) break;
      const source = this.sourceLines.get(lineNum) || '';
      output += `${lineNum} ${source}\n`;
    }
    return output;
  }

  getGraphics() { return this.graphics; }
  getSound() { return this.sound; }
  getMemory() { return this.memory; }
}

// ============================================================================
// COCO EMULATOR
// ============================================================================

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
    if (options.onOutput) this.interpreter.outputCallback = (text) => options.onOutput(text);
  }

  loadProgram(source) {
    this.programText = source;
    try { this.interpreter.load(source); return { success: true }; }
    catch (error) { return { success: false, error: error.message }; }
  }

  async run(startLine = null) {
    try { await this.interpreter.run(startLine); return { success: true }; }
    catch (error) { return { success: false, error: error.message }; }
  }

  async execute(command) {
    try {
      const upper = command.trim().toUpperCase();
      if (upper === 'RUN') return await this.run();
      if (upper === 'NEW') { this.interpreter.program.clear(); this.interpreter.sortedLineNumbers = []; this.interpreter.reset(); return { success: true, output: '' }; }
      if (upper === 'LIST' || upper.startsWith('LIST ')) { return { success: true, output: this.interpreter.list() }; }
      if (upper === 'CLEAR') { this.interpreter.reset(); return { success: true, output: '' }; }

      const lineMatch = command.match(/^(\d+)\s*(.*)/);
      if (lineMatch) {
        const lineNumber = parseInt(lineMatch[1]), lineContent = lineMatch[2];
        if (lineContent.trim() === '') {
          this.interpreter.program.delete(lineNumber);
          this.interpreter.sourceLines.delete(lineNumber);
        } else {
          const lexer = new Lexer(command);
          const tokens = lexer.tokenize();
          const parser = new Parser(tokens);
          const ast = parser.parse();
          if (ast.lines.length > 0 && ast.lines[0].lineNumber !== null) {
            this.interpreter.program.set(lineNumber, ast.lines[0]);
            this.interpreter.sourceLines.set(lineNumber, lineContent);
          }
        }
        this.interpreter.sortedLineNumbers = Array.from(this.interpreter.program.keys()).sort((a, b) => a - b);
        this.updateDataValues();
        return { success: true, output: '' };
      }

      const lexer = new Lexer(command);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      if (ast.lines.length > 0) await this.interpreter.executeLine(ast.lines[0]);
      return { success: true, output: '' };
    } catch (error) { return { success: false, error: `?${error.message}` }; }
  }

  updateDataValues() {
    this.interpreter.dataValues = [];
    for (const lineNum of this.interpreter.sortedLineNumbers) {
      const line = this.interpreter.program.get(lineNum);
      for (const stmt of line.statements) {
        if (stmt?.type === NodeType.DATA) {
          for (const value of stmt.values) this.interpreter.dataValues.push(value);
        }
      }
    }
  }

  stop() { this.interpreter.running = false; this.interpreter.stopped = true; }
  keyPress(key) { this.interpreter.keyPress(key); }
  getGraphics() { return this.interpreter.getGraphics(); }
  getSound() { return this.interpreter.getSound(); }
  getMemory() { return this.interpreter.getMemory(); }
  setCanvas(canvas) { this.interpreter.getGraphics().setCanvas(canvas); }
  getProgram() { return this.interpreter.list(); }
  getVariable(name) { return this.interpreter.variables.get(name.toUpperCase()); }
  setVariable(name, value) { this.interpreter.variables.set(name.toUpperCase(), value); }
}

// ============================================================================
// PROGRAM STORAGE
// ============================================================================

class ProgramStorage {
  constructor() {
    this.localStorageKey = 'coco-basic-programs';
    this.googleUser = null;
    this.googleAccessToken = null;
    this.onAuthChange = null;
  }

  // Local Storage
  getLocalPrograms() {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) { return {}; }
  }

  saveLocal(name, code) {
    if (!name || typeof name !== 'string') throw new Error('Invalid program name');
    if (name.length > 64) throw new Error('Program name too long (max 64 characters)');
    const programs = this.getLocalPrograms();
    programs[name] = { code, savedAt: new Date().toISOString(), size: code.length };
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(programs));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') throw new Error('Local storage full');
      throw e;
    }
  }

  loadLocal(name) {
    const programs = this.getLocalPrograms();
    const program = programs[name];
    if (!program) throw new Error('Program not found');
    return program.code;
  }

  deleteLocal(name) {
    const programs = this.getLocalPrograms();
    if (!programs[name]) throw new Error('Program not found');
    delete programs[name];
    localStorage.setItem(this.localStorageKey, JSON.stringify(programs));
    return true;
  }

  listLocal() {
    const programs = this.getLocalPrograms();
    return Object.entries(programs).map(([name, data]) => ({
      name, savedAt: data.savedAt, size: data.size, source: 'local'
    }));
  }

  // Google Drive Integration
  async initGoogle(clientId) {
    if (!clientId) return false;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => { this.googleClientId = clientId; resolve(true); };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  async signInWithGoogle() {
    if (!this.googleClientId) throw new Error('Google Sign-In not initialized');
    return new Promise((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.googleClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
          if (response.error) { reject(new Error(response.error)); return; }
          this.googleAccessToken = response.access_token;
          this.fetchGoogleUserInfo().then(user => {
            this.googleUser = user;
            if (this.onAuthChange) this.onAuthChange(user);
            resolve(user);
          }).catch(reject);
        }
      });
      tokenClient.requestAccessToken();
    });
  }

  signOutFromGoogle() {
    if (this.googleAccessToken) google.accounts.oauth2.revoke(this.googleAccessToken);
    this.googleAccessToken = null;
    this.googleUser = null;
    if (this.onAuthChange) this.onAuthChange(null);
  }

  isSignedIn() { return !!this.googleAccessToken; }
  getGoogleUser() { return this.googleUser; }

  async fetchGoogleUserInfo() {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${this.googleAccessToken}` }
    });
    if (!response.ok) throw new Error('Failed to get user info');
    return response.json();
  }

  async saveToGoogleDrive(name, code) {
    if (!this.googleAccessToken) throw new Error('Not signed in to Google');
    const fileName = `${name}.bas`;
    const existingFile = await this.findGoogleDriveFile(fileName);
    if (existingFile) {
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${this.googleAccessToken}`, 'Content-Type': 'text/plain' }, body: code }
      );
      if (!response.ok) throw new Error('Failed to update file on Google Drive');
      return response.json();
    }
    const metadata = { name: fileName, mimeType: 'text/plain', parents: ['appDataFolder'] };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([code], { type: 'text/plain' }));
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      { method: 'POST', headers: { Authorization: `Bearer ${this.googleAccessToken}` }, body: form }
    );
    if (!response.ok) throw new Error('Failed to save to Google Drive');
    return response.json();
  }

  async findGoogleDriveFile(fileName) {
    const query = encodeURIComponent(`name='${fileName}' and trashed=false`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}`,
      { headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.files?.length > 0 ? data.files[0] : null;
  }

  async loadFromGoogleDrive(fileId) {
    if (!this.googleAccessToken) throw new Error('Not signed in to Google');
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) throw new Error('Failed to load from Google Drive');
    return response.text();
  }

  async deleteFromGoogleDrive(fileId) {
    if (!this.googleAccessToken) throw new Error('Not signed in to Google');
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) throw new Error('Failed to delete from Google Drive');
    return true;
  }

  async listGoogleDrivePrograms() {
    if (!this.googleAccessToken) return [];
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime,size)',
      { headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.files || []).filter(f => f.name.endsWith('.bas')).map(f => ({
      id: f.id, name: f.name.replace('.bas', ''), savedAt: f.modifiedTime, size: parseInt(f.size) || 0, source: 'google'
    }));
  }

  async listAllPrograms() {
    const local = this.listLocal();
    const google = await this.listGoogleDrivePrograms();
    return [...local, ...google].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  }

  exportAsFile(name, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.bas`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.bas') && !file.type.includes('text')) {
        reject(new Error('Invalid file type')); return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const name = file.name.replace('.bas', '').replace(/[^a-zA-Z0-9_-]/g, '_');
        resolve({ name, code: e.target.result });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { CoCoEmulator, Interpreter, Lexer, Parser, Memory, Graphics, Sound, ProgramStorage };
