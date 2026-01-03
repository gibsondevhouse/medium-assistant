import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export interface DraftMetadata {
    id: string; // filename without extension
    title: string;
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
                    const content = fs.readFileSync(filepath, 'utf-8');
                    const titleLine = content.split('\n')[0] || 'Untitled';
                    const title = titleLine.replace(/^#\s*/, '').trim().substring(0, 50) || 'Untitled Draft';
                    const preview = content.substring(0, 100).replace(/\n/g, ' ').trim() + '...';

                    return {
                        id: file.replace('.md', ''),
                        title,
                        lastModified: stats.mtimeMs,
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
            const content = fs.readFileSync(filepath, 'utf-8');
            return { id, content };
        } catch (error) {
            console.error(`Failed to read draft ${id}:`, error);
            return null;
        }
    }

    saveDraft(id: string, content: string): boolean {
        try {
            const filepath = path.join(this.draftsDir, `${id}.md`);
            fs.writeFileSync(filepath, content, 'utf-8');
            return true;
        } catch (error) {
            console.error(`Failed to save draft ${id}:`, error);
            return false;
        }
    }

    createDraft(title: string = 'Untitled Draft'): DraftMetadata | null {
        try {
            const timestamp = Date.now();
            const safeTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim();
            const id = `${safeTitle}-${timestamp}`;
            const filepath = path.join(this.draftsDir, `${id}.md`);

            const initialContent = `# ${title}\n\nStart writing here...`;
            fs.writeFileSync(filepath, initialContent, 'utf-8');

            return {
                id,
                title,
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

    renameDraft(id: string, newTitle: string): boolean {
        // Renaming logic might be complex if ID depends on title.
        // For simplicity, we keep ID constant (filename) but updating the first line (Title) is content change.
        // If we want to rename the FILE, we need to handle that.
        // For now, let's just assume "saving content" updates the title in the file content.
        // But if we want to change the ID/Filename, that breaks references.
        // Let's stick to ID = filename, and Title is derived from content.
        return true;
    }
}
