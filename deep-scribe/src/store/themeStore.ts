import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeName = 'harlem_nights' | 'vibranium' | 'kente_cloth' | 'black_ice' | 'akatsuki' | 'uzumaki' | 'byakugan';
export type ThemeMode = 'light' | 'dark';

interface ThemeState {
    theme: ThemeName;
    mode: ThemeMode;
    setTheme: (theme: ThemeName) => void;
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'vibranium', // Default to a dark, futuristic theme
            mode: 'dark',
            setTheme: (theme) => set({ theme }),
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'deep-scribe-theme',
        }
    )
);
