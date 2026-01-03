
import { Edge, Node } from 'reactflow';

export type ResearchStatus =
    | 'idle'
    | 'source_running'      // Level 1: Gathering context & hypotheses
    | 'hypothesis_review'   // User selects hypotheses
    | 'research_running'    // Level 2: Parallel deep dive
    | 'outlines_review'     // Level 3: User reviews generated outlines
    | 'complete'
    | 'error';

export interface ResearchSource {
    id: string;
    url: string;
    title: string;
    summary: string;
    relevance: number;
}

export interface ResearchHypothesis {
    id: string;
    text: string;
    rationale: string;
    selected: boolean;
    status: 'pending' | 'verifying' | 'validated' | 'debunked' | 'error';
    findings?: string;
}

export interface ArticleOutline {
    id: string;
    title: string;
    hook: string;
    sections: { title: string; points: string[] }[];
    targetAudience: string;
}

export interface ResearchSession {
    id: string;
    query: string;
    status: ResearchStatus;

    // Level 1 Data
    sources: ResearchSource[];
    hypotheses: ResearchHypothesis[];

    // Level 3 Data
    outlines: ArticleOutline[];

    error?: string;
    createdAt: string;
}

// Keep Node types for graph visualization if we still use it, 
// but the core logic is now driven by the lists above.
export interface ResearchNodeData {
    label: string;
    status: 'pending' | 'loading' | 'done' | 'error';
    findings?: string;
}
export type TopicNode = Node<ResearchNodeData>;
