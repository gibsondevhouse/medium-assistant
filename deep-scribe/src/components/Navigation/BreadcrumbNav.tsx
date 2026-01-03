import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronRight,
    ChevronDown,
    LayoutGrid,
    Edit3,
    Database,
    MessageSquare,
    Settings,
    Home
} from 'lucide-react';

interface BreadcrumbNavProps {
    activeView: string;
    onNavigate: (view: any) => void;
}

const VIEW_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
    'dashboard': { label: 'Home', icon: <Home size={16} /> },
    'editor': { label: 'Editor', icon: <Edit3 size={16} /> },
    'research': { label: 'Research', icon: <Database size={16} /> },
    'knowledge': { label: 'Knowledge', icon: <MessageSquare size={16} /> },
    'settings': { label: 'Settings', icon: <Settings size={16} /> },
};

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ activeView, onNavigate }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentView = VIEW_CONFIG[activeView] || VIEW_CONFIG['dashboard'];

    return (
        <div className="w-full h-14 min-h-[56px] px-6 flex items-center bg-surface-100/80 backdrop-blur-md border-b border-white/5 z-50 select-none">
            {/* Root: Deep Scribe */}
            <div
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer group"
            >
                <div className="w-5 h-5 bg-brand-primary rounded flex items-center justify-center">
                    <span className="text-white font-serif font-bold text-xs">D</span>
                </div>
                <span className="font-medium text-sm group-hover:bg-white/5 px-2 py-1 rounded-md transition-all">
                    Deep Scribe
                </span>
            </div>

            {/* Separator */}
            <ChevronRight className="w-4 h-4 text-text-muted mx-2" />

            {/* Current View Switcher */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-text-primary transition-colors font-medium text-sm group"
                >
                    <span className="text-brand-primary">{currentView.icon}</span>
                    <span>{currentView.label}</span>
                    <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-surface-200 border border-white/10 rounded-lg shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100 z-[100]">
                        {Object.entries(VIEW_CONFIG).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    onNavigate(key);
                                    setIsDropdownOpen(false);
                                }}
                                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors
                  ${activeView === key
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}
                `}
                            >
                                {config.icon}
                                {config.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Optional: Add trailing controls or actions here (e.g. user profile, status) */}
            <div className="ml-auto flex items-center gap-4">
                {/* Example Status Indicator */}
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" title="System Online"></div>
            </div>
        </div>
    );
};
