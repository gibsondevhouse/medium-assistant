# Electron IPC

## Patterns

### 1. Renderer to Main (One-Way)

Use `ipcRenderer.send` and `ipcMain.on`.
Good for: Notifications, Logging.

### 2. Renderer to Main (Two-Way)

Use `ipcRenderer.invoke` and `ipcMain.handle`.
Good for: Data fetching, heavy computations.

**Main:**

```javascript
ipcMain.handle('some-channel', async (event, ...args) => {
  const result = await doWork(args)
  return result
})
```

**Renderer:**

```javascript
const result = await window.electronAPI.invoke('some-channel', ...args)
```

### 3. Main to Renderer

Use `webContents.send` and `ipcRenderer.on`.
Good for: Push notifications, menu events.

**Main:**

```javascript
mainWindow.webContents.send('update-counter', 1)
```

**Preload:**

```javascript
contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value))
})
```
