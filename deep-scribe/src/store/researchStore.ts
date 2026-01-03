import { create } from 'zustand';
import { ResearchStatus, ResearchHypothesis, ResearchSource, ArticleOutline } from '../types/research';

interface ResearchState {
    query: string;
    status: ResearchStatus;

    // Level 1
    sources: ResearchSource[];
    hypotheses: ResearchHypothesis[];

    // Level 3
    outlines: ArticleOutline[];

    error: string | null;

    // Actions
    setQuery: (query: string) => void;
    setStatus: (status: ResearchStatus) => void;
    setSources: (sources: ResearchSource[]) => void;
    setHypotheses: (hypotheses: ResearchHypothesis[]) => void;
    toggleHypothesis: (id: string) => void;
    updateHypothesisStatus: (id: string, status: ResearchHypothesis['status'], findings?: string) => void;
    setOutlines: (outlines: ArticleOutline[]) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
    query: '',
    status: 'idle',
    sources: [],
    hypotheses: [],
    outlines: [],
    error: null,

    setQuery: (query) => set({ query }),
    setStatus: (status) => set({ status }),
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
    setError: (error) => set({ error }),

    reset: () => set({
        query: '',
        status: 'idle',
        sources: [],
        hypotheses: [],
        outlines: [],
        error: null,
    }),
}));
