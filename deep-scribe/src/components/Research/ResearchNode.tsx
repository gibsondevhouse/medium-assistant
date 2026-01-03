
import { Handle, Position, NodeProps } from 'reactflow';
import { ResearchNodeData } from '../../types/research';
import { Loader2, CheckCircle2, Circle, AlertCircle, FileText } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export function ResearchNode({ data, selected }: NodeProps<ResearchNodeData>) {
    const isRoot = data.label.length > 30 || !data.subtopicQuery; // simple heuristic or pass type

    return (
        <div
            className={cn(
                "px-4 py-3 shadow-lg rounded-xl border-2 transition-all min-w-[180px]",
                selected ? "border-brand-primary shadow-brand-primary/20" : "border-white/10 shadow-black/40",
                isRoot ? "bg-surface-800" : "bg-surface-200"
            )}
        >
            <Handle type="target" position={Position.Top} className="!bg-brand-accent" />

            <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                    {data.status === 'pending' && <Circle className="w-4 h-4 text-text-muted" />}
                    {data.status === 'loading' && <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />}
                    {data.status === 'done' && <CheckCircle2 className="w-4 h-4 text-brand-secondary" />}
                    {data.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                <div className="flex-1">
                    <div className="text-sm font-medium text-text-primary">
                        {data.label}
                    </div>
                    {data.findings && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-brand-secondary uppercase tracking-wider font-bold">
                            <FileText className="w-3 h-3" />
                            Findings Ready
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-brand-accent" />
        </div>
    );
}
