import React, { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

interface LayoutShellProps {
    children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
    const { theme, mode } = useThemeStore();

    useEffect(() => {
        // Apply theme and mode to the document root
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        root.setAttribute('data-mode', mode);

        // Also manage 'dark' class for Tailwind's dark mode
        if (mode === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Log for debugging
        console.log(`[Deep Scribe] Theme Applied: ${theme} | Mode: ${mode}`);
    }, [theme, mode]);

    return (
        <div className="h-full w-full bg-surface-100 text-text-primary transition-colors duration-300">
            {children}
        </div>
    );
};
