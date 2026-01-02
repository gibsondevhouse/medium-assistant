import { ArticleCard } from '../types/articles';
import { getGNewsKey } from './settings-keys';

const BASE_URL = 'https://gnews.io/api/v4/top-headlines';

interface GNewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

interface GNewsResponse {
    totalArticles: number;
    articles: GNewsArticle[];
}

export async function fetchArticles(page: number): Promise<{ hero: ArticleCard | null, subHero: ArticleCard[], basic: ArticleCard[] }> {
    const apiKey = await getGNewsKey();

    if (!apiKey) {
        console.warn('GNews API Key is missing. Using mock data.');
        return generateMockData(page);
    }

    try {
        const response = await fetch(`${BASE_URL}?category=technology&lang=en&country=us&max=21&page=${page}&apikey=${apiKey}`);

        if (!response.ok) {
            // Fallback to mock on error (e.g. 403, 429)
            if (response.status === 401 || response.status === 403 || response.status === 429) {
                console.warn(`GNews API Error: ${response.status}. Falling back to mock data.`);
                return generateMockData(page);
            }
            throw new Error(`News API Error: ${response.statusText}`);
        }

        const data: GNewsResponse = await response.json();
        return mapArticles(data.articles, page);

    } catch (error) {
        console.error('Failed to fetch articles, using mock data:', error);
        return generateMockData(page);
    }
}

function mapArticles(articles: any[], page: number) {
    const mappedArticles: ArticleCard[] = articles.map((article, index) => ({
        id: `${article.url}-${index}-${page}`,
        title: article.title,
        description: article.description,
        image: article.image,
        url: article.url,
        publishedAt: article.publishedAt,
        source: { name: article.source.name },
        cardType: 'basic',
    }));

    if (mappedArticles.length === 0) return { hero: null, subHero: [], basic: [] };

    const hero = mappedArticles[0] || null;
    if (hero) hero.cardType = 'hero';

    const subHero = mappedArticles.slice(1, 11).map(a => ({ ...a, cardType: 'sub-hero' as const }));
    const basic = mappedArticles.slice(11).map(a => ({ ...a, cardType: 'basic' as const }));

    return { hero, subHero, basic };
}

function generateMockData(page: number) {
    const mockArticles: ArticleCard[] = Array.from({ length: 21 }).map((_, i) => ({
        id: `mock-${page}-${i}`,
        title: `Mock Article ${i + 1} - Page ${page}`,
        description: 'This is a placeholder description for the mock article. It demonstrates the layout structure without needing a live API connection.',
        image: `https://picsum.photos/seed/${page * 21 + i}/800/600`,
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
