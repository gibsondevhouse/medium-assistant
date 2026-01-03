import { useResearchStore } from '../../store/researchStore';
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';

export function SourcesPanel() {
    const { nodes, query } = useResearchStore();

    // Filter out the root node to get only subtopic nodes
    const subtopicNodes = nodes.filter(n => n.id !== 'root');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'done':
                return <CheckCircle2 className="w-5 h-5 text-green-400" />;
            case 'loading':
                return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-400" />;
            default:
                return <Clock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'done':
                return 'Complete';
            case 'loading':
                return 'Researching...';
            case 'error':
                return 'Failed';
            default:
                return 'Pending';
        }
    };

    return (
        <div className="h-full overflow-y-auto p-8 animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 font-serif tracking-tight">Research Findings</h2>
                    <p className="text-gray-400">
                        {query ? `Subtopics for "${query}"` : 'No research in progress'}
                    </p>
                </div>

                {/* No findings state */}
                {subtopicNodes.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-300 mb-2">No findings yet</h3>
                        <p className="text-gray-500">Start a research session from the Topic Map tab.</p>
                    </div>
                )}

                {/* Findings Grid */}
                <div className="space-y-4">
                    {subtopicNodes.map((node) => (
                        <div
                            key={node.id}
                            className={`p-6 rounded-xl border transition-all ${
                                node.data.status === 'done'
                                    ? 'bg-[#161b22] border-[#30363d]'
                                    : node.data.status === 'loading'
                                    ? 'bg-blue-900/10 border-blue-500/20'
                                    : node.data.status === 'error'
                                    ? 'bg-red-900/10 border-red-500/20'
                                    : 'bg-[#0d1117] border-[#30363d]/50'
                            }`}
                        >
                            {/* Topic Header */}
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <h3 className="text-lg font-semibold text-white">{node.data.label}</h3>
                                <div className="flex items-center gap-2 shrink-0">
                                    {getStatusIcon(node.data.status)}
                                    <span className={`text-xs font-medium ${
                                        node.data.status === 'done' ? 'text-green-400' :
                                        node.data.status === 'loading' ? 'text-blue-400' :
                                        node.data.status === 'error' ? 'text-red-400' :
                                        'text-gray-500'
                                    }`}>
                                        {getStatusLabel(node.data.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Findings Content */}
                            {node.data.findings ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    {node.data.findings.split('\n').map((line, i) => {
                                        if (line.startsWith('## ')) {
                                            return <h4 key={i} className="text-base font-semibold text-gray-200 mt-4 mb-2">{line.replace('## ', '')}</h4>;
                                        }
                                        if (line.startsWith('- ')) {
                                            return <li key={i} className="text-gray-400 text-sm ml-4">{line.replace('- ', '')}</li>;
                                        }
                                        if (line.trim() === '') {
                                            return null;
                                        }
                                        return <p key={i} className="text-gray-400 text-sm leading-relaxed mb-2">{line}</p>;
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm italic">
                                    {node.data.status === 'loading'
                                        ? 'Gathering information...'
                                        : node.data.status === 'error'
                                        ? 'Failed to retrieve findings'
                                        : 'Waiting to start research'}
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                {subtopicNodes.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-[#30363d] flex items-center justify-center gap-8 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-gray-400">
                                {subtopicNodes.filter(n => n.data.status === 'done').length} complete
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-blue-400" />
                            <span className="text-gray-400">
                                {subtopicNodes.filter(n => n.data.status === 'loading').length} in progress
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-400">
                                {subtopicNodes.filter(n => n.data.status === 'pending').length} pending
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
