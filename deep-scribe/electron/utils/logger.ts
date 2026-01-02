import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

class Logger {
    private logFile: string | null = null;
    private initialized: boolean = false;

    constructor() {
        this.init();
    }

    private init() {
        if (this.initialized) return;

        // Determine log directory (userData/logs or local logs for dev)
        // In dev, we prefer local 'logs' folder for easy access
        const isDev = process.env.NODE_ENV === 'development';
        let logDir = '';

        if (isDev) {
            logDir = path.join(process.cwd(), 'logs');
        } else {
            logDir = path.join(app.getPath('userData'), 'logs');
        }

        if (!fs.existsSync(logDir)) {
            try {
                fs.mkdirSync(logDir, { recursive: true });
            } catch (e) {
                console.error('[Logger] Failed to create log directory:', e);
                return;
            }
        }

        const timestamp = this.getLocalTimestamp();
        this.logFile = path.join(logDir, `debug-${timestamp.filename}.log`);

        console.log(`[Logger] Initialized. Writing to: ${this.logFile}`);
        this.initialized = true;
    }

    private getLocalTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        return {
            str: `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`,
            filename: `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`
        };
    }

    private formatArg(arg: any): string {
        if (arg instanceof Error || (arg && typeof arg === 'object' && 'message' in arg && 'stack' in arg)) {
            return JSON.stringify({
                name: arg.name || 'Error',
                message: arg.message,
                stack: arg.stack,
                ...arg
            }, null, 2);
        }
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return '[Circular/Unserializable]';
            }
        }
        return String(arg);
    }

    public log(level: string, message: any, ...args: any[]) {
        if (!this.logFile) return;

        const timestamp = this.getLocalTimestamp().str;
        const formattedMessage = typeof message === 'string' ? message : this.formatArg(message);
        const formattedArgs = args.map(a => this.formatArg(a)).join(' ');
        const logLine = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage} ${formattedArgs}\n`;

        // Also write to stdout/stderr for dev console visibility
        if (level === 'error') {
            console.error(logLine.trim());
        } else {
            console.log(logLine.trim());
        }

        fs.appendFile(this.logFile, logLine, (err) => {
            if (err) console.error('[Logger] Failed to write to file:', err);
        });
    }

    public info(message: any, ...args: any[]) { this.log('info', message, ...args); }
    public error(message: any, ...args: any[]) { this.log('error', message, ...args); }
    public warn(message: any, ...args: any[]) { this.log('warn', message, ...args); }
    public debug(message: any, ...args: any[]) { this.log('debug', message, ...args); }

    public getLogFilePath() { return this.logFile; }
}

export const logger = new Logger();
