import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
const isDev = process.env.NODE_ENV === 'development';
import { spawn, ChildProcess } from 'child_process';
import * as dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { SettingsService } from './services/settings';
import { RssService } from './services/rss';
import { DraftService } from './services/drafts';
import { ResearchService } from './services/research';
import { logger } from './utils/logger';

let pythonProcess: ChildProcess | null = null;
let mainWindow: BrowserWindow | null = null;
let backendPort: string | null = null;

async function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const address = server.address();
      const port = typeof address === 'string' ? 0 : address?.port || 0;
      server.close(() => {
        resolve(port);
      });
    });
  });
}

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

async function startPythonBackend() {
  let executablePath = '';
  let args: string[] = [];

  const port = await getFreePort();
  backendPort = port.toString();

  if (isDev) {
    executablePath = 'python3';
    args = ['-u', path.join(__dirname, '../python_backend/main.py'), '--port', backendPort];
  } else {
    const bundledPath = path.join(process.resourcesPath, 'deep-scribe-backend');
    executablePath = bundledPath;
    args = ['--port', backendPort];
  }

  logger.info(`Spawning Gemini backend: ${executablePath} ${args.join(' ')}`);

  if (!isDev && !fs.existsSync(executablePath)) {
    logger.error(`Backend executable not found at: ${executablePath}`);
    return;
  }

  pythonProcess = spawn(executablePath, args);

  pythonProcess.stdout?.on('data', (data) => {
    logger.logPython(data.toString());
  });

  pythonProcess.stderr?.on('data', (data) => {
    logger.error(`Python stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    logger.warn(`Python process exited with code ${code}`);
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

// --- Settings (Gemini API Key) ---
const settingsService = new SettingsService();

ipcMain.handle('settings:get-gemini-key', async () => {
  return settingsService.getGeminiKey();
});

ipcMain.handle('settings:set-gemini-key', async (_, key: string) => {
  return settingsService.setGeminiKey(key);
});

ipcMain.handle('settings:test-gemini-key', async (_, key?: string) => {
  return settingsService.testGeminiKey(key);
});

ipcMain.handle('settings:clear-gemini-key', async () => {
  return settingsService.clearGeminiKey();
});

ipcMain.handle('settings:has-gemini-key', async () => {
  return settingsService.hasGeminiKey();
});

ipcMain.handle('settings:get-rss-url', async () => {
  return settingsService.getRssFeedUrl();
});

ipcMain.handle('settings:set-rss-url', async (_, url: string) => {
  return settingsService.setRssFeedUrl(url);
});

// Medium Token
ipcMain.handle('settings:get-medium-token', async () => {
  return settingsService.getMediumToken();
});

ipcMain.handle('settings:set-medium-token', async (_, token: string) => {
  return settingsService.setMediumToken(token);
});

ipcMain.handle('settings:has-medium-token', async () => {
  return settingsService.hasMediumToken();
});

ipcMain.handle('settings:clear-medium-token', async () => {
  return settingsService.clearMediumToken();
});

// Google Search Keys
ipcMain.handle('settings:get-google-search-key', async () => { return settingsService.getGoogleSearchKey(); });
ipcMain.handle('settings:set-google-search-key', async (_, key) => { return settingsService.setGoogleSearchKey(key); });
ipcMain.handle('settings:has-google-search-key', async () => { return settingsService.hasGoogleSearchKey(); });
ipcMain.handle('settings:clear-google-search-key', async () => { return settingsService.clearGoogleSearchKey(); });

ipcMain.handle('settings:get-google-search-cx', async () => { return settingsService.getGoogleSearchCx(); });
ipcMain.handle('settings:set-google-search-cx', async (_, cx) => { return settingsService.setGoogleSearchCx(cx); });
ipcMain.handle('settings:has-google-search-cx', async () => { return settingsService.hasGoogleSearchCx(); });
ipcMain.handle('settings:clear-google-search-cx', async () => { return settingsService.clearGoogleSearchCx(); });

// Medium Publishing
ipcMain.handle('medium:publish', async (_, title: string, content: string, tags: string[], publishStatus: string) => {
  try {
    const token = settingsService.getMediumToken();
    if (!token) {
      return { success: false, error: 'Medium token not configured' };
    }

    // First, get user ID
    const userResponse = await fetch('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      return { success: false, error: `Failed to get user info: ${errorText}` };
    }

    const userData = await userResponse.json() as { data?: { id?: string } };
    const userId = userData.data?.id;

    if (!userId) {
      return { success: false, error: 'Could not retrieve Medium user ID' };
    }

    // Create post
    const postResponse = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        title,
        contentFormat: 'html',
        content,
        tags: tags.slice(0, 5), // Medium allows max 5 tags
        publishStatus: publishStatus || 'draft'
      })
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      return { success: false, error: `Failed to publish: ${errorText}` };
    }

    const postData = await postResponse.json() as { data?: { url?: string; id?: string } };
    return {
      success: true,
      url: postData.data?.url,
      id: postData.data?.id
    };
  } catch (error: any) {
    logger.error('Medium publish error:', error);
    return { success: false, error: error.message };
  }
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

ipcMain.handle('drafts:create', async (_, title: string, initialContent?: string, tags?: string[]) => {
  return draftService.createDraft(title, initialContent, tags);
});

ipcMain.handle('drafts:update-metadata', async (_, id: string, metadata: any) => {
  return draftService.updateMetadata(id, metadata);
});

ipcMain.handle('drafts:delete', async (_, id: string) => {
  return draftService.deleteDraft(id);
});

ipcMain.handle('drafts:export-to-pdf', async (_, title: string, htmlContent: string) => {
  if (!mainWindow) {
    return { success: false, error: 'No window available' };
  }

  try {
    // Create a hidden window to render the HTML for PDF export
    const pdfWindow = new BrowserWindow({
      width: 800,
      height: 600,
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      }
    });

    // Create styled HTML document for PDF
    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;500;600&display=swap');

            body {
              font-family: 'Merriweather', Georgia, serif;
              line-height: 1.8;
              color: #1a1a1a;
              max-width: 700px;
              margin: 0 auto;
              padding: 60px 40px;
              background: white;
            }

            h1 {
              font-size: 2.5em;
              font-weight: 700;
              margin-bottom: 0.5em;
              line-height: 1.2;
            }

            h2 {
              font-size: 1.75em;
              font-weight: 700;
              margin-top: 1.5em;
              margin-bottom: 0.5em;
            }

            h3 {
              font-size: 1.25em;
              font-weight: 600;
              margin-top: 1.25em;
              margin-bottom: 0.5em;
            }

            p {
              margin-bottom: 1.25em;
              text-align: justify;
            }

            ul, ol {
              margin-bottom: 1.25em;
              padding-left: 1.5em;
            }

            li {
              margin-bottom: 0.5em;
            }

            blockquote {
              border-left: 4px solid #e5e5e5;
              padding-left: 1em;
              margin-left: 0;
              color: #666;
              font-style: italic;
            }

            code {
              background: #f5f5f5;
              padding: 0.2em 0.4em;
              border-radius: 3px;
              font-size: 0.9em;
            }

            pre {
              background: #f5f5f5;
              padding: 1em;
              border-radius: 5px;
              overflow-x: auto;
            }

            hr {
              border: none;
              border-top: 1px solid #e5e5e5;
              margin: 2em 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Load the HTML content
    await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(styledHtml)}`);

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate PDF
    const pdfData = await pdfWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      }
    });

    // Close the hidden window
    pdfWindow.close();

    // Sanitize filename
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s-]/g, '').trim() || 'Untitled';
    const defaultPath = path.join(app.getPath('documents'), `${sanitizedTitle}.pdf`);

    // Show save dialog
    const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export to PDF',
      defaultPath,
      filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      return { success: false, error: 'Export cancelled' };
    }

    // Write PDF to file
    await fs.promises.writeFile(filePath, pdfData);

    return { success: true, filePath };
  } catch (error: any) {
    console.error('PDF Export Error:', error);
    return { success: false, error: error.message };
  }
});

