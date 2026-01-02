import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
const isDev = process.env.NODE_ENV === 'development';
import { spawn, ChildProcess } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { GeminiSDKService } from './services/gemini';
import { SettingsService } from './services/settings';

dotenv.config({ path: path.join(__dirname, '../.env') });

let pythonProcess: ChildProcess | null = null;

let mainWindow: BrowserWindow | null = null;
let backendPort: string | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startPythonBackend() {
  const pythonScriptPath = path.join(__dirname, '../python_backend/main.py');
  pythonProcess = spawn('python3', ['-u', pythonScriptPath]);

  pythonProcess.stdout?.on('data', (data) => {
    console.log(`Python stdout: ${data}`);
    const output = data.toString();
    const match = output.match(/Starting backend server on port (\d+)/);
    if (match) {
      backendPort = match[1];
      console.log(`Backend port detected (stdout): ${backendPort}`);
    }
  });

  pythonProcess.stderr?.on('data', (data) => {
    console.error(`Python stderr: ${data}`);
    const output = data.toString();
    // Fallback: capture port from Uvicorn stderr log
    const match = output.match(/Uvicorn running on http:\/\/127.0.0.1:(\d+)/);
    if (match && !backendPort) {
      backendPort = match[1];
      console.log(`Backend port detected (stderr): ${backendPort}`);
    }
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    pythonProcess = null;
  });
}

app.on('ready', () => {
  startPythonBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

ipcMain.handle('get-api-port', async () => {
  const timeout = 10000;
  const interval = 100;
  let elapsed = 0;

  while (backendPort === null && elapsed < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval));
    elapsed += interval;
  }

  return backendPort;
});

// --- Gemini SDK Integration ---
const geminiService = new GeminiSDKService();

ipcMain.handle('gemini:generate', async (_, prompt) => {
  try {
    const text = await geminiService.generateContent(prompt);
    return { success: true, text };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
});

// --- Settings / API Keys ---
const settingsService = new SettingsService();

ipcMain.handle('settings:get-gemini-key', async () => {
  return settingsService.getGeminiKey();
});

ipcMain.handle('settings:set-gemini-key', async (_, key: string) => {
  return settingsService.setGeminiKey(key);
});

ipcMain.handle('settings:get-gnews-key', async () => {
  return settingsService.getGNewsKey();
});

ipcMain.handle('settings:set-gnews-key', async (_, key: string) => {
  return settingsService.setGNewsKey(key);
});

ipcMain.handle('settings:test-gemini-key', async (_, key?: string) => {
  return settingsService.testGeminiKey(key);
});

ipcMain.handle('settings:test-gnews-key', async (_, key?: string) => {
  return settingsService.testGNewsKey(key);
});

ipcMain.handle('settings:clear-all-keys', async () => {
  return settingsService.clearAllKeys();
});

ipcMain.handle('settings:both-keys-set', async () => {
  return settingsService.bothKeysSet();
});

// Helper for local timestamp (YYYY-MM-DD HH:mm:ss.SSS)
function getLocalTimestamp() {
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

function formatLogArg(arg: any): string {
  if (arg instanceof Error || (arg && typeof arg === 'object' && 'message' in arg && 'stack' in arg)) {
    return JSON.stringify({
      name: arg.name || 'Error',
      message: arg.message,
      stack: arg.stack,
      ...arg // Include other properties
    });
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

// Generate a unique log file for this session
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir);
  } catch (e) {
    console.error("Failed to create log directory:", e);
  }
}

// Format: debug-YYYY-MM-DD-HH-mm-ss.log (Local Time)
const sessionLogFile = path.join(logDir, `debug-${getLocalTimestamp().filename}.log`);
console.log(`[Main] Logging to: ${sessionLogFile}`);

ipcMain.on('logger:log', (event, level, message, ...args) => {
  const timestamp = getLocalTimestamp().str;

  // Format message if it's an object (like an Error passed as first arg)
  const formattedMessage = typeof message === 'object' ? formatLogArg(message) : message;
  const formattedArgs = args.map(formatLogArg).join(' ');

  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${formattedMessage} ${formattedArgs}\n`;

  fs.appendFile(sessionLogFile, logLine, (err: NodeJS.ErrnoException | null) => {
    if (err) console.error("Failed to write to log file:", err);
  });
});
