import { app } from 'electron';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DraftMetadata {
    id: string; // filename without extension
    title: string;
    tags: string[];
    version: number;
    lastModified: number;
    preview: string;
    filepath: string;
}

export interface DraftContent {
    id: string;
    content: string;
}

export class DraftService {
    private draftsDir: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.draftsDir = path.join(userDataPath, 'Drafts');
        this.ensureDraftsDir();
    }

    private async ensureDraftsDir() {
        try {
            await fsPromises.access(this.draftsDir);
        } catch {
            await fsPromises.mkdir(this.draftsDir, { recursive: true });
        }
    }

    async listDrafts(): Promise<DraftMetadata[]> {
        try {
            await this.ensureDraftsDir();
            const files = await fsPromises.readdir(this.draftsDir);
            const draftsPromises = files
                .filter(file => file.endsWith('.md'))
                .map(async file => {
                    const filepath = path.join(this.draftsDir, file);
                    const stats = await fsPromises.stat(filepath);
                    const rawContent = await fsPromises.readFile(filepath, 'utf-8');

                    // Parse frontmatter
                    const { data, content: body } = matter(rawContent);

                    // Fallbacks
                    const title = data.title || body.split('\n')[0].replace(/^#\s*/, '').trim().substring(0, 50) || 'Untitled Draft';
                    const tags = Array.isArray(data.tags) ? data.tags : [];
                    const version = typeof data.version === 'number' ? data.version : 1;
                    const preview = body.substring(0, 100).replace(/\n/g, ' ').trim() + '...';
                    // Prefer frontmatter lastModified if available (e.g. for synced files), else fs stats
                    const lastModified = data.lastModified ? Number(data.lastModified) : stats.mtimeMs;

                    return {
                        id: file.replace('.md', ''),
                        title,
                        tags,
                        version,
                        lastModified,
                        preview,
                        filepath
                    };
                });

            const drafts = await Promise.all(draftsPromises);
            return drafts.sort((a, b) => b.lastModified - a.lastModified);
        } catch (error) {
            console.error('Failed to list drafts:', error);
            return [];
        }
    }

    async readDraft(id: string): Promise<DraftContent | null> {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            try {
                await fsPromises.access(filepath);
            } catch {
                return null;
            }

            const rawContent = await fsPromises.readFile(filepath, 'utf-8');
            const { content } = matter(rawContent);
            return { id, content };
        } catch (error) {
            console.error(`Failed to read draft ${id}:`, error);
            return null;
        }
    }

    async saveDraft(id: string, bodyContent: string): Promise<boolean> {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            let existingData = {};

            try {
                const raw = await fsPromises.readFile(filepath, 'utf-8');
                const parsed = matter(raw);
                existingData = parsed.data;
            } catch {
                // File might not exist or read failed, proceed with empty metadata
            }

            // Update lastModified
            const updatedData = {
                ...existingData,
                lastModified: Date.now()
            };

            const fileContent = matter.stringify(bodyContent, updatedData);
            await fsPromises.writeFile(filepath, fileContent, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Failed to save draft ${id}:`, error);
            return false;
        }
    }

    async updateMetadata(id: string, metadata: Partial<DraftMetadata>): Promise<boolean> {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            try {
                await fsPromises.access(filepath);
            } catch {
                return false;
            }

            const raw = await fsPromises.readFile(filepath, 'utf-8');
            const parsed = matter(raw);

            const updatedData = {
                ...parsed.data,
                ...metadata,
                lastModified: Date.now()
            };

            const fileContent = matter.stringify(parsed.content, updatedData);
            await fsPromises.writeFile(filepath, fileContent, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Failed to update metadata for ${id}:`, error);
            return false;
        }
    }

    async createDraft(title: string = 'Untitled Draft', initialContent?: string, tags: string[] = []): Promise<DraftMetadata | null> {
        try {
            await this.ensureDraftsDir();
            const timestamp = Date.now();
            const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
            const id = `${safeTitle}-${timestamp}`;
            const filepath = path.join(this.draftsDir, `${id}.md`);

            const data = {
                title,
                tags,
                version: 1,
                lastModified: timestamp
            };

            const body = initialContent || `# ${title}\n\nStart writing here...`;
            const fileContent = matter.stringify(body, data);

            await fsPromises.writeFile(filepath, fileContent, 'utf-8');

            return {
                id,
                title,
                tags,
                version: 1,
                lastModified: timestamp,
                preview: body.substring(0, 100).replace(/\n/g, ' ').trim() + '...',
                filepath
            };
        } catch (error) {
            console.error('Failed to create draft:', error);
            return null;
        }
    }

    async deleteDraft(id: string): Promise<boolean> {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            try {
                await fsPromises.unlink(filepath);
                return true;
            } catch {
                return false;
            }
        } catch (error) {
            console.error(`Failed to delete draft ${id}:`, error);
            return false;
        }
    }
}
