import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Bookmark, Plus, Mic, ArrowUp, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MosaicGrid } from '../ui/MosaicGrid';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MediumArticle {
  id: string;
  title: string;
  description: string;
  author: string;
  authorImage?: string;
  publishedAt: string;
  readTime: number;
  claps: number;
  url: string;
  image?: string;
  tags: string[];
  cardType?: 'hero' | 'sub-hero' | 'basic';
}

interface ArticlesFeedProps {
  onOpenSettings: () => void;
}

export function ArticlesFeed({ onOpenSettings }: ArticlesFeedProps) {
  const [displayedArticles, setDisplayedArticles] = useState<MediumArticle[]>([]);
  const [allArticles, setAllArticles] = useState<MediumArticle[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [rssUrl, setRssUrl] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 8;

  // Load configured RSS URL on mount
  useEffect(() => {
    async function loadSettings() {
      if (window.electronAPI?.settings) {
        try {
          const url = await window.electronAPI.settings.getRssUrl();
          setRssUrl(url);
          loadArticles(url);
        } catch (e) {
          console.error("Failed to load RSS URL:", e);
        }
      }
    }
    loadSettings();
  }, []);

  const loadArticles = async (url: string) => {
    setIsLoading(true);
    try {
      if (!url) return;

      const result = await window.electronAPI.rss.fetch(url);
      if (result.success && result.feed) {
        const mappedArticles: MediumArticle[] = result.feed.items.map((item: any, index: number) => {
          const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
          const image = imgMatch ? imgMatch[1] : undefined;
          const tags = item.categories || ['Tech', 'Medium'];

          return {
            id: item.guid || item.id || `rss-${index}`,
            title: item.title || 'Untitled',
            description: item.contentSnippet || item.summary || '',
            author: item.creator || result.feed.title || 'Medium',
            authorImage: undefined,
            publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
            readTime: 5,
            claps: 0,
            url: item.link || '#',
            image: image,
            tags: tags,
            cardType: 'basic'
          };
        });

        setAllArticles(mappedArticles);
        // Initial Page
        setDisplayedArticles(mappedArticles.slice(0, ITEMS_PER_PAGE));
        setPage(1);

      } else {
        console.error("RSS Fetch Failed:", result.error);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive the source list based on active filter
  const sourceArticles = React.useMemo(() => {
    if (activeTag) {
      return allArticles.filter(article => article.tags.includes(activeTag));
    }
    return allArticles;
  }, [activeTag, allArticles]);

  // Intersection Observer for Client-Side Pagination
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && sourceArticles.length > displayedArticles.length) {
          setIsLoading(true);
          // Simulate small network delay for UX
          setTimeout(() => {
            const nextPage = page + 1;
            const nextBatch = sourceArticles.slice(0, nextPage * ITEMS_PER_PAGE);
            setDisplayedArticles(nextBatch);
            setPage(nextPage);
            setIsLoading(false);
          }, 600);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, sourceArticles, displayedArticles, page]);

  // Get all unique tags from ALL articles
  const allTags = Array.from(
    new Set(allArticles.flatMap(article => article.tags))
  ).sort();

  // Limit visual tags to stop "too plentiful"
  const visibleTags = allTags.slice(0, 10);

  // Update filtered articles when activeTag changes
  useEffect(() => {
    // When tag changes, reset pagination and load first batch of the NEW source
    setPage(1);
    setDisplayedArticles(sourceArticles.slice(0, ITEMS_PER_PAGE));
  }, [sourceArticles]); // Depend on sourceArticles (which changes with activeTag)

  // Map articles with animation timing and calculate Display Card Type
  const articlesWithAnimation = displayedArticles.map((article, index) => ({
    article: {
      ...article,
      cardType: index === 0 ? 'hero' : index === 1 ? 'sub-hero' : 'basic'
    } as MediumArticle,
    delay: (index % ITEMS_PER_PAGE) * 30 // Stagger animation for each batch
  }));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full h-full bg-[#0f111a] flex flex-col">
      {/* Scrollable Feed Container */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto custom-scrollbar-vertical">
        <div className="w-full px-6 pt-8 pb-32">
          <div className="w-full max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                Medium Articles
              </h1>
              <p className="text-gray-400 mb-6">Curated from {rssUrl || 'your feed'} • {allArticles.length} recent stories</p>
            </div>

            {/* Tag Filter Pills - Hidden scrollbar */}
            <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setActiveTag(null)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                  !activeTag
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-transparent text-[#8b949e] border-[#30363d] hover:bg-white/10 hover:text-white"
                )}
              >
                All Articles
              </button>
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                    activeTag === tag
                      ? "bg-white text-black border-white shadow-sm"
                      : "bg-transparent text-[#8b949e] border-[#30363d] hover:bg-white/10 hover:text-white"
                  )}
                >
                  {tag}
                </button>
              ))}
              {/* Empty "Add" Pill */}
              <button
                onClick={onOpenSettings} /* Assuming settings is where they manage feeds/tags */
                className="w-9 h-9 rounded-full border border-[#30363d] bg-transparent text-[#8b949e] hover:bg-white/10 hover:text-white hover:border-white transition-all flex items-center justify-center shrink-0"
                title="Manage Topics"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Editorial Mosaic Grid */}
            <MosaicGrid
              items={articlesWithAnimation}
              keyExtractor={(item) => item.article.id}
              pattern="editorial"
              renderItem={({ article, delay }, index, spanClass) => (
                <article
                  className={cn(
                    "group relative bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden hover:border-blue-500/50 transition-all duration-500 cursor-pointer flex flex-col",
                    "animate-fade-up",
                    spanClass
                  )}
                  style={{
                    animation: `fadeInUp 0.6s ease-out forwards`,
                    animationDelay: `${delay}ms`,
                    opacity: 0
                  }}
                >
                  {/* Image Background */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%)'
                  }}>
                    {article.image ? (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                    )}
                  </div>

                  {/* Content Overlay */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-4 gap-2">
                    {/* Title */}
                    <h3 className={cn(
                      "font-bold leading-tight transition-colors text-white drop-shadow group-hover:text-blue-200 line-clamp-3",
                      index === 0 ? 'text-3xl md:text-4xl' : index === 1 ? 'text-2xl' : 'text-lg'
                    )} style={{ fontFamily: '"Playfair Display", serif' }}>
                      {article.title}
                    </h3>

                    {/* Description (on hero/sub-hero cards) */}
                    {(index === 0 || index === 1) && (
                      <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 opacity-90">
                        {article.description}
                      </p>
                    )}

                    {/* Meta Footer */}
                    <div className="space-y-2">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-full transition-colors bg-white/10 text-white/90 hover:bg-white/20 drop-shadow"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {article.authorImage && (
                            <img
                              src={article.authorImage}
                              alt={article.author}
                              className="w-5 h-5 rounded-full object-cover border border-white/20"
                            />
                          )}
                          <span className="text-white/90 drop-shadow">
                            {article.author}
                          </span>
                        </div>
                        <span className="text-white/70 drop-shadow">
                          {formatDate(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Action Buttons */}
                  <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-lg transition-colors bg-black/50 text-white hover:bg-black/80 drop-shadow"
                      title="Open on Medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button className="p-2 rounded-lg transition-colors bg-black/50 text-white hover:bg-black/80 drop-shadow">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              )}
            />

            {/* Pagination Sentinel & Loading State */}
            <div ref={sentinelRef} className="w-full flex justify-center py-8 min-h-[50px]">
              {isLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                </div>
              )}
              {!isLoading && displayedArticles.length > 0 && displayedArticles.length >= sourceArticles.length && (
                <p className="text-gray-500 text-sm">You've reached the end of the list.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
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
      {/* Floating Command Capsule (Search) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
        <div className="bg-[#1e1e1e]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center gap-3 transition-all duration-300 focus-within:bg-[#1e1e1e]/95 focus-within:shadow-[0_15px_50px_rgba(0,0,0,0.6)] focus-within:border-white/20">
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#a1a1a1] hover:text-white hover:bg-white/10 transition-colors shrink-0">
            <Plus className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Search articles..."
            className="flex-1 bg-transparent border-none text-white text-base placeholder:text-[#a1a1a1] focus:outline-none py-2"
          />
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
    </div >
  );
}
