# Deep Scribe

**The AI-Powered Research Assistant for Medium Authors.**
*Running on the Google Gemini Ecosystem.*

> **Status:** Production Ready (MVP) - v0.2.0
> **Architecture:** Electron + React (Frontend) / Python (Backend Sidecar) / Gemini 2.5 Flash + 3.0 Pro (AI)

![Deep Scribe Banner](https://img.shields.io/badge/Status-Stable-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey)

## 📖 Overview

**Deep Scribe** is a local-first desktop application designed to supercharge the workflow of Medium authors. It combines a distraction-free Markdown editor with a powerful "Three-Pass" AI research engine and a local RAG knowledge base.

Designed for technical writers and thought leaders, it offers a seamless flow from **Research** -> **Synthesis** -> **Drafting** -> **Publishing**.

## ✨ Key Features

### 🧭 Navigation & AI

* **Breadcrumb Navigation:** A modern, consumer-grade top navigation bar that replaces traditional sidebars for a focused writing experience.
* **Lazy Authentication:** The app works immediately offline; AI features unlock gracefully when keys are provided.

### 📝 Editorial Workbench

* **Pro Markdown Editor:** Built on **TipTap**, supporting typical notions shortcuts and formatting.
* **Exports:** One-click export to **PDF** (styled) or **HTML/JSON**.
* **Live Autosave:** Never lose a word with robust local filesystem persistence.

### 🧠 Local Knowledge Engine (RAG)

* **ChromaDB Integration:** All your research findings and notes are indexed locally.
* **Chat with Notes:** Query your entire knowledge base using natural language to find connections and supporting arguments.

### 🤖 3-Level Research Engine

* **Source Run:** Generates contextual search queries and source evaluation.
* **Research Run:** Performs parallel verification of claims against credible sources.
* **Creative Run:** Synthesizes findings into actionable article outlines and drafts.

### 📰 Content Discovery

* **Google News Feed:** Integrated RSS reader to track your niche topics without leaving the app.
* **Topic Monitoring:** Stay ahead of trends with curated feeds.

### 🚀 Publishing

* **Medium Integration:** Publish your polished drafts directly to Medium.com (as drafts) via the official API.

## 🏗️ Architecture

The application follows a **Three-Layer IPC Architecture** to ensure security and performance:

1. **Frontend (Renderer):**
    * **React 18 + Vite:** High-performance UI rendering.
    * **Tailwind CSS + Framer Motion:** Fluid, beautiful animations and styling.
    * **Zustand:** Predictable state management.
    * *Security:* Sandboxed environment with no direct Node.js access.

2. **Middle Layer (Electron Main):**
    * **Secure Bridge:** Uses `contextBridge` for protected IPC communication.
    * **Secret Management:** `safeStorage` encryption for API keys.
    * **Orchestrator:** Manages the lifecycle of the Python sidecar.

3. **Backend (Python Sidecar):**
    * **FastAPI:** Async, high-concurrency API server.
    * **Google Gemini SDK:** Direct integration with Gemini 1.5/2.0 models.
    * **ChromaDB:** Local vector database for RAG operations.
    * *Stateless Design:* API keys are injected per-request for maximum security.

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* Python 3.10+
* A Google Cloud Project with the **Gemini API** enabled.

### Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/gibsondevhouse/medium-assistant.git
    cd medium-assistant
    ```

2. **Install JS Dependencies:**

    ```bash
    npm install
    # This installs Electron, React, and all build tools.
    ```

3. **Setup Python Environment:**
    *It is recommended to use a virtual environment.*

    ```bash
    cd python_backend
    python3 -m venv venv
    source venv/bin/activate  # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    ```

4. **Run in Development Mode:**

    ```bash
    # From the root directory (ensure venv is active or python3 is global)
    npm run dev
    ```

    *This command concurrently starts the Vite dev server, compiles the Electron main process, and spawns the Python backend.*

### Building for Production

To create a deployable `.dmg` or `.exe`:

```bash
npm run build
```

This script will:

1. Compile the Python backend into a standalone executable (using PyInstaller).
2. Build the React frontend.
3. Package everything into a single Electron application.

## 📂 Project Structure

* `src/`: **React Frontend**
  * `components/Navigation`: Breadcrumb navigation logic.
  * `components/Editor`: TipTap editor implementation.
  * `components/Research`: Research dashboard and visualization.
* `electron/`: **Main Process**
  * `services/`: Node.js services (Drafts, RSS, Settings).
  * `main.ts`: Application entry point and IPC handlers.
* `python_backend/`: **AI Backend**
  * `main.py`: FastAPI routes.
  * `knowledge_base.py`: ChromaDB RAG implementation.
* `docs/`: **Documentation** & Architectural References.

## 🔒 Security Note

This application promotes **Data Sovereignty**:

* **Local-First:** Your drafts and notes live on your disk, not our servers.
* **Encrypted Keys:** API keys are encrypted using your OS's keychain/vault.
* **Private RAG:** Your vector database is local `sqlite3` based (ChromaDB), ensuring your research data stays private.

## 📄 License

MIT © [Gibson Development]
