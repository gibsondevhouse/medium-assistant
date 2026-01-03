# Deep Scribe - Gemini Context

**Deep Scribe** is an AI-powered research assistant for Medium authors, architected as a desktop application that leverages the Google Gemini ecosystem exclusively.

## Project Overview

*   **Goal:** Assist authors in researching, drafting, and publishing articles to Medium.
*   **Core Technology:**
    *   **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons.
    *   **Desktop Shell:** Electron 25.
    *   **AI Backend:** Python (FastAPI) sidecar managing Google Gemini API interactions.
    *   **AI Engine:** Google Gemini (3.0 Pro/Flash Preview, 2.5 Pro/Flash).
    *   **Data Store:** Local filesystem for drafts (Markdown + YAML), ChromaDB for Knowledge Base (RAG).

## High-Level Architecture

The application follows a **Three-Layer IPC Architecture** to ensure security and separation of concerns:

1.  **React Frontend:** Runs in the renderer process (Vite). It handles UI/UX and state management (Zustand). It *never* communicates directly with Node.js APIs or the Gemini API.
2.  **Electron Main Process:** Acts as the bridge. It spawns the Python sidecar, handles filesystem I/O, manages safe storage for API keys, and routes requests between the frontend and the Python backend via IPC.
3.  **Python Sidecar:** A FastAPI server that runs locally. It handles the heavy lifting for AI: interacting with the Google Gemini API and managing the local Vector Database (ChromaDB) for RAG (Retrieval-Augmented Generation).

## Key Commands

### Development

*   **Start All (Dev Mode):** `npm run dev`
    *   *Note:* Starts Vite (frontend) and Electron (main) concurrently.
    *   *Tip:* If port 3000 is blocked: `npx kill-port 3000`
*   **Compile Electron:** `tsc -p electron`
*   **Type Check:** `npx tsc --noEmit`
*   **Build Python Backend:** `sh python_backend/build_executable.sh`

### Build & Distribution

*   **Full Build:** `npm run build`
    *   Builds Python executable -> Compiles TypeScript -> Builds Vite -> Packages with Electron Builder.

## Directory Structure

*   **`src/`**: React Frontend source.
    *   `components/`: UI components organized by feature (Editor, Research, KnowledgeBase, Settings).
    *   `store/`: Zustand state stores (`draftStore`, `chatStore`, `researchStore`, `knowledgeBaseStore`).
    *   `services/`: Frontend API layer (`ai-router`, `gemini`).
*   **`electron/`**: Electron Main Process source.
    *   `main.ts`: Entry point, lifecycle management, and IPC setup.
    *   `preload.ts`: Secure Context Bridge exposing `window.electronAPI`.
    *   `services/`: Node.js services for file I/O, native settings, and RSS.
*   **`python_backend/`**: Python FastAPI Sidecar.
    *   `main.py`: API endpoints.
    *   `router.py`: Logic for calling Google Gemini API.
    *   `knowledge_base.py`: ChromaDB integration for RAG.
*   **`docs/`**: Comprehensive documentation (Architecture, API usage, Reports).

## Development Conventions

*   **State Management:** Use **Zustand**. Separate concerns into specific stores (e.g., `draftStore` vs `researchStore`).
*   **Styling:** Use **Tailwind CSS**.
*   **Communication:**
    *   **Frontend <-> Electron:** Use `window.electronAPI` (defined in `preload.ts` and `types/electron.d.ts`).
    *   **Electron <-> Python:** HTTP requests to `localhost` (port is dynamically assigned and passed via environment variables).
*   **Security:**
    *   **Never** expose API keys to the frontend.
    *   **Never** import Node.js modules directly in React components.
    *   Use `safeStorage` (Electron) for sensitive tokens.
*   **AI Integration:**
    *   All AI logic resides in the Python backend (`router.py`).
    *   Frontend requests AI tasks via `aiRouter` service which calls Electron which calls Python.

## Key Features

*   **Research Workflow:** Topic decomposition, parallel subtopic research, and report synthesis using Gemini.
*   **Editor:** Tiptap-based Markdown editor with live HTML/JSON export and PDF generation.
*   **Knowledge Base:** Local RAG system using ChromaDB to store and query notes/research.
*   **Medium Integration:** Direct publishing (as drafts) to Medium.
