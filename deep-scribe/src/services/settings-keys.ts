// Gemini API Key Management

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

export async function testGeminiKey(key?: string): Promise<boolean> {
    const result = await window.electronAPI.settings.testGeminiKey(key);
    if (!result.success) {
        throw new Error(result.error || 'Gemini key test failed');
    }
    return true;
}

export async function clearGeminiKey(): Promise<void> {
    await window.electronAPI.settings.clearGeminiKey();
}

export async function hasGeminiKey(): Promise<boolean> {
    return await window.electronAPI.settings.hasGeminiKey();
}

// Utility

export function maskKey(key: string): string {
    if (!key || key.length < 12) return '•••••••••••••';
    return `${key.slice(0, 4)}...${key.slice(-8)}`;
}

// RSS Feed URL

export async function getRssUrl(): Promise<string> {
    return await window.electronAPI.settings.getRssUrl();
}

export async function setRssUrl(url: string): Promise<void> {
    await window.electronAPI.settings.setRssUrl(url);
}
