export { };

declare global {
    interface Window {
        electronAPI: {
            getApiPort: () => Promise<string | null>;
            logger: {
                log: (level: string, message: string, ...args: any[]) => void;
            };
            openExternal: (url: string) => void;
            rss: {
                fetch: (url: string) => Promise<{ success: boolean; feed?: any; error?: string }>;
            };
            settings: {
                // Gemini API Key
                getGeminiKey: () => Promise<string | null>;
                setGeminiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                testGeminiKey: (key?: string) => Promise<{ success: boolean; error?: string }>;
                clearGeminiKey: () => Promise<{ success: boolean }>;
                hasGeminiKey: () => Promise<boolean>;
                // RSS Feed
                getRssUrl: () => Promise<string>;
                setRssUrl: (url: string) => Promise<void>;
                // Medium Token
                getMediumToken: () => Promise<string | null>;
                setMediumToken: (token: string) => Promise<{ success: boolean; error?: string }>;
                hasMediumToken: () => Promise<boolean>;
                clearMediumToken: () => Promise<{ success: boolean }>;
                // Google Search
                getGoogleSearchKey: () => Promise<string | null>;
                setGoogleSearchKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                hasGoogleSearchKey: () => Promise<boolean>;
                clearGoogleSearchKey: () => Promise<{ success: boolean }>;
                getGoogleSearchCx: () => Promise<string | null>;
                setGoogleSearchCx: (cx: string) => Promise<{ success: boolean; error?: string }>;
                hasGoogleSearchCx: () => Promise<boolean>;
                clearGoogleSearchCx: () => Promise<{ success: boolean }>;
            };
            google: {
                search: (query: string) => Promise<{ success: boolean; results?: any[]; error?: string }>;
                books: (query: string) => Promise<{ success: boolean; results?: any[]; error?: string }>;
            };
            medium: {
                publish: (title: string, content: string, tags: string[], publishStatus: string) => Promise<{ success: boolean; url?: string; id?: string; error?: string }>;
            };
            drafts: {
                list: () => Promise<{ id: string; title: string; tags: string[]; version: number; lastModified: number; preview: string; filepath: string }[]>;
                read: (id: string) => Promise<{ id: string; content: string } | null>;
                save: (id: string, content: string) => Promise<boolean>;
                updateMetadata: (id: string, metadata: any) => Promise<boolean>;
                create: (title: string, initialContent?: string, tags?: string[]) => Promise<{ id: string; title: string; tags: string[]; version: number; lastModified: number; preview: string; filepath: string } | null>;
                delete: (id: string) => Promise<boolean>;
                exportToPDF: (title: string, htmlContent: string) => Promise<{ success: boolean; filePath?: string; error?: string }>;
            };
            research: {
                sourceRun: (query: string) => Promise<any>;
                researchRun: (hypotheses: any[]) => Promise<any>;
                creativeRun: (findings: any[]) => Promise<any>;
            };
            knowledgeBase: {
                addDocument: (content: string, source: string, title: string, docType?: string, metadata?: any) =>
                    Promise<{ success: boolean; id?: string; error?: string }>;
                addResearch: (topic: string, subtopic: string, findings: string, researchId: string) =>
                    Promise<{ success: boolean; id?: string; error?: string }>;
                addReport: (topic: string, report: string, researchId: string) =>
                    Promise<{ success: boolean; id?: string; error?: string }>;
                query: (query: string, nResults?: number, docType?: string) =>
                    Promise<{ success: boolean; results: KBQueryResult[]; error?: string }>;
                getDocuments: (limit?: number) =>
                    Promise<{ success: boolean; documents: KBDocument[]; error?: string }>;
                deleteDocument: (docId: string) =>
                    Promise<{ success: boolean; error?: string }>;
                clear: () =>
                    Promise<{ success: boolean; error?: string }>;
                getStats: () =>
                    Promise<{ success: boolean; total_documents?: number; error?: string }>;
                chat: (message: string, nContext?: number) =>
                    Promise<{ success: boolean; response?: string; sources?: KBChatSource[]; error?: string }>;
            };
        };
    }

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
}
