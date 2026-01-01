import { ReactNode } from 'react';

interface DeepScribeLayoutProps {
  sidebar: ReactNode;
  editor: ReactNode;
  metadata?: ReactNode; // Optional for now
}

export function DeepScribeLayout({ sidebar, editor, metadata }: DeepScribeLayoutProps) {
  return (
    <div className="grid grid-cols-[250px_1fr_250px] h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Left Sidebar: 250px */}
      <div className="flex flex-col border-r border-slate-800">
        {sidebar}
      </div>

      {/* Center Editor: 1fr */}
      <div className="flex flex-col relative min-w-0">
        {editor}
      </div>

      {/* Right Metadata Panel: 250px */}
      <div className="flex flex-col border-l border-slate-800">
        {metadata}
      </div>
    </div>
  );
}
