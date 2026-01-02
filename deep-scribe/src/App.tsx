import { useEffect, useState } from 'react';
import {
  Cog
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeepScribeLayout } from './components/DeepScribeLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { SettingsModal } from './components/Settings/SettingsModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function App() {
  const [backendStatus, setBackendStatus] = useState('Connecting...');

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [activeProvider, setActiveProvider] = useState(() => localStorage.getItem('activeProvider') || 'gemini');

  useEffect(() => {
    localStorage.setItem('activeProvider', activeProvider);
    // Sync provider to backend env if needed? For now just frontend state.
  }, [activeProvider]);

  const [activeView, setActiveView] = useState('Dashboard');

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

    // Lazy Auth Check
    if (window.electronAPI?.settings) {
      window.electronAPI.settings.bothKeysSet().then((keysPresent) => {
        console.log("Startup Auth Check:", keysPresent ? "Keys Present" : "No Keys (Lazy Mode)");
        if (!keysPresent) {
          setShowSettings(true);
        }
      });
    } else {
      console.warn("Electron API not available (App.tsx)");
    }
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

        {/* 2. SECTION A: HOME (New Primary) */}
        <div className="space-y-4">
          <h3 className="text-xs font-medium text-[#8b949e] uppercase tracking-[0.1em]">Home</h3>
          <div className="flex flex-col space-y-2">

            {/* Dashboard */}
            <button
              onClick={() => setActiveView('Dashboard')}
              className={cn(
                "text-left text-sm text-[15px] font-medium transition-all duration-200",
                activeView === 'Dashboard'
                  ? "text-white translate-x-1"
                  : "text-[#8b949e] hover:text-white hover:translate-x-1"
              )}
            >
              Dashboard
            </button>

            {/* Settings (Moved here) */}
            <button
              onClick={() => setShowSettings(true)}
              className={cn(
                "text-left text-sm text-[15px] font-medium transition-all duration-200 text-[#8b949e] hover:text-white hover:translate-x-1",
                // No active state visual for settings strictly, usually it opens a modal
              )}
            >
              Settings
            </button>

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

      {/* 6. BOTTOM: CHATS (Communication Module) */}
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





  // We still check for keys to update UI state if needed, but we don't block.
  // const [isAuthenticated, setIsAuthenticated] = useState(false); // Removed gating state



  return (
    <>
      {/* AuthOverlay removed for Lazy Auth */}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        onKeysUpdated={() => {
          console.log("Keys updated");
          // Force re-render or notify components?
          // For now, components check on mount/interaction.
        }}
      // "Done" button still validates, but closing doesn't strictly depend on it for app access anymore,
      // though SettingsModal internal logic might still prefer valid keys.
      // Actually, let's allow closing even if keys aren't set in this "Lazy" mode?
      // The current SettingsModal logic enforces valid keys to "Done" (save). 
      // User can still click "Cancel" or "Close" if we add that, or just use "Done" when they are ready.
      />

      <DeepScribeLayout
        sidebar={Sidebar}
        editor={<Dashboard onOpenSettings={() => setShowSettings(true)} />}
        metadata={Metadata}
      />
    </>
  );
}

export default App;
