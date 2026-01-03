# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Deep Scribe** is an AI-powered research assistant for Medium authors running exclusively on **Google Gemini**. It's a full-stack Electron desktop application with a React frontend, Electron main process, and Python FastAPI backend sidecar.

**Architecture:** React 18 (frontend) + Electron 25 (desktop shell) + Python/FastAPI (Gemini backend sidecar)

**AI Engine:** Google Gemini (exclusive) - Gemini 3.0 Pro/Flash (Preview) and Gemini 2.5 Pro/Flash/Flash-Lite (Stable)

**Status:** Active development (v0.3.0)

---

## Common Commands

### Development

```bash
# Start development mode (Vite + Electron with hot reload)
npm run dev

# Kill any process on port 3000 (run before dev if port conflicts)
npx kill-port 3000

# Compile TypeScript for Electron process only
tsc -p electron

# Type-check the entire project
npx tsc --noEmit

# Build Python backend executable (PyInstaller)
sh python_backend/build_executable.sh
```

### Build & Distribution

```bash
# Full production build (Python → TypeScript → Vite → Electron)
npm run build

# Start built app
npm start
```

---

## High-Level Architecture

### Three-Layer IPC Architecture

```
React Frontend (Vite on port 3000)
    ↓ (IPC messages via Electron preload bridge)
Electron Main Process
    ↓ (HTTP: localhost:random-port)
Python FastAPI Sidecar (auto-spawned on random port)
    ↓ (API calls via google-generativeai SDK)
Google Gemini API
```

**Key Design Decision:** This architecture provides **security isolation** (API keys never touch React), **flexibility** (backend can be updated independently), and **clear separation of concerns**.

### Directory Structure

```
src/                           # React frontend (TypeScript)
├── App.tsx                     # Root component with layout routing
├── main.tsx                    # React entry point with logging
├── components/                 # Feature-based component organization
│   ├── Editor/                 # Tiptap markdown editor with export
│   ├── Research/               # Multi-phase research workflow
│   │   ├── ResearchDashboard.tsx  # Main orchestrator with KB integration
│   │   ├── TopicPanel.tsx         # Topic input/graph wrapper
│   │   ├── TopicGraph.tsx         # ReactFlow visualization
│   │   ├── SourcesPanel.tsx       # Research findings display
│   │   └── ReportPanel.tsx        # Final report viewer
│   ├── KnowledgeBase/          # RAG-powered knowledge base
│   │   └── ChatWithNotes.tsx      # Chat interface for querying notes
│   ├── Chat/                   # Chat assistant panel
│   ├── Dashboard/              # Home with article feed & tabs
│   ├── Settings/               # Gemini API key & Medium token config
│   ├── NewsFeed.tsx            # RSS feed integration
│   └── DeepScribeLayout.tsx    # Three-panel responsive layout
├── store/                      # Zustand state management
│   ├── draftStore.ts           # Draft CRUD operations
│   ├── chatStore.ts            # Chat messages & AI generation
│   ├── researchStore.ts        # Research session state
│   └── knowledgeBaseStore.ts   # Knowledge base state & RAG chat
├── services/                   # Frontend API layer
│   ├── ai-router.ts            # Routes prompts to Python Gemini backend
│   ├── gemini.ts               # Gemini research functions
│   ├── settings-keys.ts        # Gemini API key management
│   └── news-api.ts             # News/content fetching
└── types/                      # TypeScript type definitions
    └── electron.d.ts           # IPC bridge type definitions

electron/                       # Electron main process (TypeScript)
├── main.ts                     # App lifecycle, Python sidecar, PDF export, Medium API
├── preload.ts                  # Context bridge (secure IPC API)
├── services/                   # Backend services
│   ├── settings.ts             # Gemini key & Medium token encryption
│   ├── drafts.ts               # Draft file I/O (.md with YAML frontmatter)
│   ├── knowledgeBase.ts        # Knowledge base IPC bridge
│   ├── research.ts             # Research service (stubs)
│   └── rss.ts                  # RSS feed parsing
└── utils/
    └── logger.ts               # Centralized logging to ~/logs/

python_backend/                # Python FastAPI sidecar (Gemini-exclusive)
├── main.py                     # FastAPI app with KB endpoints
├── router.py                   # GeminiRouter class for API calls
├── knowledge_base.py           # ChromaDB + Gemini Embeddings service
├── requirements.txt            # Python dependencies (incl. chromadb)
├── deep-scribe-backend.spec   # PyInstaller spec for packaging
└── build_executable.sh         # Build script for standalone executable
```

### State Management (Zustand)

**Four independent stores:**

1. **draftStore.ts** - Draft list, active draft selection, CRUD operations, auto-persist via Electron IPC
2. **chatStore.ts** - Chat messages and AI generation state, uses `aiRouter.generateContent()`
3. **researchStore.ts** - Research workflow lifecycle (topic → sources → findings → report)
4. **knowledgeBaseStore.ts** - Knowledge base documents, search, RAG-powered chat

