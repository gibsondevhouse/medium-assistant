/**
 * Knowledge Base Store
 * Zustand store for managing local knowledge base state
 */

import { create } from 'zustand';

export interface KBDocument {
  id: string;
  content: string;
  metadata: {
    source: string;
    title: string;
    doc_type: string;
    main_topic?: string;
    subtopic?: string;
    research_id?: string;
    [key: string]: any;
  };
}

export interface KBQueryResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance: number;
  relevance: number;
}

export interface KBChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { id: string; title: string; relevance: number }[];
  timestamp: number;
}

interface KnowledgeBaseState {
  // Documents
  documents: KBDocument[];
  isLoadingDocuments: boolean;

  // Search
  searchResults: KBQueryResult[];
  searchQuery: string;
  isSearching: boolean;

  // Chat
  chatMessages: KBChatMessage[];
  isChatLoading: boolean;

  // Stats
  totalDocuments: number;

  // Error
  error: string | null;

  // Actions
  loadDocuments: () => Promise<void>;
  searchDocuments: (query: string, nResults?: number, docType?: string) => Promise<void>;
  addDocument: (content: string, source: string, title: string, docType?: string, metadata?: any) => Promise<boolean>;
  addResearchToKB: (topic: string, subtopic: string, findings: string, researchId: string) => Promise<boolean>;
  addReportToKB: (topic: string, report: string, researchId: string) => Promise<boolean>;
  deleteDocument: (docId: string) => Promise<boolean>;
  clearKnowledgeBase: () => Promise<boolean>;
  loadStats: () => Promise<void>;

  // Chat actions
  sendChatMessage: (message: string) => Promise<void>;
  clearChat: () => void;

  // Reset
  reset: () => void;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => ({
  // Initial state
  documents: [],
  isLoadingDocuments: false,
  searchResults: [],
  searchQuery: '',
  isSearching: false,
  chatMessages: [],
  isChatLoading: false,
  totalDocuments: 0,
  error: null,

  // Load all documents
  loadDocuments: async () => {
    set({ isLoadingDocuments: true, error: null });
    try {
      const result = await window.electronAPI.knowledgeBase.getDocuments(100);
      if (result.success) {
        set({ documents: result.documents, totalDocuments: result.documents.length });
      } else {
        set({ error: result.error || 'Failed to load documents' });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoadingDocuments: false });
    }
  },

  // Search documents
  searchDocuments: async (query: string, nResults = 5, docType?: string) => {
    set({ isSearching: true, searchQuery: query, error: null });
    try {
      const result = await window.electronAPI.knowledgeBase.query(query, nResults, docType);
      if (result.success) {
        set({ searchResults: result.results });
      } else {
        set({ error: result.error || 'Search failed' });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isSearching: false });
    }
  },

  // Add document
  addDocument: async (content, source, title, docType, metadata) => {
    try {
      const result = await window.electronAPI.knowledgeBase.addDocument(content, source, title, docType, metadata);
      if (result.success) {
        await get().loadDocuments();
        return true;
      }
      set({ error: result.error || 'Failed to add document' });
      return false;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  // Add research findings
  addResearchToKB: async (topic, subtopic, findings, researchId) => {
    try {
      const result = await window.electronAPI.knowledgeBase.addResearch(topic, subtopic, findings, researchId);
      if (result.success) {
        await get().loadStats();
        return true;
      }
      set({ error: result.error || 'Failed to add research' });
      return false;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  // Add research report
  addReportToKB: async (topic, report, researchId) => {
    try {
      const result = await window.electronAPI.knowledgeBase.addReport(topic, report, researchId);
      if (result.success) {
        await get().loadStats();
        return true;
      }
      set({ error: result.error || 'Failed to add report' });
      return false;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  // Delete document
  deleteDocument: async (docId) => {
    try {
      const result = await window.electronAPI.knowledgeBase.deleteDocument(docId);
      if (result.success) {
        await get().loadDocuments();
        return true;
      }
      set({ error: result.error || 'Failed to delete document' });
      return false;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  // Clear all documents
  clearKnowledgeBase: async () => {
    try {
      const result = await window.electronAPI.knowledgeBase.clear();
      if (result.success) {
        set({ documents: [], searchResults: [], totalDocuments: 0 });
        return true;
      }
      set({ error: result.error || 'Failed to clear knowledge base' });
      return false;
    } catch (error: any) {
      set({ error: error.message });
      return false;
    }
  },

  // Load stats
  loadStats: async () => {
    try {
      const result = await window.electronAPI.knowledgeBase.getStats();
      if (result.success && result.total_documents !== undefined) {
        set({ totalDocuments: result.total_documents });
      }
    } catch (error) {
      // Silent fail for stats
    }
  },

  // Send chat message
  sendChatMessage: async (message) => {
    const userMessage: KBChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      isChatLoading: true,
      error: null,
    }));

    try {
      const result = await window.electronAPI.knowledgeBase.chat(message, 5);

      if (result.success && result.response) {
        const assistantMessage: KBChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.response,
          sources: result.sources,
          timestamp: Date.now(),
        };

        set((state) => ({
          chatMessages: [...state.chatMessages, assistantMessage],
        }));
      } else {
        set({ error: result.error || 'Chat failed' });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isChatLoading: false });
    }
  },

  // Clear chat
  clearChat: () => {
    set({ chatMessages: [] });
  },

  // Reset
  reset: () => {
    set({
      documents: [],
      isLoadingDocuments: false,
      searchResults: [],
      searchQuery: '',
      isSearching: false,
      chatMessages: [],
      isChatLoading: false,
      totalDocuments: 0,
      error: null,
    });
  },
}));
