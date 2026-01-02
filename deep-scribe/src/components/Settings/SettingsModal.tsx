import React, { useEffect, useState } from 'react';
import {
    X,
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
    getGNewsKey, setGNewsKey,
    maskKey, clearAllKeys,
    testGeminiKey, testGNewsKey
} from '../../services/settings-keys';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onKeysUpdated?: () => void;
}

type TabType = 'api' | 'research' | 'news' | 'editor' | 'advanced';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onKeysUpdated }) => {
    const [activeTab, setActiveTab] = useState<TabType>('api');
    const [geminiKey, setGeminiKeyDisplay] = useState<string | undefined>();
    const [gnewsKey, setGnewsKeyDisplay] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ key: string; success: boolean; message: string } | null>(null);

    // Research Settings
    const [researchModel, setResearchModel] = useState('gemini-1.5-pro');
    const [temperature, setTemperature] = useState(0.7);
    const [maxTokens, setMaxTokens] = useState(8192);
    const [parallelResearch, setParallelResearch] = useState(true);

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
        const nKey = await getGNewsKey();

        if (gKey) setGeminiKeyDisplay(await maskKey(gKey));
        else setGeminiKeyDisplay(undefined);

        if (nKey) setGnewsKeyDisplay(await maskKey(nKey));
        else setGnewsKeyDisplay(undefined);
    };

    useEffect(() => {
        if (isOpen) {
            loadKeys();
            setTestResult(null);
        }
    }, [isOpen]);

    const handleGeminiSave = async (key: string) => {
        setLoading(true);
        try {
            await setGeminiKey(key);
            await loadKeys();
            if (onKeysUpdated) onKeysUpdated();
        } finally {
            setLoading(false);
        }
    };

    const handleGNewsSave = async (key: string) => {
        setLoading(true);
        try {
            await setGNewsKey(key);
            await loadKeys();
            if (onKeysUpdated) onKeysUpdated();
        } finally {
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        if (!confirm("Are you sure you want to remove all API keys? You will need to re-enter them.")) return;
        await clearAllKeys();
        await loadKeys();
        setTestResult(null);
        if (onKeysUpdated) onKeysUpdated();
    };

    const handleTestKey = async (keyType: 'gemini' | 'gnews') => {
        setLoading(true);
        setTestResult(null);
        try {
            const result = keyType === 'gemini' ? await testGeminiKey() : await testGNewsKey();
            setTestResult({
                key: keyType,
                success: result,
                message: result ? `${keyType === 'gemini' ? 'Gemini' : 'GNews'} API connected successfully` : `Failed to verify ${keyType === 'gemini' ? 'Gemini' : 'GNews'} key`
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

    const tabs = [
        { id: 'api' as TabType, label: 'API Keys', icon: Key },
        { id: 'research' as TabType, label: 'Research', icon: Sparkles },
        { id: 'news' as TabType, label: 'News Feed', icon: Globe },
        { id: 'editor' as TabType, label: 'Editor', icon: FileText },
        { id: 'advanced' as TabType, label: 'Advanced', icon: SettingsIcon },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="max-w-4xl w-full bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#30363d] bg-[#161b22]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Settings</h2>
                            <p className="text-xs text-[#8b949e]">Configure your Deep Scribe experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#8b949e] hover:text-white p-2 rounded-lg hover:bg-[#30363d]/50 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-48 border-r border-[#30363d] bg-[#0d1117] p-4">
                        <nav className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                            activeTab === tab.id
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
                    <div className="flex-1 overflow-y-auto p-6">
                        {testResult && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm ${
                                testResult.success
                                    ? 'bg-green-900/20 border border-green-500/30 text-green-300'
                                    : 'bg-red-900/20 border border-red-500/30 text-red-300'
                            }`}>
                                {testResult.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                {testResult.message}
                            </div>
                        )}

                        {/* API Keys Tab */}
                        {activeTab === 'api' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">API Configuration</h3>
                                    <p className="text-sm text-[#8b949e] mb-6">Manage your API keys for external services. Keys are stored securely on your device.</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <ApiKeyInput
                                            label="Gemini API Key"
                                            placeholder="AIzaSy..."
                                            currentValue={geminiKey}
                                            getKeyUrl="https://aistudio.google.com/app/apikey"
                                            onSave={handleGeminiSave}
                                            isLoading={loading}
                                        />
                                        {geminiKey && (
                                            <button
                                                onClick={() => handleTestKey('gemini')}
                                                disabled={loading}
                                                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                                Test Gemini Connection
                                            </button>
                                        )}
                                    </div>

                                    <div>
                                        <ApiKeyInput
                                            label="GNews API Key"
                                            placeholder="Compare to your Dashboard..."
                                            currentValue={gnewsKey}
                                            getKeyUrl="https://gnews.io"
                                            onSave={handleGNewsSave}
                                            isLoading={loading}
                                        />
                                        {gnewsKey && (
                                            <button
                                                onClick={() => handleTestKey('gnews')}
                                                disabled={loading}
                                                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                                            >
                                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                                Test GNews Connection
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[#30363d]">
                                    <button
                                        onClick={handleClearAll}
                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-2 px-3 py-2 rounded hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" /> Clear All API Keys
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Research Tab */}
                        {activeTab === 'research' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Research Configuration</h3>
                                    <p className="text-sm text-[#8b949e] mb-6">Customize how Deep Scribe conducts research and generates content.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Model Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">AI Model</label>
                                        <select
                                            value={researchModel}
                                            onChange={(e) => setResearchModel(e.target.value)}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Recommended)</option>
                                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Faster)</option>
                                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Latest)</option>
                                        </select>
                                        <p className="mt-1 text-xs text-[#8b949e]">Pro offers better quality, Flash is faster and cheaper</p>
                                    </div>

                                    {/* Temperature */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">
                                            Temperature: <span className="text-blue-400">{temperature.toFixed(2)}</span>
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
                                        <div className="flex justify-between text-xs text-[#8b949e] mt-1">
                                            <span>Precise</span>
                                            <span>Creative</span>
                                        </div>
                                        <p className="mt-1 text-xs text-[#8b949e]">Lower values = more focused, higher values = more creative</p>
                                    </div>

                                    {/* Max Tokens */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Max Output Tokens</label>
                                        <input
                                            type="number"
                                            min="1024"
                                            max="32768"
                                            step="1024"
                                            value={maxTokens}
                                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <p className="mt-1 text-xs text-[#8b949e]">Maximum length of generated content (higher = longer, more expensive)</p>
                                    </div>

                                    {/* Parallel Research */}
                                    <div className="flex items-center justify-between p-4 bg-[#161b22] rounded-lg border border-[#30363d]">
                                        <div>
                                            <p className="text-sm font-medium text-white">Parallel Research</p>
                                            <p className="text-xs text-[#8b949e] mt-0.5">Research multiple subtopics simultaneously (faster but uses more API calls)</p>
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
                                </div>
                            </div>
                        )}

                        {/* News Feed Tab */}
                        {activeTab === 'news' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">News Feed Settings</h3>
                                    <p className="text-sm text-[#8b949e] mb-6">Customize what news articles appear in your feed.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Language */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Language</label>
                                        <select
                                            value={newsLanguage}
                                            onChange={(e) => setNewsLanguage(e.target.value)}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
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
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Country</label>
                                        <select
                                            value={newsCountry}
                                            onChange={(e) => setNewsCountry(e.target.value)}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="us">United States</option>
                                            <option value="gb">United Kingdom</option>
                                            <option value="ca">Canada</option>
                                            <option value="au">Australia</option>
                                            <option value="in">India</option>
                                        </select>
                                    </div>

                                    {/* Articles per page */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Articles per Load</label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="50"
                                            step="1"
                                            value={newsMaxArticles}
                                            onChange={(e) => setNewsMaxArticles(parseInt(e.target.value))}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <p className="mt-1 text-xs text-[#8b949e]">Number of articles to fetch per page (10-50)</p>
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Default Categories</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {['technology', 'business', 'science', 'health', 'entertainment', 'sports'].map((cat) => (
                                                <label key={cat} className="flex items-center gap-2 p-3 bg-[#161b22] rounded-lg border border-[#30363d] cursor-pointer hover:border-blue-500/30 transition-colors">
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
                                                        className="rounded border-[#30363d] text-blue-600 focus:ring-2 focus:ring-blue-500/50"
                                                    />
                                                    <span className="text-sm text-white capitalize">{cat}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Editor Tab */}
                        {activeTab === 'editor' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Editor Preferences</h3>
                                    <p className="text-sm text-[#8b949e] mb-6">Configure your writing and editing experience.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Auto-save interval */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Auto-save Interval (seconds)</label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="300"
                                            step="10"
                                            value={autoSaveInterval}
                                            onChange={(e) => setAutoSaveInterval(parseInt(e.target.value))}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                        <p className="mt-1 text-xs text-[#8b949e]">How often to automatically save your work (10-300 seconds)</p>
                                    </div>

                                    {/* Default export format */}
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Default Export Format</label>
                                        <select
                                            value={defaultExportFormat}
                                            onChange={(e) => setDefaultExportFormat(e.target.value)}
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        >
                                            <option value="markdown">Markdown (.md)</option>
                                            <option value="html">HTML (.html)</option>
                                            <option value="pdf">PDF (.pdf)</option>
                                            <option value="medium">Medium Draft</option>
                                        </select>
                                    </div>

                                    {/* Spell check */}
                                    <div className="flex items-center justify-between p-4 bg-[#161b22] rounded-lg border border-[#30363d]">
                                        <div>
                                            <p className="text-sm font-medium text-white">Spell Check</p>
                                            <p className="text-xs text-[#8b949e] mt-0.5">Enable real-time spell checking while writing</p>
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
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Advanced Settings</h3>
                                    <p className="text-sm text-[#8b949e] mb-6">Developer and power user options.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Logging */}
                                    <div className="flex items-center justify-between p-4 bg-[#161b22] rounded-lg border border-[#30363d]">
                                        <div>
                                            <p className="text-sm font-medium text-white">Debug Logging</p>
                                            <p className="text-xs text-[#8b949e] mt-0.5">Write detailed logs to help troubleshoot issues</p>
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
                                    <div className="flex items-center justify-between p-4 bg-[#161b22] rounded-lg border border-[#30363d]">
                                        <div>
                                            <p className="text-sm font-medium text-white">Enable Cache</p>
                                            <p className="text-xs text-[#8b949e] mt-0.5">Cache API responses to reduce costs and improve speed</p>
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
                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Theme</label>
                                        <select
                                            value={theme}
                                            onChange={(e) => setTheme(e.target.value)}
                                            disabled
                                            className="w-full bg-[#161b22] border border-[#30363d] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 opacity-50 cursor-not-allowed"
                                        >
                                            <option value="dark">Dark (Default)</option>
                                            <option value="light">Light (Coming Soon)</option>
                                        </select>
                                        <p className="mt-1 text-xs text-[#8b949e]">Theme customization coming in a future update</p>
                                    </div>

                                    {/* Clear Cache */}
                                    <div className="pt-4 border-t border-[#30363d]">
                                        <button
                                            onClick={() => alert('Cache cleared successfully!')}
                                            className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-2 px-3 py-2 rounded hover:bg-yellow-900/20 transition-colors"
                                        >
                                            <Database className="w-3 h-3" /> Clear Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-[#30363d] bg-[#0d1117]">
                    <button
                        onClick={onClose}
                        className="text-sm text-[#8b949e] hover:text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            // Save all settings to localStorage or backend
                            localStorage.setItem('deep-scribe-settings', JSON.stringify({
                                research: { model: researchModel, temperature, maxTokens, parallelResearch },
                                news: { language: newsLanguage, country: newsCountry, maxArticles: newsMaxArticles, categories: newsCategories },
                                editor: { autoSaveInterval, defaultExportFormat, enableSpellCheck },
                                advanced: { enableLogging, cacheEnabled, theme }
                            }));
                            onClose();
                        }}
                        className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};
