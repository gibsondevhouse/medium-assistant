# Electron PDF Generation

## Method: `contents.printToPDF(options)`

Prints window's web page as PDF with Chromium's preview printing custom settings.

**Returns:** `Promise<Buffer>` - The generated PDF data.

**Options:**

- `landscape` (boolean) - Paper orientation. Defaults to false.
- `displayHeaderFooter` (boolean) - Whether to display header and footer. Defaults to false.
- `printBackground` (boolean) - Whether to print background graphics. Defaults to false.
- `scale` (number) - Scale of the webpage rendering. Defaults to 1.
- `pageSize` (string | Size) - Specify page size of the generated PDF. Can be `A3`, `A4`, `A5`, `Legal`, `Letter`, `Tabloid` or an Object containing `height` and `width` in microns.

**Example:**

```javascript
const fs = require('fs')
const { BrowserWindow } = require('electron')

let win = new BrowserWindow({ width: 800, height: 600 })
win.loadURL('http://github.com')

win.webContents.on('did-finish-load', () => {
    // Use default printing options
    win.webContents.printToPDF({}).then(data => {
        fs.writeFile('/tmp/print.pdf', data, (error) => {
            if (error) throw error
            console.log('Write PDF successfully.')
        })
    }).catch(error => {
        console.log(`Failed to write PDF to ${path}: `, error)
    })
})
```
