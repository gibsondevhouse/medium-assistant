import React, { useRef, useEffect } from 'react';
import { ApiKeyInput } from './ApiKeyInput';
import { ChevronLeft, ChevronRight, Sparkles, Box, Search, Zap, Globe, Cpu } from 'lucide-react';

interface ProviderCarouselProps {
    activeProvider: string;
    setActiveProvider: (provider: string) => void;
    // Key props
    keys: {
        gemini?: string;
        anthropic?: string;
        deepseek?: string;
        perplexity?: string;
        openai?: string;
        openrouter?: string;
    };
    saveHandlers: {
        gemini: (key: string) => Promise<void>;
        anthropic: (key: string) => Promise<void>;
        deepseek: (key: string) => Promise<void>;
        perplexity: (key: string) => Promise<void>;
        openai: (key: string) => Promise<void>;
        openrouter: (key: string) => Promise<void>;
    };
    testHandlers?: {
        gemini?: () => void;
    };
    loading: boolean;
}

const PROVIDERS = [
    {
        id: 'gemini',
        name: 'Google Gemini',
        icon: Sparkles,
        description: 'Multimodal AI by Google. Best for large context and speed.',
        color: 'from-blue-500/20 to-purple-500/20',
        borderColor: 'border-blue-500/30',
        activeColor: 'text-blue-400',
        getKeyUrl: 'https://aistudio.google.com/app/apikey',
        placeholder: 'AIzaSy...'
    },
    {
        id: 'anthropic',
        name: 'Anthropic Claude',
        icon: Box,
        description: 'Advanced reasoning and coding capabilities.',
        color: 'from-orange-500/20 to-amber-500/20',
        borderColor: 'border-orange-500/30',
        activeColor: 'text-orange-400',
        getKeyUrl: 'https://console.anthropic.com/',
        placeholder: 'sk-ant...'
    },
    {
        id: 'openai',
        name: 'OpenAI GPT-4',
        icon: Zap,
        description: 'The industry standard for reasoning and creativity.',
        color: 'from-green-500/20 to-emerald-500/20',
        borderColor: 'border-green-500/30',
        activeColor: 'text-green-400',
        getKeyUrl: 'https://platform.openai.com/api-keys',
        placeholder: 'sk-...'
    },
    {
        id: 'deepseek',
        name: 'DeepSeek',
        icon: Cpu,
        description: 'Strong coding performance and open weights.',
        color: 'from-cyan-500/20 to-blue-500/20',
        borderColor: 'border-cyan-500/30',
        activeColor: 'text-cyan-400',
        getKeyUrl: 'https://platform.deepseek.com/',
        placeholder: 'sk-...'
    },
    {
        id: 'perplexity',
        name: 'Perplexity',
        icon: Search,
        description: 'Real-time web search and answer synthesis.',
        color: 'from-teal-500/20 to-cyan-500/20',
        borderColor: 'border-teal-500/30',
        activeColor: 'text-teal-400',
        getKeyUrl: 'https://www.perplexity.ai/settings/api',
        placeholder: 'pplx-...'
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        icon: Globe,
        description: 'Unified interface for all top LLMs.',
        color: 'from-violet-500/20 to-indigo-500/20',
        borderColor: 'border-violet-500/30',
        activeColor: 'text-violet-400',
        getKeyUrl: 'https://openrouter.ai/keys',
        placeholder: 'sk-or-...'
    }
];

export const ProviderCarousel: React.FC<ProviderCarouselProps> = ({
    activeProvider,
    setActiveProvider,
    keys,
    saveHandlers,
    testHandlers,
    loading
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Scroll to active provider when it changes
    useEffect(() => {
        const activeCard = cardRefs.current[activeProvider];
        if (activeCard && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const containerWidth = container.offsetWidth;
            const cardLeft = activeCard.offsetLeft;
            const cardWidth = activeCard.offsetWidth;

            // Center the active card
            const scrollTo = cardLeft - (containerWidth / 2) + (cardWidth / 2);

            container.scrollTo({
                left: scrollTo,
                behavior: 'smooth'
            });
        }
    }, [activeProvider]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400; // Approx card width + gap
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group">
            {/* Scroll Controls */}
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-[#161b22] border border-[#30363d] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500/50 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>
            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-[#161b22] border border-[#30363d] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:border-blue-500/50 transition-all opacity-0 group-hover:opacity-100 shadow-xl"
            >
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-6 pt-2 px-1 snap-xSnap-mandatory scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#30363d] snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar for cleaner look
            >
                {PROVIDERS.map((provider) => {
                    const isActive = activeProvider === provider.id;
                    const Icon = provider.icon;
                    return (
                        <div
                            key={provider.id}
                            ref={el => cardRefs.current[provider.id] = el}
                            onClick={() => setActiveProvider(provider.id)}
                            className={`
                                relative min-w-[350px] w-[350px] p-6 rounded-xl border transition-all duration-300 cursor-pointer snap-center flex flex-col
                                ${isActive
                                    ? `bg-[#161b22] ${provider.borderColor} shadow-lg shadow-black/40 scale-100`
                                    : 'bg-[#0d1117] border-[#30363d] hover:border-[#8b949e]/50 opacity-60 hover:opacity-100 scale-95'
                                }
                            `}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-gradient-to-br ${provider.color}`}>
                                    <Icon className={`w-6 h-6 ${provider.activeColor}`} />
                                </div>
                                {isActive && (
                                    <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium animate-pulse">
                                        Active
                                    </span>
                                )}
                            </div>

                            <h3 className={`text-lg font-bold mb-1 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                {provider.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 h-10 leading-snug">
                                {provider.description}
                            </p>

                            {/* Input Area - Only fully interactive if active to prevent accidents, but readable always */}
                            <div className={`mt-auto transition-opacity ${isActive ? 'opacity-100' : 'pointer-events-none'}`}>
                                <ApiKeyInput
                                    label="API Key"
                                    placeholder={provider.placeholder}
                                    currentValue={keys[provider.id as keyof typeof keys]}
                                    getKeyUrl={provider.getKeyUrl}
                                    onSave={saveHandlers[provider.id as keyof typeof saveHandlers]}
                                    isLoading={loading}
                                />
                                {provider.id === 'gemini' && isActive && testHandlers?.gemini && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            testHandlers.gemini!();
                                        }}
                                        className="mt-3 w-full py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium border border-blue-500/20 transition-all"
                                    >
                                        Test Connection
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
