import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { NewsFeed } from '../NewsFeed';
import { ArticlesFeed } from '../Articles/ArticlesFeed';
import { ResearchTab } from '../Research/ResearchTab';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardTab {
  id: string;
  label: string;
  component: React.ComponentType<{ onOpenSettings: () => void }>;
  closeable?: boolean;
}

interface DashboardProps {
  onOpenSettings: () => void;
}

export function Dashboard({ onOpenSettings }: DashboardProps) {
  // Default tabs that come with the dashboard
  const defaultTabs: DashboardTab[] = [
    {
      id: 'news',
      label: 'News Feed',
      component: NewsFeed,
      closeable: true,
    },
    {
      id: 'articles',
      label: 'Articles',
      component: ArticlesFeed,
      closeable: true,
    },
    {
      id: 'home',
      label: 'Home',
      component: function HomeTab({ onOpenSettings }) {
        return (
          <div className="w-full h-full bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl text-center space-y-6">
              <h1 className="text-5xl font-bold tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
                Welcome to Deep Scribe
              </h1>
              <p className="text-lg text-gray-400 leading-relaxed">
                Deep Scribe is your all-in-one platform for research, writing, and publishing. Start by exploring the news feed, reading curated articles, conducting research, or diving into a writing project.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-[#161b22] rounded-lg border border-[#30363d] hover:border-blue-500/30 transition-colors text-left">
                  <h3 className="text-lg font-semibold text-white mb-2">📰 News Feed</h3>
                  <p className="text-sm text-gray-400">Stay updated with the latest articles from your favorite topics.</p>
                </div>
                <div className="p-6 bg-[#161b22] rounded-lg border border-[#30363d] hover:border-blue-500/30 transition-colors text-left">
                  <h3 className="text-lg font-semibold text-white mb-2">📚 Articles</h3>
                  <p className="text-sm text-gray-400">Read curated Medium articles on technology, design, and creative work.</p>
                </div>
                <div className="p-6 bg-[#161b22] rounded-lg border border-[#30363d] hover:border-blue-500/30 transition-colors text-left">
                  <h3 className="text-lg font-semibold text-white mb-2">🔍 Research</h3>
                  <p className="text-sm text-gray-400">Deep dive into topics and synthesize comprehensive reports using AI.</p>
                </div>
              </div>
              <button
                onClick={onOpenSettings}
                className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                Configure API Keys
              </button>
            </div>
          </div>
        );
      },
      closeable: false,
    },
    {
      id: 'research',
      label: 'Research',
      component: ResearchTab,
      closeable: true,
    },
  ];

  const [tabs, setTabs] = useState<DashboardTab[]>(defaultTabs);
  const [activeTabId, setActiveTabId] = useState('home'); // Home is default but News Feed is leftmost

  const activeTab = tabs.find(t => t.id === activeTabId);
  const ActiveComponent = activeTab?.component;

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close the last tab
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    // Switch to first tab if closed tab was active
    if (activeTabId === tabId) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const addTab = (tab: DashboardTab) => {
    // Check if tab already exists
    if (!tabs.find(t => t.id === tab.id)) {
      setTabs([...tabs, tab]);
    }
    setActiveTabId(tab.id);
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] flex flex-col">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 px-4 py-3 bg-[#0d1117] border-b border-[#30363d] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2 relative",
              activeTabId === tab.id
                ? "text-white bg-[#161b22] border-b-blue-500"
                : "text-[#8b949e] bg-[#0d1117] border-b-transparent hover:text-white hover:bg-[#161b22]/50"
            )}
          >
            {tab.label}
            {tab.closeable && activeTabId === tab.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="ml-1 p-1 hover:bg-[#30363d] rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </button>
        ))}

        {/* Add Tab Button */}
        <div className="ml-auto flex items-center gap-2">
          <div className="h-6 border-l border-[#30363d]"></div>
          <button
            onClick={() => {
              // Show dropdown with available tabs to add
              console.log('Show add tab menu');
            }}
            className="p-2 text-[#8b949e] hover:text-white hover:bg-[#30363d]/30 rounded-lg transition-colors"
            title="Add new tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {ActiveComponent ? (
          <ActiveComponent onOpenSettings={onOpenSettings} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Tab not found
          </div>
        )}
      </div>
    </div>
  );
}
