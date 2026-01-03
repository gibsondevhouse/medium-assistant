# webContents

## Class: WebContents

### Instance Methods

#### contents.printToPDF(options)

```javascript
contents.printToPDF(options)
```

Returns `Promise<Buffer>` - Resolves with the generated PDF data.

Prints window's web page as PDF with Chromium's preview printing custom settings.

The `landscape` will be ignored if `@page` CSS at-rule is used in the web page.

- `options` Object
  - `landscape` boolean (optional) - Paper orientation. Defaults to `false`.
  - `displayHeaderFooter` boolean (optional) - Whether to display header and footer. Defaults to `false`.
  - `printBackground` boolean (optional) - Whether to print background graphics. Defaults to `false`.
  - `scale` number (optional) - Scale of the webpage rendering. Defaults to `1`.
  - `pageSize` string | Size (optional) - Specify page size of the generated PDF. Can be `A3`, `A4`, `A5`, `Legal`, `Letter`, `Tabloid` or an Object containing `height` and `width` in microns.
  - `margins` Object (optional)
    - `top` number (optional) - Top margin in microns. Defaults to `0`.
    - `bottom` number (optional) - Bottom margin in microns. Defaults to `0`.
    - `left` number (optional) - Left margin in microns. Defaults to `0`.
    - `right` number (optional) - Right margin in microns. Defaults to `0`.
  - `pageRanges` string (optional) - Page ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages.
  - `headerTemplate` string (optional) - HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: `date` (formatted print date), `title` (document title), `url` (document location), `pageNumber` (current page number) and `totalPages` (total pages in the document). For example, `<span class=title></span>` would generate span containing the title.
  - `footerTemplate` string (optional) - HTML template for the print footer. Should use the same format as the `headerTemplate`.
  - `preferCSSPageSize` boolean (optional) - Whether to prefer page size as defined by CSS. Defaults to `false`, in which case the content will be scaled to fit the paper size.

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
