import React, { useState } from 'react';
import { Clipboard, CheckCircle2, Zap, Key, Settings as SettingsIcon, RefreshCw } from 'lucide-react';

interface ProviderHeroProps {
    apiKey: string | undefined;
    onSave: (key: string) => Promise<void>;
    onNavigateToPrompts: () => void;
    isLoading: boolean;
}

export const ProviderHero: React.FC<ProviderHeroProps> = ({ apiKey, onSave, onNavigateToPrompts, isLoading }) => {
    const [tempKey, setTempKey] = useState('');
    const [isPasting, setIsPasting] = useState(false);
    const [showInput, setShowInput] = useState(false);

    const handlePaste = async () => {
        setIsPasting(true);
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                setTempKey(text);
                setShowInput(true);
            }
        } catch (err) {
            console.error('Failed to read clipboard', err);
            setShowInput(true);
        } finally {
            setIsPasting(false);
        }
    };

    const handleSave = async () => {
        if (!tempKey) return;
        await onSave(tempKey);
        setTempKey('');
        setShowInput(false);
    };

    const isConfigured = !!apiKey;

    return (
        <div className="w-full relative overflow-hidden rounded-2xl bg-[#161b22] border border-[#30363d] p-8 transition-all hover:border-[#58a6ff]/30 group">

            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                    {/* Provider Info */}
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-xl bg-blue-900/20 flex items-center justify-center border border-blue-500/20">
                            <Zap className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-white font-serif">Google Gemini</h2>
                                {isConfigured && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Connected
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm max-w-sm">Deep Scribe's exclusive AI engine for research and writing.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">

                        {!showInput && (
                            <>
                                {/* Paste Button */}
                                <button
                                    onClick={handlePaste}
                                    disabled={isLoading || isPasting}
                                    className="w-full sm:w-auto group/btn relative overflow-hidden px-6 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                >
                                    <Clipboard className="w-4 h-4" />
                                    {isConfigured ? 'Update Key' : 'Paste API Key'}
                                    {isPasting && <span className="absolute inset-0 bg-white/50 animate-pulse" />}
                                </button>

                                {/* Prompts Button */}
                                {isConfigured && (
                                    <button
                                        onClick={onNavigateToPrompts}
                                        className="w-full sm:w-auto px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium transition-all border border-[#30363d] hover:border-gray-500 flex items-center justify-center gap-2"
                                    >
                                        <SettingsIcon className="w-4 h-4 text-gray-400" />
                                        System Prompt
                                    </button>
                                )}
                            </>
                        )}

                        {/* Input Mode */}
                        {showInput && (
                            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 animate-in fade-in slide-in-from-right-4">
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        value={tempKey}
                                        onChange={(e) => setTempKey(e.target.value)}
                                        placeholder="AIza..."
                                        className="w-full sm:w-64 pl-9 pr-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-gray-600"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={!tempKey || isLoading}
                                        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowInput(false)}
                                        className="px-4 py-3 bg-[#21262d] hover:bg-[#30363d] text-gray-400 hover:text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Helper Text for unconfigured */}
                {!isConfigured && !showInput && (
                    <div className="mt-6 pt-6 border-t border-[#30363d] flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                        Your API key is stored locally on this device and never shared. Get your key at{' '}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            Google AI Studio
                        </a>.
                    </div>
                )}
            </div>
        </div>
    );
};
