import { GoogleGenerativeAI } from '@google/generative-ai';
import { SettingsService } from './settings';

export class GeminiSDKService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;
    private apiKey: string | null = null;
    private settings: SettingsService;

    constructor() {
        this.settings = new SettingsService();
    }

    private ensureInitialized() {
        const key = this.settings.getGeminiKey();
        if (!key) {
            this.genAI = null;
            this.model = null;
            this.apiKey = null;
            return false;
        }

        if (key !== this.apiKey) {
            this.apiKey = key;
            this.genAI = new GoogleGenerativeAI(key);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        }
        return true;
    }

    // Methods like setApiKey, hasKey, testApiKey are now handled by SettingsService.
    // We keep helper methods if Main needs them, or Main should just use settingsService.
    // For now, I'll remove them to avoid duplication if they aren't used.
    // But check main.ts usage. 
    // main.ts still has handlers that usage geminiService.
    // I should update main.ts to remove those legacy handlers or update them to forward to settings.
    // BUT, the prompt didn't strictly say "Remove old Gemini handlers", but it implied a replacement.
    // I will leave methods compatible but delegating to settings or throw deprecated if not used.
    // Actually, cleaning up is better. I will remove unused methods.

    async generateContent(prompt: string): Promise<string> {
        if (!this.ensureInitialized()) {
            throw new Error("Gemini API Key not set. Please go to settings and enter your API Key.");
        }

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (e: any) {
            console.error("Gemini Generation Error:", e);
            throw new Error(e.message || "Failed to generate content");
        }
    }
}
