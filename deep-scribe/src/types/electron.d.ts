export { };

declare global {
    interface Window {
        electronAPI: {
            getApiPort: () => Promise<string | null>;
            logger: {
                log: (level: string, message: string, ...args: any[]) => void;
            };
            gemini: {
                generate: (prompt: string) => Promise<{ success: boolean; text?: string; error?: string }>;
            };
            onGeminiLog: (callback: (message: string) => void) => () => void;
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
                testGeminiKey: (key?: string) => Promise<{ success: boolean; error?: string }>;
                testGNewsKey: (key?: string) => Promise<{ success: boolean; error?: string }>;
                clearAllKeys: () => Promise<{ success: boolean }>;
                bothKeysSet: () => Promise<boolean>;
            };
        };
    }
}
