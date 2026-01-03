import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Key,
    Settings as SettingsIcon,
    Database,
    Sparkles,
    FileText,
    Globe,
    Search,
    Send,
    ExternalLink,
    Palette,
    Sun,
    Moon
} from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import {
    getGeminiKey, setGeminiKey,
    getRssUrl, setRssUrl,
    maskKey, clearGeminiKey,
    testGeminiKey
} from '../../services/settings-keys';
import { ProviderHero } from './ProviderHero';
import { ProviderDeepDive } from './ProviderDeepDive';
import { useThemeStore, ThemeName, ThemeMode } from '../../store/themeStore';

interface SettingsDashboardProps {
    onOpenSettings?: () => void;
}

type TabType = 'api' | 'research' | 'news' | 'editor' | 'appearance' | 'advanced';

// Gemini Model Options
const GEMINI_MODELS = [
    { group: 'Gemini 3 (Preview)', label: 'Gemini 3.0 Pro (Reasoning)', value: 'gemini-3.0-pro-preview' },
    { group: 'Gemini 3 (Preview)', label: 'Gemini 3.0 Flash (Multimodal)', value: 'gemini-3.0-flash-preview' },
    { group: 'Gemini 2.5 (Stable)', label: 'Gemini 2.5 Pro (Powerful)', value: 'gemini-2.5-pro' },
    { group: 'Gemini 2.5 (Stable)', label: 'Gemini 2.5 Flash (Balanced)', value: 'gemini-2.5-flash' },
    { group: 'Gemini 2.5 (Stable)', label: 'Gemini 2.5 Flash-Lite (Fastest)', value: 'gemini-2.5-flash-lite' },
];

const THEMES: { id: ThemeName; label: string; color: string }[] = [
    { id: 'harlem_nights', label: 'Harlem Nights', color: '#d4af37' },
    { id: 'vibranium', label: 'Vibranium', color: '#6a0dad' },
    { id: 'kente_cloth', label: 'Kente Cloth', color: '#ce1126' },
    { id: 'black_ice', label: 'Black Ice', color: '#a5f2f3' },
    { id: 'akatsuki', label: 'Akatsuki', color: '#ba1319' },
    { id: 'uzumaki', label: 'Uzumaki', color: '#f66c2d' },
    { id: 'byakugan', label: 'Byakugan', color: '#dcd0ff' },
];