// --- Research Service ---
// ResearchService registers its own IPC handlers in its constructor
const researchService = new ResearchService();

// --- Knowledge Base Service ---
import { KnowledgeBaseService } from './services/knowledgeBase';
const knowledgeBaseService = new KnowledgeBaseService();

// Update backend port when available
const updateKBPort = () => {
  if (backendPort) {
    knowledgeBaseService.setBackendPort(backendPort);
  }
};

ipcMain.handle('kb:add-document', async (_, content: string, source: string, title: string, docType?: string, metadata?: any) => {
  updateKBPort();
  return knowledgeBaseService.addDocument(content, source, title, docType, metadata);
});

ipcMain.handle('kb:add-research', async (_, topic: string, subtopic: string, findings: string, researchId: string) => {
  updateKBPort();
  return knowledgeBaseService.addResearchFindings(topic, subtopic, findings, researchId);
});

ipcMain.handle('kb:add-report', async (_, topic: string, report: string, researchId: string) => {
  updateKBPort();
  return knowledgeBaseService.addResearchReport(topic, report, researchId);
});

ipcMain.handle('kb:query', async (_, query: string, nResults?: number, docType?: string) => {
  updateKBPort();
  return knowledgeBaseService.query(query, nResults, docType);
});

ipcMain.handle('kb:get-documents', async (_, limit?: number) => {
  updateKBPort();
  return knowledgeBaseService.getAllDocuments(limit);
});

