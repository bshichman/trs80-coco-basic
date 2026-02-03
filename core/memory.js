/**
 * TRS-80 Color Computer Memory Manager
 *
 * Emulates the CoCo's memory map including:
 * - 64KB address space
 * - Screen memory
 * - Graphics pages
 * - System areas
 */

class Memory {
  constructor() {
    // 64KB of RAM (expandable CoCo 3 had up to 512KB)
    this.ram = new Uint8Array(65536);

    // Memory map constants
    this.TEXT_SCREEN_START = 0x0400;  // Text screen memory start
    this.TEXT_SCREEN_SIZE = 512;       // 32x16 characters
    this.GRAPHICS_START = 0x0600;      // Graphics memory start
    this.GRAPHICS_PAGE_SIZE = 0x600;   // 1536 bytes per page
    this.BASIC_START = 0x0E00;         // BASIC program start
    this.STACK_TOP = 0x7FFF;           // Stack top

    // CoCo-specific memory locations
    this.PIA0_DATA_A = 0xFF00;  // Keyboard/joystick
    this.PIA0_CTRL_A = 0xFF01;
    this.PIA0_DATA_B = 0xFF02;
    this.PIA0_CTRL_B = 0xFF03;
    this.PIA1_DATA_A = 0xFF20;  // Cassette/sound
    this.PIA1_CTRL_A = 0xFF21;
    this.PIA1_DATA_B = 0xFF22;  // VDG mode
    this.PIA1_CTRL_B = 0xFF23;
    this.SAM_BASE = 0xFFC0;     // SAM registers

    // System variables (from Color BASIC ROM)
    this.CURPOS = 0x0088;       // Current cursor position
    this.CURLIN = 0x0068;       // Current line number
    this.VARTAB = 0x0019;       // Start of variables
    this.ARYTAB = 0x001B;       // Start of arrays
    this.ARYEND = 0x001D;       // End of arrays
    this.STRTAB = 0x0021;       // Start of strings
    this.FRESPC = 0x0023;       // String space pointer
    this.MEMSIZ = 0x0025;       // Top of memory
    this.TIMER = 0x0112;        // Timer value (16-bit)
    this.RNDX = 0x0115;         // Random seed

    // Initialize system variables
    this.initSystemVariables();
  }

  initSystemVariables() {
    // Set up default memory configuration
    this.writeWord(this.MEMSIZ, 0x7FFF);
    this.writeWord(this.VARTAB, this.BASIC_START);
    this.writeWord(this.ARYTAB, this.BASIC_START);
    this.writeWord(this.ARYEND, this.BASIC_START);
    this.writeWord(this.STRTAB, 0x7FFF);
    this.writeWord(this.FRESPC, 0x7FFF);

    // Initialize random seed
    this.writeWord(this.RNDX, 0x1234);

    // Clear text screen
    for (let i = 0; i < this.TEXT_SCREEN_SIZE; i++) {
      this.ram[this.TEXT_SCREEN_START + i] = 0x60; // Space character (inverted)
    }
  }

  peek(address) {
    address = address & 0xFFFF; // Ensure 16-bit address

    // Handle I/O addresses specially
    if (address >= 0xFF00 && address <= 0xFFFF) {
      return this.readIO(address);
    }

    return this.ram[address];
  }

  poke(address, value) {
    address = address & 0xFFFF;
    value = value & 0xFF;

    // Handle I/O addresses specially
    if (address >= 0xFF00 && address <= 0xFFFF) {
      this.writeIO(address, value);
      return;
    }

    this.ram[address] = value;
  }

  readWord(address) {
    address = address & 0xFFFF;
    return (this.ram[address] << 8) | this.ram[address + 1];
  }

  writeWord(address, value) {
    address = address & 0xFFFF;
    value = value & 0xFFFF;
    this.ram[address] = (value >> 8) & 0xFF;
    this.ram[address + 1] = value & 0xFF;
  }

  readIO(address) {
    // Simulate I/O reads
    switch (address) {
      case this.PIA0_DATA_A:
        // Keyboard column (would be set by keyboard handler)
        return 0xFF; // No key pressed
      case this.PIA0_DATA_B:
        // Keyboard row
        return 0xFF;
      case this.PIA1_DATA_A:
        // Cassette input
        return 0x00;
      case this.PIA1_DATA_B:
        // VDG mode register
        return this.ram[address] || 0x00;
      default:
        return this.ram[address] || 0x00;
    }
  }

  writeIO(address, value) {
    // Simulate I/O writes
    this.ram[address] = value;

    // Handle SAM register writes
    if (address >= this.SAM_BASE && address <= 0xFFDF) {
      this.handleSAMWrite(address, value);
    }
  }

  handleSAMWrite(address, value) {
    // SAM (Synchronous Address Multiplexer) register handling
    // These control video mode, memory mapping, etc.
    const reg = (address - this.SAM_BASE) >> 1;
    const bit = (address - this.SAM_BASE) & 1;

    // Store for later reference
    if (!this.samRegisters) {
      this.samRegisters = new Uint8Array(16);
    }

    if (bit === 0) {
      this.samRegisters[reg] &= ~1;
    } else {
      this.samRegisters[reg] |= 1;
    }
  }

  // Get a block of memory
  getBlock(start, length) {
    return this.ram.slice(start, start + length);
  }

  // Set a block of memory
  setBlock(start, data) {
    for (let i = 0; i < data.length; i++) {
      this.ram[start + i] = data[i];
    }
  }

  // Clear a range of memory
  clear(start, end, value = 0) {
    for (let i = start; i <= end; i++) {
      this.ram[i] = value;
    }
  }

  // Get timer value (incremented by system)
  getTimer() {
    return this.readWord(this.TIMER);
  }

  // Set timer value
  setTimer(value) {
    this.writeWord(this.TIMER, value);
  }

  // Increment timer (called by emulator loop)
  incrementTimer() {
    let timer = this.getTimer();
    timer = (timer + 1) & 0xFFFF;
    this.setTimer(timer);
  }

  // Get free memory
  getFreeMemory() {
    const varEnd = this.readWord(this.ARYEND);
    const strStart = this.readWord(this.STRTAB);
    return strStart - varEnd;
  }

  // Reset memory to initial state
  reset() {
    this.ram.fill(0);
    this.initSystemVariables();
  }
}

module.exports = { Memory };
