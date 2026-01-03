import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';
export type LogCategory = 'main' | 'renderer' | 'python';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    category: LogCategory;
    message: string;
    data?: any;
    sessionId: string;
}

class Logger {
    private logFile: string | null = null;
    private initialized: boolean = false;
    private sessionId: string;
    private maxLogFiles = 5;

    constructor() {
        this.sessionId = Date.now().toString(36); // Simple session ID
        this.init();
    }

    private init() {
        if (this.initialized) return;

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

        // Rotate logs: Delete oldest if we have more than maxLogFiles
        this.rotateLogs(logDir);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        this.logFile = path.join(logDir, `deep-scribe-${timestamp}.jsonl`);

        // Initial log entry
        this.write({
            timestamp: new Date().toISOString(),
            level: 'info',
            category: 'main',
            message: 'Logger initialized',
            data: { 
                logFile: this.logFile, 
                env: process.env.NODE_ENV,
                version: app.getVersion() 
            },
            sessionId: this.sessionId
        });

        console.log(`[Logger] Initialized. Writing JSONL to: ${this.logFile}`);
        this.initialized = true;
    }

    private rotateLogs(logDir: string) {
        try {
            const files = fs.readdirSync(logDir)
                .filter(f => f.startsWith('deep-scribe-') && f.endsWith('.jsonl'))
                .map(f => ({ name: f, time: fs.statSync(path.join(logDir, f)).mtime.getTime() }))
                .sort((a, b) => b.time - a.time); // Newest first

            if (files.length >= this.maxLogFiles) {
                const toDelete = files.slice(this.maxLogFiles);
                for (const file of toDelete) {
                    fs.unlinkSync(path.join(logDir, file.name));
                    console.log(`[Logger] Rotated old log file: ${file.name}`);
                }
            }
        } catch (e) {
            console.error('[Logger] Failed to rotate logs:', e);
        }
    }

    private write(entry: LogEntry) {
        if (!this.logFile) return;

        const logLine = JSON.stringify(entry) + '\n';
        
        // Also write to stdout for dev console (formatted for readability)
        if (process.env.NODE_ENV === 'development') {
            const color = entry.level === 'error' ? '\x1b[31m' : (entry.level === 'warn' ? '\x1b[33m' : '\x1b[36m');
            const reset = '\x1b[0m';
            console.log(`${color}[${entry.level.toUpperCase()}]${reset} [${entry.category}] ${entry.message}`, entry.data ? entry.data : '');
        }

        fs.appendFile(this.logFile, logLine, (err) => {
            if (err) console.error('[Logger] Failed to write to file:', err);
        });
    }

    public log(level: LogLevel, category: LogCategory, message: string, data?: any) {
        this.write({
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            data,
            sessionId: this.sessionId
        });
    }

    // Convenience methods for Main process
    public info(message: string, data?: any) { this.log('info', 'main', message, data); }
    public warn(message: string, data?: any) { this.log('warn', 'main', message, data); }
    public error(message: string, data?: any) { this.log('error', 'main', message, data); }
    public debug(message: string, data?: any) { this.log('debug', 'main', message, data); }

    // Python stdout parser (assumes Python outputs JSON string or plain text)
    public logPython(message: string) {
        try {
            // Try to parse if it's a JSON string from our Python logger
            const parsed = JSON.parse(message);
            if (parsed.level && parsed.message) {
                this.write({
                    timestamp: parsed.timestamp || new Date().toISOString(),
                    level: parsed.level.toLowerCase() as LogLevel,
                    category: 'python',
                    message: parsed.message,
                    data: parsed.data,
                    sessionId: this.sessionId
                });
                return;
            }
        } catch (e) {
            // Not JSON, fall back to raw text
        }
        
        this.log('info', 'python', message);
    }
    
    public getLogFilePath() { return this.logFile; }
}

export const logger = new Logger();
