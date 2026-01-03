import { safeStorage, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
const Store = require('electron-store');
import { GoogleGenerativeAI } from '@google/generative-ai';

interface StoreSchema {
    rssFeedUrl: string;
}

export class SettingsService {
    private configDir: string;
    private geminiKeyPath: string;
    private mediumTokenPath: string;
    private googleSearchKeyPath: string;
    private googleSearchCxPath: string;
    private store: any;

    constructor() {
        this.configDir = path.join(app.getPath('userData'), 'keys');
        this.geminiKeyPath = path.join(this.configDir, 'gemini');
        this.mediumTokenPath = path.join(this.configDir, 'medium');
        this.googleSearchKeyPath = path.join(this.configDir, 'google_search_key');
        this.googleSearchCxPath = path.join(this.configDir, 'google_search_cx');

        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
    }

    private getStore() {
        if (this.store) return this.store;

        try {
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

    // RSS FEED URL
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

    async testGeminiKey(key?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const apiKey = key || this.getGeminiKey();
            if (!apiKey) return { success: false, error: 'No Gemini key set' };

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

    clearGeminiKey(): { success: boolean } {
        try {
            if (fs.existsSync(this.geminiKeyPath)) {
                fs.unlinkSync(this.geminiKeyPath);
            }
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    hasGeminiKey(): boolean {
        return !!this.getGeminiKey();
    }

    // MEDIUM TOKEN MANAGEMENT
    getMediumToken(): string | null {
        try {
            if (!fs.existsSync(this.mediumTokenPath)) return null;

            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = fs.readFileSync(this.mediumTokenPath);
                return safeStorage.decryptString(encrypted);
            } else {
                return null;
            }
        } catch (e) {
            console.error('Failed to read Medium token:', e);
            return null;
        }
    }

    setMediumToken(token: string): { success: boolean; error?: string } {
        try {
            if (!token || token.length < 20) {
                return { success: false, error: 'Invalid Medium token format' };
            }

            const trimmed = token.trim();

            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = safeStorage.encryptString(trimmed);
                fs.writeFileSync(this.mediumTokenPath, encrypted);
            } else {
                return { success: false, error: 'Secure storage not available on this system' };
            }
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    clearMediumToken(): { success: boolean } {
        try {
            if (fs.existsSync(this.mediumTokenPath)) {
                fs.unlinkSync(this.mediumTokenPath);
            }
            return { success: true };
        } catch (e) {
            return { success: false };
        }
    }

    hasMediumToken(): boolean {
        return !!this.getMediumToken();
    }

    // GOOGLE SEARCH API KEY
    getGoogleSearchKey(): string | null {
        try {
            if (!fs.existsSync(this.googleSearchKeyPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = fs.readFileSync(this.googleSearchKeyPath);
                return safeStorage.decryptString(encrypted);
            }
            return null;
        } catch (e) {
            console.error('Failed to read Google Search Key:', e);
            return null;
        }
    }

    setGoogleSearchKey(key: string): { success: boolean; error?: string } {
        try {
            if (!key) return { success: false, error: 'Invalid Key' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.googleSearchKeyPath, safeStorage.encryptString(key.trim()));
                return { success: true };
            }
            return { success: false, error: 'Encryption unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    hasGoogleSearchKey(): boolean { return !!this.getGoogleSearchKey(); }
    
    clearGoogleSearchKey(): { success: boolean } {
        try {
            if (fs.existsSync(this.googleSearchKeyPath)) fs.unlinkSync(this.googleSearchKeyPath);
            return { success: true };
        } catch (e) { return { success: false }; }
    }

    // GOOGLE SEARCH CX (ENGINE ID)
    getGoogleSearchCx(): string | null {
        try {
            if (!fs.existsSync(this.googleSearchCxPath)) return null;
            if (safeStorage.isEncryptionAvailable()) {
                const encrypted = fs.readFileSync(this.googleSearchCxPath);
                return safeStorage.decryptString(encrypted);
            }
            return null;
        } catch (e) {
            console.error('Failed to read Google Search CX:', e);
            return null;
        }
    }

    setGoogleSearchCx(cx: string): { success: boolean; error?: string } {
        try {
            if (!cx) return { success: false, error: 'Invalid CX' };
            if (safeStorage.isEncryptionAvailable()) {
                fs.writeFileSync(this.googleSearchCxPath, safeStorage.encryptString(cx.trim()));
                return { success: true };
            }
            return { success: false, error: 'Encryption unavailable' };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }

    hasGoogleSearchCx(): boolean { return !!this.getGoogleSearchCx(); }

    clearGoogleSearchCx(): { success: boolean } {
        try {
            if (fs.existsSync(this.googleSearchCxPath)) fs.unlinkSync(this.googleSearchCxPath);
            return { success: true };
        } catch (e) { return { success: false }; }
    }
}
