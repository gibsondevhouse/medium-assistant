# Electron

## Methods

### launch

Launches electron application specified with the [executablePath](https://playwright.dev/docs/api/class-electron#electron-launch-option-executable-path).

**Usage**

```javascript
await electron.launch();
await electron.launch(options);
```

**Arguments**

- `options` Object (optional)
  - `acceptDownloads` boolean (optional). Whether to automatically download all the attachments. Defaults to true where all the downloads are accepted.
  - `args` string[] (optional). Additional arguments to pass to the application.
  - `bypassCSP` boolean (optional). Toggles bypassing page's Content-Security-Policy.
  - `colorScheme` "light" | "dark" | "no-preference" (optional). Emulates `'prefers-color-scheme'` media feature, supported values are `'light'`, `'dark'`, `'no-preference'`.
  - `cwd` string (optional). Current working directory to launch the application in.
  - `env` Object<string, string | number | boolean> (optional). Environment variables.
  - `executablePath` string (optional). Path to the Electron executable.
  - `extraHTTPHeaders` Object<string, string> (optional). Additional HTTP headers to be sent with every request.
  - `geolocation` Object (optional)
    - `latitude` number. Latitude between -90 and 90.
    - `longitude` number. Longitude between -180 and 180.
    - `accuracy` number (optional). Non-negative accuracy value. Defaults to 0.
  - `httpCredentials` Object (optional). Credentials for [HTTP authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication).
    - `username` string
    - `password` string
  - `ignoreHTTPSErrors` boolean (optional). Whether to ignore HTTPS errors when sending network requests. Defaults to `false`.
  - `locale` string (optional). Specify user locale, for example `en-GB`, `de-DE`, etc.
  - `offline` boolean (optional). Whether to emulate network being offline. Defaults to `false`.
  - `recordHar` Object (optional). Enables [HAR](http://www.softwareishard.com/blog/har-12-spec) recording.
    - `omitContent` boolean (optional). Optional setting to control whether to omit the content from HAR. Defaults to false.
    - `path` string. Path on the filesystem to write the HAR file to.
  - `recordVideo` Object (optional). Enables video recording for all pages.
    - `dir` string. Path to the directory to put videos into.
    - `size` Object (optional). Dimensions of the recorded videos.
      - `width` number
      - `height` number
  - `timeout` number (optional). Maximum time in milliseconds to wait for the application to start. Defaults to `30000` (30 seconds). Pass `0` to disable timeout.
  - `timezoneId` string (optional). Changes the timezone of the context.
  - `tracesDir` string (optional). If specified, traces are saved into this directory.

**Returns**

- `Promise<ElectronApplication>`
