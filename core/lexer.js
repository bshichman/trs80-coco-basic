/**
 * TRS-80 Color Computer Extended BASIC Lexer/Tokenizer
 *
 * Converts BASIC source code into a stream of tokens for parsing.
 * Handles the unique syntax of Microsoft Extended Color BASIC.
 */

const { TokenType, KEYWORDS, Token } = require('./tokens');

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
    if (char === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  skipWhitespace() {
    while (this.peek() && this.peek() !== '\n' && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  isDigit(char) {
    return char && /[0-9]/.test(char);
  }

  isAlpha(char) {
    return char && /[A-Za-z]/.test(char);
  }

  isAlphaNumeric(char) {
    return char && /[A-Za-z0-9]/.test(char);
  }

  readNumber() {
    const startColumn = this.column;
    let value = '';

    // Read integer part
    while (this.isDigit(this.peek())) {
      value += this.advance();
    }

    // Check for decimal point
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += this.advance(); // consume '.'
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    // Check for scientific notation (E or D)
    if (this.peek() && /[EeDd]/.test(this.peek())) {
      value += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        value += this.advance();
      }
      while (this.isDigit(this.peek())) {
        value += this.advance();
      }
    }

    return new Token(TokenType.NUMBER, parseFloat(value), this.line, startColumn);
  }

  readString() {
    const startColumn = this.column;
    this.advance(); // consume opening quote
    let value = '';

    while (this.peek() && this.peek() !== '"' && this.peek() !== '\n') {
      value += this.advance();
    }

    if (this.peek() !== '"') {
      this.error('Unterminated string');
    }
    this.advance(); // consume closing quote

    return new Token(TokenType.STRING, value, this.line, startColumn);
  }

  readIdentifierOrKeyword() {
    const startColumn = this.column;
    let value = '';

    while (this.isAlphaNumeric(this.peek())) {
      value += this.advance();
    }

    // Check for $ suffix (string variable)
    if (this.peek() === '$') {
      value += this.advance();
    }

    const upper = value.toUpperCase();

    // Check if it's a keyword
    if (KEYWORDS[upper]) {
      return new Token(KEYWORDS[upper], upper, this.line, startColumn);
    }

    return new Token(TokenType.IDENTIFIER, value.toUpperCase(), this.line, startColumn);
  }

  readRemark() {
    const startColumn = this.column;
    let value = '';

    // Skip the REM keyword
    this.advance(); // R
    this.advance(); // E
    this.advance(); // M

    // Skip leading space
    if (this.peek() === ' ') {
      this.advance();
    }

    // Read until end of line
    while (this.peek() && this.peek() !== '\n') {
      value += this.advance();
    }

    return new Token(TokenType.REM, value, this.line, startColumn);
  }

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();

      if (this.pos >= this.source.length) break;

      const char = this.peek();
      const startColumn = this.column;

      // Check for REM (also handles ' as shorthand)
      if (char === "'") {
        this.advance();
        let comment = '';
        while (this.peek() && this.peek() !== '\n') {
          comment += this.advance();
        }
        this.tokens.push(new Token(TokenType.REM, comment, this.line, startColumn));
        continue;
      }

      // Newline
      if (char === '\n') {
        this.tokens.push(new Token(TokenType.NEWLINE, '\n', this.line, startColumn));
        this.advance();
        continue;
      }

      // Numbers
      if (this.isDigit(char) || (char === '.' && this.isDigit(this.peek(1)))) {
        this.tokens.push(this.readNumber());
        continue;
      }

      // Strings
      if (char === '"') {
        this.tokens.push(this.readString());
        continue;
      }

      // Identifiers and keywords
      if (this.isAlpha(char)) {
        // Special handling for REM
        if (char.toUpperCase() === 'R' &&
            this.peek(1) && this.peek(1).toUpperCase() === 'E' &&
            this.peek(2) && this.peek(2).toUpperCase() === 'M' &&
            (!this.peek(3) || !this.isAlphaNumeric(this.peek(3)))) {
          this.tokens.push(this.readRemark());
          continue;
        }
        this.tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      // Operators and punctuation
      switch (char) {
        case '+':
          this.tokens.push(new Token(TokenType.PLUS, '+', this.line, startColumn));
          this.advance();
          break;
        case '-':
          this.tokens.push(new Token(TokenType.MINUS, '-', this.line, startColumn));
          this.advance();
          break;
        case '*':
          this.tokens.push(new Token(TokenType.MULTIPLY, '*', this.line, startColumn));
          this.advance();
          break;
        case '/':
          this.tokens.push(new Token(TokenType.DIVIDE, '/', this.line, startColumn));
          this.advance();
          break;
        case '^':
          this.tokens.push(new Token(TokenType.POWER, '^', this.line, startColumn));
          this.advance();
          break;
        case '=':
          this.tokens.push(new Token(TokenType.EQUALS, '=', this.line, startColumn));
          this.advance();
          break;
        case '<':
          this.advance();
          if (this.peek() === '>') {
            this.advance();
            this.tokens.push(new Token(TokenType.NOT_EQUALS, '<>', this.line, startColumn));
          } else if (this.peek() === '=') {
            this.advance();
            this.tokens.push(new Token(TokenType.LESS_EQUAL, '<=', this.line, startColumn));
          } else {
            this.tokens.push(new Token(TokenType.LESS_THAN, '<', this.line, startColumn));
          }
          break;
        case '>':
          this.advance();
          if (this.peek() === '=') {
            this.advance();
            this.tokens.push(new Token(TokenType.GREATER_EQUAL, '>=', this.line, startColumn));
          } else if (this.peek() === '<') {
            this.advance();
            this.tokens.push(new Token(TokenType.NOT_EQUALS, '><', this.line, startColumn));
          } else {
            this.tokens.push(new Token(TokenType.GREATER_THAN, '>', this.line, startColumn));
          }
          break;
        case '(':
          this.tokens.push(new Token(TokenType.LPAREN, '(', this.line, startColumn));
          this.advance();
          break;
        case ')':
          this.tokens.push(new Token(TokenType.RPAREN, ')', this.line, startColumn));
          this.advance();
          break;
        case ',':
          this.tokens.push(new Token(TokenType.COMMA, ',', this.line, startColumn));
          this.advance();
          break;
        case ';':
          this.tokens.push(new Token(TokenType.SEMICOLON, ';', this.line, startColumn));
          this.advance();
          break;
        case ':':
          this.tokens.push(new Token(TokenType.COLON, ':', this.line, startColumn));
          this.advance();
          break;
        case '?':
          // Shorthand for PRINT
          this.tokens.push(new Token(TokenType.PRINT, 'PRINT', this.line, startColumn));
          this.advance();
          break;
        case '#':
          // Hash for file operations
          this.advance();
          // Just skip it, the number following will be the file handle
          break;
        case '@':
          // AT sign for PRINT@ positioning
          this.advance();
          // Handle as part of the statement
          break;
        default:
          this.error(`Unexpected character: ${char}`);
      }
    }

    this.tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
    return this.tokens;
  }
}

module.exports = { Lexer };
