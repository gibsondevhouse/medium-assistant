
import { useState } from 'react';
import { useResearchStore } from '../../store/researchStore';
import { generateTopicMap } from '../../services/gemini';
import { ArrowRight, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function TopicInput({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const [localQuery, setLocalQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setQuery, setNodes, setEdges, setStatus, setError } = useResearchStore();

    const handleStart = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localQuery.trim()) return;

        setIsLoading(true);
        setStatus('surveying');
        setError(null);

        try {
            // Fetch key from secure storage just before using it
            const hasKey = await window.electronAPI.settings.hasGeminiKey();

            if (!hasKey) {
                setIsLoading(false);
                setStatus('idle');
                onOpenSettings?.();
                return;
            }

            setQuery(localQuery);

            const { nodes, edges } = await generateTopicMap(localQuery);
            setNodes(nodes);
            setEdges(edges);
            setStatus('reviewing_plan');
        } catch (err: any) {
            setError(err.message || "Failed to generate topic map.");
            setStatus('error');
            setIsLoading(false); // Reset loading on error
        } // No finally here because if success, we changed status to 'reviewing_plan' (component unmounts/switches)
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-6 tracking-tight">
                What do you want to learn?
            </h1>
            <p className="text-gray-400 mb-10 max-w-lg text-lg leading-relaxed">
                Deep Scribe will analyze your topic, break it down into key areas, and conduct parallel research to build a comprehensive report.
            </p>

            <form onSubmit={handleStart} className="relative w-full max-w-2xl group">
                <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    placeholder="e.g., The Impact of WebAssembly on Cloud Computing..."
                    className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-6 py-5 pr-16 text-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all shadow-2xl"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !localQuery.trim()}
                    className="absolute right-3 top-3 bottom-3 aspect-square flex items-center justify-center bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
            </form>

            <div className="mt-8 flex gap-4 text-sm text-gray-500">
                <span>Try:</span>
                {['Quantum Computing', 'Brutalist Web Design', 'History of Coffee'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setLocalQuery(s)}
                        className="hover:text-white transition-colors underline decoration-dotted underline-offset-4"
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="mt-12">
                <button
                    onClick={onOpenSettings}
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1 mx-auto"
                >
                    <span>Configure API Keys</span>
                </button>
            </div>
        </div>
    );
}
