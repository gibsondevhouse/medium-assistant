
import { useResearchStore } from '../../store/researchStore';
import { TopicInput } from './TopicInput';
import { TopicGraph } from './TopicGraph';
import { ResearchReport } from './ResearchReport';

export function ResearchTab({ onOpenSettings }: { onOpenSettings: () => void }) {
    const { status } = useResearchStore();

    return (
        <div className="w-full h-full bg-[#0a0a0a] text-white overflow-hidden relative">
            {status === 'idle' && <TopicInput onOpenSettings={onOpenSettings} />}

            {(status === 'surveying' || status === 'reviewing_plan' || status === 'researching') && (
                <TopicGraph />
            )}

            {(status === 'synthesizing' || status === 'complete') && (
                <ResearchReport />
            )}
        </div>
    );
}
