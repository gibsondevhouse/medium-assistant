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
    testGeminiKey: (key?: string) => ipcRenderer.invoke('settings:test-gemini-key', key),
    clearGeminiKey: () => ipcRenderer.invoke('settings:clear-gemini-key'),
    hasGeminiKey: () => ipcRenderer.invoke('settings:has-gemini-key'),
    getRssUrl: () => ipcRenderer.invoke('settings:get-rss-url'),
    setRssUrl: (url: string) => ipcRenderer.invoke('settings:set-rss-url', url),
    // Medium Token
    getMediumToken: () => ipcRenderer.invoke('settings:get-medium-token'),
    setMediumToken: (token: string) => ipcRenderer.invoke('settings:set-medium-token', token),
    hasMediumToken: () => ipcRenderer.invoke('settings:has-medium-token'),
    clearMediumToken: () => ipcRenderer.invoke('settings:clear-medium-token'),
    // Google Search Keys
    getGoogleSearchKey: () => ipcRenderer.invoke('settings:get-google-search-key'),
    setGoogleSearchKey: (key: string) => ipcRenderer.invoke('settings:set-google-search-key', key),
    hasGoogleSearchKey: () => ipcRenderer.invoke('settings:has-google-search-key'),
    clearGoogleSearchKey: () => ipcRenderer.invoke('settings:clear-google-search-key'),
    getGoogleSearchCx: () => ipcRenderer.invoke('settings:get-google-search-cx'),
    setGoogleSearchCx: (cx: string) => ipcRenderer.invoke('settings:set-google-search-cx', cx),
    hasGoogleSearchCx: () => ipcRenderer.invoke('settings:has-google-search-cx'),
    clearGoogleSearchCx: () => ipcRenderer.invoke('settings:clear-google-search-cx'),
  },
  google: {
    search: (query: string) => ipcRenderer.invoke('google:search', query),
    books: (query: string) => ipcRenderer.invoke('google:books', query)
  },
  medium: {
    publish: (title: string, content: string, tags: string[], publishStatus: string) =>
      ipcRenderer.invoke('medium:publish', title, content, tags, publishStatus),
  },
  drafts: {
    list: () => ipcRenderer.invoke('drafts:list'),
    read: (id: string) => ipcRenderer.invoke('drafts:read', id),
    save: (id: string, content: string) => ipcRenderer.invoke('drafts:save', id, content),
    updateMetadata: (id: string, metadata: any) => ipcRenderer.invoke('drafts:update-metadata', id, metadata),
    create: (title: string, initialContent?: string, tags?: string[]) => ipcRenderer.invoke('drafts:create', title, initialContent, tags),
    delete: (id: string) => ipcRenderer.invoke('drafts:delete', id),
    exportToPDF: (title: string, htmlContent: string) => ipcRenderer.invoke('drafts:export-to-pdf', title, htmlContent),
  },
  research: {
    sourceRun: (query: string) => ipcRenderer.invoke('research:source-run', query),
    researchRun: (hypotheses: any[]) => ipcRenderer.invoke('research:research-run', hypotheses),
    creativeRun: (findings: any[]) => ipcRenderer.invoke('research:creative-run', findings),
  },
  knowledgeBase: {
    addDocument: (content: string, source: string, title: string, docType?: string, metadata?: any) =>
      ipcRenderer.invoke('kb:add-document', content, source, title, docType, metadata),
    addResearch: (topic: string, subtopic: string, findings: string, researchId: string) =>
      ipcRenderer.invoke('kb:add-research', topic, subtopic, findings, researchId),
    addReport: (topic: string, report: string, researchId: string) =>
      ipcRenderer.invoke('kb:add-report', topic, report, researchId),
    query: (query: string, nResults?: number, docType?: string) =>
      ipcRenderer.invoke('kb:query', query, nResults, docType),
    getDocuments: (limit?: number) =>
      ipcRenderer.invoke('kb:get-documents', limit),
    deleteDocument: (docId: string) =>
      ipcRenderer.invoke('kb:delete-document', docId),
    clear: () =>
      ipcRenderer.invoke('kb:clear'),
    getStats: () =>
      ipcRenderer.invoke('kb:stats'),
    chat: (message: string, nContext?: number) =>
      ipcRenderer.invoke('kb:chat', message, nContext),
  }
});
