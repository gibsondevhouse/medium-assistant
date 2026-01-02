import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { Bookmark, Plus, Mic, ArrowUp, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

// Helper to get span classes for editorial masonry
function getCardSpanClass(index: number): string {
  // Pattern: hero (2x2), sub-hero (1x2), then basic cards fill rest
  if (index === 0) return 'md:col-span-2 md:row-span-2';
  if (index === 1) return 'md:col-span-1 md:row-span-2';
  return 'col-span-1 md:row-span-1';
}

export function ArticlesFeed({ onOpenSettings }: ArticlesFeedProps) {
  const [displayedArticles, setDisplayedArticles] = useState<MediumArticle[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Mock Medium articles data
  const mockArticles: MediumArticle[] = [
    {
      id: 'medium-1',
      title: 'Building Production-Ready AI Applications with Claude',
      description: 'A comprehensive guide to integrating Claude API into your applications with best practices for error handling, rate limiting, and prompt engineering.',
      author: 'Sarah Chen',
      authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 12,
      claps: 2400,
      url: 'https://medium.com/example/building-production-ai',
      image: 'https://images.unsplash.com/photo-1677442d019cecf8178ae5900677046c97c853b94?w=800&q=80',
      tags: ['AI', 'Development', 'Claude'],
      cardType: 'hero'
    },
    {
      id: 'medium-2',
      title: 'The Future of Web Development in 2026',
      description: 'Exploring emerging technologies, frameworks, and paradigms that will shape web development this year. From AI-assisted coding to edge computing.',
      author: 'Marcus Johnson',
      authorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 15,
      claps: 5600,
      url: 'https://medium.com/example/future-web-dev',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&q=80',
      tags: ['Web Development', 'Technology', 'Trends'],
      cardType: 'sub-hero'
    },
    {
      id: 'medium-3',
      title: 'Prompt Engineering Secrets from LLM Experts',
      description: 'Learn advanced techniques for crafting effective prompts that unlock the full potential of large language models. Including real-world examples.',
      author: 'Elena Rodriguez',
      authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 10,
      claps: 8200,
      url: 'https://medium.com/example/prompt-engineering',
      image: 'https://images.unsplash.com/photo-1526374965328-7f5ae4e8a84e?w=800&q=80',
      tags: ['AI', 'Prompting', 'LLM'],
      cardType: 'basic'
    },
    {
      id: 'medium-4',
      title: 'Building a Photography Business in the Digital Age',
      description: 'From portfolio websites to client management systems, everything you need to know about running a modern photography business.',
      author: 'James Wilson',
      authorImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 14,
      claps: 3100,
      url: 'https://medium.com/example/photography-business',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
      tags: ['Photography', 'Business', 'Digital'],
      cardType: 'basic'
    },
    {
      id: 'medium-5',
      title: 'Mastering TypeScript for Scale',
      description: 'Best practices for using TypeScript in large-scale applications. Covers advanced types, generics, decorators, and architectural patterns.',
      author: 'David Park',
      authorImage: 'https://images.unsplash.com/photo-1507238691154-cef280dff58e?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 16,
      claps: 6800,
      url: 'https://medium.com/example/typescript-scale',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      tags: ['TypeScript', 'Development', 'Best Practices'],
      cardType: 'basic'
    },
    {
      id: 'medium-6',
      title: 'The Art and Science of Color in Web Design',
      description: 'Understanding color theory and psychology to create visually stunning and accessible web experiences.',
      author: 'Lisa Thompson',
      authorImage: 'https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 9,
      claps: 4200,
      url: 'https://medium.com/example/color-design',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
      tags: ['Design', 'UX', 'Color Theory'],
      cardType: 'basic'
    },
    {
      id: 'medium-7',
      title: 'Advanced React Patterns for Enterprise Apps',
      description: 'Deep dive into compound components, render props, and hooks patterns that power large-scale React applications.',
      author: 'Alex Kumar',
      authorImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 18,
      claps: 7200,
      url: 'https://medium.com/example/react-patterns',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&q=80',
      tags: ['React', 'Development', 'Best Practices'],
      cardType: 'basic'
    },
    {
      id: 'medium-8',
      title: 'Sustainable Web Design in 2026',
      description: 'Building web applications that are not just fast, but also environmentally conscious. Strategies for reducing digital carbon footprint.',
      author: 'Nina Patel',
      authorImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      readTime: 11,
      claps: 3900,
      url: 'https://medium.com/example/sustainable-design',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      tags: ['Design', 'Sustainability', 'Web'],
      cardType: 'basic'
    },
  ];

  // Generate articles with duplication for pagination
  const generateArticles = (count: number): MediumArticle[] => {
    const articles: MediumArticle[] = [];
    for (let i = 0; i < count; i++) {
      const baseArticle = mockArticles[i % mockArticles.length];
      articles.push({
        ...baseArticle,
        id: `${baseArticle.id}-${i}` // Unique ID for each instance
      });
    }
    return articles;
  };

  // Load initial articles
  useEffect(() => {
    const firstPageArticles = generateArticles(10);
    setDisplayedArticles(firstPageArticles);
    setPage(1);
  }, []);

  // Intersection Observer for pagination
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setIsLoading(true);
          // Simulate loading delay
          setTimeout(() => {
            const newArticles = generateArticles(10);
            setDisplayedArticles((prev) => [...prev, ...newArticles]);
            setPage((prev) => prev + 1);
            setIsLoading(false);
          }, 300);
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(mockArticles.flatMap(article => article.tags))
  ).sort();

  // Filter articles by tag and add animation delay
  const filteredArticles = activeTag
    ? displayedArticles.filter(article => article.tags.includes(activeTag))
    : displayedArticles;

  // Map articles with animation timing
  const articlesWithAnimation = filteredArticles.map((article, index) => ({
    article,
    delay: index * 30 // Stagger animation for each card
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
              <p className="text-gray-400 mb-6">Curated writing on technology, design, and creative work</p>
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
              {allTags.map((tag) => (
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
            </div>

            {/* Editorial Masonry Grid */}
            <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gridAutoRows: '280px' }}>
              {articlesWithAnimation.map(({ article, delay }, index) => (
                <article
                  key={`${article.id}-${index}`}
                  className={cn(
                    "group relative bg-[#161b22] rounded-lg border border-[#30363d] overflow-hidden hover:border-blue-500/50 transition-all duration-500 cursor-pointer flex flex-col",
                    "animate-fade-up",
                    getCardSpanClass(index % 10) // Only use first 10 for spanning pattern
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
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80';
                      }}
                    />
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
                          {(article.claps / 1000).toFixed(1)}k
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
              ))}
            </div>

            {/* Pagination Sentinel */}
            <div ref={sentinelRef} className="h-8 mt-8" />
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

      {/* Floating Command Capsule */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[700px] z-50">
        <div className="bg-[#1e1e1e]/85 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-full p-2 flex items-center gap-3 transition-all duration-300 focus-within:bg-[#1e1e1e]/95 focus-within:shadow-[0_15px_50px_rgba(0,0,0,0.6)] focus-within:border-white/20">
          {/* Left Action: Add Context */}
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-[#a1a1a1] hover:text-white hover:bg-white/10 transition-colors shrink-0">
            <Plus className="w-5 h-5" />
          </button>

          {/* Center Input */}
          <input
            type="text"
            placeholder="Search articles..."
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
    </div>
  );
}
