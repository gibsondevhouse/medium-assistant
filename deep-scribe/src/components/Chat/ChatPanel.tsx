import React, { useRef, useEffect, useState } from 'react';
import { Send, Bot, User, Trash2, StopCircle } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export const ChatPanel: React.FC = () => {
    const { messages, isLoading, error, sendMessage, clearMessages } = useChatStore();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const text = input;
        setInput('');
        await sendMessage(text);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] border-l border-[#30363d]/30">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]/50 bg-[#0d1117]">
                <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Editor Bot</h3>
                </div>
                <button
                    onClick={clearMessages}
                    className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                    title="Clear Chat"
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center mt-10 space-y-2">
                        <div className="w-10 h-10 bg-[#161b22] rounded-full flex items-center justify-center mx-auto border border-[#30363d]">
                            <Bot className="w-5 h-5 text-gray-500" />
                        </div>
                        <p className="text-xs text-gray-500 max-w-[200px] mx-auto">
                            I can help you edit, summarize, or expand on your current draft.
                        </p>
                    </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            msg.role === 'user' ? 'bg-blue-600' : 'bg-[#1e1e1e] border border-[#30363d]'
                        }`}>
                            {msg.role === 'user' ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-blue-400" />}
                        </div>
                        <div className={`flex-1 text-sm leading-relaxed p-3 rounded-lg ${
                            msg.role === 'user'
                                ? 'bg-blue-600/10 text-blue-100 border border-blue-600/20'
                                : 'bg-[#161b22] text-gray-300 border border-[#30363d]'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#1e1e1e] border border-[#30363d] flex items-center justify-center shrink-0">
                            <Bot className="w-3 h-3 text-blue-400" />
                        </div>
                        <div className="bg-[#161b22] px-3 py-2 rounded-lg border border-[#30363d] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/20 text-center">
                        {error}
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#30363d]/50 bg-[#0d1117]">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask for feedback..."
                        className="w-full bg-[#161b22] text-white text-sm rounded-lg pl-3 pr-10 py-3 border border-[#30363d] focus:border-blue-500/50 focus:outline-none resize-none min-h-[44px] max-h-[120px] scrollbar-hide"
                        rows={1}
                        style={{ height: 'auto', minHeight: '44px' }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 bottom-2 p-1.5 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                    >
                        {isLoading ? <StopCircle className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
