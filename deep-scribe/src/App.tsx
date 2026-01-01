import { useEffect, useState } from 'react';
import {
  // Lucide icons removed per Swiss Style "NO icons" constraint
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeepScribeLayout } from './components/DeepScribeLayout';
import { NewsFeed } from './components/NewsFeed';

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

  /* Editor replaced by NewsFeed component */

  const Metadata = (
    <div className="w-full h-full bg-[#0a0a0a] border-l border-white/5 flex flex-col p-6 overflow-y-auto">

      {/* Module A: Trending Now */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-white/40 mb-6">
          Trending Now
        </h2>
        <div className="space-y-6">
          {/* Item 1 */}
          <div className="flex items-baseline gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
            <span className="text-3xl text-white/20 font-serif leading-none group-hover:text-white/40 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>01</span>
            <div>
              <h4 className="text-[0.95rem] font-medium text-gray-200 mb-1 leading-tight group-hover:text-white transition-colors">The Death of Corpocore</h4>
              <span className="text-xs text-gray-500">Elena Fisher</span>
            </div>
          </div>
          {/* Item 2 */}
          <div className="flex items-baseline gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
            <span className="text-3xl text-white/20 font-serif leading-none group-hover:text-white/40 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>02</span>
            <div>
              <h4 className="text-[0.95rem] font-medium text-gray-200 mb-1 leading-tight group-hover:text-white transition-colors">Rust in 2025</h4>
              <span className="text-xs text-gray-500">Marcus Chen</span>
            </div>
          </div>
          {/* Item 3 */}
          <div className="flex items-baseline gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
            <span className="text-3xl text-white/20 font-serif leading-none group-hover:text-white/40 transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>03</span>
            <div>
              <h4 className="text-[0.95rem] font-medium text-gray-200 mb-1 leading-tight group-hover:text-white transition-colors">AI & Typography</h4>
              <span className="text-xs text-gray-500">Sarah Connor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module B: Reading List */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-white/40 mb-4">
          Reading List
        </h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-md bg-[#1e1e1e] border border-white/5 overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=80" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Thumb" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">Design Systems Vol. 2</h4>
              <span className="text-[11px] text-gray-500">4 min read</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-md bg-[#1e1e1e] border border-white/5 overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=100&q=80" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt="Thumb" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">Neo-Brutalism UI</h4>
              <span className="text-[11px] text-gray-500">12 min read</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module C: Explore */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[1.5px] text-white/40 mb-4">
          Explore
        </h2>
        <div className="flex flex-col gap-1">
          {['Generative Art', 'Slow Software', 'Typography', 'Web Assembly', 'Privacy'].map((topic) => (
            <a key={topic} href="#" className="block text-sm text-gray-500 hover:text-white hover:translate-x-1 transition-all py-1">
              {topic}
            </a>
          ))}
          <a href="#" className="block text-sm text-blue-400/80 hover:text-blue-400 hover:translate-x-1 transition-all py-1 mt-2">
            View all topics →
          </a>
        </div>
      </div>

    </div>
  );

  return (
    <DeepScribeLayout
      sidebar={Sidebar}
      editor={<NewsFeed />}
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
