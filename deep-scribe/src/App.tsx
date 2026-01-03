import React, { useState, useEffect } from 'react';
import { BreadcrumbNav } from './components/Navigation/BreadcrumbNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Editor } from './components/Editor/Editor';
import { ResearchDashboard } from './components/Research/ResearchDashboard';
import { SettingsDashboard } from './components/Settings/SettingsDashboard';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getGeminiKey } from './services/settings-keys';
import { LayoutShell } from './components/LayoutShell';

type View = 'dashboard' | 'editor' | 'research' | 'settings' | 'knowledge';

function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await fetch('http://localhost:8000/');
        if (health.ok) setBackendReady(true);
      } catch (e) {
        console.warn("Backend not ready yet...");
      }
    };

    const init = async () => {
      const key = await getGeminiKey();
      if (key) setHasKey(true);

      // Initial check
      await checkBackend();

      // Poll for backend if not ready (retry 3 times)
      if (!backendReady) {
        let retries = 0;
        const interval = setInterval(async () => {
          retries++;
          try {
            const health = await fetch('http://localhost:8000/');
            if (health.ok) {
              setBackendReady(true);
              clearInterval(interval);
            }
          } catch (e) { }

          if (retries > 5) clearInterval(interval);
        }, 1000);
      }

      setLoading(false);
    };

    init();
  }, []);

  if (loading) {
    return (
      <LayoutShell>
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
        </div>
      </LayoutShell>
    );
  }

  // Lazy Auth Redirect: If no key, force settings, but allow app to load
  if (!hasKey && activeView !== 'settings') {
    // Optional: You could force redirect here, or just show a banner
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard
          onNavigate={(view: string) => setActiveView(view as View)}
          onCreateArticle={() => setActiveView('editor')}
        />;
      case 'editor':
        return <Editor />;
      case 'research':
        return <ResearchDashboard />;
      case 'settings':
        return <SettingsDashboard />;
      case 'knowledge':
        return <KnowledgeBase />;
      default:
        return <Dashboard onNavigate={(view) => setActiveView(view as View)} />;
    }
  };

  return (
    <LayoutShell>
      <div className="flex flex-col h-screen overflow-hidden bg-surface-100 text-text-primary">
        <BreadcrumbNav
          activeView={activeView}
          onNavigate={setActiveView}
        />

        <main className="flex-1 overflow-hidden relative">
          {!backendReady && (
            <div className="bg-brand-secondary/20 text-brand-secondary px-4 py-2 text-xs font-mono flex items-center gap-2 justify-center border-b border-brand-secondary/30">
              <AlertCircle className="w-3 h-3" />
              Backend Connection Pending... AI features may be unavailable.
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </LayoutShell>
  );
}

export default App;
