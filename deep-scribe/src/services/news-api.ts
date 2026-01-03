import { ArticleCard } from '../types/articles';

const GOOGLE_NEWS_RSS_BASE = 'https://news.google.com/rss';

export async function fetchArticles(category: string = 'All'): Promise<{ hero: ArticleCard | null, subHero: ArticleCard[], basic: ArticleCard[] }> {
    try {
        let rssUrl = GOOGLE_NEWS_RSS_BASE; // Default to Top Stories

        // Simple mapping for topic-based feeds
        // Note: For more specific topics, we can use search?q={query}&hl=en-US&gl=US&ceid=US:en
        switch (category) {
            case 'Tech':
                rssUrl = `${GOOGLE_NEWS_RSS_BASE}/topics/CAAqJggKIiB7QkFTRV9VQVJMX3RvcGljX2lkfQ?hl=en-US&gl=US&ceid=US:en&q=Technology`;
                // Better approach: Use search for reliable categorization if topics IDs are unstable
                rssUrl = `https://news.google.com/rss/search?q=technology&hl=en-US&gl=US&ceid=US:en`;
                break;
            case 'Design':
                rssUrl = `https://news.google.com/rss/search?q=design+latency+ui+ux&hl=en-US&gl=US&ceid=US:en`;
                break;
            case 'Crypto':
                rssUrl = `https://news.google.com/rss/search?q=cryptocurrency+blockchain&hl=en-US&gl=US&ceid=US:en`;
                break;
            case 'Culture':
                rssUrl = `https://news.google.com/rss/search?q=internet+culture+social+media&hl=en-US&gl=US&ceid=US:en`;
                break;
            case 'All':
            default:
                // Top stories US
                rssUrl = `${GOOGLE_NEWS_RSS_BASE}?hl=en-US&gl=US&ceid=US:en`;
                break;
        }

        const response = await window.electronAPI.rss.fetch(rssUrl);

        if (!response.success || !response.feed) {
            console.warn('RSS Fetch failed, using mock data:', response.error);
            return generateMockData(category); // Pass category for context-aware mocks if we wanted
        }

        return mapRssToArticles(response.feed.items);

    } catch (error) {
        console.error('Failed to fetch RSS articles:', error);
        return generateMockData(category);
    }
}

function mapRssToArticles(items: any[]) {
    const mappedArticles: ArticleCard[] = items.map((item, index) => {
        let image = `https://picsum.photos/seed/${index}/800/600`;

        // 1. Try standard RSS enclosure/media:content if available directly
        if (item.enclosure && item.enclosure.url) {
            image = item.enclosure.url;
        } else if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
            image = item['media:content'].$.url;
        } else if (item['media:content'] && item['media:content'].url) {
            image = item['media:content'].url;
        } else {
            // 2. Parse HTML content for images (Google News often hides it here)
            const htmlToParse = item['content:encoded'] || item.content || item.description || '';
            if (htmlToParse) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlToParse, 'text/html');
                    const img = doc.querySelector('img');
                    if (img && img.src) {
                        image = img.src;
                    }
                } catch (e) {
                    console.warn('Failed to parse HTML for image:', e);
                }
            }
        }

        // Additional cleanup for Google News specific images which can be tiny thumbnails
        // Check if it's a google news thumbnail which often looks like .../w100-h100/...
        // We can try to strip parsing params to get high res, but it's flaky. 
        // For now, let's stick to just finding *an* image.

        return {
            id: item.guid || item.link || `rss-${index}`,
            title: item.title,
            description: (item.contentSnippet || item.description || '').replace(/<[^>]*>/g, '').slice(0, 150) + '...',
            image: image,
            url: item.link,
            publishedAt: item.pubDate,
            source: { name: item.source || 'Google News' },
            cardType: 'basic',
        };
    });

    if (mappedArticles.length === 0) return { hero: null, subHero: [], basic: [] };

    const hero = mappedArticles[0] || null;
    if (hero) hero.cardType = 'hero';

    const subHero = mappedArticles.slice(1, 11).map(a => ({ ...a, cardType: 'sub-hero' as const }));
    const basic = mappedArticles.slice(11).map(a => ({ ...a, cardType: 'basic' as const }));

    return { hero, subHero, basic };
}

function generateMockData(category: string) {
    const mockArticles: ArticleCard[] = Array.from({ length: 21 }).map((_, i) => ({
        id: `mock-${category}-${i}`,
        title: `Mock ${category} Article ${i + 1}`,
        description: 'This is a placeholder description. The feed failed to load, so you are seeing this mock content.',
        image: `https://picsum.photos/seed/${category}${i}/800/600`,
        url: '#',
        publishedAt: new Date().toISOString(),
        source: { name: 'Mock Source' },
        cardType: 'basic'
    }));

    // Assign types manually for mock
    const hero = { ...mockArticles[0], cardType: 'hero' as const };
    const subHero = mockArticles.slice(1, 11).map(a => ({ ...a, cardType: 'sub-hero' as const }));
    const basic = mockArticles.slice(11).map(a => ({ ...a, cardType: 'basic' as const }));

    return { hero, subHero, basic };
}
