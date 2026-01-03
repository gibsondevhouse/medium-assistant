import { Edge, Node } from 'reactflow';

export type ResearchStatus =
    | 'idle'
    | 'surveying'            // Generating topic map
    | 'reviewing_plan'       // User reviews topic breakdown
    | 'source_running'       // Level 1: Gathering context & hypotheses
    | 'hypothesis_review'    // User selects hypotheses
    | 'researching'          // Level 2: Parallel deep dive on subtopics
    | 'research_running'     // (alias for researching)
    | 'synthesizing'         // Generating final report
    | 'outlines_review'      // Level 3: User reviews generated outlines
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

// Node types for ReactFlow graph visualization
export interface ResearchNodeData {
    label: string;
    status: 'pending' | 'loading' | 'done' | 'error';
    findings?: string;
    subtopicQuery?: string;
}

export type TopicNode = Node<ResearchNodeData>;
