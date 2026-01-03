# Deep Scribe - Development Plan

This document outlines the phased development roadmap for "Deep Scribe".
Based on the code audit and the "Yet to be Implemented" section of `README.md`.

## Architecture Design: The Draft System

The core of the "Scribe" experience is the ability to write, save, and manage content. We will use a local file-based persistence strategy to ensure user data ownership and portability.

### 1. Data Structure (`Draft`)

Drafts are stored as Markdown files (`.md`) with YAML Frontmatter for metadata.

**File Format Example (`my-article.md`):**
```markdown
---
title: "The Future of AI"
lastModified: 1704201200000
tags: ["tech", "ai", "opinion"]
version: 1
---

# The Future of AI

Content starts here...
```

**TypeScript Interface (`src/types/draft.ts`):**
```typescript
export interface Draft {
    id: string;          // Filename (without extension)
    title: string;       // From frontmatter
    tags: string[];      // From frontmatter
    lastModified: number;// From file stats or frontmatter
    content: string;     // The markdown body
    preview: string;     // First 100 chars
    filepath: string;    // Full path on disk
}
```

### 2. Electron Backend (`DraftService`)

*   **Location:** `electron/services/drafts.ts`
*   **Responsibilities:**
    *   CRUD operations on `.md` files in `app.getPath('userData')/Drafts`.
    *   Parsing/Stringifying YAML frontmatter (using `gray-matter` or similar).
    *   Generating unique IDs (slugified title + timestamp).

### 3. Frontend Store (`DraftStore`)

*   **Location:** `src/store/draftStore.ts`
*   **Responsibilities:**
    *   State management (Zustand).
    *   Syncing with Electron backend.
    *   Handling auto-save logic.

---

## Phased Development Roadmap

### Phase 1: Core Persistence (DraftService + Store)
**Goal:** robust file system operations.

1.  **Dependencies:** Install `gray-matter` (or implement simple parser) in Electron process.
2.  **Service Upgrade:** Update `electron/services/drafts.ts` to parse frontmatter.
3.  **API:** Expose `getTags`, `updateTags` in `preload.ts`.
4.  **Store:** Update `draftStore` to handle `tags` and `version`.
5.  **UI:** Update "Recent Articles" list to show tags (if any).

### Phase 2: The Editor (Markdown Component)
**Goal:** A writing interface worthy of a "Scribe".

1.  **Component:** Create `src/components/Editor/Editor.tsx` replacing the current placeholder.
2.  **Library:** Integrate a proper editor (e.g., `Monaco`, `CodeMirror`, or `TipTap`).
    *   *Recommendation:* **TipTap** for a "Medium-like" WYSIWYG markdown experience.
3.  **Features:**
    *   Auto-save (debounced calls to `draftStore.saveCurrentDraft`).
    *   Title editing (updates frontmatter).
    *   Tag management input.
4.  **Layout:** Ensure it fits within `DeepScribeLayout`.

### Phase 3: Research Integration
**Goal:** Connecting the "Research" tab to the "Writing" tab.

1.  **Export Action:** In `Research/ResearchReport.tsx`, implement the "Export Article" button.
2.  **Flow:**
    *   Click "Export".
    *   Call `draftStore.createNewDraft(topic, reportContent)`.
    *   Redirect user to `Editor` view with new draft open.
3.  **Metadata:** Store the research "Source IDs" in the draft's frontmatter (`sources: ['node-1', 'node-2']`) for future reference.

### Phase 4: Contextual Chat (The "Editor Bot")
**Goal:** An AI assistant that knows what you are writing.

1.  **UI:** Implement the `Messages` sidebar panel.
2.  **Context Injection:**
    *   When user asks a question, grab `useDraftStore.getState().activeDraft.content`.
    *   Append to the prompt: `Context: User is writing an article about [Title]. Current content: [Content]...`.
3.  **Backend:** Use `AiRouterService` to send this context-aware prompt.
4.  **RAG (Optional):** If content is too long, implement local chunking/embedding in Python backend.
