import { useResearchStore } from '../../store/researchStore';
import { TopicInput } from './TopicInput';
import { SourceReview } from './SourceReview';
// import { ResearchProgress } from './ResearchProgress'; // We'll build these next
// import { CreativeResults } from './CreativeResults';

export function ResearchTab({ onOpenSettings }: { onOpenSettings: () => void }) {
    const { status } = useResearchStore();

    return (
        <div className="w-full h-full bg-[#0a0a0a] text-white overflow-hidden relative flex flex-col">
            {status === 'idle' && <TopicInput onOpenSettings={onOpenSettings} />}

            {/* Level 1: Source & Hypothesis Review */}
            {(status === 'source_running' || status === 'hypothesis_review') && (
                <SourceReview />
            )}

            {/* Level 2: Deep Research Running */}
            {/* status === 'research_running' && <ResearchProgress /> */}

            {/* Level 3: Outlines */}
            {/* (status === 'outlines_review' || status === 'complete') && <CreativeResults /> */}

            {/* Temporary Fallback for unimplemented states */}
            {(status === 'research_running' || status === 'outlines_review' || status === 'complete') && (
                <div className="p-10 text-center">
                    <h2 className="text-xl">Level 2 & 3 Views Under Construction</h2>
                    <p className="text-gray-400">Current Status: {status}</p>
                </div>
            )}
        </div>
    );
}