ipcMain.handle('kb:delete-document', async (_, docId: string) => {
  updateKBPort();
  return knowledgeBaseService.deleteDocument(docId);
});

ipcMain.handle('kb:clear', async () => {
  updateKBPort();
  return knowledgeBaseService.clearAll();
});

ipcMain.handle('kb:stats', async () => {
  updateKBPort();
  return knowledgeBaseService.getStats();
});

ipcMain.handle('kb:chat', async (_, message: string, nContext?: number) => {
  updateKBPort();
  return knowledgeBaseService.chat(message, nContext);
});

// --- Logger ---
ipcMain.on('logger:log', (event, level, message, ...args) => {
  logger.log(level, 'renderer', message, args);
});

ipcMain.on('shell:open-external', (_, url: string) => {
  shell.openExternal(url);
});


// --- Google Tools ---
ipcMain.handle('google:search', async (_, query: string) => {
  try {
    const port = backendPort;
    if (!port) return { success: false, error: 'Backend not ready' };

    // Get keys from secure storage
    const apiKey = await settingsService.getGoogleSearchKey(); // Need to implement this in SettingsService
    const cx = await settingsService.getGoogleSearchCx();     // Need to implement this in SettingsService

    if (!apiKey || !cx) {
      return { success: false, error: 'Google Search API Key or Engine ID (CX) not configured' };
    }

    const response = await fetch(`http://127.0.0.1:${port}/api/tools/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        num_results: 5,
        api_key: apiKey,
        search_engine_id: cx
      })
    });

    if (!response.ok) {
      return { success: false, error: `Backend Error: ${response.statusText}` };
    }

    return await response.json();
  } catch (error: any) {
    logger.error(`Google Search Proxy Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('google:books', async (_, query: string) => {
  try {
    const port = backendPort;
    if (!port) return { success: false, error: 'Backend not ready' };

    // Reuse the Search API Key (Google Cloud Key)
    const apiKey = await settingsService.getGoogleSearchKey();

    if (!apiKey) {
      return { success: false, error: 'Google API Key not configured' };
    }

    const response = await fetch(`http://127.0.0.1:${port}/api/tools/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        max_results: 5,
        api_key: apiKey
      })
    });

    if (!response.ok) {
      return { success: false, error: `Backend Error: ${response.statusText}` };
    }

    return await response.json();
  } catch (error: any) {
    logger.error(`Google Books Proxy Error: ${error.message}`);
    return { success: false, error: error.message };
  }
});

// --- Settings (Gemini API Key) ---
