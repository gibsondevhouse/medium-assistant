# Playwright for Electron

## Overview

Playwright has experimental but powerful support for automating Electron applications. It allows you to launch your app, inspect windows, interact with elements, and perform full end-to-end testing within the real application context.

## Installation

```bash
npm install -D playwright
```

## Basic Usage

Here is a complete example of launching an Electron app, inspecting its window, and performing interactions.

```javascript
const { _electron: electron } = require('playwright')

(async () => {
  // Launch Electron app.
  const electronApp = await electron.launch({ args: ['main.js'] })

  // Evaluation expression in the Electron context.
  const appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process
    return app.getAppPath()
  })
  console.log(`App Path: ${appPath}`)

  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow()
  
  // Print the title.
  console.log(await window.title())
  
  // Capture a screenshot.
  await window.screenshot({ path: 'intro.png' })
  
  // Direct Electron console to Node terminal.
  window.on('console', console.log)

  // Click button.
  await window.click('text=Click me')

  // Exit app.
  await electronApp.close()
})()
```

## API Reference

### `electron.launch([options])`

Launches the Electron application.

- **options**: Object
  - `args`: `string[]` - Arguments to pass to the application.
  - `executablePath`: `string` - Path to the specific electron executable (optional).
  - `env`: `Object` - Environment variables.
  - `recordVideo`: `Object` - Options to record video.

**Returns:** `Promise<ElectronApplication>`

### `ElectronApplication`

The wrapper around the running application.

- `browserWindow(page)`: Returns the `BrowserWindow` handle for a given Playwright `Page`.
- `firstWindow()`: Waits for and returns the first opened `Page`.
- `windows()`: Returns an array of all open `Page`s.
- `evaluate(pageFunction, ...args)`: Execute a function in the main Electron process context.
- `close()`: Closes the application.
