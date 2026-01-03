# Deep Scribe - Development Roadmap

This document outlines the current status of the project, planned future developments, and perceived blockages/technical debt.

## 1. Current Status

The core "Deep Scribe" experience has been successfully implemented, transitioning from a prototype to a functional local-first writing assistant.

### ✅ Implemented Features
*   **Draft System (Persistence):**
    *   Drafts are stored as portable Markdown files (`.md`) with YAML frontmatter in the user's data directory.
    *   Metadata (title, tags, versioning) is robustly handled via `gray-matter`.
    *   Full CRUD operations via `DraftService` (Electron) and `DraftStore` (Zustand).
*   **The Editor:**
    *   Replaced placeholder text area with **TipTap** rich text editor.
    *   Supports auto-saving of content, title, and tags (debounced).
    *   Styled with Tailwind Typography for a distraction-free writing experience.
*   **Research Integration:**
    *   Users can "Export" research reports directly into new Drafts.
    *   Automatic navigation flow from Research -> Editor.
*   **Contextual Chat (Editor Bot):**
    *   Integrated AI chat panel in the right sidebar.
    *   Context-aware: The bot reads the currently active draft to provide specific feedback.
    *   Uses the unified `AiRouterService` for model-agnostic generation.
*   **Cleanup:**
    *   Removed legacy `Gemini CLI` and `AuthOverlay` blocking code.
    *   Implemented "Lazy Auth" flow for better user onboarding.

---

## 2. Future Development Plan

### 🚀 Phase 5: Publishing & Export
*   **Medium API Integration:**
    *   Add "Publish to Medium" button in the Editor.
    *   Map local tags to Medium tags.
    *   Handle canonical URLs and publishing status (draft/public).
*   **Export Formats:**
    *   PDF Export (using `print-to-pdf` in Electron).
    *   HTML/JSON Export for other CMSs.

### 🧠 Phase 6: RAG (Retrieval Augmented Generation)
*   **Local Vector Store:**
    *   Implement a local vector database (e.g., ChromaDB or FAISS) in the Python backend.
*   **Knowledge Base:**
    *   When Research Reports are saved, chunk and embed them.
    *   Allow the "Editor Bot" to query this knowledge base to answer questions like "What did I find about X in my research?" without needing the full text in context.

### 👥 Phase 7: Collaboration (Long-term)
*   **Real-time Editing:**
    *   Explore Yjs or similar CRDTs for eventual peer-to-peer collaboration or syncing across devices.

---

## 3. Perceived Blockages & Technical Debt

### ⚠️ Technical Debt
*   **Synchronous I/O in Main Process:**
    *   `DraftService` currently uses `fs.readFileSync` and `fs.writeFileSync`. While acceptable for text files in a local app, this blocks the main thread.
    *   *Action:* Refactor `DraftService` to use `fs.promises` for all file operations.
*   **TipTap HTML vs Markdown:**
    *   The editor saves content as HTML within the `.md` file body. While functional, it's not "pure" Markdown.
    *   *Action:* Integrate `tiptap-markdown` extension to serialize/deserialize content to actual Markdown syntax on save/load.
*   **Type Inconsistencies:**
    *   `src/types/electron.d.ts` defines methods for Anthropic/DeepSeek keys, but these might need rigorous verification in `preload.ts` and `main.ts` to ensuring full parity.

### 🚧 Development Blockers
*   **Testing Gaps:**
    *   The new Drafts and Editor features lack comprehensive unit/integration tests.
    *   *Action:* Set up a testing framework (Vitest/Playwright) to ensure creating/saving drafts is regression-proof.
*   **Error Handling:**
    *   If the Python backend crashes, the Chat Panel fails silently or with generic errors. Better heartbeat/reconnection logic is needed.

---

**Last Updated:** January 3, 2026
