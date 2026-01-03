import { create } from 'zustand';
import { Node, Edge, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { ResearchStatus, ResearchHypothesis, ResearchSource, ArticleOutline, ResearchNodeData } from '../types/research';

interface ResearchState {
    query: string;
    status: ResearchStatus;

    // ReactFlow graph state
    nodes: Node<ResearchNodeData>[];
    edges: Edge[];

    // Level 1
    sources: ResearchSource[];
    hypotheses: ResearchHypothesis[];

    // Level 3
    outlines: ArticleOutline[];

    // Final output
    finalReport: string;

    error: string | null;

    // Actions
    setQuery: (query: string) => void;
    setStatus: (status: ResearchStatus) => void;

    // ReactFlow actions
    setNodes: (nodes: Node<ResearchNodeData>[]) => void;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    updateNodeStatus: (id: string, status: ResearchNodeData['status'], findings?: string) => void;

    // Data actions
    setSources: (sources: ResearchSource[]) => void;
    setHypotheses: (hypotheses: ResearchHypothesis[]) => void;
    toggleHypothesis: (id: string) => void;
    updateHypothesisStatus: (id: string, status: ResearchHypothesis['status'], findings?: string) => void;
    setOutlines: (outlines: ArticleOutline[]) => void;
    setFinalReport: (report: string) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
    query: '',
    status: 'idle',
    nodes: [],
    edges: [],
    sources: [],
    hypotheses: [],
    outlines: [],
    finalReport: '',
    error: null,

    setQuery: (query) => set({ query }),
    setStatus: (status) => set({ status }),

    // ReactFlow actions
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes)
        });
    },

    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges)
        });
    },

    updateNodeStatus: (id, status, findings) => {
        const nodes = get().nodes.map(node =>
            node.id === id
                ? { ...node, data: { ...node.data, status, ...(findings ? { findings } : {}) } }
                : node
        );
        set({ nodes });
    },

    // Data actions
    setSources: (sources) => set({ sources }),
    setHypotheses: (hypotheses) => set({ hypotheses }),

    toggleHypothesis: (id) => {
        const hypotheses = get().hypotheses.map(h =>
            h.id === id ? { ...h, selected: !h.selected } : h
        );
        set({ hypotheses });
    },

    updateHypothesisStatus: (id, status, findings) => {
        const hypotheses = get().hypotheses.map(h =>
            h.id === id ? { ...h, status, ...(findings ? { findings } : {}) } : h
        );
        set({ hypotheses });
    },

    setOutlines: (outlines) => set({ outlines }),
    setFinalReport: (report) => set({ finalReport: report }),
    setError: (error) => set({ error }),

    reset: () => set({
        query: '',
        status: 'idle',
        nodes: [],
        edges: [],
        sources: [],
        hypotheses: [],
        outlines: [],
        finalReport: '',
        error: null,
    }),
}));
