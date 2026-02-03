# TRS-80 Color Computer Extended BASIC Emulator

A complete emulator for the TRS-80 Color Computer (CoCo) Extended Color BASIC, written in JavaScript.

## Features

### Program Control
- `PRINT`, `INPUT`, `LET`
- `IF...THEN...ELSE`
- `FOR...TO...STEP...NEXT`
- `GOTO`, `GOSUB`, `RETURN`
- `ON...GOTO`, `ON...GOSUB`
- `END`, `STOP`, `REM`

### Data Handling
- `DATA`, `READ`, `RESTORE`
- `DIM` (multi-dimensional arrays)
- `DEF FN` (user-defined functions)

### Math Functions
- `ABS`, `SGN`, `INT`, `FIX`
- `SQR`, `LOG`, `EXP`
- `SIN`, `COS`, `TAN`, `ATN`
- `RND`

### String Functions
- `LEFT$`, `RIGHT$`, `MID$`
- `LEN`, `CHR$`, `ASC`
- `STR$`, `VAL`, `STRING$`
- `INSTR`, `INKEY$`

### Extended Color BASIC Graphics
- `PMODE` (0-4) - Set graphics mode
- `SCREEN` - Switch between text and graphics
- `PCLS` - Clear graphics screen
- `COLOR` - Set foreground/background colors
- `PSET`, `PRESET` - Plot/unplot pixels
- `LINE` - Draw lines and boxes (with B, BF options)
- `CIRCLE` - Draw circles and ellipses
- `PAINT` - Flood fill
- `DRAW` - Turtle graphics commands
- `PCOPY` - Copy graphics pages

### Sound
- `SOUND` - Generate tones (frequency, duration)
- `PLAY` - Music macro language
  - Notes: C, D, E, F, G, A, B
  - Octave: O1-O6, >, <
  - Length: L1-L64
  - Tempo: T32-T255
  - Volume: V0-V15
  - Pause: P

### Memory
- `PEEK`, `POKE` - Direct memory access
- 64KB address space emulation

## Usage

### Command Line (Node.js)

```bash
# Interactive mode
node src/trs80-coco-basic/index.js

# Run a program file
node src/trs80-coco-basic/index.js program.bas --run
```

### Web Browser

Open `ui/coco-emulator.html` in a web browser. Features:
- Terminal with command input
- Graphics canvas with CRT effect
- Program editor
- Sample programs

### Programmatic API

```javascript
const { CoCoEmulator } = require('./src/trs80-coco-basic');

const emulator = new CoCoEmulator({
  outputCallback: (text) => console.log(text)
});

emulator.loadProgram(`
10 PRINT "HELLO WORLD"
20 END
`);

await emulator.run();
```

## Sample Programs

See the `programs/` directory for examples:
- `graphics-demo.bas` - Graphics primitives
- `music-demo.bas` - PLAY command music
- `bouncing-ball.bas` - Animation demo

## Graphics Modes (PMODE)

| Mode | Resolution | Colors |
|------|-----------|--------|
| 0    | 128x96    | 2      |
| 1    | 128x96    | 4      |
| 2    | 128x192   | 2      |
| 3    | 128x192   | 4      |
| 4    | 256x192   | 2      |

## Architecture

```
src/trs80-coco-basic/
├── core/
│   ├── tokens.js      # Token definitions
│   ├── lexer.js       # Tokenizer
│   ├── parser.js      # AST parser
│   ├── memory.js      # 64KB memory manager
│   └── interpreter.js # BASIC interpreter
├── graphics/
│   └── graphics.js    # VDG graphics emulation
├── sound/
│   └── sound.js       # Audio (Web Audio API)
├── ui/
│   ├── coco-emulator.html
│   └── coco-browser.js
├── programs/          # Sample BASIC programs
└── index.js           # Main entry point
```

## License

MIT
