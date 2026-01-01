import { useState } from 'react';
import { MessageSquare, Heart, Bookmark, Share2, MoreHorizontal, PenTool, Plus, Mic, ArrowUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Article {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    title: string;
    preview: string;
    date: string;
    readTime: string;
    likes: number;
    comments: number;
}

export function NewsFeed() {
    const [activeTab, setActiveTab] = useState<'All' | 'Tech' | 'Design' | 'Crypto' | 'Culture'>('All');

    // Updated mock data with images
    const articles: (Article & { imageUrl: string })[] = [
        {
            id: '1',
            author: { name: 'Elena Fisher', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
            title: 'The Future of Digital Typography',
            preview: 'Why variable fonts and CSS grid are changing the way we consume editorial content on the web...',
            date: 'Oct 24',
            readTime: '4 min read',
            likes: 124,
            comments: 18,
            imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: '2',
            author: { name: 'Marcus Chen', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
            title: 'Building for the Modern Web',
            preview: 'A deep dive into server-side rendering, hydration, and the "Island Architecture" that is taking over...',
            date: 'Oct 23',
            readTime: '7 min read',
            likes: 89,
            comments: 42,
            imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: '3',
            author: { name: 'Sarah Connor', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
            title: 'Design Systems in 2024',
            preview: 'How to maintain consistency at scale without sacrificing creativity. Lessons learned from a year of refactoring...',
            date: 'Oct 22',
            readTime: '5 min read',
            likes: 256,
            comments: 12,
            imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            id: '4',
            author: { name: 'Alex T.', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026302a' },
            title: 'Minimalism is Back',
            preview: 'Exploring the return of Swiss style and brutalism in modern app design.',
            date: 'Oct 21',
            readTime: '3 min read',
            likes: 45,
            comments: 8,
            imageUrl: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];

    const categories = ['All', 'Tech', 'Design', 'Crypto', 'Culture'] as const;

    return (
        <div className="w-full h-full bg-[#0f111a] flex flex-col overflow-hidden relative">

            {/* Scrollable Center Feed */}
            <div className="flex-1 overflow-y-auto">
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
                    <div className="columns-1 md:columns-2 gap-6 block flex-1">
                        {articles.map((article) => (
                            <article
                                key={article.id}
                                className="group relative break-inside-avoid rounded-xl overflow-hidden mb-6 bg-[#161b22] border border-[#30363d] hover:border-gray-500 transition-all duration-300 cursor-pointer shadow-lg w-full"
                                style={{ minHeight: '320px' }}
                            >
                                {/* Full Bleed Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {/* Gradient Scrim Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
                                </div>

                                {/* Content Overlay */}
                                <div className="relative h-full flex flex-col justify-end p-6 z-10 gap-2">

                                    {/* Author & Meta */}
                                    <div className="flex items-center gap-2">
                                        <img src={article.author.avatar} alt={article.author.name} className="w-5 h-5 rounded-full border border-white/20" />
                                        <span className="text-[11px] font-semibold text-white/90 tracking-wide uppercase">{article.author.name}</span>
                                        <span className="text-[11px] text-gray-400">• {article.readTime}</span>
                                    </div>

                                    {/* Title */}
                                    <h2 className="text-2xl font-bold text-white leading-tight drop-shadow-sm" style={{ fontFamily: '"Playfair Display", serif' }}>
                                        {article.title}
                                    </h2>

                                    {/* Preview (Hidden on small cards or truncated heavily) */}
                                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-2 opacity-90">
                                        {article.preview}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-1">
                                        <div className="flex items-center gap-4 text-gray-300">
                                            <button className="flex items-center gap-1.5 hover:text-white transition-colors group/btn">
                                                <Heart className="w-4 h-4 group-hover/btn:fill-white/20" />
                                                <span className="text-xs font-medium">{article.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-white transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                                <span className="text-xs font-medium">{article.comments}</span>
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

        </div>
    );
}
