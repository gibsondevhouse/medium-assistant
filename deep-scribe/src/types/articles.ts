export type ArticleCard = {
    id: string;
    title: string;
    description: string;
    image: string;
    url: string;
    publishedAt: string;
    source: { name: string };
    cardType: 'hero' | 'sub-hero' | 'basic';
};
