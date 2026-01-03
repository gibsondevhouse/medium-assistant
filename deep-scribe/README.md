# Deep Scribe

A local-first desktop assistant for authors to research, write, and publish articles, powered by AI.

## Project Status

### ✅ Built

- **Core Architecture**: Electron + React + TypeScript frontend with a Python FastAPI sidecar backend.
- **Multi-Provider AI Router**: Unified Python backend router supporting Gemini, Anthropic (Claude), DeepSeek, and Perplexity with standardized responses and credit calculation.
- **Draft Management System**: Local Markdown persistence layer for creating, editing, and saving drafts to disk.
- **Local Persistence**: Secure storage of API keys (`safeStorage`) and application settings (`electron-store`) without relying on environment variables.
- **RSS Integration**: Real-time fetching of customizable RSS feeds (e.g., Medium tags) with smooth client-side pagination and editorial masonry layout.
- **Enhanced Logging**: Centralized, timestamped logging system for both Main and Renderer processes.
- **Dashboard UI**: Modern, glassmorphism-inspired dashboard with "For You" feed and "Command Capsule" navigation.
- **Executable Bundling**: Python backend is compiled to a standalone executable for production.

### 🚧 Started

- **Research Tab**: Initial UI scaffolding for the hierarchical research mode.
- **Markdown Editor**: Basic editor component integrated with draft management system.

### 📝 Yet to be Implemented

- **Medium Publishing**: Direct API integration to draft/publish stories to Medium.
- **Deep Research Agent**: Multi-step AI research workflows (Topic Mapping -> Deep Dive -> Synthesis).
- **Conversational Interface**: Chat-based side panel for drafting assistance.

## Architecture

This application uses the **Python Sidecar Pattern**:

- **Frontend (UI):** Electron + Vite + React + TypeScript, styled with Tailwind CSS.
- **Backend (Logic):** Python with FastAPI, running as a spawned subprocess.
- **Communication:** Electron communicates with the persistent local Python server via REST API over localhost (dynamic port).
- **Data:** All data is stored locally (JSON/SQLite). No external cloud databases are required.

## Requirements

### Prerequisites

- **Node.js**: v18+
- **Python**: v3.10+ (for development only; production builds bundle the runtime)
- **Git**

### Tech Stack

- **Electron**: v28
- **React**: v18
- **Vite**: v5
- **TailwindCSS**: v3
- **FastAPI**: v0.100+
- **AI Providers**: Google Gemini, Anthropic Claude, Perplexity, DeepSeek (via Python SDKs)

## How to Run

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/gibsondevhouse/medium-assistant.git
    cd medium-assistant/deep-scribe
    ```

2. **Install Node.js Dependencies:**

    ```bash
    npm install
    ```

3. **Setup Python Backend (Development):**

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r python_backend/requirements.txt
    ```

4. **Run in Development Mode:**

    ```bash
    npm run dev
    ```

    *This starts the Vite dev server and spawns the Electron app (which spawns the Python backend).*

5. **Build for Production:**

    ```bash
    npm run build
    ```

    *Produces a DMG/AppImage in `dist` with the fully bundled Python executable.*
