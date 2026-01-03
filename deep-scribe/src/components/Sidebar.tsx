import React, { useState } from 'react';
import { Home, Edit3, Settings, Database, MessageSquare, ChevronLeft, ChevronRight, PenTool } from 'lucide-react';

interface SidebarProps {
    activeView: string;
    onChangeView: (view: any) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView, isOpen, onToggle }) => {

    return (
        <div
            className={`
        h-full bg-surface-200 border-r border-white/5 flex flex-col transition-all duration-300 relative
        ${isOpen ? 'w-64' : 'w-16'}
      `}
        >
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-8 bg-surface-300 border border-white/10 rounded-full p-1 text-text-muted hover:text-text-primary transition-colors z-50"
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Brand */}
            <div className={`p-6 flex items-center gap-3 ${isOpen ? 'justify-start' : 'justify-center'}`}>
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shrink-0">
                    <PenTool className="text-surface-100" size={18} />
                </div>
                {isOpen && (
                    <h1 className="text-lg font-serif font-bold text-text-primary tracking-tight">Deep Scribe</h1>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-2">
                <NavItem
                    icon={<Home size={20} />}
                    label="Dashboard"
                    active={activeView === 'dashboard'}
                    collapsed={!isOpen}
                    onClick={() => onChangeView('dashboard')}
                />
                <NavItem
                    icon={<Edit3 size={20} />}
                    label="Editor"
                    active={activeView === 'editor'}
                    collapsed={!isOpen}
                    onClick={() => onChangeView('editor')}
                />
                <NavItem
                    icon={<Database size={20} />}
                    label="Research"
                    active={activeView === 'research'}
                    collapsed={!isOpen}
                    onClick={() => onChangeView('research')}
                />
                <NavItem
                    icon={<MessageSquare size={20} />}
                    label="Knowledge"
                    active={activeView === 'knowledge'}
                    collapsed={!isOpen}
                    onClick={() => onChangeView('knowledge')}
                />
            </nav>

            {/* Footer / Settings */}
            <div className="p-3 border-t border-white/5">
                <NavItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    active={activeView === 'settings'}
                    collapsed={!isOpen}
                    onClick={() => onChangeView('settings')}
                />
            </div>
        </div>
    );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, collapsed, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
        ${active
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}
        ${collapsed ? 'justify-center' : ''}
      `}
            title={collapsed ? label : undefined}
        >
            <span className={`${active ? 'text-brand-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                {icon}
            </span>
            {!collapsed && (
                <span className="text-sm font-medium">{label}</span>
            )}
        </button>
    );
};
