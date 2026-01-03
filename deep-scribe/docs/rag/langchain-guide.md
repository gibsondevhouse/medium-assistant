# LangChain Overview

## What is LangChain?

[LangChain](https://langchain.com) is a framework for developing applications powered by language models. It provides standard interfaces for chains, retrieval strategies, and agents.

## Core Concepts

* **Chains**: Sequences of calls (e.g., prompt -> LLM -> Output Parser).
* **Agents**: Using an LLM to decide what actions to take.
* **Retrieval**: Interfacing with data sources (e.g., ChromaDB).

## Role in Deep Scribe

While **Deep Scribe** primarily accesses the Gemini API directly (via `google-generative-ai`) for maximum control and reduced overhead, we use LangChain concepts for our internal RAG architecture:

1. **Retrieval**: We implement a manual retrieval step using ChromaDB.
2. **Context Construction**: We manually construct the prompt context based on retrieved documents.
3. **Generation**: We pass the augmented prompt to Gemini.

*Note: Future versions of Deep Scribe may integrate `langgraph` for complex multi-agent research flows.*
