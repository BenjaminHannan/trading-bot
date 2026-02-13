export type LogLevel = "debug" | "info" | "warn" | "error";
const order: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class Logger {
  constructor(private readonly scope: string, private readonly level: LogLevel = "info") {}

  private emit(level: LogLevel, msg: string, data?: unknown): void {
    if (order[level] < order[this.level]) return;
    const entry = {
      ts: new Date().toISOString(),
      level,
      scope: this.scope,
      msg,
      ...(data === undefined ? {} : { data })
    };
    process.stdout.write(`${JSON.stringify(entry)}\n`);
  }

  debug(msg: string, data?: unknown): void { this.emit("debug", msg, data); }
  info(msg: string, data?: unknown): void { this.emit("info", msg, data); }
  warn(msg: string, data?: unknown): void { this.emit("warn", msg, data); }
  error(msg: string, data?: unknown): void { this.emit("error", msg, data); }
}
