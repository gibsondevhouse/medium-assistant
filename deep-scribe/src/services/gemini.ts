import { Node, Edge } from 'reactflow';
import { ResearchNodeData } from '../types/research';
import { aiRouter } from './ai-router';

// Helper to get model from settings
const getModel = (): string => {
    try {
        const stored = localStorage.getItem('deep-scribe-settings');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.research && parsed.research.model) {
                return parsed.research.model;
            }
        }
    } catch (e) {
        console.warn("Failed to parse settings", e);
    }
    return 'gemini-2.5-flash'; // Default model
};

// PASS 1: Generate Topic Map
export const generateTopicMap = async (topic: string): Promise<{ nodes: Node<ResearchNodeData>[], edges: Edge[] }> => {
    const model = getModel();

    const prompt = `
    You are a research planning assistant.
    Break down the topic "${topic}" into 5-8 distinct, non-overlapping subtopics suitable for deep research.
    Return a strictly valid JSON object with the following structure:
    {
      "root": { "id": "root", "label": "${topic}" },
      "subtopics": [
        { "id": "t1", "label": "Subtopic Name", "description": "Brief description" },
        ...
      ]
    }
    Do not add markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

    const result = await aiRouter.generateContent(prompt, model);

    if (!result.success || !result.content) {
        throw new Error(result.error || "Failed to generate content via Gemini");
    }

    const text = result.content.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const data = JSON.parse(text);

        const nodes: Node<ResearchNodeData>[] = [
            {
                id: 'root',
                type: 'input',
                position: { x: 250, y: 0 },
                data: { label: topic, status: 'done', findings: '' },
            },
            ...data.subtopics.map((sub: any, index: number) => ({
                id: sub.id,
                position: { x: (index % 3) * 200, y: 150 + Math.floor(index / 3) * 150 },
                data: {
                    label: sub.label,
                    status: 'pending',
                    subtopicQuery: sub.description
                },
            }))
        ];

        const edges: Edge[] = data.subtopics.map((sub: any) => ({
            id: `e-root-${sub.id}`,
            source: 'root',
            target: sub.id,
            animated: true,
        }));

        return { nodes, edges };
    } catch (e) {
        console.error("Failed to parse topic map JSON", e, text);
        throw new Error("Failed to generate topic map. Please try again.");
    }
};

// PASS 2: Deep Dive (Single Subtopic)
export const researchSubtopic = async (subtopic: string, mainTopic: string): Promise<string> => {
    const model = getModel();
    let webContext = "";
    let useSearch = false;

    // 1. Check if Search is Enabled
    try {
        const hasKey = await window.electronAPI.settings.hasGoogleSearchKey();
        const hasCx = await window.electronAPI.settings.hasGoogleSearchCx();
        useSearch = hasKey && hasCx;
    } catch (e) {
        console.warn("Failed to check search settings", e);
    }

    // 2. Perform Live Search (if enabled)
    if (useSearch) {
        try {
            const query = `${mainTopic} ${subtopic} facts news`;
            console.log(`[Research] Searching Google for: ${query}`);
            const searchResult = await window.electronAPI.google.search(query);

            if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
                webContext = `
## LIVE WEB CONTEXT (Use these facts to ground your response):
${searchResult.results.map((r: any) => `- [${r.source}] ${r.title}: ${r.snippet}`).join('\n')}
`;
            }
        } catch (e) {
            console.error("Google Search failed during research:", e);
            // Continue without web context
        }
    }

    const prompt = `
    Conduct deep research on the subtopic "${subtopic}" within the context of "${mainTopic}".
    
    ${webContext ? `
    IMPORTANT: I have provided live search results below. Use these specific facts, figures, and sources to ground your answer.
    ${webContext}
    ` : ''}

    Provide a detailed summary of key facts, figures, recent developments, and controversies.
    Format the output as a concise markdown section.
    Focus on information density.
  `;

    const result = await aiRouter.generateContent(prompt, model);
    if (!result.success || !result.content) {
        throw new Error(result.error || "Failed to generate content via Gemini");
    }
    return result.content;
};

// PASS 3: Synthesis
export const synthesizeReport = async (topic: string, findings: { topic: string, content: string }[]): Promise<string> => {
    const model = getModel();

    const findingsText = findings.map(f => `## ${f.topic}\n${f.content}`).join('\n\n');

    const prompt = `
    You are an expert editor and analyst.
    Write a comprehensive, long-form feature article about "${topic}" based on the following research notes.

    Goal: A "The Verge" or "New Yorker" style deep dive.
    Structure:
    - Engaging Title
    - Introduction
    - Synthesized Sections (don't just list the notes, weave them together)
    - Conclusion

    Research Notes:
    ${findingsText}
  `;

    const result = await aiRouter.generateContent(prompt, model);
    if (!result.success || !result.content) {
        throw new Error(result.error || "Failed to generate content via Gemini");
    }
    return result.content;
};