### IPC Communication (Electron ↔ React)

**Bridge in `electron/preload.ts` exposes:**

```typescript
window.electronAPI = {
  settings: {
    getGeminiKey(), setGeminiKey(key), testGeminiKey(), clearGeminiKey(), hasGeminiKey(),
    getRssUrl(), setRssUrl(),
    getMediumToken(), setMediumToken(token), hasMediumToken(), clearMediumToken()
  },
  drafts: {
    list(), read(id), save(id, content), create(title), delete(id),
    updateMetadata(id, metadata), exportToPDF(title, htmlContent)
  },
  medium: { publish(title, content, tags, publishStatus) },
  rss: { fetch(url) },
  research: { sourceRun(query), researchRun(hypotheses), creativeRun(findings) },
  knowledgeBase: {
    addDocument(content, source, title, docType, metadata),
    addResearch(topic, subtopic, findings, researchId),
    addReport(topic, report, researchId),
    query(query, nResults, docType),
    getDocuments(limit), deleteDocument(docId), clear(), getStats(),
    chat(message, nContext)
  },
  logger: { log(level, message) },
  openExternal: (url) => void
}
```

**Security:** React cannot directly access Node.js; all file/system operations route through IPC.

---

## Feature Reference

### Publishing & Export

**PDF Export** (`electron/main.ts:269-419`):
- Creates hidden BrowserWindow to render styled HTML
- Uses Electron's `printToPDF` API
- Shows native save dialog

**Medium API Integration**:
- Token stored securely via `safeStorage`
- Two-step publish: GET `/v1/me` for user ID, POST `/v1/users/{id}/posts`
- Always publishes as draft for safety
- Configure in Settings → API Keys tab

**HTML/JSON Export** (`src/components/Editor/Editor.tsx`):
- Dropdown menu in Editor toolbar
- HTML: Standalone file with embedded styles
- JSON: Full draft data (markdown, HTML, metadata)

### Knowledge Base (RAG)

**Backend** (`python_backend/knowledge_base.py`):
- ChromaDB for vector storage (persists to `~/.deep-scribe/knowledge_base/`)
- Gemini `text-embedding-004` model for embeddings
- Semantic search with relevance scoring

**API Endpoints** (`python_backend/main.py`):
```
POST /api/kb/add          - Add document
POST /api/kb/add-research - Add research findings
POST /api/kb/add-report   - Add research report
POST /api/kb/query        - Semantic search
GET  /api/kb/documents    - List all documents
DELETE /api/kb/document/{id} - Delete document
DELETE /api/kb/clear      - Clear all
GET  /api/kb/stats        - Get statistics
POST /api/kb/chat         - RAG-powered chat
```

**Frontend**:
- "Save to KB" button in Research dashboard (after report generation)
- "Chat with Notes" tab in main Dashboard
- RAG chat shows source attribution with relevance scores

### Research Workflow

Three-pass Gemini integration in `src/services/gemini.ts`:
1. `generateTopicMap(topic)` - Break topic into 5-8 subtopics (ReactFlow nodes)
2. `researchSubtopic(subtopic, mainTopic)` - Deep dive per subtopic (parallel)
3. `synthesizeReport(topic, findings)` - Combine into feature article

**UI Flow:**
```
TopicInput → TopicGraph → SourcesPanel → ReportPanel
   (idle)  → (surveying) → (researching) → (complete)
```

---

## Gemini API Integration

**Python Backend (`python_backend/router.py`):**

```python
class GeminiRouter:
    def generate(self, model: str, prompt: str, api_key: str):
        genai.configure(api_key=api_key)
        model_instance = genai.GenerativeModel(model)
        response = model_instance.generate_content(prompt)
        return {"success": True, "content": response.text, ...}
```

**Available Models:**
- `gemini-3.0-pro-preview` - Advanced reasoning (Preview)
- `gemini-3.0-flash-preview` - Fast multimodal (Preview)
- `gemini-2.5-pro` - Production-grade powerful
- `gemini-2.5-flash` - Balanced (default)
- `gemini-2.5-flash-lite` - Ultra-fast, lowest cost

**Embeddings Model:**
- `text-embedding-004` - Used for knowledge base embeddings

**Cost Model (Quills):**
```python
QUILL_PRICING = {
    "gemini-2.0-flash": 1,
    "gemini-2.5-flash": 1,
    "gemini-2.5-flash-lite": 1,
    "gemini-2.5-pro": 15,
    "gemini-3.0-pro-preview": 15,
}
```

---

## Important Implementation Details

### 1. Lazy Authentication

- App does **not** block on missing API key
- At launch, checks `settings.hasGeminiKey()`
- If no key, auto-navigates to Settings tab
- Users configure Gemini key on-demand during first use

