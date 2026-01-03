import { create } from 'zustand';
import { aiRouter } from '../services/ai-router';
import { useDraftStore } from './draftStore';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface ChatStore {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;

    sendMessage: (content: string) => Promise<void>;
    clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    sendMessage: async (content: string) => {
        const { messages } = get();
        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: Date.now(),
        };

        set({ messages: [...messages, newMessage], isLoading: true, error: null });

        try {
            // Get context from active draft
            const { activeDraft } = useDraftStore.getState();
            let context = '';
            if (activeDraft) {
                // Remove HTML tags for cleaner context (optional, but good for token saving)
                // For now, raw content is fine as LLMs handle HTML well.
                context = `\n\nCONTEXT - CURRENT DRAFT:\nTitle: ${activeDraft.title}\nContent: ${activeDraft.content || '(Empty)'}`;
            }

            const prompt = `You are an intelligent writing assistant and editor.
            Help the user with their writing task.
            Be concise, constructive, and encouraging.
            ${context}

            USER QUERY: ${content}`;

            // Get model from settings (Gemini-only now)
            const storedSettings = localStorage.getItem('deep-scribe-settings');
            let model = 'gemini-2.5-flash';

            if (storedSettings) {
                const parsed = JSON.parse(storedSettings);
                if (parsed.research?.model) model = parsed.research.model;
            }

            const result = await aiRouter.generateContent(prompt, model);

            if (result.success && result.content) {
                const reply: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: result.content,
                    timestamp: Date.now(),
                };
                set(state => ({ messages: [...state.messages, reply], isLoading: false }));
            } else {
                set({ error: result.error || 'Failed to generate response', isLoading: false });
            }

        } catch (e: any) {
            set({ error: e.message, isLoading: false });
        }
    },

    clearMessages: () => set({ messages: [], error: null }),
}));
