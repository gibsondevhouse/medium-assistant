export async function getGeminiKey(): Promise<string | null> {
    const result = await window.electronAPI.settings.getGeminiKey();
    return result;
}

export async function setGeminiKey(key: string): Promise<void> {
    if (!key || key.length < 20) {
        throw new Error('Invalid Gemini key format');
    }

    const result = await window.electronAPI.settings.setGeminiKey(key);
    if (!result.success) {
        throw new Error(result.error || 'Failed to save Gemini key');
    }
}



export async function getAnthropicKey(): Promise<string | null> {
    return await window.electronAPI.settings.getAnthropicKey();
}

export async function setAnthropicKey(key: string): Promise<void> {
    const result = await window.electronAPI.settings.setAnthropicKey(key);
    if (!result.success) throw new Error(result.error || 'Failed to save Anthropic key');
}

export async function getDeepSeekKey(): Promise<string | null> {
    return await window.electronAPI.settings.getDeepSeekKey();
}

export async function setDeepSeekKey(key: string): Promise<void> {
    const result = await window.electronAPI.settings.setDeepSeekKey(key);
    if (!result.success) throw new Error(result.error || 'Failed to save DeepSeek key');
}

export async function getPerplexityKey(): Promise<string | null> {
    return await window.electronAPI.settings.getPerplexityKey();
}

export async function setPerplexityKey(key: string): Promise<void> {
    const result = await window.electronAPI.settings.setPerplexityKey(key);
    if (!result.success) throw new Error(result.error || 'Failed to save Perplexity key');
}

export async function getOpenRouterKey(): Promise<string | null> {
    return await window.electronAPI.settings.getOpenRouterKey();
}

export async function setOpenRouterKey(key: string): Promise<void> {
    const result = await window.electronAPI.settings.setOpenRouterKey(key);
    if (!result.success) throw new Error(result.error || 'Failed to save OpenRouter key');
}

export async function getOpenAIKey(): Promise<string | null> {
    return await window.electronAPI.settings.getOpenAIKey();
}

export async function setOpenAIKey(key: string): Promise<void> {
    const result = await window.electronAPI.settings.setOpenAIKey(key);
    if (!result.success) throw new Error(result.error || 'Failed to save OpenAI key');
}

export async function maskKey(key: string): Promise<string> {
    if (!key || key.length < 12) return '•••••••••••••';
    return `${key.slice(0, 4)}...${key.slice(-8)}`;
}

export async function getRssUrl(): Promise<string> {
    return await window.electronAPI.settings.getRssUrl();
}

export async function setRssUrl(url: string): Promise<void> {
    await window.electronAPI.settings.setRssUrl(url);
}

export async function clearAllKeys(): Promise<void> {
    await window.electronAPI.settings.clearAllKeys();
}

export async function testGeminiKey(key?: string): Promise<boolean> {
    const result = await window.electronAPI.settings.testGeminiKey(key);
    if (!result.success) {
        throw new Error(result.error || 'Gemini key test failed');
    }
    return true;
}
