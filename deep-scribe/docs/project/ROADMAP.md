# Deep Scribe - Development Roadmap

This document outlines the current status of the project, planned future developments, and perceived blockages/technical debt.

## 1. Current Status

The application has successfully pivoted to a **"Google Gemini All-In"** architecture, deprecating the multi-provider routing in favor of deep integration with the Gemini Ecosystem.

### ✅ Implemented Features

* **"Gemini Command Center" (Settings):**
  * Replaced generic provider selection with a dedicated **Command Center**.
  * Shows "Generation 3" (Thinking Models) and "Generation 2.5" (Production Models).
  * Unified API Key management (Single Key for all models).
* **Draft System (Persistence):**
  * Drafts are stored as portable Markdown files (`.md`) with YAML frontmatter.
  * Full CRUD operations via `DraftService` (Electron) and `DraftStore` (Zustand).
* **The Editor:**
  * **TipTap** Markdown editor with debounced auto-save.
  * Integration with Research Reports (export to draft).
* **Lazy Authentication:**
  * App launches immediately without blocking on API keys.
* **Unified Router (Gemini Only):**
  * Streamlined Python backend focusing exclusively on Gemini 3.0/2.5 optimization.

---

## 2. Future Development Plan

### 🚀 Phase 5: Publishing & Export

* **Medium API Integration:**
  * Add "Publish to Medium" button in the Editor.
  * Map local tags to Medium tags.
  * Handle canonical URLs and publishing status (draft/public).
* **Export Formats:**
  * PDF Export (using `print-to-pdf` in Electron).
  * HTML/JSON Export for other CMSs.

### 🧠 Phase 6: RAG & "Thinking" Agents

* **Deep Research Agent:**
  * Utilize **Gemini 3 Pro's "Thinking" capability** for multi-step research plans.
* **Local Knowledge Base:**
  * Chunk and embed Research Reports locally (using Gemini Embeddings + ChromaDB).
  * Enable "Chat with my Notes" functionality.

### 👥 Phase 7: Collaboration (Long-term)

* **Real-time Editing:**
  * Explore Yjs or similar CRDTs for sync.

---

## 3. Perceived Blockages & Technical Debt

### ⚠️ Technical Debt

* **Legacy Code (Multi-Provider):**
  * The Python backend still contains `openai_client`, `anthropic_client` stubs. These should be purged to reduce binary size.
  * *Action:* Purge unused provider services from `python_backend`.
* **Testing Gaps:**
  * The new Command Center and Gemini 3 integration lacks unit tests.

### 🚧 Development Blockers

* **Gemini 3 Preview Limits:**
  * The "Thinking" models are currently in Preview and may have lower rate limits than Production models.

---

**Last Updated:** January 3, 2026
