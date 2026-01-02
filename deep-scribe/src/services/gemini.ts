
import { Node, Edge } from 'reactflow';
import { ResearchNodeData } from '../types/research';

// PASS 1: Generate Topic Map
export const generateTopicMap = async (apiKey: string, topic: string): Promise<{ nodes: Node<ResearchNodeData>[], edges: Edge[] }> => {
    // Note: apiKey is now managed by the backend CLI, but keeping the signature for compatibility if needed, 
    // or we can ignore it. The backend uses the logged-in user's credentials.

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

    const result = await window.electronAPI.gemini.generate(prompt);

    if (!result.success || !result.text) {
        throw new Error(result.error || "Failed to generate content via CLI");
    }

    const text = result.text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const data = JSON.parse(text);

        // Convert to React Flow Nodes/Edges
        const nodes: Node<ResearchNodeData>[] = [
            {
                id: 'root',
                type: 'input',
                position: { x: 250, y: 0 },
                data: { label: topic, status: 'done', findings: '' },
            },
            ...data.subtopics.map((sub: any, index: number) => ({
                id: sub.id,
                position: { x: (index % 3) * 200, y: 150 + Math.floor(index / 3) * 150 }, // distinct positions
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
export const researchSubtopic = async (apiKey: string, subtopic: string, mainTopic: string): Promise<string> => {
    const prompt = `
    Conduct deep research on the subtopic "${subtopic}" within the context of "${mainTopic}".
    Provide a detailed summary of key facts, figures, recent developments, and controversies.
    Format the output as a concise markdown section.
    Focus on information density.
  `;

    const result = await window.electronAPI.gemini.generate(prompt);
    if (!result.success || !result.text) {
        throw new Error(result.error || "Failed to generate content via CLI");
    }
    return result.text;
};

// PASS 3: Synthesis
export const synthesizeReport = async (apiKey: string, topic: string, findings: { topic: string, content: string }[]): Promise<string> => {
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

    const result = await window.electronAPI.gemini.generate(prompt);
    if (!result.success || !result.text) {
        throw new Error(result.error || "Failed to generate content via CLI");
    }
    return result.text;
};
