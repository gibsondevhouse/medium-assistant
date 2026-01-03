import React, { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { Markdown } from 'tiptap-markdown';
import { useDraftStore } from '../../store/draftStore';
import { Save, Tag, Clock, Download, Loader2, Send, ExternalLink, ChevronDown, FileText, FileJson, FileType } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

export const Editor: React.FC = () => {
    const { activeDraft, saveCurrentDraft, updateDraftMetadata, isLoading, error } = useDraftStore();

    // Local state for metadata inputs to avoid jitter
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState(''); // Comma separated string for editing
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

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

    // Publish to Medium handler
    const handlePublishToMedium = async () => {
        if (!editor || !activeDraft) return;

        // Check if Medium token is configured
        const hasToken = await window.electronAPI.settings.hasMediumToken();
        if (!hasToken) {
            alert('Please configure your Medium Integration Token in Settings first.');
            return;
        }

        const confirmPublish = confirm(
            'This will publish your article as a draft on Medium. Continue?'
        );
        if (!confirmPublish) return;

        setIsPublishing(true);
        setPublishedUrl(null);

        try {
            const htmlContent = editor.getHTML();
            const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean);

            const result = await window.electronAPI.medium.publish(
                title || 'Untitled',
                htmlContent,
                currentTags,
                'draft' // Always publish as draft first for safety
            );

            if (result.success && result.url) {
                setPublishedUrl(result.url);
                alert(`Published successfully! Opening Medium...`);
                window.electronAPI.openExternal(result.url);
            } else {
                alert(`Publish failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Publish error:', error);
            alert('Failed to publish to Medium');
        } finally {
            setIsPublishing(false);
        }
    };

    // PDF Export handler
    const handleExportPDF = async () => {
        if (!editor || !activeDraft) return;

        setIsExporting(true);
        setShowExportMenu(false);
        try {
            // Get HTML content from editor
            const htmlContent = editor.getHTML();
            const result = await window.electronAPI.drafts.exportToPDF(title || 'Untitled', htmlContent);

            if (!result.success && result.error !== 'Export cancelled') {
                console.error('PDF Export failed:', result.error);
                alert(`Export failed: ${result.error}`);
            }
        } catch (error) {
            console.error('PDF Export error:', error);
            alert('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    // HTML Export handler
    const handleExportHTML = () => {
        if (!editor || !activeDraft) return;

        setShowExportMenu(false);
        const htmlContent = editor.getHTML();
        const sanitizedTitle = (title || 'Untitled').replace(/[^a-zA-Z0-9\s-]/g, '').trim();

        // Create full HTML document with styling
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sanitizedTitle}</title>
    <style>
        body {
            font-family: Georgia, 'Times New Roman', serif;
            line-height: 1.8;
            color: #1a1a1a;
            max-width: 700px;
            margin: 0 auto;
            padding: 60px 40px;
        }
        h1 { font-size: 2.5em; font-weight: 700; margin-bottom: 0.5em; }
        h2 { font-size: 1.75em; margin-top: 1.5em; }
        h3 { font-size: 1.25em; margin-top: 1.25em; }
        p { margin-bottom: 1.25em; }
        blockquote { border-left: 4px solid #e5e5e5; padding-left: 1em; margin-left: 0; color: #666; font-style: italic; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
        pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>${sanitizedTitle}</h1>
    ${htmlContent}
</body>
</html>`;

        // Create blob and download
        const blob = new Blob([fullHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizedTitle}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // JSON Export handler
    const handleExportJSON = () => {
        if (!editor || !activeDraft) return;

        setShowExportMenu(false);
        const htmlContent = editor.getHTML();
        const markdownContent = (editor.storage as any).markdown.getMarkdown();
        const currentTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        const sanitizedTitle = (title || 'Untitled').replace(/[^a-zA-Z0-9\s-]/g, '').trim();

        const exportData = {
            title: title || 'Untitled',
            tags: currentTags,
            content: {
                markdown: markdownContent,
                html: htmlContent
            },
            metadata: {
                id: activeDraft.id,
                exportedAt: new Date().toISOString(),
                version: activeDraft.version || 1
            }
        };

        // Create blob and download
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sanitizedTitle}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

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

                    {/* Export Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-[#8b949e] hover:text-white hover:bg-[#30363d]/50 transition-all disabled:opacity-50"
                            title="Export options"
                        >
                            {isExporting ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <Download size={14} />
                            )}
                            <span>Export</span>
                            <ChevronDown size={12} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showExportMenu && (
                            <>
                                {/* Backdrop to close menu */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowExportMenu(false)}
                                />
                                {/* Dropdown menu */}
                                <div className="absolute top-full right-0 mt-1 w-44 bg-[#161b22] border border-[#30363d] rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                                    <button
                                        onClick={handleExportPDF}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b949e] hover:text-white hover:bg-[#30363d]/50 transition-colors"
                                    >
                                        <FileType size={16} />
                                        <span>Export as PDF</span>
                                    </button>
                                    <button
                                        onClick={handleExportHTML}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b949e] hover:text-white hover:bg-[#30363d]/50 transition-colors"
                                    >
                                        <FileText size={16} />
                                        <span>Export as HTML</span>
                                    </button>
                                    <button
                                        onClick={handleExportJSON}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#8b949e] hover:text-white hover:bg-[#30363d]/50 transition-colors"
                                    >
                                        <FileJson size={16} />
                                        <span>Export as JSON</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Publish to Medium Button */}
                    <button
                        onClick={handlePublishToMedium}
                        disabled={isPublishing}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 transition-all disabled:opacity-50"
                        title="Publish to Medium"
                    >
                        {isPublishing ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : publishedUrl ? (
                            <ExternalLink size={14} />
                        ) : (
                            <Send size={14} />
                        )}
                        <span>{publishedUrl ? 'Published' : 'Medium'}</span>
                    </button>
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
