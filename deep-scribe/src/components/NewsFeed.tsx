import { useState } from 'react';
import { Plus, Mic, ArrowUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { MosaicGrid, HeroSpan, LargeSpan, StandardSpan } from './MosaicGrid';
import { MagazineCard } from './MagazineCard';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function NewsFeed({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const [activeTab, setActiveTab] = useState<'All' | 'Tech' | 'Design' | 'Crypto' | 'Culture'>('All');
    const { articles, loading, hasMore, sentinelRef } = useInfiniteScroll(activeTab);

    const categories = ['All', 'Tech', 'Design', 'Crypto', 'Culture'] as const;

    return (
        <div className="w-full h-full bg-surface-100 flex flex-col overflow-hidden relative">

            {/* Scrollable Center Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-vertical">
                <div className="w-full max-w-[1200px] mx-auto pt-8 pb-32 px-6 min-h-full flex flex-col">

                    {/* Filter Tabs (Pills) */}
                    <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={cn(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border font-sans",
                                    activeTab === category
                                        ? "bg-brand-primary text-surface-100 border-brand-primary shadow-sm"
                                        : "bg-surface-200 text-text-secondary border-white/5 hover:bg-surface-300 hover:text-text-primary"
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Editorial Mosaic Grid */}
                    <MosaicGrid>
                        {articles.map((article, index) => {
                            // First article is Hero
                            if (index === 0) {
                                return (
                                    <HeroSpan key={`${article.id}-${index}`}>
                                        <MagazineCard
                                            title={article.title}
                                            excerpt={article.description}
                                            author={article.source.name}
                                            date={new Date(article.publishedAt).toLocaleDateString()}
                                            imageUrl={article.image}
                                            variant="feature"
                                            tags={[activeTab === 'All' ? 'Featured' : activeTab]}
                                        />
                                    </HeroSpan>
                                );
                            }

                            // 2nd and 3rd are Large
                            if (index === 1 || index === 2) {
                                return (
                                    <LargeSpan key={`${article.id}-${index}`}>
                                        <MagazineCard
                                            title={article.title}
                                            excerpt={article.description}
                                            author={article.source.name}
                                            date={new Date(article.publishedAt).toLocaleDateString()}
                                            imageUrl={article.image}
                                            variant="standard"
                                        />
                                    </LargeSpan>
                                )
                            }

                            // Rest are Standard
                            return (
                                <StandardSpan key={`${article.id}-${index}`}>
                                    <MagazineCard
                                        title={article.title}
                                        excerpt={article.description}
                                        author={article.source.name}
                                        date={new Date(article.publishedAt).toLocaleDateString()}
                                        imageUrl={article.image}
                                        variant="standard"
                                        className="min-h-[300px]"
                                    />
                                </StandardSpan>
                            );
                        })}
                    </MosaicGrid>

                    {/* Infinite Scroll Sentinel & Loading State */}
                    <div ref={sentinelRef} className="w-full flex justify-center py-8">
                        {loading && hasMore && (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-brand-primary/50 rounded-full animate-bounce"></div>
                            </div>
                        )}
                        {!hasMore && articles.length > 0 && (
                            <p className="text-text-muted text-sm font-sans">You've reached the end of the line.</p>
                        )}
                    </div>

                </div>
            </div>

            {/* Floating Command Capsule */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
                <div className="bg-surface-200/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center gap-3 transition-all duration-300 focus-within:bg-surface-200/95 focus-within:shadow-[0_15px_50px_rgba(0,0,0,0.6)] focus-within:border-brand-primary/30 group">

                    {/* Left Action: Add Context */}
                    <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-brand-primary hover:bg-white/5 transition-colors shrink-0">
                        <Plus className="w-5 h-5" />
                    </button>

                    {/* Center Input */}
                    <input
                        type="text"
                        placeholder="Ask Deep Scribe anything..."
                        className="flex-1 bg-transparent border-none text-text-primary text-base placeholder:text-text-muted focus:outline-none py-2 font-sans"
                    />

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-brand-primary hover:bg-white/5 transition-colors">
                            <Mic className="w-5 h-5" />
                        </button>
                        <button className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-primary text-surface-100 hover:bg-brand-accent transition-colors">
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
