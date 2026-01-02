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

export function useInfiniteScroll(): UseInfiniteScrollResult {
    const [articles, setArticles] = useState<ArticleCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);

    // Using a ref for the observer to persist across renders
    const sentinelRef = useRef<HTMLDivElement>(null);
    // Track if we are currently observing to prevent double attaches in strict mode if not careful,
    // though the cleanup function handles it.

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        setError(null);

        try {
            const { hero, subHero, basic } = await fetchArticles(page);

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
    }, [page, loading, hasMore]);

    useEffect(() => {
        // Initial load
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
