
import ReactFlow, { Background, Controls, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import { useResearchStore } from '../../store/researchStore';
import { ResearchNode } from './ResearchNode';
import { researchSubtopic, synthesizeReport } from '../../services/gemini';
import { Play, FileText, Loader2 } from 'lucide-react';
import { shallow } from 'zustand/shallow';

const nodeTypes: NodeTypes = {
    input: ResearchNode,
    default: ResearchNode,
};

export function TopicGraph() {
    // Using direct store access to avoid TS inference issues with shallow selector
    // This causes more re-renders but ensures type safety for the build.
    const {
        nodes, edges, onNodesChange, onEdgesChange,
        status, setStatus, updateNodeStatus, query,
        setFinalReport, setError
    } = useResearchStore();

    const startDeepResearch = async () => {
        setStatus('researching');

        // 1. Trigger research for all subnodes in parallel
        const subnodes = nodes.filter(n => n.id !== 'root');

        // Update all to loading
        subnodes.forEach(n => updateNodeStatus(n.id, 'loading'));

        try {
            const researchPromises = subnodes.map(async (node) => {
                try {
                    const findings = await researchSubtopic(node.data.label, query);
                    updateNodeStatus(node.id, 'done', findings);
                    return { topic: node.data.label, content: findings };
                } catch (e) {
                    console.error(e);
                    updateNodeStatus(node.id, 'error');
                    return null;
                }
            });

            const results = (await Promise.all(researchPromises)).filter(Boolean) as { topic: string, content: string }[];

            // 2. Synthesize
            if (results.length > 0) {
                setStatus('synthesizing');
                const report = await synthesizeReport(query, results);
                setFinalReport(report);
                setStatus('complete');
            } else {
                setError("Research failed: No results obtained.");
                setStatus('error');
            }

        } catch (e: any) {
            setError(e.message);
            setStatus('error');
        }
    };

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-[#0a0a0a]"
            >
                <Background color="#333" gap={20} />
                <Controls className="bg-[#1e1e1e] border-white/10" />
            </ReactFlow>

            {/* Floating Action Bar - Now integrated into TopicGraph since it's specific to reviewing_plan state */}
            {status === 'reviewing_plan' && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                    <button
                        onClick={startDeepResearch}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-blue-900/40 transition-all hover:scale-105"
                    >
                        <Play className="w-4 h-4 fill-current" />
                        Start Deep Research
                    </button>
                </div>
            )}

            {/* Progress indicator during research */}
            {status === 'researching' && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-3 bg-[#1e1e1e] text-white px-6 py-3 rounded-full border border-white/10 shadow-xl">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-sm font-medium">Researching {nodes.filter(n => n.data.status === 'done').length}/{nodes.length - 1} topics...</span>
                    </div>
                </div>
            )}

            {/* Synthesizing indicator */}
            {status === 'synthesizing' && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-3 bg-[#1e1e1e] text-white px-6 py-3 rounded-full border border-white/10 shadow-xl animate-pulse">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">Writing Final Report...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
