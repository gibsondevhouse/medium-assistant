import { useState, useEffect, useRef, useCallback } from 'react';
import { ArticleCard } from '../types/articles';
import { fetchArticles } from '../services/news-api';

interface UseInfiniteScrollResult {
    articles: ArticleCard[];
    loading: boolean;
    error: Error | null;
    hasMore: boolean;
    sentinelRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll(category: string = 'All'): UseInfiniteScrollResult {
    const [articles, setArticles] = useState<ArticleCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // Reset state when category changes
    useEffect(() => {
        setArticles([]);
        setPage(1);
        setHasMore(true);
        setError(null);
    }, [category]);

    // Using a ref for the observer to persist across renders
    const sentinelRef = useRef<HTMLDivElement>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            // We pass category to fetchArticles
            // Note: RSS feed is not paginated in the implementation we made,
            // but we might want to simulate pagination or just load once.
            // For now, if page > 1 and it's RSS, we might just stop or reload same feed?
            // Actually, Google News RSS doesn't support pagination.
            // So for RSS, we should only load once (page 1).
            if (page > 1) {
                setHasMore(false);
                setLoading(false);
                return;
            }

            const { hero, subHero, basic } = await fetchArticles(category);

            const newBatch = [
                ...(hero ? [hero] : []),
                ...subHero,
                ...basic
            ];

            if (newBatch.length === 0) {
                setHasMore(false);
            } else {
                setArticles(prev => [...prev, ...newBatch]);
                setPage(prev => prev + 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error fetching articles'));
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, category]);

    useEffect(() => {
        // Initial load or when category changed (and reset)
        if (page === 1 && articles.length === 0) {
            loadMore();
        }
    }, [loadMore, page, articles.length]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                root: null, // viewport
                rootMargin: '0px',
                threshold: 0.5, // Trigger when 50% of the sentinel is visible
            }
        );

        const currentSentinel = sentinelRef.current;

        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
            observer.disconnect();
        };
    }, [hasMore, loading, loadMore]);

    return { articles, loading, error, hasMore, sentinelRef };
}
