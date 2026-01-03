import React from 'react';
import { Clock, Tag } from 'lucide-react';

export type CardVariant = 'feature' | 'standard' | 'compact' | 'text-only' | 'media-heavy';

interface MagazineCardProps {
    title: string;
    excerpt?: string;
    author?: string;
    date?: string;
    readTime?: string;
    imageUrl?: string;
    tags?: string[];
    variant?: CardVariant;
    onClick?: () => void;
    className?: string; // Allow external grid positioning
}

export const MagazineCard: React.FC<MagazineCardProps> = ({
    title,
    excerpt,
    author,
    date,
    readTime,
    imageUrl,
    tags,
    variant = 'standard',
    onClick,
    className = '',
}) => {

    if (variant === 'feature') {
        return (
            <div
                onClick={onClick}
                className={`group relative h-full min-h-[400px] w-full overflow-hidden rounded-xl bg-surface-200 border border-white/5 cursor-pointer transition-transform duration-300 hover:scale-[1.01] ${className}`}
            >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80'}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-surface-100/50 to-transparent z-10" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 z-20 w-full p-8 md:p-12">
                    {tags && tags.length > 0 && (
                        <div className="mb-4 flex gap-2">
                            {tags.map(t => (
                                <span key={t} className="px-2 py-1 bg-brand-primary/90 text-surface-100 text-xs font-bold uppercase tracking-wider rounded-sm">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                    <h2 className="mb-4 font-serif text-3xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg group-hover:text-brand-primary transition-colors duration-300">
                        {title}
                    </h2>
                    {excerpt && (
                        <p className="mb-6 max-w-2xl text-lg text-gray-200 line-clamp-2 md:line-clamp-3 font-sans">
                            {excerpt}
                        </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-300 font-mono">
                        {author && <span className="font-semibold text-white">{author}</span>}
                        {(author && (date || readTime)) && <span>•</span>}
                        {date && <span>{date}</span>}
                        {readTime && (
                            <span className="flex items-center gap-1">
                                <Clock size={12} /> {readTime}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Standard Card
    return (
        <div
            onClick={onClick}
            className={`group flex flex-col h-full bg-surface-200 rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-all duration-300 cursor-pointer ${className}`}
        >
            {imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                </div>
            )}

            <div className="flex flex-col flex-1 p-6">
                <div className="mb-3 flex items-center justify-between">
                    {tags && tags[0] && (
                        <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                            {tags[0]}
                        </span>
                    )}
                    {readTime && (
                        <span className="text-[10px] text-text-muted flex items-center gap-1">
                            <Clock size={10} /> {readTime}
                        </span>
                    )}
                </div>

                <h3 className="mb-2 font-serif text-xl font-bold text-text-primary leading-tight group-hover:text-brand-primary transition-colors">
                    {title}
                </h3>

                {excerpt && (
                    <p className="mb-4 text-sm text-text-secondary line-clamp-3 font-sans">
                        {excerpt}
                    </p>
                )}

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    {author ? (
                        <span className="text-xs font-medium text-text-primary">{author}</span>
                    ) : <span></span>}
                    {date && <span className="text-[10px] text-text-muted">{date}</span>}
                </div>
            </div>
        </div>
    );
};
