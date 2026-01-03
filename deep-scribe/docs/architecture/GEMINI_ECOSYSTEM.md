# The Google Gemini Ecosystem

**Architecture & Capabilities Reference**

> **Status:** Active / Production Core
> **Date:** January 2026
> **Scope:** AI Model Registry, Routing Topology, Capabilities

## 1. Executive Summary: The "All-In" Pivot

Deep Scribe has deprecated the multi-provider "Split-Brain" architecture in favor of a strictly **Google Gemini Local-First** implementation. This decision simplifies the entire stack (Billing, Auth, State) while providing unrestricted access to the most advanced Multimodal/Agentic models available.

**Key Architecture Changes:**

1. **Single Key Authorization:** One API Key grants access to Text, Vision, Audio, and Video models.
2. **Unified Router:** All requests flow through a central efficient router, eliminating client-side direct calls.
3. **Command Center UI:** The Settings UI now serves as a "Command Center" for selecting specialized Google models for specific tasks.

---

## 2. The Intelligence Registry

The application hardcodes its capabilities to two distinct model generations. This registry is the "Source of Truth" for valid model IDs.

### Generation 3 (The Agentic Tier)

*Bleeding-edge models focused on "Thinking" and Autonomy.*

| Model ID | Name | Role | Specs |
| :--- | :--- | :--- | :--- |
| `gemini-3-pro-preview` | **Gemini 3 Pro** | Reasoning & Agents | **Thinking** Enabled • 1M Context • Complex Problem Solving |
| `gemini-3-flash-preview` | **Gemini 3 Flash** | Next-Gen Speed | **Thinking** Enabled • Low Latency • High Throughput |
| `gemini-3-pro-image-preview` | **Gemini 3 Vision** | Generative Media | Image/Video Output generation supported |

### Generation 2.5 (The Production Tier)

*Stable, high-reliability models for critical workloads.*

| Model ID | Name | Role | Specs |
| :--- | :--- | :--- | :--- |
| `gemini-2.5-pro` | **Gemini 2.5 Pro** | Production Logic | 2M Context • Max Stability • Instruction Following |
| `gemini-2.5-flash` | **Gemini 2.5 Flash** | High Throughput | Sub-100ms Latency • Cost Effective • Chat Optimized |
| `gemini-2.5-flash-lite` | **Gemini 2.5 Flash-Lite** | Economy / Micro | Micro-tasks • Metadata Extraction • Zero-Cost |

---

## 3. Core Capabilities

### 3.1 Agentic Reasoning ("Thinking")

Gemini 3 models introduce a "Pause for Thought" mechanism. Before streaming tokens to the user, the model enters a hidden reasoning state to plan code architecture, verify logic, or structure complex arguments.

* **Usage:** Automatically enabled for "Deep Research" tasks.
* **UI Indicator:** The "Command Center" UI highlights these models with a Pulsing Purple Badge.

### 3.2 Native Multimodality

Unlike legacy architectures that required separate pipelines (e.g., Whisper for Audio, GPT-4 for Text), Gemini is natively multimodal.

* **Audio:** Ingests up to 10 hours of MP3/WAV directly.
* **Video:** Processes up to 2 hours of MP4 (Visuals + Audio track).
* **Images:** Native understanding of charts, diagrams, and handwriting.
* **Code:** Ingests entire repositories (ZIP/Tarball) into its massive context window.

---

## 4. System Topology

### 4.1 The Unified Router

```mermaid
graph TD
    UI[Frontend (React)] -->|IPC Bridge| Electron[Electron Main]
    Electron -->|HTTP /generate| Backend[Python Sidecar]
    Backend -->|gRPC| Google[Google Cloud API]
```

* **Frontend:** No longer holds API keys or makes fetch calls. It requests specific *Tasks* (e.g., `research:start`).
* **Electron:** Manages the secure API Key storage (System Keychain) and Process Lifecycle.
* **Python Sidecar:** Handles the actual request routing, error handling, and cost tracking units (`quills`).

### 4.2 Security & Privacy

* **Training Data:** By using the Gemini API (Paid/Developer tier), **NO** data is used for training Google's models.
* **Isolation:** The Python Sidecar creates an ephemeral sandbox for the session.

---

## 5. Future Roadmap

* **Gemini 3 General Availability:** Transition `preview` models to stable when Google releases GA.
* **Local Fine-Tuning:** Explore Google's "Edge" LoRA adapters for specialized writing styles.
