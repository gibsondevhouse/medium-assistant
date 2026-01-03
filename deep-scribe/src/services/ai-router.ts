import { getGeminiKey } from './settings-keys';

interface AiRouterResponse {
    success: boolean;
    content?: string;
    error?: string;
    provider?: string;
    model?: string;
    quills_deducted?: number;
}

export class AiRouterService {
    private async getApiPort(): Promise<number> {
        // @ts-ignore
        return await window.electronAPI.getApiPort();
    }

    async generateContent(prompt: string, model: string = 'gemini-2.5-flash'): Promise<AiRouterResponse> {
        try {
            const port = await this.getApiPort();
            if (!port) {
                return { success: false, error: "Backend server not reachable (port not found)" };
            }

            const geminiKey = await getGeminiKey();
            if (!geminiKey) {
                return { success: false, error: "Gemini API key not configured. Please add your key in Settings." };
            }

            const payload = {
                prompt,
                model,
                api_key: geminiKey
            };

            console.log(`[AiRouter] Sending request to Gemini, Model: ${model}`);

            const response = await fetch(`http://127.0.0.1:${port}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, error: `Backend Error ${response.status}: ${errorText}` };
            }

            const data = await response.json();
            return data as AiRouterResponse;

        } catch (error: any) {
            console.error('[AiRouter] Request Failed:', error);
            return { success: false, error: error.message || 'Unknown network error' };
        }
    }
}

export const aiRouter = new AiRouterService();
