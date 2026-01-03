export interface ProviderData {
    title: string;
    subtitle: string;
    article: string;
    specs: { label: string; value: string }[];
    pricing: { model: string; input: string; output: string }[];
}

export const PROVIDER_INFO: Record<string, ProviderData> = {
    gemini: {
        title: "Google Gemini",
        subtitle: "The Limitless Context Engine",
        article: `
### The "Long Context" Revolution
While most models struggle to remember a conversation after a few thousand words, **Gemini 1.5 Pro** has shattered the ceiling. It features a massive context window (up to 2 million tokens), allowing it to hold entire codebases, long novels, or hours of video in its working memory simultaneously.

### Model Breakdown

#### Gemini 1.5 Pro
This is the "reasoning" engine. It is slower than Flash but significantly more capable at complex instruction following, coding, and nuance.
* **Best for:** Complex RAG (Retrieval Augmented Generation), coding agents, and creative writing.
* **Cost:** Moderate. It is cheaper than GPT-4o but more expensive than Flash.

#### Gemini 1.5 Flash
Flash is an engineering marvel optimized for speed. It sacrifices a small amount of reasoning capability for extreme throughput and low latency.
* **Best for:** High-volume data extraction, summarization, and chat interfaces where speed is critical.
* **Cost:** Extremely low. You can process millions of tokens for pennies.

### Privacy & Training
Google explicitly states that data sent via the API (unlike the consumer ChatGPT/Gemini web apps) is **not** used to train their models. Your data remains isolated within your project container.
`,
        specs: [
            { label: "Context Window", value: "2,000,000 Tokens" },
            { label: "Training Cutoff", value: "Nov 2023" },
            { label: "Max Output", value: "8,192 Tokens" },
            { label: "Audio/Video", value: "Native Support" }
        ],
        pricing: [
            { model: "1.5 Pro", input: "$3.50 / 1M", output: "$10.50 / 1M" },
            { model: "1.5 Flash", input: "$0.075 / 1M", output: "$0.30 / 1M" }
        ]
    },
    anthropic: {
        title: "Anthropic Claude",
        subtitle: "The Writer's Choice",
        article: `
### Constitutional AI
Anthropic takes a different approach to safety and alignment, resulting in models that feel less robotic and more eager to help. **Claude 3.5 Sonnet** is currently considered the state-of-the-art for coding and nuanced writing.

### Model Breakdown

#### Claude 3.5 Sonnet
The current sweet spot between speed and intelligence. It outperforms GPT-4o on many coding benchmarks while remaining incredibly fast.
* **Best for:** Coding, complex reasoning, and nuanced editorial work.
* **Cost:** Competitive tier, similar to GPT-4o but often faster.

#### Claude 3 Haiku
A blazingly fast model designed for simple tasks and high throughput.
* **Best for:** Simple classification, customer support bots, and fast summaries.

### Steerability
Claude allows for extensive "System Prompts" that heavily influence its tone and style. It is less prone to "preachiness" than other models.
`,
        specs: [
            { label: "Context Window", value: "200,000 Tokens" },
            { label: "Training Cutoff", value: "Apr 2024" },
            { label: "Max Output", value: "8,192 Tokens" },
            { label: "Vision", value: "Native Support" }
        ],
        pricing: [
            { model: "3.5 Sonnet", input: "$3.00 / 1M", output: "$15.00 / 1M" },
            { model: "3 Haiku", input: "$0.25 / 1M", output: "$1.25 / 1M" }
        ]
    },
    openai: {
        title: "OpenAI GPT-4",
        subtitle: "The Industry Standard",
        article: `
### The Reasoning Benchmark
**GPT-4o** represents the current baseline for general intelligence in AI. It excels at following strict logical instructions and has a vast knowledge base.

### Model Breakdown

#### GPT-4o
The flagship "omni" model. It is multimodal by default and highly optimized for reasoning tasks.
* **Best for:** Logic puzzles, general knowledge, and strict instruction following.
* **Cost:** Standard premium tier pricing.

#### GPT-4o Mini
A cost-effective alternative that replaces the older GPT-3.5 Turbo.
* **Best for:** Simple tasks, chat bots, and high-volume processing.

### Function Calling
OpenAI has the most mature ecosystem for "Tool Use" or "Function Calling," making it the easiest model to integrate with external APIs.
`,
        specs: [
            { label: "Context Window", value: "128,000 Tokens" },
            { label: "Training Cutoff", value: "Oct 2023" },
            { label: "Max Output", value: "4,096 Tokens" },
            { label: "Vision", value: "Native Support" }
        ],
        pricing: [
            { model: "GPT-4o", input: "$5.00 / 1M", output: "$15.00 / 1M" },
            { model: "GPT-4o Mini", input: "$0.15 / 1M", output: "$0.60 / 1M" }
        ]
    },
    deepseek: {
        title: "DeepSeek",
        subtitle: "The Efficient Coder",
        article: `
### Open Weights Revolution
**DeepSeek Coder V2** has taken the open models community by storm. It achieves performance comparable to top-tier closed models, especially in coding tasks, due to its specialized Mixture-of-Experts (MoE) architecture.

### Model Breakdown

#### DeepSeek Coder V2
A massive MoE model trained heavily on code and technical documentation.
* **Best for:** Python, Rust, and JavaScript generation.
* **Cost:** Significantly cheaper than Western proprietary models.

### API Compatibility
DeepSeek aims to be a drop-in replacement for OpenAI, using a fully compatible API structure.
`,
        specs: [
            { label: "Context Window", value: "128,000 Tokens" },
            { label: "Training Cutoff", value: "Unknown" },
            { label: "Max Output", value: "4,096 Tokens" },
            { label: "Architecture", value: "Mixture of Experts" }
        ],
        pricing: [
            { model: "Coder V2", input: "$0.14 / 1M", output: "$0.28 / 1M" },
            { model: "Chat", input: "$0.14 / 1M", output: "$0.28 / 1M" }
        ]
    },
    perplexity: {
        title: "Perplexity",
        subtitle: "The Real-Time Researcher",
        article: `
### Grounded in Reality
Unlike standard LLMs which rely on static training data, **Perplexity** queries the live web for every request. It constructs its answers by synthesizing search results, providing citations for its claims.

### Mechanism
1. **Query Analysis:** Understands user intent.
2. **Search:** Scans reliable sources (Academic, News, Creative).
3. **Synthesis:** Generates a coherent answer with footnotes.

### Limitations
It is less capable of "creative" writing or roleplay, as its primary directive is factual accuracy and sourcing.
`,
        specs: [
            { label: "Context Window", value: "Varies" },
            { label: "Knowledge", value: "Real-Time Web" },
            { label: "Citations", value: "Always Included" },
            { label: "Focus", value: "Fact Checking" }
        ],
        pricing: [
            { model: "Sonar Online", input: "$5.00 / 1M", output: "$5.00 / 1M" },
            { model: "Sonar Large", input: "$1.00 / 1M", output: "$1.00 / 1M" }
        ]
    },
    openrouter: {
        title: "OpenRouter",
        subtitle: "The Universal Interface",
        article: `
### One Key, Every Model
**OpenRouter** acts as a unified gateway to the AI ecosystem. Instead of managing ten different API keys, you use one OpenRouter key to access OpenAI, Anthropic, Google, Mistral, Meta Llama, and more.

### Benefits
* **Experimentation:** Instantly swap models to see which works best for your prompt.
* **Access:** Get access to models like Llama 3 405B which are hard to host yourself.
* **Ranking:** See live leaderboards and pricing comparisons.

### Routing
OpenRouter finds the cheapest and fastest provider for open-source models, routing your request dynamically.
`,
        specs: [
            { label: "Context Window", value: "Model Dependent" },
            { label: "Selection", value: "100+ Models" },
            { label: "Privacy", value: "Optional Logging" },
            { label: "Billing", value: "Pre-paid Credits" }
        ],
        pricing: [
            { model: "Llama 3 70B", input: "$0.54 / 1M", output: "$0.79 / 1M" },
            { model: "Mistral Large", input: "$3.00 / 1M", output: "$9.00 / 1M" }
        ]
    }
};
