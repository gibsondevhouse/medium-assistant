
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
                selected ? "border-blue-500 shadow-blue-500/20" : "border-white/10 shadow-black/40",
                isRoot ? "bg-slate-900" : "bg-[#1e1e1e]"
            )}
        >
            <Handle type="target" position={Position.Top} className="!bg-slate-500" />

            <div className="flex items-start gap-3">
                <div className="mt-1 shrink-0">
                    {data.status === 'pending' && <Circle className="w-4 h-4 text-slate-500" />}
                    {data.status === 'loading' && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                    {data.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {data.status === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                </div>

                <div className="flex-1">
                    <div className="text-sm font-medium text-slate-200">
                        {data.label}
                    </div>
                    {data.findings && (
                        <div className="flex items-center gap-1 mt-2 text-[10px] text-green-400 uppercase tracking-wider font-bold">
                            <FileText className="w-3 h-3" />
                            Findings Ready
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
        </div>
    );
}
