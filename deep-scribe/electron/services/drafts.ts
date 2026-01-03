import { app } from 'electron';
import fs from 'fs';
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
    content: string; // This will now include frontmatter if we read strictly, but ideally we return parsed content?
    // Actually, for the editor, we probably want just the body, OR we handle frontmatter in the UI.
    // Let's stick to "content" being the Markdown BODY for the Editor.
    // Metadata is passed separately.
    // BUT, when saving, we need to preserve frontmatter.
}

export class DraftService {
    private draftsDir: string;

    constructor() {
        const userDataPath = app.getPath('userData');
        this.draftsDir = path.join(userDataPath, 'Drafts');
        this.ensureDraftsDir();
    }

    private ensureDraftsDir() {
        if (!fs.existsSync(this.draftsDir)) {
            fs.mkdirSync(this.draftsDir, { recursive: true });
        }
    }

    listDrafts(): DraftMetadata[] {
        try {
            const files = fs.readdirSync(this.draftsDir);
            const drafts: DraftMetadata[] = files
                .filter(file => file.endsWith('.md'))
                .map(file => {
                    const filepath = path.join(this.draftsDir, file);
                    const stats = fs.statSync(filepath);
                    const rawContent = fs.readFileSync(filepath, 'utf-8');

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
                })
                .sort((a, b) => b.lastModified - a.lastModified);

            return drafts;
        } catch (error) {
            console.error('Failed to list drafts:', error);
            return [];
        }
    }

    readDraft(id: string): DraftContent | null {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            if (!fs.existsSync(filepath)) return null;
            const rawContent = fs.readFileSync(filepath, 'utf-8');
            const { content } = matter(rawContent);
            return { id, content };
        } catch (error) {
            console.error(`Failed to read draft ${id}:`, error);
            return null;
        }
    }

    saveDraft(id: string, bodyContent: string): boolean {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            let existingData = {};

            if (fs.existsSync(filepath)) {
                const raw = fs.readFileSync(filepath, 'utf-8');
                const parsed = matter(raw);
                existingData = parsed.data;
            }

            // Update lastModified
            const updatedData = {
                ...existingData,
                lastModified: Date.now()
            };

            const fileContent = matter.stringify(bodyContent, updatedData);
            fs.writeFileSync(filepath, fileContent, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Failed to save draft ${id}:`, error);
            return false;
        }
    }

    updateMetadata(id: string, metadata: Partial<DraftMetadata>): boolean {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            if (!fs.existsSync(filepath)) return false;

            const raw = fs.readFileSync(filepath, 'utf-8');
            const parsed = matter(raw);

            const updatedData = {
                ...parsed.data,
                ...metadata,
                lastModified: Date.now()
            };

            // Don't overwrite essential fields if passed incorrectly, but generally we trust the caller.
            // ID and filepath are immutable in the file itself usually.

            const fileContent = matter.stringify(parsed.content, updatedData);
            fs.writeFileSync(filepath, fileContent, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Failed to update metadata for ${id}:`, error);
            return false;
        }
    }

    createDraft(title: string = 'Untitled Draft'): DraftMetadata | null {
        try {
            const timestamp = Date.now();
            const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
            const id = `${safeTitle}-${timestamp}`;
            const filepath = path.join(this.draftsDir, `${id}.md`);

            const data = {
                title,
                tags: [],
                version: 1,
                lastModified: timestamp
            };

            const initialBody = `# ${title}\n\nStart writing here...`;
            const fileContent = matter.stringify(initialBody, data);

            fs.writeFileSync(filepath, fileContent, 'utf-8');

            return {
                id,
                title,
                tags: [],
                version: 1,
                lastModified: timestamp,
                preview: 'Start writing here...',
                filepath
            };
        } catch (error) {
            console.error('Failed to create draft:', error);
            return null;
        }
    }

    deleteDraft(id: string): boolean {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to delete draft ${id}:`, error);
            return false;
        }
    }
}
