/**
 * Chat with Notes Component
 * RAG-powered chat interface for querying the knowledge base
 */

import { useState, useRef, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Loader2,
    Database,
    FileText,
    Trash2,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';
import { useKnowledgeBaseStore, KBChatMessage } from '../../store/knowledgeBaseStore';

interface ChatWithNotesProps {
    className?: string;
    onOpenSettings?: () => void;
    navigateToTab?: (tabId: string) => void;
}

export function ChatWithNotes({ className = '', onOpenSettings, navigateToTab }: ChatWithNotesProps) {
    const [input, setInput] = useState('');
    const [expandedSources, setExpandedSources] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const {
        chatMessages,
        isChatLoading,
        totalDocuments,
        sendChatMessage,
        clearChat,
        loadStats,
        error
    } = useKnowledgeBaseStore();

    // Load stats on mount
    useEffect(() => {
        loadStats();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Handle send message
    const handleSend = async () => {
        if (!input.trim() || isChatLoading) return;

        const message = input.trim();
        setInput('');
        await sendChatMessage(message);
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Toggle sources expansion
    const toggleSources = (messageId: string) => {
        setExpandedSources(expandedSources === messageId ? null : messageId);
    };

    // Render a chat message
    const renderMessage = (message: KBChatMessage) => {
        const isUser = message.role === 'user';

        return (
            <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
                <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-[#1c1c1e] border border-[#333] text-gray-200'
                    }`}
                >
                    {/* Message content */}
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                    </div>

                    {/* Sources (for assistant messages) */}
                    {!isUser && message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-[#333]">
                            <button
                                onClick={() => toggleSources(message.id)}
                                className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-white transition-colors"
                            >
                                <FileText className="w-3 h-3" />
                                <span>{message.sources.length} source(s) used</span>
                                {expandedSources === message.id ? (
                                    <ChevronUp className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                            </button>

                            {expandedSources === message.id && (
                                <div className="mt-2 space-y-1">
                                    {message.sources.map((source, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between text-xs bg-[#0d1117] rounded px-2 py-1"
                                        >
                                            <span className="text-gray-300 truncate">
                                                {source.title}
                                            </span>
                                            <span className="text-[#8b949e] ml-2">
                                                {Math.round(source.relevance * 100)}% match
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-full bg-[#0a0a0a] ${className}`}>
            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b border-[#333] bg-[#161618]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                            <MessageSquare className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Chat with Notes</h2>
                            <p className="text-xs text-[#8b949e]">
                                {totalDocuments > 0
                                    ? `${totalDocuments} notes in your knowledge base`
                                    : 'Save research to start chatting'}
                            </p>
                        </div>
                    </div>

                    {chatMessages.length > 0 && (
                        <button
                            onClick={clearChat}
                            className="p-2 text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Clear chat"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6">
                {chatMessages.length === 0 ? (
                    // Empty state
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/20">
                            <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Ask about your research
                        </h3>
                        <p className="text-sm text-[#8b949e] max-w-sm mb-6">
                            {totalDocuments > 0
                                ? 'Your knowledge base is ready. Ask questions about your saved research notes.'
                                : 'Save research reports to your knowledge base first, then come back to chat with your notes.'}
                        </p>

                        {totalDocuments > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['What have I researched?', 'Summarize my notes', 'Key findings?'].map(
                                    (suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => {
                                                setInput(suggestion);
                                                inputRef.current?.focus();
                                            }}
                                            className="px-3 py-1.5 text-xs bg-[#1c1c1e] border border-[#333] rounded-full text-[#8b949e] hover:text-white hover:border-purple-500/30 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // Chat messages
                    <div className="space-y-4">
                        {chatMessages.map(renderMessage)}

                        {/* Loading indicator */}
                        {isChatLoading && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-[#1c1c1e] border border-[#333] rounded-2xl px-4 py-3 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                    <span className="text-sm text-[#8b949e]">Searching notes...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Error display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                        {error}
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="shrink-0 p-4 border-t border-[#333] bg-[#161618]">
                <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={
                                totalDocuments > 0
                                    ? 'Ask about your research notes...'
                                    : 'Save research to knowledge base first...'
                            }
                            disabled={totalDocuments === 0 || isChatLoading}
                            rows={1}
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-white placeholder-[#8b949e] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                        />
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isChatLoading || totalDocuments === 0}
                        className="p-3 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
                    >
                        {isChatLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Knowledge base status */}
                <div className="mt-2 flex items-center gap-2 text-xs text-[#8b949e]">
                    <Database className="w-3 h-3" />
                    <span>
                        {totalDocuments > 0
                            ? `Searching across ${totalDocuments} notes`
                            : 'No notes in knowledge base'}
                    </span>
                </div>
            </div>
        </div>
    );
}
