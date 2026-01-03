/**
 * Knowledge Base Service for Electron
 * Bridges frontend to Python backend for RAG operations
 */

import { SettingsService } from './settings';

const settingsService = new SettingsService();

interface KBDocument {
  id: string;
  content: string;
  metadata: {
    source: string;
    title: string;
    doc_type: string;
    [key: string]: any;
  };
}

interface KBQueryResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance: number;
  relevance: number;
}

interface KBChatSource {
  id: string;
  title: string;
  relevance: number;
}

export class KnowledgeBaseService {
  private backendPort: string | null = null;

  setBackendPort(port: string) {
    this.backendPort = port;
  }

  private async getApiKey(): Promise<string | null> {
    return settingsService.getGeminiKey();
  }

  private async fetch<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    if (!this.backendPort) {
      throw new Error('Backend port not set');
    }

    const apiKey = await this.getApiKey();
    if (!apiKey && method === 'POST') {
      throw new Error('Gemini API key not configured');
    }

    const url = `http://127.0.0.1:${this.backendPort}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify({ ...body, api_key: apiKey });
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async addDocument(
    content: string,
    source: string,
    title: string,
    docType: string = 'research',
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      return await this.fetch('/api/kb/add', 'POST', {
        content,
        source,
        title,
        doc_type: docType,
        metadata,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addResearchFindings(
    topic: string,
    subtopic: string,
    findings: string,
    researchId: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      return await this.fetch('/api/kb/add-research', 'POST', {
        topic,
        subtopic,
        findings,
        research_id: researchId,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addResearchReport(
    topic: string,
    report: string,
    researchId: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      return await this.fetch('/api/kb/add-report', 'POST', {
        topic,
        report,
        research_id: researchId,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async query(
    queryText: string,
    nResults: number = 5,
    docType?: string
  ): Promise<{ success: boolean; results: KBQueryResult[]; error?: string }> {
    try {
      return await this.fetch('/api/kb/query', 'POST', {
        query: queryText,
        n_results: nResults,
        doc_type: docType,
      });
    } catch (error: any) {
      return { success: false, results: [], error: error.message };
    }
  }

  async getAllDocuments(
    limit: number = 100
  ): Promise<{ success: boolean; documents: KBDocument[]; error?: string }> {
    try {
      return await this.fetch(`/api/kb/documents?limit=${limit}`, 'GET');
    } catch (error: any) {
      return { success: false, documents: [], error: error.message };
    }
  }

  async deleteDocument(
    docId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.fetch(`/api/kb/document/${docId}`, 'DELETE');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async clearAll(): Promise<{ success: boolean; error?: string }> {
    try {
      return await this.fetch('/api/kb/clear', 'DELETE');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getStats(): Promise<{
    success: boolean;
    total_documents?: number;
    error?: string;
  }> {
    try {
      return await this.fetch('/api/kb/stats', 'GET');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async chat(
    message: string,
    nContext: number = 3
  ): Promise<{
    success: boolean;
    response?: string;
    sources?: KBChatSource[];
    error?: string;
  }> {
    try {
      return await this.fetch('/api/kb/chat', 'POST', {
        message,
        n_context: nContext,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
