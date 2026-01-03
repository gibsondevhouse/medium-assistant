import { useResearchStore } from '../../store/researchStore';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export function SourceReview() {
    const { status, query, sources, hypotheses, toggleHypothesis, setStatus } = useResearchStore();

    // Mock triggering the next phase
    const handleStartResearch = async () => {
        const selected = hypotheses.filter(h => h.selected);
        if (selected.length === 0) return;

        setStatus('research_running');
        try {
            // In real impl, we'd await window.electronAPI.research.researchRun(selected)
            await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
            setStatus('outlines_review');
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    if (status === 'source_running') {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <div className="text-xl font-medium">Scanning Sources & Generating Hypotheses...</div>
                <div className="text-gray-400">Analyzing context for "{query}"</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full p-6 space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Source Analysis</h2>
                    <p className="text-gray-400">Review findings and select hypotheses to verify.</p>
                </div>
                <button
                    onClick={handleStartResearch}
                    disabled={!hypotheses.some(h => h.selected)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                    Start Research Run <ArrowRight className="w-4 h-4" />
                </button>
            </header>

            <div className="grid grid-cols-[300px_1fr] gap-6 flex-1 min-h-0">
                {/* Left: Sources */}
                <div className="bg-[#161b22] rounded-xl border border-[#30363d] overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#30363d] bg-[#0d1117]">
                        <h3 className="font-semibold text-gray-200">Key Context</h3>
                    </div>
                    <div className="p-4 space-y-4 overflow-y-auto">
                        {sources.map(source => (
                            <div key={source.id} className="text-sm space-y-1">
                                <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-blue-400 hover:underline block truncate">
                                    {source.title}
                                </a>
                                <p className="text-gray-400 text-xs leading-relaxed">{source.summary}</p>
                            </div>
                        ))}
                        {sources.length === 0 && <span className="text-gray-500 italic">No sources found yet.</span>}
                    </div>
                </div>

                {/* Right: Hypotheses */}
                <div className="space-y-4 overflow-y-auto pr-2">
                    {hypotheses.map(hypothesis => (
                        <div
                            key={hypothesis.id}
                            onClick={() => toggleHypothesis(hypothesis.id)}
                            className={clsx(
                                "p-5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]",
                                hypothesis.selected
                                    ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                    : "bg-[#161b22] border-[#30363d] hover:border-gray-500"
                            )}
                        >
                            <div className="flex items-start gap-3">
                                <div className={clsx(
                                    "w-5 h-5 rounded border flex items-center justify-center mt-1 flex-shrink-0 transition-colors",
                                    hypothesis.selected ? "bg-blue-500 border-blue-500" : "border-gray-600"
                                )}>
                                    {hypothesis.selected && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-medium leading-tight text-gray-100">{hypothesis.text}</h4>
                                    <p className="text-sm text-gray-400">{hypothesis.rationale}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
