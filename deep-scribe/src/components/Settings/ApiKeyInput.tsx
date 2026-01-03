import React, { useState } from 'react';
import { Loader2, Check, X, ExternalLink, Save } from 'lucide-react';

interface ApiKeyInputProps {
    label: string;
    placeholder: string;
    currentValue?: string;
    getKeyUrl: string;
    onSave: (key: string) => Promise<void>;
    isLoading?: boolean;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
    label,
    placeholder,
    currentValue,
    getKeyUrl,
    onSave,
    isLoading = false
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(!currentValue);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!inputValue.trim()) {
            setError("Key cannot be empty");
            return;
        }
        setError(null);
        try {
            await onSave(inputValue.trim());
            setIsEditing(false);
            setInputValue('');
        } catch (e: any) {
            setError(e.message);
        }
    };

    const startEditing = () => {
        setIsEditing(true);
        setInputValue('');
        setError(null);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setError(null);
    };

    return (
        <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
            <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-300">{label}</label>
                <button
                    onClick={() => window.electronAPI.openExternal(getKeyUrl)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                    Get Key <ExternalLink className="w-3 h-3" />
                </button>
            </div>

            {isEditing ? (
                <div className="space-y-2">
                    <input
                        type="password"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded p-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none transition-all placeholder:text-zinc-600"
                        autoFocus
                    />

                    {error && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                            <X className="w-3 h-3" /> {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        {currentValue && (
                            <button
                                onClick={cancelEditing}
                                disabled={isLoading}
                                className="text-xs px-3 py-1.5 text-zinc-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isLoading || !inputValue.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded text-xs font-medium text-white transition-colors"
                        >
                            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between bg-zinc-900/50 p-2.5 rounded border border-zinc-800">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                        <code className="text-sm text-zinc-400 font-mono tracking-wider">{currentValue}</code>
                    </div>
                    <button
                        onClick={startEditing}
                        className="text-xs text-zinc-500 hover:text-white underline decoration-zinc-700 hover:decoration-white transition-all"
                    >
                        Change
                    </button>
                </div>
            )}
        </div>
    );
};
