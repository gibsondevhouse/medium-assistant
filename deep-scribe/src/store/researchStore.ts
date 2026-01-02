
import { create } from 'zustand';
import { Edge, Node, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { ResearchSession, ResearchStatus } from '../types/research';

interface ResearchState {
    // Current Session Data
    query: string;
    status: ResearchStatus;
    nodes: Node[];
    edges: Edge[];
    finalReport: string | null;
    error: string | null;

    setQuery: (query: string) => void;
    setStatus: (status: ResearchStatus) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    updateNodeStatus: (nodeId: string, status: 'pending' | 'loading' | 'done' | 'error', findings?: string) => void;
    setFinalReport: (report: string) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
    query: '',
    status: 'idle',
    nodes: [],
    edges: [],
    finalReport: null,
    error: null,

    setQuery: (query) => set({ query }),
    setStatus: (status) => set({ status }),
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },
    onEdgesChange: (changes) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    updateNodeStatus: (nodeId, status, findings) => {
        const nodes = get().nodes.map((node) => {
            if (node.id === nodeId) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        status,
                        ...(findings ? { findings } : {}),
                    },
                };
            }
            return node;
        });
        set({ nodes });
    },

    setFinalReport: (report) => set({ finalReport: report }),
    setError: (error) => set({ error }),

    reset: () => set({
        query: '',
        status: 'idle',
        nodes: [],
        edges: [],
        finalReport: null,
        error: null,
    }),
}));
