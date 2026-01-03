import {
    getGeminiKey,
    getAnthropicKey,
    getDeepSeekKey,
    getPerplexityKey
} from './settings-keys';

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

    async generateContent(prompt: string, provider: string, model: string): Promise<AiRouterResponse> {
        try {
            const port = await this.getApiPort();
            if (!port) {
                return { success: false, error: "Backend server not reachable (port not found)" };
            }

            // Gather all keys (backend will pick the right one)
            // Ideally we could validiate here if the key for the *selected* provider exists
            const geminiKey = await getGeminiKey();
            const anthropicKey = await getAnthropicKey();
            const deepseekKey = await getDeepSeekKey();
            const perplexityKey = await getPerplexityKey();

            const apiKeys = {
                gemini: geminiKey,
                anthropic: anthropicKey,
                deepseek: deepseekKey,
                perplexity: perplexityKey
            };

            const payload = {
                prompt,
                provider,
                model,
                api_keys: apiKeys
            };

            console.log(`[AiRouter] Sending request to Provider: ${provider}, Model: ${model}`);

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
