import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
const isDev = process.env.NODE_ENV === 'development';
import { spawn, ChildProcess } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { SettingsService } from './services/settings';
import { RssService } from './services/rss';
import { DraftService } from './services/drafts';

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
  let executablePath = '';
  let args: string[] = [];

  if (isDev) {
    executablePath = 'python3';
    args = ['-u', path.join(__dirname, '../python_backend/main.py')];
  } else {
    // In production, use the bundled executable
    // It should be in extraResources
    const bundledPath = path.join(process.resourcesPath, 'deep-scribe-backend');
    executablePath = bundledPath;
    // No args needed for the standalone executable unless main.py expects them
  }

  console.log(`[Main] Spawning backend: ${executablePath} ${args.join(' ')}`);

  if (!isDev && !fs.existsSync(executablePath)) {
    console.error(`[Main] Backend executable not found at: ${executablePath}`);
    return;
  }

  pythonProcess = spawn(executablePath, args);

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

ipcMain.handle('settings:get-anthropic-key', async () => {
  return settingsService.getAnthropicKey();
});

ipcMain.handle('settings:set-anthropic-key', async (_, key: string) => {
  return settingsService.setAnthropicKey(key);
});

ipcMain.handle('settings:get-deepseek-key', async () => {
  return settingsService.getDeepSeekKey();
});

ipcMain.handle('settings:set-deepseek-key', async (_, key: string) => {
  return settingsService.setDeepSeekKey(key);
});

ipcMain.handle('settings:get-perplexity-key', async () => {
  return settingsService.getPerplexityKey();
});

ipcMain.handle('settings:set-perplexity-key', async (_, key: string) => {
  return settingsService.setPerplexityKey(key);
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

ipcMain.handle('settings:get-rss-url', async () => {
  return settingsService.getRssFeedUrl();
});

ipcMain.handle('settings:set-rss-url', async (_, url: string) => {
  return settingsService.setRssFeedUrl(url);
});

// --- RSS Service ---
const rssService = new RssService();

ipcMain.handle('rss:fetch', async (_, url: string) => {
  return rssService.fetchFeed(url);
});

// --- Draft Service ---
const draftService = new DraftService();

ipcMain.handle('drafts:list', async () => {
  return draftService.listDrafts();
});

ipcMain.handle('drafts:read', async (_, id: string) => {
  return draftService.readDraft(id);
});

ipcMain.handle('drafts:save', async (_, id: string, content: string) => {
  return draftService.saveDraft(id, content);
});

ipcMain.handle('drafts:create', async (_, title: string) => {
  return draftService.createDraft(title);
});

ipcMain.handle('drafts:delete', async (_, id: string) => {
  return draftService.deleteDraft(id);
});

import { logger } from './utils/logger';

ipcMain.on('logger:log', (event, level, message, ...args) => {
  logger.log(level, message, ...args);
});
