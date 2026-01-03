import React, { useEffect, useState } from 'react';
import { useDraftStore } from '../../store/draftStore';

export const Editor: React.FC = () => {
    const { activeDraft, saveCurrentDraft, isLoading, error } = useDraftStore();
    const [content, setContent] = useState('');

    useEffect(() => {
        if (activeDraft) {
            setContent(activeDraft.content || '');
        }
    }, [activeDraft]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    const handleSave = () => {
        saveCurrentDraft(content);
    };

    // Autosave effect (debounced) could go here
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (activeDraft && content !== activeDraft.content) {
                saveCurrentDraft(content);
            }
        }, 2000);
        return () => clearTimeout(timeout);
    }, [content, activeDraft, saveCurrentDraft]);

    if (isLoading && !activeDraft) return <div className="text-white p-8">Loading...</div>;
    if (error) return <div className="text-red-500 p-8">Error: {error}</div>;
    if (!activeDraft) return <div className="text-gray-500 p-8">Select a draft to start writing.</div>;

    return (
        <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9]">
            <div className="flex items-center justify-between px-8 py-4 border-b border-[#30363d]/50">
                <h2 className="text-lg font-medium text-white">{activeDraft.title}</h2>
                <div className="text-xs text-gray-500">
                    {activeDraft.lastModified ? `Last saved: ${new Date(activeDraft.lastModified).toLocaleTimeString()}` : 'Unsaved'}
                </div>
            </div>
            <textarea
                className="flex-1 w-full bg-transparent p-8 outline-none resize-none font-mono text-sm leading-relaxed"
                value={content}
                onChange={handleChange}
                placeholder="Start writing..."
            />
        </div>
    );
};
