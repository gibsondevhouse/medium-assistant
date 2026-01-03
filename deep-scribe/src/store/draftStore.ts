import { create } from 'zustand';
import { Draft, DraftStore } from '../types/draft';

// @ts-ignore
const electron = window.electronAPI;

export const useDraftStore = create<DraftStore>((set, get) => ({
    drafts: [],
    activeDraft: null,
    isLoading: false,
    error: null,

    loadDrafts: async () => {
        set({ isLoading: true, error: null });
        try {
            const drafts = await electron.drafts.list();
            set({ drafts, isLoading: false });
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    selectDraft: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const result = await electron.drafts.read(id);
            if (result) {
                // Find metadata to merge
                const metadata = get().drafts.find(d => d.id === id);
                set({
                    activeDraft: {
                        ...metadata,
                        ...result
                    } as Draft,
                    isLoading: false
                });
            } else {
                set({ error: 'Draft not found', isLoading: false });
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    createNewDraft: async (title: string = 'Untitled Draft') => {
        set({ isLoading: true, error: null });
        try {
            const newDraftMeta = await electron.drafts.create(title);
            if (newDraftMeta) {
                // Refresh list
                await get().loadDrafts();
                // Select it
                await get().selectDraft(newDraftMeta.id);
            }
        } catch (err: any) {
            set({ error: err.message, isLoading: false });
        }
    },

    saveCurrentDraft: async (content: string) => {
        const { activeDraft } = get();
        if (!activeDraft) return;

        try {
            await electron.drafts.save(activeDraft.id, content);
            // Reload metadata to capture updated lastModified or version if backend handles it
            await get().loadDrafts();

            // Update active draft content in store
            set(state => ({
                activeDraft: state.activeDraft ? { ...state.activeDraft, content } : null
            }));
        } catch (err: any) {
            console.error(err);
            set({ error: err.message });
        }
    },

    updateDraftMetadata: async (id: string, metadata: Partial<Draft>) => {
        try {
            const success = await electron.drafts.updateMetadata(id, metadata);
            if (success) {
                await get().loadDrafts();
                const { activeDraft } = get();
                if (activeDraft && activeDraft.id === id) {
                    set({
                        activeDraft: {
                            ...activeDraft,
                            ...metadata
                        }
                    });
                }
            }
        } catch (err: any) {
            set({ error: err.message });
        }
    },

    deleteDraft: async (id: string) => {
        try {
            const success = await electron.drafts.delete(id);
            if (success) {
                if (get().activeDraft?.id === id) {
                    set({ activeDraft: null });
                }
                await get().loadDrafts();
            }
        } catch (err: any) {
            set({ error: err.message });
        }
    }
}));
