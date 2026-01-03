# Deep Scribe

**The AI-Powered Research Assistant for Medium Authors.**
*Running on the Google Gemini Ecosystem.*

> **Status:** Production Ready (MVP) - v0.2.0
> **Architecture:** Electron + React (Frontend) / Python (Backend Sidecar) / Gemini 2.5 Flash + 3.0 Pro (AI)

![Deep Scribe Banner](https://img.shields.io/badge/Status-Stable-success) ![License](https://img.shields.io/badge/License-MIT-blue)

## 📖 Overview

**Deep Scribe** is a local-first desktop application designed to supercharge the workflow of Medium authors. It combines a distraction-free Markdown editor with a powerful "Three-Pass" AI research engine.

Ideally suited for technical writers, it allows you to:

1. **Research:** Generate deep, cited research reports from a simple topic using Gemini.
2. **Draft:** Write in a clean, Notion-style editor with built-in AI assistance.
3. **Chat:** Query your research notes using a local RAG (Retrieval-Augmented Generation) system.
4. **Publish:** Post directly to Medium.com as a draft.

## 🏗️ Architecture

The application follows a **Three-Layer IPC Architecture** to ensure security and performance:

1. **Frontend (Renderer):**
    * **React 18 + Vite:** Fast, component-based UI.
    * **Tailwind CSS:** Modern, utility-first styling.
    * **Zustand:** Lightweight state management.
    * *Security:* No direct Node.js access; communicates exclusively via `window.electronAPI`.

2. **Middle Layer (Electron Main):**
    * **Secure Implementation:** proper `contextBridge` isolation.
    * **Secret Management:** Uses `safeStorage` to encrypt API keys (Gemini, Medium) at rest.
    * **Orchestrator:** Spawns and manages the Python sidecar process.

3. **Backend (Python Sidecar):**
    * **FastAPI:** High-performance async API.
    * **Google Gemini:** Uses `google-generative-ai` SDK for all AI tasks.
    * **Local RAG:** Uses `ChromaDB` for vector storage of research notes.
    * *Stateless:* API keys are passed per-request from Electron; never stored in Python state.

## ✨ Key Features

* **📝 Editorial Workbench:** professional Markdown editor (TipTap) with live HTML/JSON export and PDF generation.
* **🧠 Local Knowledge Base:** Ingests your research and notes into a local vector database for AI querying.
* **🤖 3-Level Research Engine:**
  * *Source Run:* Generates context and hypotheses.
  * *Research Run:* Parallel verification of claims.
  * *Creative Run:* Synthesizes an actionable outline.
* **📰 Medium Integration:** Seamless "Publish to Draft" functionality.

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

2. **Install Frontend/Electron dependencies:**

    ```bash
    npm install
    ```

3. **Setup Python Environment:**
    The application will attempt to use your system `python3`. It is recommended to create a venv:

    ```bash
    cd python_backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

4. **Run in Development Mode:**

    ```bash
    # From the root directory
    npm run dev
    ```

    *This starts the Vite renderer, compiles the Electron main process, and spawns the Python backend automatically.*

## 🔒 Security Note

This application stores your API keys locally on your machine using OS-level encryption (`safeStorage`).

* **Gemini API Key:** Required for all AI features.
* **Medium Integration Token:** Required for publishing.

## 📂 Project Structure

* `src/`: React Frontend (UI, Stores, Components)
* `electron/`: Main Process (Window Mgmt, IPC, File I/O)
* `python_backend/`: AI Logic (FastAPI, ChromaDB, Gemini)
* `docs/`: Comprehensive documentation.

## 📄 License

MIT © [Gibson Development]
