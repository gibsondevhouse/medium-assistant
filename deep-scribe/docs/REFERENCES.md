# Deep Scribe - Research Path & Reference Index

This document serves as the "Source of Truth" for technical references required to implement upcoming roadmap phases. Consult these resources before and during development.

## 🚧 Immediate Priority: Quality Assurance (Testing)

We need to backfill tests for the `DraftService` and `Editor`.

* **[Vitest](https://vitest.dev/guide/)**: Blazing fast unit test framework.
  * *Usage:* Unit testing pure logic (TypeScript) and utility functions.
* **[Playwright for Electron](https://playwright.dev/docs/a-electron)**: End-to-End testing.
  * *Usage:* Launching the Electron app, interacting with the window, and verifying IPC calls.
  * *Critical:* Learn how to mock the `electronAPI` bridge during tests.
* **[Testing Library (React)](https://testing-library.com/docs/react-testing-library/intro/)**: Component testing.
  * *Usage:* Testing the `Editor` component in isolation (headless).

## 🚀 Phase 5: Publishing & Export

Integration with third-party platforms and file generation.

* **[Medium API Documentation](https://github.com/Medium/medium-api-docs)**
  * *Endpoint:* `POST /v1/users/{{userId}}/posts`
  * *Auth:* Self-issued Access Tokens (User Settings > Integration Token).
  * *Format:* Markdown or HTML (we will likely use HTML from TipTap's serializer).
* **[Electron PDF Generation](https://www.electronjs.org/docs/latest/api/web-contents#contentsprinttopdfoptions)**
  * *Method:* `win.webContents.printToPDF(options)`
  * *Strategy:* Create a hidden, print-optimized BrowserWindow or generic print stylesheet.

## 🧠 Phase 6: RAG (Retrieval Augmented Generation)

Local vector storage and advanced context retrieval.

* **[ChromaDB (Python)](https://docs.trychroma.com/)**: Open-source embedding database.
  * *Fit:* Runs locally, integrates well with Python backend.
* **[LangChain / LlamaIndex (Python)](https://python.langchain.com/docs/get_started/introduction)**
  * *Usage:* optional orchestration for "Chat with your Drafts".
* **[Google Generative AI (Embeddings)](https://ai.google.dev/models/embeddings)**
  * *Usage:* Generating vector embeddings for research notes to store in ChromaDB.

## 🛠 Core Stack References (Maintenance)

* **[TipTap Documentation](https://tiptap.dev/introduction)**: The core of our Editor.
  * *Extensions:* [Markdown Extension](https://github.com/ueberdosis/tiptap-extension-markdown)
* **[Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc)**: Inter-Process Communication patterns.
* **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)**: State management for Drafts.
* **[Tailwind Typography](https://github.com/tailwindlabs/tailwindcss-typography)**: Converting Markdown/HTML to beautiful prose (`prose` class).