### 2. Context Isolation (Security)

- React code **cannot** require Node modules
- React code **cannot** access filesystem directly
- All system operations go through controlled IPC bridge
- Gemini API key stored in system keychain (Electron safeStorage), never exposed to renderer
- Medium token also uses safeStorage encryption

### 3. Python Backend Lifecycle

**Spawned by Electron `main.ts`:**
- Python backend calls `find_free_port()` to bind to random available port
- Writes `PORT=<number>` to `.env` file
- Electron reads port and makes it available via IPC
- Knowledge base persists to `~/.deep-scribe/knowledge_base/`

### 4. Draft Storage Format

Drafts stored as `.md` files in `userData/Drafts/` with YAML frontmatter:

```yaml
---
title: "Article Title"
tags: ["tag1", "tag2"]
version: 1
lastModified: 1704231600000
---
# Markdown content here
```

---

## Development Workflows

### Adding a New Gemini Feature

1. Add function in `src/services/gemini.ts` that calls `aiRouter.generateContent(prompt, model)`
2. Update store if needed (e.g., `researchStore.ts`)
3. Create/update React component to use the new function
4. Model selection comes from localStorage `deep-scribe-settings`

### Adding Knowledge Base Features

1. Add endpoint in `python_backend/main.py`
2. Add method in `python_backend/knowledge_base.py` if needed
3. Add IPC handler in `electron/main.ts`
4. Add bridge method in `electron/preload.ts`
5. Add types in `src/types/electron.d.ts`
6. Update `knowledgeBaseStore.ts` actions
7. Create/update UI component

### Changing Default Model

Edit `src/services/gemini.ts`:
```typescript
const getModel = (): string => {
    // ...
    return 'gemini-2.5-flash'; // Change this default
};
```

Or update via Settings UI → Research tab → Gemini Model dropdown.

### Debugging

- **Frontend:** React DevTools in Electron (dev mode opens with Ctrl+F12)
- **Electron:** DevTools Inspector
- **Python Backend:** Logs appear in console; add `print()` statements
- **File I/O:** Drafts stored in `~/Library/Application Support/Deep Scribe/Drafts/` (macOS)
- **Knowledge Base:** ChromaDB stored in `~/.deep-scribe/knowledge_base/`

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **UI Framework** | React | 18.2.0 |
| **Language (UI)** | TypeScript | 5.1.6 |
| **Bundler** | Vite | 4.4.4 |
| **Styling** | Tailwind CSS | 3.3.3 |
| **State** | Zustand | 5.0.9 |
| **Editor** | Tiptap | 3.14.0 |
| **Desktop** | Electron | 25.3.1 |
| **Backend** | FastAPI + Uvicorn | Latest |
| **AI Engine** | Google Gemini | 3.0/2.5 |
| **Vector DB** | ChromaDB | Latest |
| **Icons** | Lucide React | 0.562.0 |
| **Animation** | Framer Motion | 12.23.26 |
| **Graph Viz** | ReactFlow | Latest |

---

## Quick Reference

| Task | Command/Location |
|------|------------------|
| Start dev | `npm run dev` |
| Build app | `npm run build` |
| Type check | `npx tsc --noEmit` |
| View app logs | `~/Library/Logs/Deep Scribe/` (macOS) |
| View stored drafts | `~/Library/Application Support/Deep Scribe/Drafts/` (macOS) |
| View knowledge base | `~/.deep-scribe/knowledge_base/` |
| Gemini key storage | `~/Library/Application Support/deep-scribe/keys/gemini` |
| Medium token storage | `~/Library/Application Support/deep-scribe/keys/medium` |
| Add React component | `src/components/{Feature}/{ComponentName}.tsx` |
| Add Zustand store | `src/store/{storeName}.ts` |
| Update Gemini router | `python_backend/router.py` |
| Update KB service | `python_backend/knowledge_base.py` |
| Type IPC calls | `src/types/electron.d.ts` |
| Settings UI | `src/components/Settings/SettingsDashboard.tsx` |

---

## Completed Features (as of Jan 2026)

- [x] Gemini-exclusive architecture (no multi-provider)
- [x] Research workflow with ReactFlow visualization
- [x] TipTap Markdown editor with auto-save
- [x] PDF export via Electron printToPDF
- [x] Medium API integration (publish as draft)
- [x] HTML/JSON export
- [x] Local Knowledge Base (ChromaDB + Gemini Embeddings)
- [x] RAG-powered "Chat with Notes"
- [x] Settings dashboard with API key management

## Remaining / Future Work

- [ ] Unit tests for Settings and Research components
- [ ] Real-time collaboration (Phase 7 - long-term)
- [ ] Knowledge base management UI (view/delete notes)
- [ ] Dark/light theme toggle
