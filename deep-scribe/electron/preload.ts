import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  logger: {
    log: (level: string, message: string, ...args: any[]) => ipcRenderer.send('logger:log', level, message, ...args)
  },
  getApiPort: () => ipcRenderer.invoke('get-api-port'),
  // Gemini CLI
  gemini: {
    generate: (prompt: string) => ipcRenderer.invoke('gemini:generate', prompt)
  },
  onGeminiLog: (callback: (message: string) => void) => {
    const subscription = (_: any, message: string) => callback(message);
    ipcRenderer.on('gemini:log', subscription);
    return () => ipcRenderer.removeListener('gemini:log', subscription);
  },
  rss: {
    fetch: (url: string) => ipcRenderer.invoke('rss:fetch', url)
  },
  settings: {
    getGeminiKey: () => ipcRenderer.invoke('settings:get-gemini-key'),
    setGeminiKey: (key: string) => ipcRenderer.invoke('settings:set-gemini-key', key),
    getGNewsKey: () => ipcRenderer.invoke('settings:get-gnews-key'),
    setGNewsKey: (key: string) => ipcRenderer.invoke('settings:set-gnews-key', key),
    getRssUrl: () => ipcRenderer.invoke('settings:get-rss-url'),
    setRssUrl: (url: string) => ipcRenderer.invoke('settings:set-rss-url', url),
    testGeminiKey: (key?: string) => ipcRenderer.invoke('settings:test-gemini-key', key),
    testGNewsKey: (key?: string) => ipcRenderer.invoke('settings:test-gnews-key', key),
    clearAllKeys: () => ipcRenderer.invoke('settings:clear-all-keys'),
    bothKeysSet: () => ipcRenderer.invoke('settings:both-keys-set'),
  }
});
