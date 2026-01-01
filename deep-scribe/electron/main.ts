import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import { spawn, ChildProcess } from 'child_process';
import * as dotenv from 'dotenv';

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
