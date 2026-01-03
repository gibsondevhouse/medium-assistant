import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Bookmark, Share2, Plus, Mic, ArrowUp } from 'lucide-react'; // Removing unused import
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { ArticleCard } from '../types/articles';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function NewsFeed({ onOpenSettings }: { onOpenSettings: () => void }) {
    const [activeTab, setActiveTab] = useState<'All' | 'Tech' | 'Design' | 'Crypto' | 'Culture'>('All');
    const [hasKey, setHasKey] = useState<boolean | null>(null);

    // Using the custom hook for infinite scroll data
    // We conditionally allow fetching only if we think we might have a key, 
    // but hooks can't be conditional. Ideally useInfiniteScroll should handle "skip".
    // For now we'll let it run, it will likely fail silently or we ignore it if !hasKey.
    const { articles, loading, hasMore, sentinelRef } = useInfiniteScroll();

    useEffect(() => {
        // Check for GNews key
        if (window.electronAPI?.settings) {
            window.electronAPI.settings.getGNewsKey().then(key => {
                setHasKey(!!key);
            });
        }
    }, []);

    const categories = ['All', 'Tech', 'Design', 'Crypto', 'Culture'] as const;

    // Helper to get span classes based on card type
    const getCardSpanClass = (type: ArticleCard['cardType']) => {
        switch (type) {
            case 'hero':
                return 'md:col-span-2 md:row-span-2 min-h-[500px]';
            case 'sub-hero':
                return 'col-span-1 row-span-1 min-h-[300px]';
            case 'basic':
            default:
                return 'col-span-1 min-h-[200px]';
        }
    };

    if (hasKey === false) {
        return (
            <div className="w-full h-full bg-[#0f111a] flex flex-col items-center justify-center p-8 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                        <Bookmark className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Latest News</h2>
                    <p className="text-gray-400">
                        Connect your GNews API key to see the latest articles in Tech, Design, and Crypto.
                    </p>
                    <button
                        onClick={onOpenSettings}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                    >
                        Configure GNews Key
                    </button>
                    <p className="text-xs text-zinc-600 pt-4">
                        Don't have a key? <a href="#" className="underline hover:text-zinc-400">Get one here</a>.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-[#0f111a] flex flex-col overflow-hidden relative">

            {/* Scrollable Center Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-vertical">
                <div className="w-full max-w-[900px] mx-auto pt-8 pb-32 px-6 min-h-full flex flex-col">

                    {/* Filter Tabs (Pills) */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                                    activeTab === category
                                        ? "bg-white text-black border-white shadow-sm"
                                        : "bg-transparent text-[#8b949e] border-[#30363d] hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Masonry Grid Feed */}
                    <div className="grid gap-6 pb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gridAutoRows: '200px' }}>
                        {articles.map((article, index) => (
                            <article
                                key={`${article.id}-${index}`} // Using composite key to ensure uniqueness if needed
                                className={cn(
                                    "group relative rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d] hover:border-gray-500 transition-all duration-300 cursor-pointer shadow-lg w-full",
                                    getCardSpanClass(article.cardType)
                                )}
                                style={{
                                    animation: `fadeInFromBottom 0.6s ease-out forwards`,
                                    animationDelay: `${(index % 21) * 0.05}s`, // Stagger based on position in batch
                                    opacity: 0, // Start hidden for animation
                                }}
                            >
                                {/* Full Bleed Image (for Hero and Sub-Hero mostly, but applied to all for consistency in this design) */}
                                <div className="absolute inset-0">
                                    <img
                                        src={article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80'}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80'; // Fallback
                                        }}
                                    />
                                    {/* Gradient Scrim Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                                </div>

                                {/* Content Overlay */}
                                <div className="relative h-full flex flex-col justify-end p-6 z-10 gap-2">

                                    {/* Author & Meta */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-semibold text-white/90 tracking-wide uppercase">{article.source.name}</span>
                                        <span className="text-[11px] text-gray-400">• {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className={cn(
                                        "font-bold text-white leading-tight drop-shadow-sm",
                                        article.cardType === 'hero' ? "text-3xl md:text-4xl" : "text-xl"
                                    )} style={{ fontFamily: '"Playfair Display", serif' }}>
                                        {article.title}
                                    </h2>

                                    {/* Preview (Shown mostly on Hero/Sub-hero) */}
                                    {article.cardType !== 'basic' && (
                                        <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 opacity-90">
                                            {article.description}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                        <div className="flex items-center gap-4 text-gray-300">
                                            <button className="flex items-center gap-1.5 hover:text-white transition-colors group/btn">
                                                <Heart className="w-4 h-4 group-hover/btn:fill-white/20" />
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <button className="hover:text-white"><Bookmark className="w-4 h-4" /></button>
                                            <button className="hover:text-white"><Share2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>

                            </article>
                        ))}
                    </div>

                    {/* Infinite Scroll Sentinel & Loading State */}
                    <div ref={sentinelRef} className="w-full flex justify-center py-8">
                        {loading && hasMore && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                            </div>
                        )}
                        {!hasMore && articles.length > 0 && (
                            <p className="text-gray-500 text-sm">You've reached the end of the feed.</p>
                        )}
                    </div>

                </div>
            </div>

            {/* Floating Command Capsule */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
                <div className="bg-[#1e1e1e]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center gap-3 transition-all duration-300 focus-within:bg-[#1e1e1e]/95 focus-within:shadow-[0_15px_50px_rgba(0,0,0,0.6)] focus-within:border-white/20 group">

                    {/* Left Action: Add Context */}
                    <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#a1a1a1] hover:text-white hover:bg-white/10 transition-colors shrink-0">
                        <Plus className="w-5 h-5" />
                    </button>

                    {/* Center Input */}
                    <input
                        type="text"
                        placeholder="Ask anything..."
                        className="flex-1 bg-transparent border-none text-white text-base placeholder:text-[#a1a1a1] focus:outline-none py-2"
                    />

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#a1a1a1] hover:text-white hover:bg-white/10 transition-colors">
                            <Mic className="w-5 h-5" />
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors">
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>

                </div>
            </div>


            <style>{`
                @keyframes fadeInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>

        </div>
    );
}
