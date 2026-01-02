import React, { useEffect, useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { bothKeysSet } from '../../services/settings-keys';
import { ArrowRight, Shield } from 'lucide-react';

export function KeySetupOverlay() {
    const [needsSetup, setNeedsSetup] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const checkKeys = async () => {
        const complete = await bothKeysSet();
        setNeedsSetup(!complete);
        if (complete) setShowSettings(false);
    };

    useEffect(() => {
        checkKeys();
    }, []);

    if (!needsSetup) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-[#0d1117] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-8 animate-in bg-gradient-to-b from-blue-500/5 to-transparent p-10 rounded-3xl border border-white/5">
                    <div className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-blue-500/20">
                        <Shield className="w-12 h-12 text-blue-500" />
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Welcome to Deep Scribe</h1>
                        <p className="text-[#8b949e] text-lg leading-relaxed">
                            To ensure your privacy, Deep Scribe runs locally using your own API keys. No data is sent to our servers.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-full py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-xl shadow-white/5"
                    >
                        Connect API Keys <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-xs text-[#8b949e]">
                        Configuration is stored securely on your device.
                    </p>
                </div>
            </div>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => {
                    // Only allow close if setup is done, or if user cancels (but then overlay remains)
                    checkKeys();
                    setShowSettings(false);
                }}
                onKeysUpdated={() => {
                    checkKeys();
                }}
            />
        </>
    );
}
