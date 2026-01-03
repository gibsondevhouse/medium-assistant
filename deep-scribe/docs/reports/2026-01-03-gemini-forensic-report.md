# [ARCHIVED] Deep Scribe: Forensic Engineering Report
>
> **Note:** This report documents the "Split-Brain" state of the application prior to the "Gemini Command Center" refactor. It is preserved for historical context.
> **Current Architecture:** See `docs/architecture/GEMINI_ECOSYSTEM.md`.

## Deep Scribe: Forensic Engineering Report

**Date:** 2026-01-03
**Status:** Critical Refactoring Phase
**Scope:** IPC, State Management, Process Lifecycle, AI Architecture

## 1. Critical Blocking Issues (P0)

### 1.1 "Split-Brain" AI Architecture

The application currently employs two competing patterns for AI interaction, leading to code duplication, fragmented configuration, and billing inconsistencies.

* **Path A (Frontend - `src/components/Research/TopicInput.tsx`):
  * **Direct Execution:** Imports `generateTopicMap` from `../../services/gemini`.
  * **Credential Leakage:** Fetches raw API keys into the renderer process via `window.electronAPI.settings.getGeminiKey()`.
  * **Bypasses Backend:** Completely ignores the Python `UnifiedRouter`, rendering the `quills_deducted` (cost tracking) logic in `router.py` useless.
  * **Status:** **Active** (Used by current UI).

* **Path B (Backend - `electron/services/research.ts`):
  * **Intended Architecture:** Electron receives request -> calls Python sidecar -> Python handles Provider/Keys.
  * **Broken Implementation:** Hardcodes `const PYTHON_API_URL = 'http://127.0.0.1:8000'`.
  * **Status:** **Broken/Dormant** (Will fail connection if Python port is dynamic).

**Remediation:** Deprecate Path A. Refactor `TopicInput.tsx` to call `window.electronAPI.research.startTopicAnalysis(query)`.

### 1.2 Destructive Port Discovery

* **File:** `python_backend/main.py`
* **Mechanism:** `with open("../.env", "w")` overwrites the global `.env` file at startup to persist the `PORT`.
* **Impact:** Destroys all other environment variables (e.g., `GOOGLE_API_KEY` if stored there for dev).
* **Race Condition:** Electron reads `.env` while Python is writing it.
* **Remediation:** Pass port via CLI arg (`--port`) or use a dedicated ephemeral lockfile (`.port`).

### 1.3 Hardcoded Backend Service URL

* **File:** `electron/services/research.ts`
* **Issue:** Uses constant `'http://127.0.0.1:8000'`.
* **Context:** `main.ts` spawns Python on a *free* port (e.g., 54321).
* **Result:** `ResearchService` sends requests to the void.
* **Remediation:** Inject the discovered port from `main.ts` into `ResearchService` instantiation.

## 2. Architectural Technical Debt (P1)

### 2.1 IPC & Type Safety

* **File:** `electron/preload.ts` & `src/types/electron.d.ts`
* **Issue:** Loose typing. `research` methods return `Promise<any>`.
* **Risk:** No contract enforcement between Python response shape (`{ success: bool, content: str }`) and Frontend expectations.
* **Recommendation:** Implement shared Zod schemas or TypeScript interfaces for all IPC payloads.

### 2.2 Anemic State Store / Component Bloat

* **File:** `src/store/researchStore.ts`
* **Analysis:** Store is a data bucket.
* **File:** `src/components/Research/TopicInput.tsx`
* **Issue:** Contains complex orchestration logic (`handleStart` -> `setStatus` -> `API Call` -> `setNodes`).
* **Impact:** Hard to test research logic in isolation; logic is bound to the UI lifecycle.
* **Recommendation:** Move `handleStart` logic into a Thunk or a dedicated `ResearchController` within the store.

## 3. Refactoring Roadmap

### Phase 1: Plumbing & Stability (Day 1)

1. **Fix Port Handshake:**
    * Update `main.ts` to find a free port `P`.
    * Spawn Python with `main.py --port P`.
    * Remove `.env` write from `python_backend/main.py`.
2. **Connect Electron Service:**
    * Pass `P` to `ResearchService` constructor.
    * Verify `ResearchService` can hit `http://127.0.0.1:P/api/generate`.

### Phase 2: Unification (Day 2)

1. **Migrate Topic Generation:**
    * Create `ipcMain.handle('research:generate-topic-map')`.
    * Implement logic in `ResearchService` to call Python `UnifiedRouter`.
    * Update `TopicInput.tsx` to use the IPC call instead of `generateTopicMap`.
2. **Remove Legacy Code:**
    * Delete `src/services/gemini.ts` (Frontend direct caller).
    * Remove `getGeminiKey` calls from React components (keys should stay in Main).

## 4. Debugging & Verification

* **Verify Python Port:** Check `dist-electron/main.js` logs or console for `[Main] Backend port: X`.
* **Test Python Independently:**

    ```bash
    curl -X POST http://localhost:<PORT>/api/generate \
      -H "Content-Type: application/json" \
      -d '{"provider": "gemini", "model": "gemini-pro", "prompt": "Test", "api_keys": {"gemini": "..."}}'
    ```

* **Check IPC Bridge:**
  * Frontend: `window.electronAPI.getApiPort().then(console.log)`
