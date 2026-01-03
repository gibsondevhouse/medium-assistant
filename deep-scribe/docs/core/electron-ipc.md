# Inter-Process Communication

## Pattern 1: Renderer to main (one-way)

To fire a one-way IPC message from a renderer process to the main process, you can use the `ipcRenderer.send` API to send a message that is then received by the `ipcMain.on` API.

You usually use this pattern to call a main process API from your web contents. We'll demonstrate this pattern by creating a simple app that can programmatically change its window title.

### 1. Listen for events with ipcMain.on

In the main process, set an IPC listener on the `set-title` channel with the `ipcMain.on` API:

```javascript
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

function handleSetTitle (event, title) {
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.on('set-title', handleSetTitle)
  createWindow()
})
```

### 2. Expose ipcRenderer.send via preload

To send messages to the listener created above, you can use the `ipcRenderer.send` API. By default, the renderer process has no Node.js or Electron module access. As an app developer, you need to choose which APIs to expose from your preload script using the `contextBridge` API.

In your preload script, add the following code, which will expose a global `window.electronAPI` variable to your renderer process.

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title)
})
```

## Pattern 2: Renderer to main (two-way)

### 1. Listen for events with ipcMain.handle

In the main process, we'll be creating a `handleFileOpen()` function that calls `dialog.showOpenDialog` and returns the value of the file path selected by the user. This function is used as a callback whenever an `ipcRender.invoke` message is sent through the `dialog:openFile` channel from the renderer process. The return value is then returned as a Promise to the original invoke call.

```javascript
const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('node:path')

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog({})
  if (!canceled) {
    return filePaths[0]
  }
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen)
  createWindow()
})
```

### 2. Expose ipcRenderer.invoke via preload

In the preload script, we expose a one-line `openFile` function that calls and returns the value of `ipcRenderer.invoke('dialog:openFile')`.

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile')
})
```

## Pattern 3: Main to renderer

### 1. Send messages with the webContents module

For this demo, we'll need to first build a custom menu in the main process using Electron's `Menu` module that uses the `webContents.send` API to send an IPC message from the main process to the target renderer.

```javascript
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('node:path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        {
          click: () => mainWindow.webContents.send('update-counter', 1),
          label: 'Increment'
        },
        {
          click: () => mainWindow.webContents.send('update-counter', -1),
          label: 'Decrement'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
  mainWindow.loadFile('index.html')
}
```

### 2. Expose ipcRenderer.on via preload

Like in the previous renderer-to-main example, we use the `contextBridge` and `ipcRenderer` modules in the preload script to expose IPC functionality to the renderer process:

```javascript
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value))
})
```
