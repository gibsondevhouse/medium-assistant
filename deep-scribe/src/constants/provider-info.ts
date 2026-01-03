export interface ProviderData {
    title: string;
    subtitle: string;
    article: string;
    specs: { label: string; value: string }[];
    pricing: { model: string; input: string; output: string }[];
}

export const GEMINI_INFO: ProviderData = {
    title: "Google Gemini",
    subtitle: "The All-In AI Engine",
    article: `
### Deep Scribe's AI Foundation

Deep Scribe runs exclusively on **Google Gemini**, providing a consistent, powerful AI experience for all your research and writing needs.

### Generation 3.0 (Preview)

#### Gemini 3.0 Pro
The latest reasoning engine with advanced multi-step logic and improved instruction following.
* **Best for:** Complex research synthesis, nuanced analysis, and detailed article generation.
* **Note:** Preview model - cutting-edge capabilities with occasional updates.

#### Gemini 3.0 Flash
Blazing fast multimodal model optimized for speed while maintaining quality.
* **Best for:** Quick iterations, drafts, and high-volume content generation.

### Generation 2.5 (Stable)

#### Gemini 2.5 Pro
Production-grade powerful model for demanding tasks.
* **Best for:** Final article polishing, complex reasoning, and detailed research.
* **Cost:** Premium tier for maximum capability.

#### Gemini 2.5 Flash
The balanced workhorse - fast, capable, and cost-effective.
* **Best for:** Daily writing tasks, research synthesis, and general content creation.
* **Cost:** Affordable for high-volume usage.

#### Gemini 2.5 Flash-Lite
Ultra-fast, lightweight model for simple tasks.
* **Best for:** Quick edits, summaries, and simple transformations.
* **Cost:** Lowest cost option for basic operations.

### Privacy & Training
Google explicitly states that data sent via the API is **not** used to train their models. Your research and writing remains private.
`,
    specs: [
        { label: "Context Window", value: "1,000,000+ Tokens" },
        { label: "Training Cutoff", value: "2024" },
        { label: "Max Output", value: "8,192 Tokens" },
        { label: "Audio/Video", value: "Native Support" }
    ],
    pricing: [
        { model: "3.0 Pro (Preview)", input: "TBD", output: "TBD" },
        { model: "2.5 Pro", input: "$1.25 / 1M", output: "$5.00 / 1M" },
        { model: "2.5 Flash", input: "$0.075 / 1M", output: "$0.30 / 1M" },
        { model: "2.5 Flash-Lite", input: "$0.01 / 1M", output: "$0.04 / 1M" }
    ]
};

// Export for backwards compatibility if needed
export const PROVIDER_INFO: Record<string, ProviderData> = {
    gemini: GEMINI_INFO
};
