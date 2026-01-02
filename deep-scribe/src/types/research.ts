
import { Edge, Node } from 'reactflow';

export type ResearchStatus =
    | 'idle'
    | 'surveying'
    | 'reviewing_plan'
    | 'researching'
    | 'synthesizing'
    | 'complete'
    | 'error';

export interface ResearchNodeData {
    label: string;
    status: 'pending' | 'loading' | 'done' | 'error';
    findings?: string;
    subtopicQuery?: string;
}

export type TopicNode = Node<ResearchNodeData>;

export interface ResearchSession {
    id: string;
    query: string;
    nodes: TopicNode[];
    edges: Edge[];
    finalReport?: string;
    status: ResearchStatus;
    error?: string;
}
