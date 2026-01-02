import Parser from 'rss-parser';
import { logger } from '../utils/logger';

export class RssService {
    private parser: Parser;

    constructor() {
        this.parser = new Parser();
    }

    async fetchFeed(url: string) {
        logger.info(`[RSS] Fetching feed: ${url}`);
        try {
            const feed = await this.parser.parseURL(url);
            logger.info(`[RSS] Successfully fetched feed: ${feed.title} (${feed.items?.length} items)`);
            return { success: true, feed };
        } catch (error: any) {
            logger.error(`[RSS] Fetch Error for ${url}:`, error);
            // Also log verbose if available
            if (error.code) logger.error(`[RSS] Error Code: ${error.code}`);
            return { success: false, error: error.message };
        }
    }
}
