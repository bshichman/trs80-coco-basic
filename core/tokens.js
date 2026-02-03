/**
 * TRS-80 Color Computer Extended BASIC Token Definitions
 *
 * The CoCo used tokenized BASIC where keywords were stored as single bytes
 * to save memory. This module defines all tokens for Extended Color BASIC.
 */

const TokenType = {
  // Literals
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',

  // Operators
  PLUS: 'PLUS',           // +
  MINUS: 'MINUS',         // -
  MULTIPLY: 'MULTIPLY',   // *
  DIVIDE: 'DIVIDE',       // /
  POWER: 'POWER',         // ^
  EQUALS: 'EQUALS',       // =
  NOT_EQUALS: 'NOT_EQUALS', // <>
  LESS_THAN: 'LESS_THAN', // <
  GREATER_THAN: 'GREATER_THAN', // >
  LESS_EQUAL: 'LESS_EQUAL', // <=
  GREATER_EQUAL: 'GREATER_EQUAL', // >=

  // Punctuation
  LPAREN: 'LPAREN',       // (
  RPAREN: 'RPAREN',       // )
  COMMA: 'COMMA',         // ,
  SEMICOLON: 'SEMICOLON', // ;
  COLON: 'COLON',         // :
  DOLLAR: 'DOLLAR',       // $

  // Keywords - Program Control
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

  // Data handling
  DATA: 'DATA',
  READ: 'READ',
  RESTORE: 'RESTORE',
  DIM: 'DIM',

  // Memory
  PEEK: 'PEEK',
  POKE: 'POKE',
  DEF: 'DEF',
  FN: 'FN',
  USR: 'USR',

  // String functions
  LEFT$: 'LEFT$',
  RIGHT$: 'RIGHT$',
  MID$: 'MID$',
  LEN: 'LEN',
  CHR$: 'CHR$',
  ASC: 'ASC',
  STR$: 'STR$',
  VAL: 'VAL',
  STRING$: 'STRING$',
  INKEY$: 'INKEY$',
  INSTR: 'INSTR',

  // Math functions
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

  // Graphics - Extended Color BASIC
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

  // Sound
  SOUND: 'SOUND',
  PLAY: 'PLAY',
  AUDIO: 'AUDIO',

  // I/O
  OPEN: 'OPEN',
  CLOSE: 'CLOSE',
  PRINT_HASH: 'PRINT#',
  INPUT_HASH: 'INPUT#',
  CLOAD: 'CLOAD',
  CSAVE: 'CSAVE',

  // Misc
  CLEAR: 'CLEAR',
  SET: 'SET',
  RESET: 'RESET',
  POINT: 'POINT',
  TAB: 'TAB',
  POS: 'POS',
  TIMER: 'TIMER',
  MEM: 'MEM',

  // Logical operators
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',

  // Extended BASIC specific
  HSCREEN: 'HSCREEN',
  HCOLOR: 'HCOLOR',
  HLINE: 'HLINE',
  HCIRCLE: 'HCIRCLE',
  HPAINT: 'HPAINT',
  HPRINT: 'HPRINT',
  HDRAW: 'HDRAW',
  HGET: 'HGET',
  HPUT: 'HPUT',
  HBUFF: 'HBUFF',

  // Control
  NEWLINE: 'NEWLINE',
  EOF: 'EOF',
};

