import { safeStorage, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
// Unified import for CJS compatibility with electron-store v8
const Store = require('electron-store');
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StoreSchema {
    rssFeedUrl: string;
}

export class SettingsService {
    private configDir: string;
    private geminiKeyPath: string;

    private anthropicKeyPath: string;
    private deepseekKeyPath: string;
    private perplexityKeyPath: string;
    private store: any;

    constructor() {
        this.configDir = path.join(app.getPath('userData'), 'keys');
        this.geminiKeyPath = path.join(this.configDir, 'gemini');

        this.anthropicKeyPath = path.join(this.configDir, 'anthropic');
        this.deepseekKeyPath = path.join(this.configDir, 'deepseek');
        this.perplexityKeyPath = path.join(this.configDir, 'perplexity');
        this.openRouterKeyPath = path.join(this.configDir, 'openrouter');
        this.openAIKeyPath = path.join(this.configDir, 'openai');

        // Ensure config directory exists
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
    }

    private openRouterKeyPath: string;
    private openAIKeyPath: string;

    // INTERNAL: Lazy load store
    private getStore() {
        if (this.store) return this.store;

        try {
            // Using standard require for CJS-compatible electron-store v8.1.0
            this.store = new Store({
                defaults: {
                    rssFeedUrl: 'https://medium.com/feed/tag/technology'
                }
            });
            return this.store;
        } catch (e) {
            console.error('Failed to load electron-store:', e);
            throw e;
        }
    }

    // GENERAL SETTINGS (Electron Store)
    getRssFeedUrl(): string {
        const store = this.getStore();
        return store.get('rssFeedUrl') as string;
    }

    setRssFeedUrl(url: string): void {
        const store = this.getStore();
        store.set('rssFeedUrl', url);
    }

    // GEMINI KEY MANAGEMENT
    getGeminiKey(): string | null {
        try {
            if (!fs.existsSync(this.geminiKeyPath)) return null;

            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = fs.readFileSync(this.geminiKeyPath);
                return safeStorage.decryptString(encrypted);
            } else {
                return null;
            }
        } catch (e) {
            console.error('Failed to read Gemini key:', e);
            return null;
        }
    }

    setGeminiKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key || key.length < 20) {
                return { success: false, error: 'Invalid Gemini API key format' };
            }

            const trimmed = key.trim();

            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = safeStorage.encryptString(trimmed);
                fs.writeFileSync(this.geminiKeyPath, encrypted);
            } else {
                return { success: false, error: 'Secure storage not available on this system' };
            }
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }



    // ANTHROPIC KEY MANAGEMENT
    getAnthropicKey(): string | null {
        try {
            if (!fs.existsSync(this.anthropicKeyPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                return safeStorage.decryptString(fs.readFileSync(this.anthropicKeyPath));
            }
            return null;
        } catch (e) {
            console.error('Failed to read Anthropic key:', e);
            return null;
        }
    }

    setAnthropicKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key) return { success: false, error: 'Invalid key' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.anthropicKeyPath, safeStorage.encryptString(key.trim()));
                return { success: true };
            }
            return { success: false, error: 'Secure storage unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // DEEPSEEK KEY MANAGEMENT
    getDeepSeekKey(): string | null {
        try {
            if (!fs.existsSync(this.deepseekKeyPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                return safeStorage.decryptString(fs.readFileSync(this.deepseekKeyPath));
            }
            return null;
        } catch (e) {
            console.error('Failed to read DeepSeek key:', e);
            return null;
        }
    }

    setDeepSeekKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key) return { success: false, error: 'Invalid key' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.deepseekKeyPath, safeStorage.encryptString(key.trim()));
                return { success: true };
            }
            return { success: false, error: 'Secure storage unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // PERPLEXITY KEY MANAGEMENT
    getPerplexityKey(): string | null {
        try {
            if (!fs.existsSync(this.perplexityKeyPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                return safeStorage.decryptString(fs.readFileSync(this.perplexityKeyPath));
            }
            return null;
        } catch (e) {
            console.error('Failed to read Perplexity key:', e);
            return null;
        }
    }

    setPerplexityKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key) return { success: false, error: 'Invalid key' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.perplexityKeyPath, safeStorage.encryptString(key.trim()));
                return { success: true };
            }
            return { success: false, error: 'Secure storage unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // OPENROUTER KEY MANAGEMENT
    getOpenRouterKey(): string | null {
        try {
            if (!fs.existsSync(this.openRouterKeyPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                return safeStorage.decryptString(fs.readFileSync(this.openRouterKeyPath));
            }
            return null;
        } catch (e) {
            console.error('Failed to read OpenRouter key:', e);
            return null;
        }
    }

    setOpenRouterKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key) return { success: false, error: 'Invalid key' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.openRouterKeyPath, safeStorage.encryptString(key.trim()));
                return { success: true };
            }
            return { success: false, error: 'Secure storage unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // OPENAI KEY MANAGEMENT
    getOpenAIKey(): string | null {
        try {
            if (!fs.existsSync(this.openAIKeyPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                return safeStorage.decryptString(fs.readFileSync(this.openAIKeyPath));
            }
            return null;
        } catch (e) {
            console.error('Failed to read OpenAI key:', e);
            return null;
        }
    }

    setOpenAIKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key) return { success: false, error: 'Invalid key' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.openAIKeyPath, safeStorage.encryptString(key.trim()));
                return { success: true };
            }
            return { success: false, error: 'Secure storage unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    // TEST KEYS
    async testGeminiKey(key?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const apiKey = key || this.getGeminiKey();
            if (!apiKey) return { success: false, error: 'No Gemini key set' };

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent('test');
            const response = await result.response;

            if (!response.text()) {
                return { success: false, error: 'Gemini API returned empty response' };
            }

            return { success: true };
        } catch (e: any) {
            if (e.message?.includes('API key not valid')) {
                return { success: false, error: 'Gemini API key is invalid' };
            }
            return { success: false, error: e.message || 'Gemini API test failed' };
        }
    }



    // UTILITY
    clearAllKeys(): { success: boolean } {
        try {
            if (fs.existsSync(this.geminiKeyPath)) fs.unlinkSync(this.geminiKeyPath);

            if (fs.existsSync(this.anthropicKeyPath)) fs.unlinkSync(this.anthropicKeyPath);
            if (fs.existsSync(this.deepseekKeyPath)) fs.unlinkSync(this.deepseekKeyPath);
            if (fs.existsSync(this.perplexityKeyPath)) fs.unlinkSync(this.perplexityKeyPath);
            if (fs.existsSync(this.openRouterKeyPath)) fs.unlinkSync(this.openRouterKeyPath);
            if (fs.existsSync(this.openAIKeyPath)) fs.unlinkSync(this.openAIKeyPath);
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    bothKeysSet(): boolean {
        // Legacy method, maybe update or deprecate? Just returns true if Gemini/GNews set.
        return !!(this.getGeminiKey());
    }
}
