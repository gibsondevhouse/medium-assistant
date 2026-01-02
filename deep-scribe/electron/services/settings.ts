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
    private gnewsKeyPath: string;
    private store: any;

    constructor() {
        this.configDir = path.join(app.getPath('userData'), 'keys');
        this.geminiKeyPath = path.join(this.configDir, 'gemini');
        this.gnewsKeyPath = path.join(this.configDir, 'gnews');

        // Ensure config directory exists
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
    }

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

    // GNEWS KEY MANAGEMENT
    getGNewsKey(): string | null {
        try {
            if (!fs.existsSync(this.gnewsKeyPath)) return null;

            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = fs.readFileSync(this.gnewsKeyPath);
                return safeStorage.decryptString(encrypted);
            }
            return null;
        } catch (e) {
            console.error('Failed to read GNews key:', e);
            return null;
        }
    }

    setGNewsKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key || key.length < 10) {
                return { success: false, error: 'Invalid GNews API key format' };
            }

            const trimmed = key.trim();

            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = safeStorage.encryptString(trimmed);
                fs.writeFileSync(this.gnewsKeyPath, encrypted);
            } else {
                return { success: false, error: 'Secure storage not available' };
            }
            return { success: true };
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

    async testGNewsKey(key?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const apiKey = key || this.getGNewsKey();
            if (!apiKey) return { success: false, error: 'No GNews key set' };

            const response = await fetch(
                `https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=1&token=${apiKey}`
            );

            if (response.status === 401 || response.status === 403) {
                return { success: false, error: 'GNews API key is invalid' };
            }

            if (!response.ok) {
                return { success: false, error: `GNews API returned ${response.status}` };
            }

            const data: any = await response.json();
            if (!data.articles || data.articles.length === 0) {
                // It's possible to have 0 articles but valid key, ideally we assume success if 200 OK.
                // But for "top-headlines" general "en", 0 is suspicious.
                // Let's pass if we got a valid JSON struct.
            }

            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message || 'GNews API test failed' };
        }
    }

    // UTILITY
    clearAllKeys(): { success: boolean } {
        try {
            if (fs.existsSync(this.geminiKeyPath)) fs.unlinkSync(this.geminiKeyPath);
            if (fs.existsSync(this.gnewsKeyPath)) fs.unlinkSync(this.gnewsKeyPath);
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    bothKeysSet(): boolean {
        return !!(this.getGeminiKey() && this.getGNewsKey());
    }
}
