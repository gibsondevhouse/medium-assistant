# Deep Scribe - Phased Implementation Plan (2026)

**Status:** Active
**Date:** January 3, 2026
**Objective:** Solidify the "Gemini-Only" pivot, integrate live Google services for "grounded" research, and mature the Knowledge Base.

---

## 🎨 Phase 0: UI/UX Overhaul ("Jules Edition")

*Goal: Establish the "Google Native" Editorial aesthetic and robust theme engine.*

* **[COMPLETED] Foundation & Theming:**
  * Implemented `ThemeEngine` with 7 cultural palettes (Harlem Nights, Vibranium, etc.).
  * Created `LayoutShell` and `Sidebar` components.
* **[COMPLETED] Core Components:**
  * Built `MagazineCard` (Feature, Standard, Compact).
  * Built `MosaicGrid` layout system.
* **[COMPLETED] Screen Migration:**
  * Refactored `NewsFeed`, `ArticleEditor`, `ResearchDashboard`, and `SettingsDashboard` to use the new Design System.

---

## 🏗️ Phase 1: Foundation & Verification (Weeks 1-2)

*Goal: Ensure the recent "All-In" pivot is stable, optimized, and testable.*

### 1.1 Dependency & Binary Optimization

* **[COMPLETED] Audit `torch` dependency:** Removed `torch` from `requirements.txt` and `main.py`. The backend is now pure Python/FastAPI without heavy ML libraries.
* **Cleanup Stubs:** Ensure no residual "OpenAI" or "Anthropic" code exists in the `electron/services` or frontend types.

### 1.2 Testing Framework

* **Backend Tests:** Create `pytest` suite for `python_backend/main.py` covering:
  * KB Operations (Add/Query/Delete)
  * Gemini Router Error Handling (e.g., API key failures)
* **Frontend Tests:** Add Vitest tests for `researchStore` state changes.

### 1.3 Knowledge Base Wiring Check

* **Verify Frontend Hook:** Confirm that `synthesizeReport` in `src/services/gemini.ts` actually triggers a save to the Knowledge Base (or that the UI provides a clear path to do so).
* **Data Persistence:** Verify `~/.deep-scribe/knowledge_base/` survives app restarts and updates.

---

## 🧠 Phase 2: The "Deep" Research Agent & Live Intel (Weeks 3-4)

*Goal: Move beyond "training data" by connecting Gemini to live Google Search APIs and specialized indexes.*

### 2.1 "Thinking" Visualization

* **UI Update:** Modify `ResearchNode.tsx` to display a "Thinking..." state when Gemini 3 is active.
* **Reasoning Trace:** If possible (via API), capture the "thought process" and allow the user to expand/collapse it in the Research Report.

### 2.2 Grounded Intelligence (Google Services)

* **Custom Search Integration:**
  * Scaffold `GoogleSearchService` in Python.
  * Feed top 5 search results into Gemini Context for "Fact Check" mode.
* **Library Search (Google Books):**
  * Add "Academic/Book" tab to Research Dashboard.
  * Fetch citations and snippets for reliable sourcing.
* **YouTube Analyst:**
  * Allow pasting YouTube URLs.
  * Fetch transcripts/metadata and have Gemini "watch" and summarize content.

### 2.3 Recursive Research (Deep vs. Broad)

* **Recursive Expansion:** If a subtopic is complex, the Agent should auto-suggest breaking *that* subtopic down further.
* **Graph Update:** Update `TopicGraph.tsx` to handle nested or hierarchical layouts.

---

## 📚 Phase 3: Knowledge Base Maturity (Weeks 5-6)

*Goal: Transform the KB from a hidden data store into a user-accessible "Second Brain".*

### 3.1 Knowledge Manager UI

* **New View:** Create `src/components/KnowledgeBase/KnowledgeManager.tsx`.
* **Features:**
  * Table/Grid view of all stored notes/reports.
  * Search/Filter by Date, Topic, Source.
  * **Delete/Edit:** Allow users to curate their KB (remove bad data).

### 3.2 Enhanced RAG

* **Source Citation:** Update `ChatWithNotes.tsx` to clickable "Citations" that open the original source note/finding.
* **Context Control:** Allow users to select *specific* documents to chat with (e.g., "Chat only with my 'AI Ethics' research").

---

## ☁️ Phase 4: Publishing & Cloud Sync (Weeks 7-8)

*Goal: Seamless export, publishing flow, and safety.*

### 4.1 Medium API Finalization

* **Publishing Wizard:** Create a modal that handles:
  * Canonical URL setting.
  * Tags mapping (Local tags -> Medium tags).
  * Preview image selection.
* **Status Check:** Visual indicator of "Draft" vs "Published" state in the Dashboard.

### 4.2 Google Drive Sync (Backup)

* **Cloud Mirror:** Implement optional sync of `~/.deep-scribe/Drafts` to a dedicated Google Drive folder.
* **Versioning:** Use Drive's native version history for draft recovery.

### 4.3 SEO Agent

* **New Agent:** "SEO Optimizer" (running on Gemini 2.5 Flash).
* **Function:** Analyzes the final draft and suggests headlines, meta descriptions, and keywords.

---

## 📉 Technical Debt Tracking

| Item | Priority | Status |
| :--- | :--- | :--- |
| Remove `torch` from requirements | High | **Done** |
| Add Backend Unit Tests | Medium | Pending |
| Refactor `Editor` toolbar for Mobile | Low | Pending |
| Add "Stop Generation" button | Medium | Pending |
