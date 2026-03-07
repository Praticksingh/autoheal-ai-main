const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.enableFileLogging = process.env.LOG_TO_FILE === 'true';
    this.logFilePath = process.env.LOG_FILE_PATH || path.join(process.cwd(), 'server', 'logs', 'app.log');

    if (this.enableFileLogging) {
      this.ensureLogDirectory();
    }
  }

  ensureLogDirectory() {
    const dirPath = path.dirname(this.logFilePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  serializeErrorPayload(payload) {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const serialized = { ...payload };

    if (serialized.error instanceof Error) {
      serialized.error = {
        message: serialized.error.message,
        stack: serialized.error.stack,
        name: serialized.error.name,
      };
    }

    return serialized;
  }

  writeToConsole(level, logLine) {
    if (level === 'error') {
      console.error(logLine);
      return;
    }

    if (level === 'warn') {
      console.warn(logLine);
      return;
    }

    console.log(logLine);
  }

  writeToFile(logLine) {
    if (!this.enableFileLogging) {
      return;
    }

    fs.appendFileSync(this.logFilePath, `${logLine}\n`, 'utf8');
  }

  log(event, payload = {}, level = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      event,
      ...this.serializeErrorPayload(payload),
    };

    const logLine = JSON.stringify(entry);
    this.writeToConsole(level, logLine);
    this.writeToFile(logLine);
  }
}

module.exports = new Logger();
