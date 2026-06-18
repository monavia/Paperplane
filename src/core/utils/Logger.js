const colors = {
  RESET: "\x1b[0m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RED: "\x1b[31m",
  CYAN: "\x1b[36m",
  GRAY: "\x1b[90m",
};

const levels = { ERROR: 0, WARN: 1, READY: 2, INFO: 3, DEBUG: 4 };
let currentLevel = "INFO";

class Logger {
  static setLevel(level) {
    if (levels[level] !== undefined) currentLevel = level;
  }

  static _log(level, color, ...args) {
    if (levels[level] <= levels[currentLevel]) {
      const ts = new Date().toISOString();
      process.stdout.write(`${colors.GRAY}[${ts}]${colors.RESET} ${color}[${level}]${colors.RESET} ${args.join(" ")}\n`);
    }
  }

  static error(...args) { this._log("ERROR", colors.RED, ...args); }
  static warn(...args) { this._log("WARN", colors.YELLOW, ...args); }
  static ready(...args) { this._log("READY", colors.GREEN, ...args); }
  static info(...args) { this._log("INFO", colors.CYAN, ...args); }
  static debug(...args) { this._log("DEBUG", colors.GRAY, ...args); }
}

module.exports = Logger;

//======================
// Created by monavia
// Don't change if you don't know
//======================
