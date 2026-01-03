import { useResearchStore } from '../../store/researchStore';
import { TopicInput } from './TopicInput';
import { TopicGraph } from './TopicGraph';

interface TopicPanelProps {
    onOpenSettings?: () => void;
}

export function TopicPanel({ onOpenSettings }: TopicPanelProps) {
    const { status, nodes } = useResearchStore();

    // Show input when idle, otherwise show the topic graph
    if (status === 'idle') {
        return (
            <div className="h-full w-full animate-in fade-in duration-300">
                <TopicInput onOpenSettings={onOpenSettings} />
            </div>
        );
    }

    return (
        <div className="h-full w-full animate-in fade-in duration-300">
            <TopicGraph />
        </div>
    );
}
