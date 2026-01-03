
import { useResearchStore } from '../../store/researchStore';
import { useDraftStore } from '../../store/draftStore';
import { ArrowLeft, Download, RotateCcw } from 'lucide-react';
// import { ReactMarkdown } from 'react-markdown/lib/react-markdown'; // if we had it, but we'll specific render or raw for now

export function ResearchReport() {
    const { finalReport, reset, query } = useResearchStore();
    const { createNewDraft } = useDraftStore();

    const handleExport = async () => {
        if (!finalReport) return;

        // Convert Markdown to HTML for TipTap if needed, or rely on Editor to handle Markdown input?
        // TipTap works best with HTML.
        // For now, let's wrap paragraphs in <p>.
        // Simple conversion:
        const htmlContent = finalReport
            .split('\n\n')
            .map(p => {
                if (p.startsWith('# ')) return `<h1>${p.replace('# ', '')}</h1>`;
                if (p.startsWith('## ')) return `<h2>${p.replace('## ', '')}</h2>`;
                if (p.startsWith('- ')) return `<ul><li>${p.replace('- ', '')}</li></ul>`; // Very naive
                return `<p>${p}</p>`;
            })
            .join('');

        await createNewDraft(query, htmlContent, ['research', 'ai-generated']);
    };

    return (
        <div className="h-full flex flex-col bg-[#0a0a0a]">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0d1117] shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={reset}
                        className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-sm font-mono text-gray-500 uppercase tracking-wider">Research Report</h2>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Start Over
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export Article
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 max-w-4xl mx-auto w-full">
                <div className="prose prose-invert prose-lg max-w-none">
                    {/* Simple splitting for now, ideally use a markdown renderer */}
                    {finalReport?.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) return <h1 key={i} className="text-4xl font-serif mb-6 text-white">{line.replace('# ', '')}</h1>;
                        if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-semibold mt-10 mb-4 text-gray-100">{line.replace('## ', '')}</h2>;
                        if (line.startsWith('- ')) return <li key={i} className="ml-4 text-gray-300">{line.replace('- ', '')}</li>;
                        if (line.trim() === '') return <br key={i} />;
                        return <p key={i} className="text-gray-300 leading-relaxed mb-4">{line}</p>;
                    })}
                </div>
            </div>
        </div>
    );
}
