import { useEffect, useState } from 'react';
import {
  // Lucide icons removed per Swiss Style "NO icons" constraint
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeepScribeLayout } from './components/DeepScribeLayout';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function App() {
  const [backendStatus, setBackendStatus] = useState('Connecting...');
  const [activeTab, setActiveTab] = useState('Drafts');
  const [topics, setTopics] = useState([
    { id: 't1', name: 'Tech & Coding', view: 'topic-dashboard' },
    { id: 't2', name: 'Productivity', view: 'topic-dashboard' },
    { id: 't3', name: 'Personal Essays', view: 'topic-dashboard' },
    { id: 't4', name: 'Crypto Trends', view: 'topic-dashboard' },
  ]);

  useEffect(() => {
    async function checkConnection() {
      try {
        const port = window.electronAPI ? await window.electronAPI.getApiPort() : null;
        if (port) {
          const response = await fetch(`http://127.0.0.1:${port}`);
          if (response.ok) {
            const data = await response.json();
            setBackendStatus('Connected');
            console.log("Backend message:", data.message);
          } else {
            setBackendStatus('Backend Error');
          }
        } else {
          setBackendStatus("Port not found");
        }
      } catch (error) {
        console.error('Failed to connect:', error);
        setBackendStatus('Disconnected');
      }
    }

    checkConnection();
  }, []);



  const Sidebar = (
    <div className="w-full h-full bg-[#0d1117] flex flex-col overflow-hidden font-sans">
      {/* 1. HEADER: Brand Identity */}
      <div className="p-8 shrink-0">
        <h1 className="text-2xl text-white font-bold tracking-tight leading-none" style={{ fontFamily: '"Playfair Display", serif' }}>
          Deep Scribe
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto min-h-0 px-8 pb-8 space-y-10">

        {/* 2. SECTION A: APPS (Primary Nav) */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-[0.1em]">Apps</h3>
          <div className="flex flex-col space-y-2">
            {['Chat', 'Images', 'Research', 'Articles'].map((app) => (
              <button
                key={app}
                className="text-left text-sm text-[15px] text-[#8b949e] font-medium hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                {app}
              </button>
            ))}
          </div>
        </div>

        {/* 3. SECTION B: TOPICS (Filters) */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-[0.1em]">Topics</h3>
          <div className="flex flex-col space-y-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setActiveTab(topic.name)}
                className={cn(
                  "text-left text-sm transition-all duration-200 hover:translate-x-1",
                  activeTab === topic.name
                    ? "text-white font-bold"
                    : "text-[#8b949e] hover:text-white"
                )}
              >
                #{topic.name.replace(/\s+/g, '')}
              </button>
            ))}
          </div>
        </div>

        {/* 4. SECTION C: RECENT ARTICLES (State) */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-[0.1em]">Recent Articles</h3>
          <div className="flex flex-col space-y-3">
            {[
              'Untitled Draft',
              'Sci-Fi Protagonist Idea',
              'World Building Rules',
              'Chapter 1: The Awakening'
            ].map((title) => (
              <button
                key={title}
                className="text-left text-sm text-[#8b949e] hover:text-white hover:translate-x-1 transition-all duration-200"
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 5. BOTTOM: CHATS (Communication Module) */}
      <div className="p-8 shrink-0 bg-[#0d1117] border-t border-[#30363d]/30">
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-[0.1em]">Messages</h3>
          <button className="block w-full text-left group">
            <div className="text-sm font-bold text-white group-hover:translate-x-1 transition-transform duration-200">
              Editor Bot
            </div>
            <div className="text-xs text-[#8b949e] mt-1 truncate group-hover:text-gray-300 transition-colors">
              Feedback on Chapter 3...
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  const Editor = (
    <div className="w-full h-full flex flex-col bg-slate-950 relative overflow-hidden">
      <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm z-10 shrink-0">
        <div>
          <h2 className="text-sm font-medium text-slate-200">Untitled Draft</h2>
          <p className="text-xs text-slate-500">Last edited just now</p>
        </div>
        <button className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-900 rounded hover:bg-white transition shadow-sm">
          Export
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-prose h-full flex flex-col">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden relative group">
            <textarea
              className="w-full h-full p-12 bg-transparent resize-none focus:outline-none text-lg leading-relaxed placeholder-slate-700 text-slate-100 font-serif"
              placeholder="Start writing your masterpiece..."
              spellCheck={false}
            ></textarea>
            <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              0 words
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  const Metadata = (
    <div className="w-full h-full bg-slate-900 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Metadata</h2>
      </div>
      <div className="p-4 space-y-6">
        {/* Placeholder for metadata fields */}
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-semibold">Tags</label>
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">Sci-Fi</span>
            <span className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300">Draft</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-500 uppercase font-semibold">Notes</label>
          <textarea className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors placeholder-slate-600" rows={6} placeholder="Chapter notes..."></textarea>
        </div>
      </div>
    </div>
  );

  return (
    <DeepScribeLayout
      sidebar={Sidebar}
      editor={Editor}
      metadata={Metadata}
    />
  );
}

export default App;

declare global {
  interface Window {
    electronAPI: {
      getApiPort: () => Promise<string>;
    }
  }
}