export const SettingsDashboard: React.FC<SettingsDashboardProps> = () => {
    const [activeTab, setActiveTab] = useState<TabType>('api');
    const [geminiKey, setGeminiKeyDisplay] = useState<string | undefined>();
    const [googleSearchKey, setGoogleSearchKeyDisplay] = useState<string | undefined>();
    const [googleSearchCx, setGoogleSearchCxDisplay] = useState<string | undefined>();
    const [mediumToken, setMediumTokenDisplay] = useState<string | undefined>();
    const [rssUrl, setRssUrlDisplay] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    // Theme Store
    const { theme, mode, setTheme, setMode, toggleMode } = useThemeStore();

    // Research Settings
    const [researchModel, setResearchModel] = useState('gemini-2.5-flash');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(8192);
    const [parallelResearch, setParallelResearch] = useState(true);

    // System Prompt Settings
    const [systemPrompt, setSystemPrompt] = useState<string>('You are an expert article writer.');
    const [customSystemPromptEnabled, setCustomSystemPromptEnabled] = useState(false);

    // News Feed Settings
    const [newsLanguage, setNewsLanguage] = useState('en');
    const [newsCountry, setNewsCountry] = useState('us');
    const [newsMaxArticles, setNewsMaxArticles] = useState(21);
    const [newsCategories, setNewsCategories] = useState<string[]>(['technology']);

    // Editor Settings
    const [autoSaveInterval, setAutoSaveInterval] = useState(30);
    const [defaultExportFormat, setDefaultExportFormat] = useState('markdown');
    const [enableSpellCheck, setEnableSpellCheck] = useState(true);

    // Advanced Settings
    const [enableLogging, setEnableLogging] = useState(true);
    const [cacheEnabled, setCacheEnabled] = useState(true);

    const loadKeys = async () => {
        const gKey = await getGeminiKey();
        const rss = await getRssUrl();
        const mToken = await window.electronAPI.settings.getMediumToken();
        const gsKey = await window.electronAPI.settings.getGoogleSearchKey();
        const gsCx = await window.electronAPI.settings.getGoogleSearchCx();

        if (gKey) setGeminiKeyDisplay(maskKey(gKey));
        else setGeminiKeyDisplay(undefined);

        if (mToken) setMediumTokenDisplay(maskKey(mToken));
        else setMediumTokenDisplay(undefined);

        if (gsKey) setGoogleSearchKeyDisplay(maskKey(gsKey));
        else setGoogleSearchKeyDisplay(undefined);

        if (gsCx) setGoogleSearchCxDisplay(maskKey(gsCx));
        else setGoogleSearchCxDisplay(undefined);

        if (rss) setRssUrlDisplay(rss);
    };

    useEffect(() => {
        loadKeys();
        // Load other settings from localStorage
        try {
            const stored = localStorage.getItem('deep-scribe-settings');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.research) {
                    setResearchModel(parsed.research.model || 'gemini-2.5-flash');
                    setTemperature(parsed.research.temperature ?? 0.7);
                    setMaxTokens(parsed.research.maxTokens ?? 8192);
                    setParallelResearch(parsed.research.parallelResearch ?? true);
                    setSystemPrompt(parsed.research.systemPrompt || 'You are an expert article writer.');
                    setCustomSystemPromptEnabled(parsed.research.customSystemPromptEnabled ?? false);
                }
                if (parsed.news) {
                    setNewsLanguage(parsed.news.language || 'en');
                    setNewsCountry(parsed.news.country || 'us');
                    setNewsMaxArticles(parsed.news.maxArticles ?? 21);
                    setNewsCategories(parsed.news.categories || ['technology']);
                }
                if (parsed.editor) {
                    setAutoSaveInterval(parsed.editor.autoSaveInterval ?? 30);
                    setDefaultExportFormat(parsed.editor.defaultExportFormat || 'markdown');
                    setEnableSpellCheck(parsed.editor.enableSpellCheck ?? true);
                }
                if (parsed.advanced) {
                    setEnableLogging(parsed.advanced.enableLogging ?? true);
                    setCacheEnabled(parsed.advanced.cacheEnabled ?? true);
                }
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        }
    }, []);

    const handleGeminiSave = async (key: string) => {
        setLoading(true);
        try {
            await setGeminiKey(key);
            await loadKeys();
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSearchSave = async (key: string) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.settings.setGoogleSearchKey(key);
            if (!result.success) alert(result.error);
            await loadKeys();
        } finally { setLoading(false); }
    };

    const handleGoogleCxSave = async (cx: string) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.settings.setGoogleSearchCx(cx);
            if (!result.success) alert(result.error);
            await loadKeys();
        } finally { setLoading(false); }
    };

    const handleClearGoogleSearch = async () => {
        if (!confirm("Remove Google Search keys?")) return;
        await window.electronAPI.settings.clearGoogleSearchKey();
        await window.electronAPI.settings.clearGoogleSearchCx();
        await loadKeys();
    };

    const handleRssSave = async (url: string) => {
        setLoading(true);
        try {
            await setRssUrl(url);
            await loadKeys();
        } finally {
            setLoading(false);
        }
    };

    const handleClearKey = async () => {
        if (!confirm("Are you sure you want to remove your Gemini API key?")) return;
        await clearGeminiKey();
        await loadKeys();
        setTestResult(null);
    };

    const handleMediumSave = async (token: string) => {
        setLoading(true);
        try {
            const result = await window.electronAPI.settings.setMediumToken(token);
            if (result.success) {
                await loadKeys();
            } else {
                alert(result.error || 'Failed to save Medium token');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClearMediumToken = async () => {
        if (!confirm("Are you sure you want to remove your Medium Integration Token?")) return;
        await window.electronAPI.settings.clearMediumToken();
        await loadKeys();
    };

    const handleTestKey = async () => {
        setLoading(true);
        setTestResult(null);
        try {
            const result = await testGeminiKey();
            setTestResult({
                success: result,
                message: result ? 'Gemini API connected successfully' : 'Failed to verify Gemini key'
            });
        } catch (e: any) {
            setTestResult({
                success: false,
                message: e.message || "Test failed unexpectedly."
            });
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = () => {
        localStorage.setItem('deep-scribe-settings', JSON.stringify({
            research: { model: researchModel, temperature, maxTokens, parallelResearch, systemPrompt, customSystemPromptEnabled },
            news: { language: newsLanguage, country: newsCountry, maxArticles: newsMaxArticles, categories: newsCategories },
            editor: { autoSaveInterval, defaultExportFormat, enableSpellCheck },
            advanced: { enableLogging, cacheEnabled }
        }));
        alert("Settings saved!");
    }

    const tabs = [
        { id: 'api' as TabType, label: 'API Keys', icon: Key },
        { id: 'research' as TabType, label: 'Research', icon: Sparkles },
        { id: 'appearance' as TabType, label: 'Appearance', icon: Palette },
        { id: 'news' as TabType, label: 'News Feed', icon: Globe },
        { id: 'editor' as TabType, label: 'Editor', icon: FileText },
        { id: 'advanced' as TabType, label: 'Advanced', icon: SettingsIcon },
    ];

    return (
        <div className="w-full h-full bg-surface-100 flex flex-col md:flex-row overflow-hidden text-text-primary">

            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 border-r border-white/5 bg-surface-200 flex flex-col">
                <div className="p-8 border-b border-white/5 bg-surface-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center border border-brand-primary/20">
                            <ShieldCheck className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-serif font-bold text-text-primary leading-tight">Settings</h2>
                            <p className="text-xs text-text-muted">Configure Deep Scribe</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-surface-100 flex flex-col">
                <div className="flex-1 p-12 max-w-5xl mx-auto w-full">

                    {testResult && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${testResult.success
                            ? 'bg-green-900/20 border border-green-500/30 text-green-300'
                            : 'bg-red-900/20 border border-red-500/30 text-red-300'
                            }`}>
                            {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                            {testResult.message}
                        </div>
                    )}

                    {/* API Keys Tab */}
                    {activeTab === 'api' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-3xl font-bold text-text-primary mb-3 font-serif tracking-tight">Gemini Configuration</h3>
                                <p className="text-text-secondary font-sans text-lg leading-relaxed max-w-2xl">Deep Scribe runs exclusively on Google Gemini. Your API key is stored securely on your device.</p>
                            </div>

                            <div className="space-y-6">
                                <ProviderHero
                                    apiKey={geminiKey}
                                    onSave={handleGeminiSave}
                                    onNavigateToPrompts={() => setActiveTab('research')}
                                    isLoading={loading}
                                />

                                {geminiKey && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleTestKey}
                                            disabled={loading}
                                            className="text-sm text-brand-accent hover:text-brand-primary flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Test Connection
                                        </button>
                                    </div>
                                )}

                                <div className="my-12 border-t border-white/10"></div>

                                <ProviderDeepDive />

                                <div className="pt-6 border-t border-white/5">
                                    <button
                                        onClick={handleClearKey}
                                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-900/30"
                                    >
                                        <Trash2 className="w-4 h-4" /> Clear Gemini API Key
                                    </button>
                                </div>
                                {/* ... Rest of API keys (Google Search, Medium) similar updates ... */}
                                <div className="my-12 border-t border-white/10"></div>

                                <div>
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                                            <Search className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-text-primary font-serif tracking-tight">Live Web Research</h3>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary font-sans text-base leading-relaxed max-w-2xl mb-6">
                                        Enable "Grounded" research by connecting Google Custom Search.
                                    </p>
                                </div>
                                <div className="p-6 bg-surface-200 rounded-xl border border-white/5">
                                    <ApiKeyInput
                                        label="Search API Key"
                                        placeholder="Enter Google Search API Key"
                                        currentValue={googleSearchKey}
                                        getKeyUrl="https://developers.google.com/custom-search/v1/overview"
                                        onSave={handleGoogleSearchSave}
                                        isLoading={loading}
                                    />
                                    <ApiKeyInput
                                        label="Search Engine ID (CX)"
                                        placeholder="Enter Search Engine ID"
                                        currentValue={googleSearchCx}
                                        getKeyUrl="https://programmablesearchengine.google.com/controlpanel/create"
                                        onSave={handleGoogleCxSave}
                                        isLoading={loading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Appearance Tab */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary mb-2 font-serif">Appearance Theme</h3>
                                <p className="text-text-secondary">Select a cultural theme for your workspace.</p>
                            </div>

                            <div className="p-6 bg-surface-200 rounded-xl border border-white/5">
                                <div className="flex items-center justify-between mb-6">
                                    <label className="text-sm font-medium text-text-primary">Color Palette</label>
                                    <button
                                        onClick={toggleMode}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-300 text-text-primary hover:bg-surface-800 transition-colors text-xs font-medium"
                                    >
                                        {mode === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                                        {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {THEMES.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`relative group p-4 rounded-xl border transition-all duration-300 text-left ${theme === t.id
                                                    ? 'bg-brand-primary/10 border-brand-primary shadow-[0_0_15px_rgba(var(--brand-primary),0.3)]'
                                                    : 'bg-surface-300 border-transparent hover:border-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="w-8 h-8 rounded-full shadow-lg"
                                                    style={{ backgroundColor: t.color }}
                                                />
                                                <span className={`font-medium ${theme === t.id ? 'text-brand-primary' : 'text-text-primary'}`}>
                                                    {t.label}
                                                </span>
                                            </div>
                                            {theme === t.id && (
                                                <div className="absolute top-4 right-4">
                                                    <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Research Tab */}
                    {activeTab === 'research' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-2xl font-bold text-text-primary mb-2 font-serif">Research Configuration</h3>
                            </div>
                            <div className="p-6 bg-surface-200 rounded-xl border border-white/5">
                                <label className="block text-sm font-medium text-text-primary mb-3">Gemini Model</label>
                                <select
                                    value={researchModel}
                                    onChange={(e) => setResearchModel(e.target.value)}
                                    className="w-full bg-surface-300 border border-white/5 rounded-lg px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                                >
                                    {GEMINI_MODELS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                            {/* ... more research settings ... */}
                        </div>
                    )}

                    {/* Placeholder for others */}
                    {(activeTab === 'news' || activeTab === 'editor' || activeTab === 'advanced') && (
                        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                            <SettingsIcon className="w-12 h-12 mb-4 opacity-50" />
                            <p>Settings for {activeTab} are being updated to the new design system.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
