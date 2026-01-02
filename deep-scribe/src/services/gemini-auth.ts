
export interface AuthState {
    isCliInstalled: boolean;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export const checkSystemStatus = async (): Promise<AuthState> => {
    try {
        const status = await window.electronAPI.gemini.checkStatus();
        if (!status.installed) {
            return { isCliInstalled: false, isAuthenticated: false, isLoading: false, error: null };
        }

        const authenticated = await window.electronAPI.gemini.checkAuth();
        return { isCliInstalled: true, isAuthenticated: authenticated, isLoading: false, error: null };
    } catch (e: any) {
        return { isCliInstalled: false, isAuthenticated: false, isLoading: false, error: e.message };
    }
};

export const installCli = async (): Promise<void> => {
    // No-op for SDK integration
};

export const setApiKey = async (key: string): Promise<void> => {
    const result = await window.electronAPI.gemini.setKey(key);
    if (!result.success) {
        throw new Error(result.error);
    }
};

export const loginUser = async (): Promise<void> => {
    throw new Error("Use setApiKey instead");
};
