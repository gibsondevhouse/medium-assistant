import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Zap, Shield, Globe, Cpu } from 'lucide-react';

const GEMINI_COMMAND_CENTER = {
    headline: "The Google Intelligence Engine",
    subheadline: "Your single API key grants access to the entire Gemini spectrum—from the bleeding-edge Generation 3 preview to the ultra-efficient Flash-Lite.",

    // THE NARRATIVE (Left Column)
    article_body: `
### The "All-In" Advantage
You are running on the **Google Gemini Ecosystem**. Unlike other providers that require separate keys for Text, Vision, and Image Generation, Gemini is a **Unified Multimodal Intelligence**.

### Generation 3 (The Agentic Era)
**Gemini 3 Pro** and **Flash** (Preview) represent a new class of "Agentic" models. They feature "Thinking" capabilities—meaning they can pause to reason through complex coding or logic problems before responding. They are currently the smartest models Google offers.

### Generation 2.5 (The Production Standard)
For high-stability workloads, the **Gemini 2.5** family is the industry workhorse:
* **2.5 Pro:** The gold standard for reliable, complex instructions.
* **2.5 Flash:** The speed king. Ideal for real-time chat.
* **2.5 Flash-Lite:** The efficiency specialist. Perfect for background tasks like file renaming or metadata extraction.

### Native Sensory Input
Every model listed here is **Multimodal**. You can drag-and-drop images, 2-hour videos, or 10-hour audio files directly into the chat. Gemini sees and hears what you do.
  `,

    // THE MODEL GROUPS (Right Column - Stacked Cards)
    generations: [
        {
            series: "Gemini 3 (Preview)",
            badge_color: "purple", // Visual cue for "Bleeding Edge"
            models: [
                { id: "gemini-3-pro-preview", name: "Gemini 3 Pro", role: "Reasoning & Agents", specs: "Thinking • 1M Context" },
                { id: "gemini-3-flash-preview", name: "Gemini 3 Flash", role: "Next-Gen Speed", specs: "Thinking • Low Latency" },
                { id: "gemini-3-pro-image-preview", name: "Gemini 3 Vision", role: "Generative Media", specs: "Image Output Supported" }
            ]
        },
        {
            series: "Gemini 2.5 (Stable)",
            badge_color: "emerald", // Visual cue for "Production Ready"
            models: [
                { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", role: "Production Logic", specs: "2M Context • Stable" },
                { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", role: "High Throughput", specs: "Sub-second Latency" },
                { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", role: "Economy / Micro", specs: "Lowest Cost" }
            ]
        }
    ]
};

export const ProviderDeepDive: React.FC = () => {
    return (
        <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Narrative (Span 7) */}
                <div className="lg:col-span-7">
                    {/* Header */}
                    <div className="mb-8 pb-8 border-b border-white/10">
                        <h2 className="text-4xl font-bold font-serif text-white mb-2 tracking-tight">{GEMINI_COMMAND_CENTER.headline}</h2>
                        <p className="text-xl text-zinc-400 font-light font-sans">{GEMINI_COMMAND_CENTER.subheadline}</p>
                    </div>

                    <article className="prose prose-zinc prose-invert prose-p:text-justify prose-headings:font-serif prose-headings:font-semibold prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 prose-strong:text-white prose-a:text-blue-400 max-w-none border-l-4 border-blue-500/50 pl-6">
                        <ReactMarkdown>
                            {GEMINI_COMMAND_CENTER.article_body}
                        </ReactMarkdown>
                    </article>
                </div>

                {/* Right Column: Sticky Sidebar (Span 5) */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-8 space-y-6">

                        {GEMINI_COMMAND_CENTER.generations.map((gen, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                                <div className="px-5 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${gen.badge_color === 'purple' ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                        <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider font-sans">{gen.series}</h4>
                                    </div>
                                    <Cpu className="w-4 h-4 text-zinc-500" />
                                </div>
                                <div className="divide-y divide-white/5">
                                    {gen.models.map((model) => (
                                        <div key={model.id} className="p-4 hover:bg-white/5 transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="text-zinc-200 font-medium group-hover:text-white transition-colors">{model.name}</h5>
                                                <span className="text-xs text-zinc-500 font-mono">{model.role}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400">{model.specs}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

            </div>
        </div>
    );
};
