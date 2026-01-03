export { };

declare global {
    interface Window {
        electronAPI: {
            getApiPort: () => Promise<string | null>;
            logger: {
                log: (level: string, message: string, ...args: any[]) => void;
            };
            rss: {
                fetch: (url: string) => Promise<{ success: boolean; feed?: any; error?: string }>;
            };
            settings: {
                getGeminiKey: () => Promise<string | null>;
                setGeminiKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                getGNewsKey: () => Promise<string | null>;
                setGNewsKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                getRssUrl: () => Promise<string>;
                setRssUrl: (url: string) => Promise<void>;
                getAnthropicKey: () => Promise<string | null>;
                setAnthropicKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                getDeepSeekKey: () => Promise<string | null>;
                setDeepSeekKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                getPerplexityKey: () => Promise<string | null>;
                setPerplexityKey: (key: string) => Promise<{ success: boolean; error?: string }>;
                testGeminiKey: (key?: string) => Promise<{ success: boolean; error?: string }>;
                testGNewsKey: (key?: string) => Promise<{ success: boolean; error?: string }>;
                clearAllKeys: () => Promise<{ success: boolean }>;
                bothKeysSet: () => Promise<boolean>;
            };
            drafts: {
                list: () => Promise<{ id: string; title: string; tags: string[]; version: number; lastModified: number; preview: string; filepath: string }[]>;
                read: (id: string) => Promise<{ id: string; content: string } | null>;
                save: (id: string, content: string) => Promise<boolean>;
                updateMetadata: (id: string, metadata: any) => Promise<boolean>;
                create: (title: string) => Promise<{ id: string; title: string; tags: string[]; version: number; lastModified: number; preview: string; filepath: string } | null>;
                delete: (id: string) => Promise<boolean>;
            };
        };
    }
}
