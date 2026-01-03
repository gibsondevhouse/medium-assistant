export interface Draft {
    id: string; // Filename without extension
    title: string;
    tags: string[];
    version: number;
    lastModified: number;
    preview: string;
    filepath: string;
    content?: string; // Optional because metadata listing doesn't include full content
}

export interface DraftStore {
    drafts: Draft[];
    activeDraft: Draft | null;
    isLoading: boolean;
    error: string | null;

    loadDrafts: () => Promise<void>;
    selectDraft: (id: string) => Promise<void>;
    createNewDraft: (title?: string, initialContent?: string, tags?: string[]) => Promise<void>;
    saveCurrentDraft: (content: string) => Promise<void>;
    updateDraftMetadata: (id: string, metadata: Partial<Draft>) => Promise<void>;
    deleteDraft: (id: string) => Promise<void>;
}
