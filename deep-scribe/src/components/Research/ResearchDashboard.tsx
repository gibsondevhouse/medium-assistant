import { useState, useEffect } from 'react';
import { GitBranch, FileSearch, FileText, Sparkles, Play, Loader2, Download, RotateCcw, Database, CheckCircle2 } from 'lucide-react';
import { useResearchStore } from '../../store/researchStore';
import { useDraftStore } from '../../store/draftStore';
import { useKnowledgeBaseStore } from '../../store/knowledgeBaseStore';
import { TopicPanel } from './TopicPanel';
import { SourcesPanel } from './SourcesPanel';
import { ReportPanel } from './ReportPanel';

type TabType = 'topic' | 'sources' | 'report';

interface ResearchDashboardProps {
    onOpenSettings?: () => void;
}

export function ResearchDashboard({ onOpenSettings }: ResearchDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabType>('topic');
    const [isSavingToKB, setIsSavingToKB] = useState(false);
    const [savedToKB, setSavedToKB] = useState(false);
    const { status, nodes, finalReport, query, reset, setStatus } = useResearchStore();
    const { createNewDraft } = useDraftStore();
    const { addReportToKB, totalDocuments, loadStats } = useKnowledgeBaseStore();

    // Load KB stats on mount
    useEffect(() => {
        loadStats();
    }, []);

    // Define tabs with enabled state based on research status
    const tabs = [
        {
            id: 'topic' as TabType,
            label: 'Topic Map',
            icon: GitBranch,
            enabled: true,
        },
        {
            id: 'sources' as TabType,
            label: 'Sources',
            icon: FileSearch,
            enabled: status !== 'idle' && status !== 'surveying',
        },
        {
            id: 'report' as TabType,
            label: 'Report',
            icon: FileText,
            enabled: status === 'complete',
        },
    ];

    // Auto-switch to appropriate tab based on status changes
    useEffect(() => {
        if (status === 'complete' && finalReport) {
            setActiveTab('report');
        } else if (status === 'researching' || status === 'synthesizing') {
            // Keep on current tab or switch to sources if available
            if (activeTab === 'report') {
                setActiveTab('sources');
            }
        } else if (status === 'idle') {
            setActiveTab('topic');
        }
    }, [status, finalReport]);

    // Get status display info
    const getStatusInfo = () => {
        switch (status) {
            case 'idle':
                return { label: 'Ready', color: 'text-gray-400', bg: 'bg-gray-500/10' };
            case 'surveying':
                return { label: 'Surveying...', color: 'text-blue-400', bg: 'bg-blue-500/10' };
            case 'reviewing_plan':
                return { label: 'Plan Ready', color: 'text-green-400', bg: 'bg-green-500/10' };
            case 'researching':
                return { label: 'Researching...', color: 'text-blue-400', bg: 'bg-blue-500/10' };
            case 'synthesizing':
                return { label: 'Writing...', color: 'text-purple-400', bg: 'bg-purple-500/10' };
            case 'complete':
                return { label: 'Complete', color: 'text-green-400', bg: 'bg-green-500/10' };
            case 'error':
                return { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10' };
            default:
                return { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10' };
        }
    };

    const statusInfo = getStatusInfo();

    // Reset saved state when starting new research
    useEffect(() => {
        if (status === 'idle') {
            setSavedToKB(false);
        }
    }, [status]);

    // Handle export to draft
    const handleExport = async () => {
        if (!finalReport) return;

        const htmlContent = finalReport
            .split('\n\n')
            .map(p => {
                if (p.startsWith('# ')) return `<h1>${p.replace('# ', '')}</h1>`;
                if (p.startsWith('## ')) return `<h2>${p.replace('## ', '')}</h2>`;
                if (p.startsWith('- ')) return `<ul><li>${p.replace('- ', '')}</li></ul>`;
                return `<p>${p}</p>`;
            })
            .join('');

        await createNewDraft(query, htmlContent, ['research', 'ai-generated']);
    };

    // Handle save to knowledge base
    const handleSaveToKB = async () => {
        if (!finalReport || !query) return;

        setIsSavingToKB(true);
        try {
            const researchId = `research-${Date.now()}`;
            const success = await addReportToKB(query, finalReport, researchId);
            if (success) {
                setSavedToKB(true);
                await loadStats();
            }
        } finally {
            setIsSavingToKB(false);
        }
    };

    return (
        <div className="w-full h-full bg-[#0a0a0a] flex flex-col md:flex-row overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-r border-[#333] bg-[#161618] flex flex-col shrink-0">
                {/* Header */}
                <div className="p-6 border-b border-[#333] bg-[#161618]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                            <Sparkles className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Research</h2>
                            <p className="text-xs text-[#8b949e]">Deep topic analysis</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => tab.enabled && setActiveTab(tab.id)}
                                disabled={!tab.enabled}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                                    !tab.enabled
                                        ? 'opacity-50 cursor-not-allowed text-[#8b949e]'
                                        : activeTab === tab.id
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

                {/* Status Indicator */}
                <div className="p-4 border-t border-[#333]">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${statusInfo.bg}`}>
                        {(status === 'surveying' || status === 'researching' || status === 'synthesizing') && (
                            <Loader2 className={`w-3 h-3 animate-spin ${statusInfo.color}`} />
                        )}
                        <span className={`text-xs font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                </div>

                {/* New Research Button */}
                {status !== 'idle' && (
                    <div className="p-4 pt-0">
                        <button
                            onClick={reset}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#8b949e] hover:text-white hover:bg-[#30363d]/30 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            New Research
                        </button>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-[#121212] flex flex-col">
                <div className="flex-1 overflow-hidden">
                    {activeTab === 'topic' && <TopicPanel onOpenSettings={onOpenSettings} />}
                    {activeTab === 'sources' && <SourcesPanel />}
                    {activeTab === 'report' && <ReportPanel />}
                </div>
            </div>

            {/* Floating Action Bar */}
            {status === 'complete' && activeTab === 'report' && (
                <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3">
                    {/* Save to Knowledge Base Button */}
                    <button
                        onClick={handleSaveToKB}
                        disabled={isSavingToKB || savedToKB}
                        className={`px-5 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 transform hover:-translate-y-1 ${
                            savedToKB
                                ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default'
                                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20 hover:shadow-purple-500/40'
                        }`}
                    >
                        {isSavingToKB ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : savedToKB ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <Database className="w-5 h-5" />
                        )}
                        {savedToKB ? 'Saved to KB' : 'Save to KB'}
                    </button>

                    {/* Export to Draft Button */}
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                    >
                        <Download className="w-5 h-5" />
                        Export to Draft
                    </button>
                </div>
            )}

            {/* KB Stats Indicator */}
            {totalDocuments > 0 && (
                <div className="fixed bottom-8 left-8 z-40">
                    <div className="bg-[#161b22] border border-[#30363d] rounded-full px-4 py-2 flex items-center gap-2 text-sm text-[#8b949e]">
                        <Database className="w-4 h-4" />
                        <span>{totalDocuments} notes in KB</span>
                    </div>
                </div>
            )}
        </div>
    );
}
