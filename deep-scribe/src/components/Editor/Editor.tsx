import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { useDraftStore } from '../../store/draftStore';
import { Save, Tag, Clock } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const Editor: React.FC = () => {
    const { activeDraft, saveCurrentDraft, updateDraftMetadata, isLoading, error } = useDraftStore();

    // Local state for metadata inputs to avoid jitter
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState(''); // Comma separated string for editing
    const [isSaving, setIsSaving] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder: 'Tell your story...',
            }),
            Markdown,
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] font-serif',
            },
        },
        onUpdate: ({ editor }) => {
            // We handle save via debounce on content change
            setLocalContent((editor.storage as any).markdown.getMarkdown());
        },
    });

    const [localContent, setLocalContent] = useState('');
    const debouncedContent = useDebounce(localContent, 2000); // Auto-save content every 2s of inactivity
    const debouncedTitle = useDebounce(title, 1000);
    const debouncedTags = useDebounce(tags, 1000);

    // 1. Sync Active Draft -> Editor (Initial Load)
    useEffect(() => {
        if (activeDraft && editor) {
            // Only update if editor is empty or completely different draft
            // This is tricky with collaborative/live editing, but for local:
            // If activeDraft.id changes, we reset.
            // We use a ref or just ID check.
            setTitle(activeDraft.title);
            setTags(activeDraft.tags?.join(', ') || '');

            // Only set content if it's different to avoid cursor jumps
            // Ideally we compare simpler things or rely on ID change
        }
    }, [activeDraft?.id, editor]);
    // Note: We don't depend on activeDraft.content here to avoid loop,
    // assuming content is loaded once when ID changes.
    // BUT we need to load the content!

    useEffect(() => {
        if (activeDraft && editor && activeDraft.content !== undefined) {
            // Check if content is significantly different (e.g. newly loaded draft)
            // A simple way is to check if the editor is empty or if we just switched drafts
            // We can track "currentDraftId" in a ref

            // For now, if the editor content is empty, load it.
            // Or if we know we just switched.
            // Let's rely on the fact that when `activeDraft` changes ID, this runs.
            // const currentHTML = editor.getHTML();
            // Basic check to prevent overwrite loop if we just saved
            // Ideally, the store shouldn't update 'activeDraft.content' on save unless it came from backend

            // NOTE: activeDraft.content comes from `readDraft` in store.
            // If we just switched drafts, we MUST load content.
            // If we are typing, activeDraft might not update until save.

            // Let's use a ref to track loaded ID
        }
    }, [activeDraft, editor]);

    // Better approach for content sync:
    const [loadedDraftId, setLoadedDraftId] = useState<string | null>(null);

    useEffect(() => {
        if (activeDraft && editor && activeDraft.id !== loadedDraftId) {
            editor.commands.setContent(activeDraft.content || '');
            setTitle(activeDraft.title);
            setTags(activeDraft.tags?.join(', ') || '');
            setLocalContent(activeDraft.content || ''); // Init local content
            setLoadedDraftId(activeDraft.id);
        }
    }, [activeDraft, editor, loadedDraftId]);


    // 2. Auto-Save Content
    useEffect(() => {
        if (activeDraft && debouncedContent && loadedDraftId === activeDraft.id) {
            // Avoid saving if it matches what we loaded (no changes)
            // But checking equality against "what we loaded" is hard if we don't store "original".
            // Store's activeDraft.content might be stale if we haven't saved yet.

            // Just save if it differs from what the STORE thinks is the content?
            if (debouncedContent !== activeDraft.content) {
                setIsSaving(true);
                saveCurrentDraft(debouncedContent).finally(() => setIsSaving(false));
            }
        }
    }, [debouncedContent, activeDraft, saveCurrentDraft, loadedDraftId]);

    // 3. Auto-Save Title
    useEffect(() => {
        if (activeDraft && debouncedTitle && debouncedTitle !== activeDraft.title && loadedDraftId === activeDraft.id) {
            setIsSaving(true);
            updateDraftMetadata(activeDraft.id, { title: debouncedTitle }).finally(() => setIsSaving(false));
        }
    }, [debouncedTitle, activeDraft, updateDraftMetadata, loadedDraftId]);

    // 4. Auto-Save Tags
    useEffect(() => {
        if (activeDraft && loadedDraftId === activeDraft.id) {
            const currentTags = activeDraft.tags || [];
            const newTags = debouncedTags.split(',').map(t => t.trim()).filter(Boolean);

            // Simple array comparison
            const isDifferent = newTags.length !== currentTags.length || !newTags.every((t, i) => t === currentTags[i]);

            if (isDifferent) {
                setIsSaving(true);
                updateDraftMetadata(activeDraft.id, { tags: newTags }).finally(() => setIsSaving(false));
            }
        }
    }, [debouncedTags, activeDraft, updateDraftMetadata, loadedDraftId]);


    if (isLoading && !activeDraft) return <div className="flex h-full items-center justify-center text-gray-500">Loading...</div>;
    if (error) return <div className="flex h-full items-center justify-center text-red-500">Error: {error}</div>;
    if (!activeDraft) return <div className="flex h-full items-center justify-center text-gray-500">Select a draft to start writing.</div>;

    return (
        <div className="flex flex-col h-full bg-[#0d1117] relative">
            {/* Header / Metadata */}
            <div className="shrink-0 px-8 pt-8 pb-4 space-y-4 max-w-4xl mx-auto w-full">

                {/* Title Input */}
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 outline-none font-serif"
                    placeholder="Article Title"
                />

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-sm text-[#8b949e]">
                    <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-full border border-[#30363d] focus-within:border-blue-500/50 transition-colors">
                        <Tag size={14} />
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="bg-transparent outline-none text-gray-300 w-full min-w-[200px]"
                            placeholder="Add tags (comma separated)..."
                        />
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <Clock size={14} />
                        <span>
                            {isSaving ? 'Saving...' : 'Saved'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
                <div className="max-w-4xl mx-auto w-full h-full cursor-text" onClick={() => editor?.commands.focus()}>
                    <EditorContent editor={editor} />
                </div>
            </div>
        </div>
    );
};
