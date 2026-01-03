import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  logger: {
    log: (level: string, message: string, ...args: any[]) => ipcRenderer.send('logger:log', level, message, ...args)
  },
  openExternal: (url: string) => ipcRenderer.send('shell:open-external', url),
  getApiPort: () => ipcRenderer.invoke('get-api-port'),
  rss: {
    fetch: (url: string) => ipcRenderer.invoke('rss:fetch', url)
  },
  settings: {
    getGeminiKey: () => ipcRenderer.invoke('settings:get-gemini-key'),
    setGeminiKey: (key: string) => ipcRenderer.invoke('settings:set-gemini-key', key),

    getRssUrl: () => ipcRenderer.invoke('settings:get-rss-url'),
    setRssUrl: (url: string) => ipcRenderer.invoke('settings:set-rss-url', url),
    getAnthropicKey: () => ipcRenderer.invoke('settings:get-anthropic-key'),
    setAnthropicKey: (key: string) => ipcRenderer.invoke('settings:set-anthropic-key', key),
    getDeepSeekKey: () => ipcRenderer.invoke('settings:get-deepseek-key'),
    setDeepSeekKey: (key: string) => ipcRenderer.invoke('settings:set-deepseek-key', key),
    getPerplexityKey: () => ipcRenderer.invoke('settings:get-perplexity-key'),
    setPerplexityKey: (key: string) => ipcRenderer.invoke('settings:set-perplexity-key', key),
    getOpenRouterKey: () => ipcRenderer.invoke('settings:get-openrouter-key'),
    setOpenRouterKey: (key: string) => ipcRenderer.invoke('settings:set-openrouter-key', key),
    getOpenAIKey: () => ipcRenderer.invoke('settings:get-openai-key'),
    setOpenAIKey: (key: string) => ipcRenderer.invoke('settings:set-openai-key', key),
    testGeminiKey: (key?: string) => ipcRenderer.invoke('settings:test-gemini-key', key),
    clearAllKeys: () => ipcRenderer.invoke('settings:clear-all-keys'),
    bothKeysSet: () => ipcRenderer.invoke('settings:both-keys-set'),
  },
  drafts: {
    list: () => ipcRenderer.invoke('drafts:list'),
    read: (id: string) => ipcRenderer.invoke('drafts:read', id),
    save: (id: string, content: string) => ipcRenderer.invoke('drafts:save', id, content),
    updateMetadata: (id: string, metadata: any) => ipcRenderer.invoke('drafts:update-metadata', id, metadata),
    create: (title: string, initialContent?: string, tags?: string[]) => ipcRenderer.invoke('drafts:create', title, initialContent, tags),
    delete: (id: string) => ipcRenderer.invoke('drafts:delete', id),
  },
  research: {
    sourceRun: (query: string) => ipcRenderer.invoke('research:source-run', query),
    researchRun: (hypotheses: any[]) => ipcRenderer.invoke('research:research-run', hypotheses),
    creativeRun: (findings: any[]) => ipcRenderer.invoke('research:creative-run', findings),
  }
});
