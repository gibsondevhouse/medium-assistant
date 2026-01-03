# Playwright Electron API

## Class: Electron

Playwright has experimental support for Electron automation.

### Methods

#### launch

`await electron.launch([options])`
Launches an electron application.

**Arguments:**

- `executablePath`: Path to the electron executable (if not using default).
- `args`: Arguments to pass to the application.
- `env`: Environment variables.
- `recordVideo`: Options to record video.

**Returns:** `Promise<ElectronApplication>`

**Example:**

```javascript
const { _electron: electron } = require('playwright');
(async () => {
    const electronApp = await electron.launch({ args: ['main.js'] });
    const window = await electronApp.firstWindow();
    await window.screenshot({ path: 'intro.png' });
    await electronApp.close();
})();
```

## Class: ElectronApplication

- `browserWindow(page)`: Returns the BrowserWindow object for a given Page.
- `close()`: Closes the application.
- `evaluate(pageFunction, ...args)`: Execute a function in the main process.
- `firstWindow()`: Waits for the first window to open and returns it.
- `windows()`: Returns an array of open windows.
