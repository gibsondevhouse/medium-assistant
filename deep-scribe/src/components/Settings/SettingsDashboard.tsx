import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    RefreshCw,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Key,
    Settings as SettingsIcon,
    Database,
    Sparkles,
    FileText,
    Globe
} from 'lucide-react';
import { ApiKeyInput } from './ApiKeyInput';
import {
    getGeminiKey, setGeminiKey,
    getAnthropicKey, setAnthropicKey,
    getDeepSeekKey, setDeepSeekKey,
    getPerplexityKey, setPerplexityKey,
    getOpenAIKey, setOpenAIKey,
    getOpenRouterKey, setOpenRouterKey,
    getRssUrl, setRssUrl,
    maskKey, clearAllKeys,
    testGeminiKey
} from '../../services/settings-keys';
import { ProviderHero } from './ProviderHero';
import { ProviderDeepDive } from './ProviderDeepDive';

interface SettingsDashboardProps {
    onOpenSettings: () => void; // Unused but kept for interface compatibility if needed
    activeProvider?: string;
    setActiveProvider?: (provider: string) => void;
}

type TabType = 'api' | 'research' | 'news' | 'editor' | 'advanced';

export const SettingsDashboard: React.FC<SettingsDashboardProps> = ({ activeProvider: initialActiveProvider, setActiveProvider: initialSetActiveProvider }) => {
    const [activeTab, setActiveTab] = useState<TabType>('api');
    const [geminiKey, setGeminiKeyDisplay] = useState<string | undefined>();
    const [anthropicKey, setAnthropicKeyDisplay] = useState<string | undefined>();
    const [deepseekKey, setDeepseekKeyDisplay] = useState<string | undefined>();
    const [perplexityKey, setPerplexityKeyDisplay] = useState<string | undefined>();
    const [openaiKey, setOpenAIKeyDisplay] = useState<string | undefined>();
    const [openrouterKey, setOpenRouterKeyDisplay] = useState<string | undefined>();
    const [rssUrl, setRssUrlDisplay] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ key: string; success: boolean; message: string } | null>(null);

    // Local state for active provider if not passed via props
    const [localActiveProvider, setLocalActiveProvider] = useState<string>(initialActiveProvider || localStorage.getItem('activeProvider') || 'gemini');

    const activeProvider = initialActiveProvider || localActiveProvider;
    const setActiveProvider = initialSetActiveProvider || ((p: string) => {
        setLocalActiveProvider(p);
        localStorage.setItem('activeProvider', p);
    });

    // Model Options Map
    const MODEL_OPTIONS: Record<string, { label: string; value: string; group?: string }[]> = {
        gemini: [
            { group: 'Gemini 3 (Preview)', label: 'Gemini 3.0 Pro (Reasoning)', value: 'gemini-3.0-pro-preview' },
            { group: 'Gemini 3 (Preview)', label: 'Gemini 3.0 Flash (Multimodal)', value: 'gemini-3.0-flash-preview' },
            { group: 'Gemini 2.5 (Stable)', label: 'Gemini 2.5 Pro (Powerful)', value: 'gemini-2.5-pro' },
            { group: 'Gemini 2.5 (Stable)', label: 'Gemini 2.5 Flash (Balanced)', value: 'gemini-2.5-flash' },
            { group: 'Gemini 2.5 (Stable)', label: 'Gemini 2.5 Flash-Lite (Fastest)', value: 'gemini-2.5-flash-lite' },
        ],
        anthropic: [
            { label: 'Claude 3.5 Sonnet (Balanced)', value: 'claude-3-5-sonnet-20240620' },
            { label: 'Claude 3 Opus (Powerful)', value: 'claude-3-opus-20240229' },
            { label: 'Claude 3 Haiku (Fast)', value: 'claude-3-haiku-20240307' },
        ],
        deepseek: [
            { label: 'DeepSeek Coder V2', value: 'deepseek-coder' },
            { label: 'DeepSeek Chat V2', value: 'deepseek-chat' },
        ],
        perplexity: [
            { label: 'Llama 3.1 Sonar Large Online', value: 'llama-3.1-sonar-large-128k-online' },
            { label: 'Llama 3.1 Sonar Small Online', value: 'llama-3.1-sonar-small-128k-online' },
        ],
        openai: [
            { label: 'GPT-4o', value: 'gpt-4o' },
            { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        ],
        openrouter: [
            { label: 'Auto (Best Free)', value: 'auto' },
            { label: 'Nous Hermes 2 Mixtral', value: 'nous-hermes-2-mixtral-8x7b-dpo' },
            { label: 'Mistral 7B Instruct', value: 'mistral-7b-instruct' },
        ]
    };

    // Research Settings
    // Default to the first available model of the active provider
    const getDefaultModel = (provider: string) => {
        const models = MODEL_OPTIONS[provider];
        return models ? models[0].value : 'gemini-2.5-flash';
    };

    const [researchModel, setResearchModel] = useState(getDefaultModel(initialActiveProvider || 'gemini'));
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(8192);
    const [parallelResearch, setParallelResearch] = useState(true);

    // Reset research model when provider changes (if the current model isn't valid for the new provider)
    useEffect(() => {
        const availableModels = MODEL_OPTIONS[activeProvider]?.map(m => m.value) || [];
        if (!availableModels.includes(researchModel)) {
            setResearchModel(getDefaultModel(activeProvider));
        }
    }, [activeProvider]);

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
    const [theme, setTheme] = useState('dark');

    const loadKeys = async () => {
        const gKey = await getGeminiKey();
        const aKey = await getAnthropicKey();
        const dKey = await getDeepSeekKey();
        const pKey = await getPerplexityKey();
        const oKey = await getOpenAIKey();
        const orKey = await getOpenRouterKey();
        const rss = await getRssUrl();

        if (gKey) setGeminiKeyDisplay(await maskKey(gKey));
        else setGeminiKeyDisplay(undefined);

        if (aKey) setAnthropicKeyDisplay(await maskKey(aKey));
        else setAnthropicKeyDisplay(undefined);

        if (dKey) setDeepseekKeyDisplay(await maskKey(dKey));
        else setDeepseekKeyDisplay(undefined);

        if (pKey) setPerplexityKeyDisplay(await maskKey(pKey));
        else setPerplexityKeyDisplay(undefined);

        if (oKey) setOpenAIKeyDisplay(await maskKey(oKey));
        else setOpenAIKeyDisplay(undefined);

        if (orKey) setOpenRouterKeyDisplay(await maskKey(orKey));
        else setOpenRouterKeyDisplay(undefined);

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
                    setTheme(parsed.advanced.theme || 'dark');
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



    const handleAnthropicSave = async (key: string) => {
        setLoading(true);
        try {
            await setAnthropicKey(key);
            await loadKeys();
        } finally {
            setLoading(false);
        }
    };

    const handleDeepSeekSave = async (key: string) => {
        setLoading(true);
        try {
            await setDeepSeekKey(key);
            await loadKeys();
        } finally {
            setLoading(false);
        }
    };

    const handlePerplexitySave = async (key: string) => {
        setLoading(true);
        try {
            await setPerplexityKey(key);
            await loadKeys();
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAISave = async (key: string) => {
        setLoading(true);
        try {
            await setOpenAIKey(key);
            await loadKeys();
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRouterSave = async (key: string) => {
        setLoading(true);
        try {
            await setOpenRouterKey(key);
            await loadKeys();
        } finally {
            setLoading(false);
        }
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

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to remove all API keys? You will need to re-enter them.")) return;
        await clearAllKeys();
        await loadKeys();
        setTestResult(null);
    };

    const handleTestKey = async (keyType: 'gemini') => {
        setLoading(true);
        setTestResult(null);
        try {
            const result = await testGeminiKey();
            setTestResult({
                key: keyType,
                success: result,
                message: result ? 'Gemini API connected successfully' : 'Failed to verify Gemini key'
            });
        } catch (e) {
            setTestResult({
                key: keyType,
                success: false,
                message: "Test failed unexpectedly."
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
            advanced: { enableLogging, cacheEnabled, theme }
        }));
        alert("Settings saved!");
    }

    const tabs = [
        { id: 'api' as TabType, label: 'API Keys', icon: Key },
        { id: 'research' as TabType, label: 'Research', icon: Sparkles },
        { id: 'news' as TabType, label: 'News Feed', icon: Globe },
        { id: 'editor' as TabType, label: 'Editor', icon: FileText },
        { id: 'advanced' as TabType, label: 'Advanced', icon: SettingsIcon },
    ];

    return (
        <div className="w-full h-full bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden">

            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 border-r border-[#333] bg-[#161618] flex flex-col">
                <div className="p-8 border-b border-[#333] bg-[#161618]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Settings</h2>
                            <p className="text-xs text-[#8b949e]">Configure Deep Scribe</p>
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
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'text-[#8b949e] hover:text-white hover:bg-[#30363d]/30'
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
            <div className="flex-1 overflow-y-auto bg-[#121212] flex flex-col">
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
                                <h3 className="text-3xl font-bold text-white mb-3 font-serif tracking-tight">API Configuration</h3>
                                <p className="text-gray-400 font-sans text-lg leading-relaxed max-w-2xl">Manage your API keys for external services. Keys are stored securely on your device.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Active Provider Selector & Hero Card */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h4 className="text-xl font-bold text-white font-serif">Active Provider</h4>
                                            <p className="text-sm text-[#8b949e]">Select which AI service to use.</p>
                                        </div>
                                        <select
                                            value={activeProvider}
                                            onChange={(e) => setActiveProvider(e.target.value)}
                                            className="bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow min-w-[200px]"
                                        >
                                            <option value="gemini">Google Gemini</option>
                                            <option value="anthropic">Anthropic Claude</option>
                                            <option value="openai">OpenAI GPT-4</option>
                                            <option value="deepseek">DeepSeek</option>
                                            <option value="perplexity">Perplexity</option>
                                            <option value="openrouter">OpenRouter</option>
                                        </select>
                                    </div>

                                    <ProviderHero
                                        provider={activeProvider}
                                        apiKey={{
                                            gemini: geminiKey,
                                            anthropic: anthropicKey,
                                            deepseek: deepseekKey,
                                            perplexity: perplexityKey,
                                            openai: openaiKey,
                                            openrouter: openrouterKey
                                        }[activeProvider]}
                                        onSave={(key) => {
                                            const handlers = {
                                                gemini: handleGeminiSave,
                                                anthropic: handleAnthropicSave,
                                                deepseek: handleDeepSeekSave,
                                                perplexity: handlePerplexitySave,
                                                openai: handleOpenAISave,
                                                openrouter: handleOpenRouterSave
                                            };
                                            return handlers[activeProvider as keyof typeof handlers](key);
                                        }}
                                        onNavigateToPrompts={() => setActiveTab('research')}
                                        isLoading={loading}
                                    />

                                    <div className="my-12 border-t border-white/10"></div>

                                    <ProviderDeepDive />
                                </div>

                                <div className="pt-6 border-t border-[#30363d]">
                                    <button
                                        onClick={handleClearAll}
                                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-900/10 transition-colors border border-transparent hover:border-red-900/30"
                                    >
                                        <Trash2 className="w-4 h-4" /> Clear All API Keys
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Research Tab */}
                    {activeTab === 'research' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Research Configuration</h3>
                                <p className="text-gray-400">Customize how Deep Scribe conducts research and generates content.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Model Selection */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">AI Model</label>
                                    <select
                                        value={researchModel}
                                        onChange={(e) => setResearchModel(e.target.value)}
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        {MODEL_OPTIONS[activeProvider]?.map((option, index) => {
                                            if (option.group) {
                                                // Simple handling for grouped options if we wanted to group them by array structure, 
                                                // but for now let's just flatten or handle groups simply.
                                                // Retrying logic: The array above has 'group' property. we can filter unique groups.
                                                return (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                );
                                            }
                                            return <option key={option.value} value={option.value}>{option.label}</option>;
                                        }) || <option value="error">No models available for this provider</option>}
                                    </select>
                                    <p className="mt-2 text-xs text-[#8b949e]">
                                        Available models for <strong>{activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)}</strong>.
                                    </p>
                                </div>

                                {/* Temperature */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">
                                        Temperature: <span className="text-blue-400 font-mono">{temperature.toFixed(2)}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={temperature}
                                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-[#30363d] rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-[#8b949e] mt-2 font-medium">
                                        <span>Precise</span>
                                        <span>Creative</span>
                                    </div>
                                    <p className="mt-2 text-xs text-[#8b949e]">Lower values = more focused, higher values = more creative</p>
                                </div>

                                {/* Max Tokens */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">Max Output Tokens</label>
                                    <input
                                        type="number"
                                        min="1024"
                                        max="32768"
                                        step="1024"
                                        value={maxTokens}
                                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    <p className="mt-2 text-xs text-[#8b949e]">Maximum length of generated content (higher = longer, more expensive)</p>
                                </div>

                                {/* Parallel Research */}
                                <div className="flex items-center justify-between p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <div>
                                        <p className="text-base font-medium text-white">Parallel Research</p>
                                        <p className="text-xs text-[#8b949e] mt-1">Research multiple subtopics simultaneously (faster but uses more API calls)</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={parallelResearch}
                                            onChange={(e) => setParallelResearch(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* System Prompt */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-sm font-medium text-white">System Prompt / Personality</label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-xs text-[#8b949e]">Enable Custom Prompt</span>
                                            <div className="relative inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={customSystemPromptEnabled}
                                                    onChange={(e) => setCustomSystemPromptEnabled(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-[#30363d] peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </div>
                                        </label>
                                    </div>
                                    <textarea
                                        value={systemPrompt}
                                        onChange={(e) => setSystemPrompt(e.target.value)}
                                        disabled={!customSystemPromptEnabled}
                                        rows={4}
                                        className={`w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors ${!customSystemPromptEnabled ? 'opacity-50 cursor-not-allowed text-gray-500' : ''}`}
                                        placeholder="You are an expert article writer who explains complex topics simply..."
                                    />
                                    <p className="mt-2 text-xs text-[#8b949e]">Define the AI's persona and writing style.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* News Feed Tab */}
                    {activeTab === 'news' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">News Feed Settings</h3>
                                <p className="text-gray-400">Customize what news articles appear in your feed.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Language */}
                                    <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                        <label className="block text-sm font-medium text-white mb-3">Language</label>
                                        <select
                                            value={newsLanguage}
                                            onChange={(e) => setNewsLanguage(e.target.value)}
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                            <option value="it">Italian</option>
                                            <option value="pt">Portuguese</option>
                                        </select>
                                    </div>

                                    {/* Country */}
                                    <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                        <label className="block text-sm font-medium text-white mb-3">Country</label>
                                        <select
                                            value={newsCountry}
                                            onChange={(e) => setNewsCountry(e.target.value)}
                                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="us">United States</option>
                                            <option value="gb">United Kingdom</option>
                                            <option value="ca">Canada</option>
                                            <option value="au">Australia</option>
                                            <option value="in">India</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Articles per page */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">Articles per Load</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="50"
                                        step="1"
                                        value={newsMaxArticles}
                                        onChange={(e) => setNewsMaxArticles(parseInt(e.target.value))}
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    <p className="mt-2 text-xs text-[#8b949e]">Number of articles to fetch per page (10-50)</p>
                                </div>

                                {/* Categories */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">Default Categories</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {['technology', 'business', 'science', 'health', 'entertainment', 'sports'].map((cat) => (
                                            <label key={cat} className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d] cursor-pointer hover:border-blue-500/30 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={newsCategories.includes(cat)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewsCategories([...newsCategories, cat]);
                                                        } else {
                                                            setNewsCategories(newsCategories.filter(c => c !== cat));
                                                        }
                                                    }}
                                                    className="rounded border-[#30363d] text-blue-600 focus:ring-2 focus:ring-blue-500/50 w-4 h-4"
                                                />
                                                <span className="text-sm text-white capitalize">{cat}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* RSS Feed URL */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <div className="flex items-center gap-2 mb-3">
                                        <h4 className="text-sm font-medium text-white">RSS Feed URL</h4>
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Primary Feed</span>
                                    </div>
                                    <ApiKeyInput
                                        label="Feed Configuration"
                                        placeholder="https://medium.com/feed/tag/technology"
                                        currentValue={rssUrl}
                                        getKeyUrl="https://medium.com"
                                        onSave={handleRssSave}
                                        isLoading={loading}
                                    />
                                    <p className="mt-2 text-xs text-[#8b949e]">The primary RSS feed loaded on application start.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Editor Tab */}
                    {activeTab === 'editor' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Editor Preferences</h3>
                                <p className="text-gray-400">Configure your writing and editing experience.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Auto-save interval */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">Auto-save Interval (seconds)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="300"
                                        step="10"
                                        value={autoSaveInterval}
                                        onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    <p className="mt-2 text-xs text-[#8b949e]">How often to automatically save your work (10-300 seconds)</p>
                                </div>

                                {/* Default export format */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">Default Export Format</label>
                                    <select
                                        value={defaultExportFormat}
                                        onChange={(e) => setDefaultExportFormat(e.target.value)}
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="markdown">Markdown (.md)</option>
                                        <option value="html">HTML (.html)</option>
                                        <option value="pdf">PDF (.pdf)</option>
                                        <option value="medium">Medium Draft</option>
                                    </select>
                                </div>

                                {/* Spell check */}
                                <div className="flex items-center justify-between p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <div>
                                        <p className="text-base font-medium text-white">Spell Check</p>
                                        <p className="text-xs text-[#8b949e] mt-1">Enable real-time spell checking while writing</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enableSpellCheck}
                                            onChange={(e) => setEnableSpellCheck(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Advanced Tab */}
                    {activeTab === 'advanced' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Advanced Settings</h3>
                                <p className="text-gray-400">Developer and power user options.</p>
                            </div>

                            <div className="space-y-6">
                                {/* Logging */}
                                <div className="flex items-center justify-between p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <div>
                                        <p className="text-base font-medium text-white">Debug Logging</p>
                                        <p className="text-xs text-[#8b949e] mt-1">Write detailed logs to help troubleshoot issues</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={enableLogging}
                                            onChange={(e) => setEnableLogging(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Cache */}
                                <div className="flex items-center justify-between p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <div>
                                        <p className="text-base font-medium text-white">Enable Cache</p>
                                        <p className="text-xs text-[#8b949e] mt-1">Cache API responses to reduce costs and improve speed</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={cacheEnabled}
                                            onChange={(e) => setCacheEnabled(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#30363d] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Theme (Future) */}
                                <div className="p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
                                    <label className="block text-sm font-medium text-white mb-3">Theme</label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        disabled
                                        className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 opacity-50 cursor-not-allowed"
                                    >
                                        <option value="dark">Dark (Default)</option>
                                        <option value="light">Light (Coming Soon)</option>
                                    </select>
                                    <p className="mt-2 text-xs text-[#8b949e]">Theme customization coming in a future update</p>
                                </div>

                                {/* Clear Cache */}
                                <div className="pt-6 border-t border-[#30363d]">
                                    <button
                                        onClick={() => alert('Cache cleared successfully!')}
                                        className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-yellow-900/10 transition-colors border border-transparent hover:border-yellow-900/30"
                                    >
                                        <Database className="w-4 h-4" /> Clear Cache
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Save Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={saveSettings}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    Save Changes
                </button>
            </div>
        </div >
    );
};
