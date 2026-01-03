import { useResearchStore } from '../../store/researchStore';
import { FileText } from 'lucide-react';

export function ReportPanel() {
    const { finalReport, query } = useResearchStore();

    if (!finalReport) {
        return (
            <div className="h-full flex items-center justify-center animate-in fade-in duration-300">
                <div className="text-center">
                    <div className="w-16 h-16 bg-[#1e1e1e] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No report yet</h3>
                    <p className="text-gray-500">Complete the research process to generate a report.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto animate-in fade-in duration-300">
            <div className="p-8 md:p-12 lg:p-16 max-w-4xl mx-auto w-full">
                {/* Query Title */}
                {query && (
                    <div className="mb-8 pb-6 border-b border-[#30363d]">
                        <p className="text-sm font-mono text-gray-500 uppercase tracking-wider mb-2">Research Report</p>
                        <h1 className="text-2xl font-serif text-gray-300">{query}</h1>
                    </div>
                )}

                {/* Report Content */}
                <div className="prose prose-invert prose-lg max-w-none">
                    {finalReport.split('\n').map((line, i) => {
                        if (line.startsWith('# ')) {
                            return (
                                <h1 key={i} className="text-4xl font-serif mb-6 text-white">
                                    {line.replace('# ', '')}
                                </h1>
                            );
                        }
                        if (line.startsWith('## ')) {
                            return (
                                <h2 key={i} className="text-2xl font-semibold mt-10 mb-4 text-gray-100">
                                    {line.replace('## ', '')}
                                </h2>
                            );
                        }
                        if (line.startsWith('### ')) {
                            return (
                                <h3 key={i} className="text-xl font-semibold mt-8 mb-3 text-gray-200">
                                    {line.replace('### ', '')}
                                </h3>
                            );
                        }
                        if (line.startsWith('- ')) {
                            return (
                                <li key={i} className="ml-4 text-gray-300">
                                    {line.replace('- ', '')}
                                </li>
                            );
                        }
                        if (line.trim() === '') {
                            return <br key={i} />;
                        }
                        return (
                            <p key={i} className="text-gray-300 leading-relaxed mb-4">
                                {line}
                            </p>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