// Keywords mapping - case insensitive
const KEYWORDS = {
  'REM': TokenType.REM,
  'LET': TokenType.LET,
  'PRINT': TokenType.PRINT,
  '?': TokenType.PRINT,  // Shorthand for PRINT
  'INPUT': TokenType.INPUT,
  'IF': TokenType.IF,
  'THEN': TokenType.THEN,
  'ELSE': TokenType.ELSE,
  'FOR': TokenType.FOR,
  'TO': TokenType.TO,
  'STEP': TokenType.STEP,
  'NEXT': TokenType.NEXT,
  'GOTO': TokenType.GOTO,
  'GO': TokenType.GOTO,  // GO TO variant
  'GOSUB': TokenType.GOSUB,
  'RETURN': TokenType.RETURN,
  'ON': TokenType.ON,
  'END': TokenType.END,
  'STOP': TokenType.STOP,
  'RUN': TokenType.RUN,
  'LIST': TokenType.LIST,
  'NEW': TokenType.NEW,
  'CONT': TokenType.CONT,

  'DATA': TokenType.DATA,
  'READ': TokenType.READ,
  'RESTORE': TokenType.RESTORE,
  'DIM': TokenType.DIM,

  'PEEK': TokenType.PEEK,
  'POKE': TokenType.POKE,
  'DEF': TokenType.DEF,
  'FN': TokenType.FN,
  'USR': TokenType.USR,

  'LEFT$': TokenType.LEFT$,
  'RIGHT$': TokenType.RIGHT$,
  'MID$': TokenType.MID$,
  'LEN': TokenType.LEN,
  'CHR$': TokenType.CHR$,
  'ASC': TokenType.ASC,
  'STR$': TokenType.STR$,
  'VAL': TokenType.VAL,
  'STRING$': TokenType.STRING$,
  'INKEY$': TokenType.INKEY$,
  'INSTR': TokenType.INSTR,

  'ABS': TokenType.ABS,
  'SGN': TokenType.SGN,
  'INT': TokenType.INT,
  'SQR': TokenType.SQR,
  'LOG': TokenType.LOG,
  'EXP': TokenType.EXP,
  'SIN': TokenType.SIN,
  'COS': TokenType.COS,
  'TAN': TokenType.TAN,
  'ATN': TokenType.ATN,
  'RND': TokenType.RND,
  'FIX': TokenType.FIX,

  'CLS': TokenType.CLS,
  'SCREEN': TokenType.SCREEN,
  'PMODE': TokenType.PMODE,
  'PCLS': TokenType.PCLS,
  'COLOR': TokenType.COLOR,
  'PSET': TokenType.PSET,
  'PRESET': TokenType.PRESET,
  'LINE': TokenType.LINE,
  'CIRCLE': TokenType.CIRCLE,
  'PAINT': TokenType.PAINT,
  'GET': TokenType.GET,
  'PUT': TokenType.PUT,
  'DRAW': TokenType.DRAW,
  'PCOPY': TokenType.PCOPY,
  'LOCATE': TokenType.LOCATE,

  'SOUND': TokenType.SOUND,
  'PLAY': TokenType.PLAY,
  'AUDIO': TokenType.AUDIO,

  'OPEN': TokenType.OPEN,
  'CLOSE': TokenType.CLOSE,
  'CLOAD': TokenType.CLOAD,
  'CSAVE': TokenType.CSAVE,

  'CLEAR': TokenType.CLEAR,
  'SET': TokenType.SET,
  'RESET': TokenType.RESET,
  'POINT': TokenType.POINT,
  'TAB': TokenType.TAB,
  'POS': TokenType.POS,
  'TIMER': TokenType.TIMER,
  'MEM': TokenType.MEM,

  'AND': TokenType.AND,
  'OR': TokenType.OR,
  'NOT': TokenType.NOT,

  'HSCREEN': TokenType.HSCREEN,
  'HCOLOR': TokenType.HCOLOR,
  'HLINE': TokenType.HLINE,
  'HCIRCLE': TokenType.HCIRCLE,
  'HPAINT': TokenType.HPAINT,
  'HPRINT': TokenType.HPRINT,
  'HDRAW': TokenType.HDRAW,
  'HGET': TokenType.HGET,
  'HPUT': TokenType.HPUT,
  'HBUFF': TokenType.HBUFF,

  // Note: 'B' and 'BF' for LINE command box options are NOT keywords
  // They are handled specially in the parser context only
};

class Token {
  constructor(type, value, line = 0, column = 0) {
    this.type = type;
    this.value = value;
    this.line = line;
    this.column = column;
  }

  toString() {
    return `Token(${this.type}, ${JSON.stringify(this.value)}, line=${this.line}, col=${this.column})`;
  }
}

module.exports = { TokenType, KEYWORDS, Token };
